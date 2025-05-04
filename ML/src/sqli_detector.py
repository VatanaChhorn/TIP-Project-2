import pandas as pd
import string
import nltk
import pickle
import os
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score, classification_report
from pathlib import Path

class SQLiDetector:
    def __init__(self, model_path=None):
        self.vectorizer = CountVectorizer()
        self.tfidf = TfidfTransformer()
        self.stopwords_cleaned = self._prepare_stopwords()
        
        # Initialize base models
        self.nb_model = MultinomialNB()
        self.lr_model = LogisticRegression(solver='liblinear')
        
        # Initialize ensemble model
        self.ensemble = VotingClassifier(
            estimators=[
                ('nb', self.nb_model),
                ('lr', self.lr_model)
            ],
            voting='soft'
        )
        
        # Load model if path is provided
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        
    def _prepare_stopwords(self):
        """Prepare cleaned stopwords by removing punctuation."""
        nltk.download('stopwords', quiet=True)
        stopwords_list = stopwords.words('english')
        return [word.translate(str.maketrans('', '', string.punctuation)) 
                for word in stopwords_list]

    def text_preprocess(self, text):
        """Preprocess text by standardizing case, removing punctuation and stopwords."""
        if not isinstance(text, str):
            text = str(text)
        text = text.lower()
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = [word for word in text.split() if word.lower() not in self.stopwords_cleaned]
        return " ".join(text)

    def load_and_prepare_data(self):
        """Load and prepare SQLi dataset."""
        # Read with all columns as string type to avoid conversion errors
        sqli_df = pd.read_csv(Path(__file__).parent / "data/SQLiV3.csv", 
                             encoding='utf-8',
                             dtype=str,  # Read all columns as strings
                             on_bad_lines='skip')  # Skip problematic lines
        
        # Keep only the first two columns and rename them
        sqli_df = sqli_df.iloc[:, :2]  # Select first two columns
        sqli_df.columns = ['TEXT', 'LABEL']
        
        # Clean SQLi data
        sqli_df = sqli_df.dropna()  # Remove rows with missing values
        sqli_df['TEXT'] = sqli_df['TEXT'].astype(str).map(self.text_preprocess)
        
        # Convert labels to binary (1 for malicious, 0 for safe)
        # If label can be converted to float and is greater than 0, mark as malicious
        def convert_label(x):
            try:
                return 1 if float(x) > 0 else 0
            except (ValueError, TypeError):
                return 0
                
        sqli_df['LABEL'] = sqli_df['LABEL'].map(convert_label)
        
        # Remove duplicates
        sqli_df.drop_duplicates(subset=['TEXT'], keep='first', inplace=True)
        
        print("\nSQLi Dataset Statistics:")
        print(f"Total samples: {len(sqli_df)}")
        print("\nLabel distribution:")
        print(sqli_df['LABEL'].value_counts(normalize=True))
        
        return sqli_df

    def train_models(self, data):
        """Train the models on the provided data."""
        # Split data
        X = data['TEXT']
        y = data['LABEL']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Transform training data
        X_train_counts = self.vectorizer.fit_transform(X_train)
        X_train_tfidf = self.tfidf.fit_transform(X_train_counts)
        
        # Train ensemble model
        self.ensemble.fit(X_train_tfidf, y_train)
        
        # Transform test data
        X_test_counts = self.vectorizer.transform(X_test)
        X_test_tfidf = self.tfidf.transform(X_test_counts)
        
        # Evaluate
        y_pred = self.ensemble.predict(X_test_tfidf)
        accuracy = accuracy_score(y_test, y_pred)
        report = classification_report(y_test, y_pred)
        
        print("\nModel Performance:")
        print(f"Accuracy: {round(accuracy*100, 2)}%")
        print("\nClassification report:")
        print(report)
        
        return X_test, y_test

    def predict_text(self, text):
        """Predict if a given text is a SQL injection attempt."""
        # Preprocess text
        processed_text = self.text_preprocess(text)
        
        # Transform text
        text_counts = self.vectorizer.transform([processed_text])
        text_tfidf = self.tfidf.transform(text_counts)
        
        # Get prediction and probabilities
        prediction = self.ensemble.predict(text_tfidf)[0]
        probabilities = self.ensemble.predict_proba(text_tfidf)[0]
        
        # Determine result
        result = "🚨 SQL Injection" if prediction == 1 else "✅ Safe Query"
        
        return {
            'text': text,
            'prediction': result,
            'probabilities': {
                'safe': round(probabilities[0], 2),
                'malicious': round(probabilities[1], 2)
            }
        }

    def save_model(self, model_path):
        """Save the trained model and its components."""
        model_data = {
            'vectorizer': self.vectorizer,
            'tfidf': self.tfidf,
            'ensemble': self.ensemble
        }
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        print(f"Model saved successfully to {model_path}")

    def load_model(self, model_path):
        """Load a trained model and its components."""
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        self.vectorizer = model_data['vectorizer']
        self.tfidf = model_data['tfidf']
        self.ensemble = model_data['ensemble']
        print(f"Model loaded successfully from {model_path}")

def main():
    # # Initialize detector
    # detector = SQLiDetector()
    
    # # Load and prepare data
    # data = detector.load_and_prepare_data()
    
    # # Train models
    # X_test, y_test = detector.train_models(data)
    
    # # Save the model
    # model_path = Path(__file__).parent / "models" / "sqli_detector_model.pkl"
    # detector.save_model(model_path)
    
    # Load the model
    model_path = Path(__file__).parent.parent / "models" / "sqli" / "sqli_detector_model.pkl"
    print(model_path)
    detector = SQLiDetector()
    detector.load_model(model_path)
    
    # Example predictions
    test_texts = [
        """
        SELECT * FROM users WHERE username = 'admin' AND password = 'password123'
        """,
        """
        SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = 'anything'
        """
    ]
    
    print("\n=== TEST PREDICTIONS ===")
    for text in test_texts:
        result = detector.predict_text(text)
        print(f"\nText: {result['text']}")
        print(f"Prediction: {result['prediction']}")
        print("Probabilities:")
        print(f"- Safe: {result['probabilities']['safe']}")
        print(f"- Malicious: {result['probabilities']['malicious']}")

if __name__ == "__main__":
    main() 