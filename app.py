from flask import Flask, render_template, request, jsonify
import pickle
import nltk
import re
from nltk.stem import WordNetLemmatizer

nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)

app = Flask(__name__)

# Load trained model
with open('chatbot_model.pkl', 'rb') as f:
    model_data = pickle.load(f)

model = model_data['model']
vectorizer = model_data['vectorizer']
responses = model_data['responses']

lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

def get_response(user_input):
    cleaned = clean_text(user_input)
    vectorized = vectorizer.transform([cleaned])
    predicted_tag = model.predict(vectorized)[0]
    
    # Return random response from matching tag
    return responses[predicted_tag][0]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json['message']
    bot_response = get_response(user_message)
    return jsonify({'response': bot_response})

if __name__ == '__main__':
    app.run(debug=True)