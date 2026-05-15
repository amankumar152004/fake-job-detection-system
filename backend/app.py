from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import joblib
import re

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# Load model and vectorizer
model = joblib.load("model/fake_job_model.pkl")
vectorizer = joblib.load("model/vectorizer.pkl")

# Initialize app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# NLP setup
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))
suspicious_keywords = [
    "quick money",
    "urgent hiring",
    "easy income",
    "work from home",
    "no experience",
    "weekly payout",
    "limited seats",
    "earn money fast",
    "registration fee",
    "investment required"
]
# Request schema
class JobInput(BaseModel):
    title: str
    company_profile: str
    description: str
    requirements: str

# Cleaning function
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

# Home route
@app.get("/")
def home():
    return {"message": "API Running"}

# Prediction route
@app.post("/predict")
def predict(job: JobInput):
    
    combined_text = (
        job.title + " " +
        job.company_profile + " " +
        job.description + " " +
        job.requirements
    )

    cleaned = clean_text(combined_text)
    found_keywords = []

    for keyword in suspicious_keywords:
        if keyword in combined_text.lower():
            found_keywords.append(keyword)
    
    vectorized = vectorizer.transform([cleaned])

    prediction = model.predict(vectorized)[0]

    probability = model.predict_proba(vectorized)[0][1]

    result = "Fake Job" if prediction == 1 else "Real Job"

    return {
        "prediction": result,
        "fraud_probability": round(float(probability) * 100, 2),
        "suspicious_keywords": found_keywords
    }