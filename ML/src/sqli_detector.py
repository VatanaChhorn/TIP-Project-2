import pandas as pd
import string
import nltk
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns
from nltk.corpus import stopwords
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score, precision_score, recall_score, roc_curve, auc
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

    def generate_performance_visualization(self, y_true, y_pred, y_prob, save_path=None):
        """Generate a comprehensive performance metrics visualization."""
        # Create figure with subplots
        fig = plt.figure(figsize=(15, 10))
        gs = fig.add_gridspec(2, 2)
        
        # Confusion Matrix
        ax1 = fig.add_subplot(gs[0, 0])
        cm = confusion_matrix(y_true, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=['Safe', 'Malicious'],
                   yticklabels=['Safe', 'Malicious'],
                   ax=ax1)
        ax1.set_title('Confusion Matrix')
        ax1.set_ylabel('True Label')
        ax1.set_xlabel('Predicted Label')
        
        # ROC Curve
        ax2 = fig.add_subplot(gs[0, 1])
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        roc_auc = auc(fpr, tpr)
        ax2.plot(fpr, tpr, color='darkorange', lw=2,
                label=f'ROC curve (AUC = {roc_auc:.2f})')
        ax2.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        ax2.set_xlim([0.0, 1.0])
        ax2.set_ylim([0.0, 1.05])
        ax2.set_xlabel('False Positive Rate')
        ax2.set_ylabel('True Positive Rate')
        ax2.set_title('ROC Curve')
        ax2.legend(loc="lower right")
        
        # Metrics Summary
        ax3 = fig.add_subplot(gs[1, :])
        ax3.axis('off')
        
        # Calculate metrics
        accuracy = accuracy_score(y_true, y_pred)
        precision = precision_score(y_true, y_pred)
        recall = recall_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
        
        # Create metrics text
        metrics_text = (
            f"Model Performance Metrics:\n\n"
            f"Accuracy: {accuracy:.3f}\n"
            f"Precision: {precision:.3f}\n"
            f"Recall: {recall:.3f}\n"
            f"F1 Score: {f1:.3f}\n"
            f"AUC-ROC: {roc_auc:.3f}"
        )
        
        ax3.text(0.1, 0.5, metrics_text, fontsize=12, family='monospace')
        
        plt.tight_layout()
        
        if save_path:
            plt.savefig(save_path, dpi=300, bbox_inches='tight')
            plt.close()
        else:
            plt.show()
            
        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1': f1,
            'auc_roc': roc_auc
        }

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
        
        # Get predictions and probabilities
        y_pred = self.ensemble.predict(X_test_tfidf)
        y_prob = self.ensemble.predict_proba(X_test_tfidf)[:, 1]
        
        # Create metrics directory if it doesn't exist
        metrics_dir = Path(__file__).parent / "models" / "sqli_metrics"
        metrics_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate and save performance visualization
        metrics_path = metrics_dir / "performance_metrics.png"
        metrics = self.generate_performance_visualization(y_test, y_pred, y_prob, metrics_path)
        
        print("\nModel Performance:")
        print(f"Accuracy: {round(metrics['accuracy']*100, 2)}%")
        print(f"Precision: {round(metrics['precision']*100, 2)}%")
        print(f"Recall: {round(metrics['recall']*100, 2)}%")
        print(f"F1 Score: {round(metrics['f1']*100, 2)}%")
        print(f"AUC-ROC: {round(metrics['auc_roc']*100, 2)}%")
        print(f"\nPerformance metrics visualization saved to: {metrics_path}")
        
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
    # Initialize detector
    detector = SQLiDetector()
    
    # Load and prepare data
    data = detector.load_and_prepare_data()
    
    # Train models
    X_test, y_test = detector.train_models(data)
    
    # # Save the model
    # model_path = Path(__file__).parent / "models" / "sqli_detector_model.pkl"
    # detector.save_model(model_path)
    
    # Load the model
    # model_path = Path(__file__).parent.parent / "models" / "sqli" / "sqli_detector_model.pkl"
    # print(model_path)
    # detector = SQLiDetector()
    # detector.load_model(model_path)
    
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