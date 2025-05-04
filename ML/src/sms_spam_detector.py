import pandas as pd
import string
import matplotlib.pyplot as plt
import pickle
import os
import seaborn as sns
from sklearn.metrics import f1_score, precision_score, recall_score, roc_curve, auc
import numpy as np
import base64
from io import BytesIO

import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, ConfusionMatrixDisplay
from sklearn.ensemble import VotingClassifier

from pathlib import Path

# Get the directory where the script is located
SCRIPT_DIR = Path(__file__).parent

class SMSDetector:
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
            
        # Initialize metrics storage
        self.metrics = {
            'y_true': [],
            'y_pred': [],
            'y_prob': []
        }
        
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
        """Load and prepare SMS spam dataset."""
        # Load first dataset
        spam_df = pd.read_csv(Path(__file__).parent / "../data/spam.csv", encoding='ISO-8859-1')
        spam_df = spam_df[['v1', 'v2']]
        spam_df.columns = ['LABEL', 'TEXT']

        # Load second dataset
        more_df = pd.read_csv(Path(__file__).parent / "../data/Dataset_5971.csv", encoding='ISO-8859-1')
        more_df = more_df[more_df.LABEL != 'ham'].copy()
        more_df['LABEL'] = more_df['LABEL'].str.lower()
        more_df.drop(columns=['URL', 'EMAIL', 'PHONE'], inplace=True)

        # Combine datasets
        spam_df = pd.concat([spam_df, more_df], ignore_index=True)
        spam_df.drop_duplicates(subset=['TEXT'], keep='first', inplace=True)
        spam_df['LABEL'] = spam_df['LABEL'].map({'ham': 0, 'spam': 1, 'smishing': 1})
        spam_df['TEXT'] = spam_df['TEXT'].map(self.text_preprocess)
        
        print("\nSMS Dataset Statistics:")
        print(f"Total samples: {len(spam_df)}")
        print("\nLabel distribution:")
        print(spam_df['LABEL'].value_counts(normalize=True))
        
        return spam_df

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
        metrics_dir = SCRIPT_DIR / "models" / "sms_metrics"
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

    def plot_confusion_matrix(self, y_true, y_pred, save_path=None):
        """Plot and save confusion matrix."""
        cm = confusion_matrix(y_true, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                   xticklabels=['Safe', 'Malicious'],
                   yticklabels=['Safe', 'Malicious'])
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
        else:
            plt.show()
            
    def plot_roc_curve(self, y_true, y_prob, save_path=None):
        """Plot and save ROC curve."""
        fpr, tpr, _ = roc_curve(y_true, y_prob)
        roc_auc = auc(fpr, tpr)
        
        plt.figure(figsize=(8, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2,
                label=f'ROC curve (AUC = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('Receiver Operating Characteristic (ROC) Curve')
        plt.legend(loc="lower right")
        
        if save_path:
            plt.savefig(save_path)
            plt.close()
        else:
            plt.show()
            
    def plot_metrics(self, y_true, y_pred, y_prob, save_dir=None):
        """Plot all metrics and save them."""
        if save_dir:
            os.makedirs(save_dir, exist_ok=True)
            
        # Plot confusion matrix
        cm_path = os.path.join(save_dir, 'confusion_matrix.png') if save_dir else None
        self.plot_confusion_matrix(y_true, y_pred, cm_path)
        
        # Plot ROC curve
        roc_path = os.path.join(save_dir, 'roc_curve.png') if save_dir else None
        self.plot_roc_curve(y_true, y_prob, roc_path)
        
        # Calculate and print metrics
        metrics = {
            'accuracy': accuracy_score(y_true, y_pred),
            'precision': precision_score(y_true, y_pred),
            'recall': recall_score(y_true, y_pred),
            'f1': f1_score(y_true, y_pred)
        }
        
        print("\nModel Performance Metrics:")
        for metric, value in metrics.items():
            print(f"{metric.capitalize()}: {value:.3f}")
            
        return metrics

    def get_confusion_matrix(self):
        """Get the confusion matrix for all predictions made so far."""
        if not self.metrics['y_pred']:
            return None
            
        # Count predictions
        safe_count = self.metrics['y_pred'].count(0)
        malicious_count = self.metrics['y_pred'].count(1)
        
        # Create confusion matrix
        confusion_mat = np.array([[safe_count, 0], [0, malicious_count]])
        
        return {
            'matrix': confusion_mat.tolist(),
            'total_predictions': len(self.metrics['y_pred']),
            'safe_predictions': safe_count,
            'malicious_predictions': malicious_count
        }

    def predict_text(self, text, update_metrics=True):
        """Predict if a given text is spam/smishing."""
        # Preprocess text
        processed_text = self.text_preprocess(text)
        
        # Transform text
        text_counts = self.vectorizer.transform([processed_text])
        text_tfidf = self.tfidf.transform(text_counts)
        
        # Get prediction and probabilities
        prediction = self.ensemble.predict(text_tfidf)[0]
        probabilities = self.ensemble.predict_proba(text_tfidf)[0]
        
        # Update metrics if requested
        if update_metrics:
            self.metrics['y_pred'].append(prediction)
            self.metrics['y_prob'].append(probabilities[1])
        
        # Determine result
        result = "🚨 Malicious Message" if prediction == 1 else "✅ Safe Message"
        
        return {
            'text': text,
            'prediction': result,
            'probabilities': {
                'safe': round(probabilities[0], 2),
                'malicious': round(probabilities[1], 2)
            }
        }

    def evaluate_performance(self, X_test, y_test, save_dir=None):
        """Evaluate model performance on test data."""
        # Get predictions
        X_test_counts = self.vectorizer.transform(X_test)
        X_test_tfidf = self.tfidf.transform(X_test_counts)
        y_pred = self.ensemble.predict(X_test_tfidf)
        y_prob = self.ensemble.predict_proba(X_test_tfidf)[:, 1]
        
        # Plot metrics
        metrics = self.plot_metrics(y_test, y_pred, y_prob, save_dir)
        
        # Get confusion matrix for all predictions
        confusion_stats = self.get_confusion_matrix()
        performance_metrics = {}
        
        if confusion_stats:
            # Calculate classification report from stored predictions
            if len(self.metrics['y_pred']) > 0:
                y_true = self.metrics['y_pred']
                y_pred = self.metrics['y_pred']
                report = classification_report(y_true, y_pred, output_dict=True)
                
                # Create figure with two subplots
                fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 12))
                
                # Plot confusion matrix
                sns.heatmap(confusion_stats['matrix'], 
                           annot=True, 
                           fmt='d',
                           cmap='Blues',
                           xticklabels=['Safe', 'Malicious'],
                           yticklabels=['Safe', 'Malicious'],
                           ax=ax1)
                ax1.set_title('Confusion Matrix of All Predictions')
                ax1.set_ylabel('True Label')
                ax1.set_xlabel('Predicted Label')
                
                # Add classification report as text
                ax2.axis('off')
                ax2.text(0.1, 0.9, 'Classification Report for Stored Predictions:', fontsize=12, fontweight='bold')
                ax2.text(0.1, 0.8, classification_report(y_true, y_pred), fontsize=10, family='monospace')
                
                plt.tight_layout()
                
                # Convert plot to base64
                buffer = BytesIO()
                plt.savefig(buffer, format='png')
                buffer.seek(0)
                image_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
                plt.close()
                
                performance_metrics['plot_base64'] = image_base64
            
            # Prepare metrics dictionary
            performance_metrics.update({
                'confusion_matrix': {
                    'matrix': confusion_stats['matrix'],
                    'total_predictions': confusion_stats['total_predictions'],
                    'safe_predictions': confusion_stats['safe_predictions'],
                    'malicious_predictions': confusion_stats['malicious_predictions']
                },
                'classification_report': report,
                'metrics': {
                    'accuracy': metrics['accuracy'],
                    'precision': metrics['precision'],
                    'recall': metrics['recall'],
                    'f1': metrics['f1']
                }
            })
        
        return performance_metrics

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
    detector = SMSDetector()
    
    # Load and prepare data
    data = detector.load_and_prepare_data()
    
    # Train models
    X_test, y_test = detector.train_models(data)
    
    # Example predictions
    test_texts = [
        """
        Hey Vatana, your parcel #US9382746 is still waiting for you! 
        We've tried contacting you multiple times. 
        To avoid return, confirm your delivery address now at https://delivery-confirm.co/track.
        """,
        """
        WINNER!!! You've been selected to receive a $900,000 prize reward! 
        To claim, call 09061701461. Code KL341. Valid 12 hours only.
        """, 
        """
        URGENT! You have won a $1000 gift card. Click here to claim now: www.fakesite.com
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
    
    # Evaluate performance and show confusion matrix
    save_dir = SCRIPT_DIR / "models" / "sms_metrics"
    performance_metrics = detector.evaluate_performance(X_test, y_test, save_dir)
    print("\nModel Performance Metrics:")
    
    # for metric, value in performance_metrics['metrics'].items():
    #     print(f"{metric.capitalize()}: {value:.3f}")
    # print(f"\nPerformance metrics saved to: {performance_metrics['plot_base64']}")

if __name__ == "__main__":
    main()
