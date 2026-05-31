import nltk
import json
import pickle
import numpy as np
import random

nltk.download('punkt')
nltk.download('wordnet')
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load intents
with open('intents.json', 'r') as file:
    intents = json.load(file)

lemmatizer = WordNetLemmatizer()

# Prepare training data
patterns = []
tags = []
responses_dict = {}

for intent in intents['intents']:
    for pattern in intent['patterns']:
        patterns.append(pattern.lower())
        tags.append(intent['tag'])
    responses_dict[intent['tag']] = intent['responses']

# Vectorize patterns
vectorizer = TfidfVectorizer(token_pattern=r'(?u)\b\w+\b', max_features=2000)
X = vectorizer.fit_transform(patterns)
y = np.array(tags)

# Train model
model = LogisticRegression(max_iter=1000, C=0.8)
model.fit(X, y)

# Save everything
with open('chatbot_model.pkl', 'wb') as f:
    pickle.dump({'model': model, 'vectorizer': vectorizer, 'responses': responses_dict}, f)

print("✅ Model trained and saved as 'chatbot_model.pkl'")
print(f"📊 Training data: {len(patterns)} patterns, {len(set(tags))} categories")