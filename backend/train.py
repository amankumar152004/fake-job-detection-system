import pandas as pd
import numpy as np
import re
import nltk
import joblib

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.metrics import confusion_matrix

from xgboost import XGBClassifier

nltk.download('stopwords')
nltk.download('wordnet')

# Load dataset
df = pd.read_csv("dataset/fake_job_postings.csv")

# Keep useful columns
df = df[['title', 'company_profile', 'description', 'requirements', 'fraudulent']]

# Fill missing values
df = df.fillna('')

# Combine text columns
df['text'] = (
    df['title'] + ' ' +
    df['company_profile'] + ' ' +
    df['description'] + ' ' +
    df['requirements']
)

# Text preprocessing
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

def clean_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z]', ' ', text)

    words = text.split()

    words = [
        lemmatizer.lemmatize(word)
        for word in words
        if word not in stop_words
    ]

    return ' '.join(words)

df['cleaned_text'] = df['text'].apply(clean_text)

# Features and labels
X = df['cleaned_text']
y = df['fraudulent']

# TF-IDF Vectorization
vectorizer = TfidfVectorizer(max_features=5000)

X_vectorized = vectorizer.fit_transform(X)

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized,
    y,
    test_size=0.2,
    random_state=42
)

# Model
fake_count = sum(y == 1)
real_count = sum(y == 0)

scale_weight = real_count / fake_count

model = XGBClassifier(
    n_estimators=200,
    max_depth=8,
    learning_rate=0.05,
    scale_pos_weight=scale_weight,
    subsample=0.8,
    colsample_bytree=0.8
)

# Train
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Accuracy
accuracy = accuracy_score(y_test, y_pred)

print(f"Accuracy: {accuracy:.4f}")

print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:\n")
print(cm)

# Save model
joblib.dump(model, "model/fake_job_model.pkl")
joblib.dump(vectorizer, "model/vectorizer.pkl")

print("\nModel saved successfully.")