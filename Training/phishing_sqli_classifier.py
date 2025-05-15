import pandas as pd
import string
import matplotlib.pyplot as plt

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, ConfusionMatrixDisplay

from pathlib import Path

filepath = Path("classification_dataset/combined_dataset.csv")
text_df = pd.read_csv(filepath)

def text_preprocess(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = [word for word in text.split() if word.lower() not in stopwords_cleaned]
    return " ".join(text)

nltk.download('stopwords', quiet=True)
stopwords = stopwords.words('english')
stopwords_cleaned = [i.translate(str.maketrans('', '', string.punctuation)) for i in stopwords]

print("Preprocessing text data...")
text_df['TEXT_CLEANED'] = text_df['Text'].map(text_preprocess)
text_df = text_df[text_df['TEXT_CLEANED'].str.strip() != '']
text_df = text_df.dropna(subset=['TEXT_CLEANED'])

X = text_df['TEXT_CLEANED'].copy()
y = text_df['AttackType'].copy()
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Vectorizing text data...")
vectoriser = CountVectorizer()
X_train_counts = vectoriser.fit_transform(X_train)
tfidf_transformer = TfidfTransformer()
X_train_transf = tfidf_transformer.fit_transform(X_train_counts)

print("Training Logistic Regression model...")
clf_log = LogisticRegression(solver='liblinear', max_iter=1000)
clf_log.fit(X_train_transf, y_train)

X_test_counts = vectoriser.transform(X_test)
X_test_transf = tfidf_transformer.transform(X_test_counts)
y_pred = clf_log.predict(X_test_transf)

print("\nModel Performance:")
print(classification_report(y_test, y_pred))

cm = confusion_matrix(y_test, y_pred)
disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['phishing', 'sqli', 'ddos'])
plt.figure(figsize=(8, 6))
disp.plot()
plt.title('Confusion Matrix')
plt.savefig('classification_dataset/confusion_matrix.png')
plt.close()

def predict_attack(input_text):
    input_cleaned = text_preprocess(input_text)
    input_counts = vectoriser.transform([input_cleaned])
    input_transf = tfidf_transformer.transform(input_counts)
    
    prediction = clf_log.predict(input_transf)
    prediction_prob = clf_log.predict_proba(input_transf)[0]
    class_labels = clf_log.classes_
    pred_class_idx = list(class_labels).index(prediction[0])
    pred_prob = prediction_prob[pred_class_idx]
    
    confidence = "High" if pred_prob >= 0.8 else "Medium" if pred_prob >= 0.6 else "Low"
    
    print("\nInput text:", input_text)
    print("\nPrediction:", prediction[0].upper())
    print("Confidence:", confidence)
    for label, prob in zip(class_labels, prediction_prob):
        print(f"- p({label.capitalize()}): {prob:.2f}")
    
    return prediction[0]

print("\nTesting with example inputs...")

phishing_example = "Urgent: Your account has been suspended. Click here to verify: http://suspicious-bank.com"
print("\n=== PHISHING TEST ===")
predict_attack(phishing_example)

sqli_example = "SELECT * FROM users WHERE username = 'admin' OR '1'='1'"
print("\n=== SQL INJECTION TEST ===")
predict_attack(sqli_example)

ddos_example = "172.16.0.5,192.168.50.1,715,30494,17,2,1472,1472,1472,1472000000,1000000,2,2,2,2,2,2,2,1000000,1472,1472,1472,2208,1472,2960,2,2944,-1,-1,1,1480,1"
print("\n=== DDOS TEST ===")
predict_attack(ddos_example)

print("\nModel and example predictions saved. You can now use predict_attack() function to classify new inputs.")