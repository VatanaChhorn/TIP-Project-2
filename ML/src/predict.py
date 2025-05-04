import pickle
import string
import nltk
from nltk.corpus import stopwords

class AttackPredictor:
    def __init__(self, pipeline_path='pipeline.pkl'):
        # Load the pipeline
        with open(pipeline_path, 'rb') as f:
            self.pipeline = pickle.load(f)
        
        # Initialize components
        self.vectorizer = self.pipeline['vectorizer']
        self.tfidf_transformer = self.pipeline['tfidf_transformer']
        self.classifier = self.pipeline['classifier']
        
        # Initialize stopwords
        nltk.download('stopwords', quiet=True)
        self.stopwords = stopwords.words('english')
        self.stopwords_cleaned = [i.translate(str.maketrans('', '', string.punctuation)) 
                                for i in self.stopwords]

    def preprocess_text(self, text):
        """Preprocess the input text"""
        if not isinstance(text, str):
            return ""
        text = text.lower()
        text = [word for word in text.split() if word.lower() not in self.stopwords_cleaned]
        return " ".join(text)

    def predict(self, input_text):
        """Make a prediction for the input text"""
        # Preprocess input
        input_cleaned = self.preprocess_text(input_text)
        input_counts = self.vectorizer.transform([input_cleaned])
        input_transf = self.tfidf_transformer.transform(input_counts)
        
        # Get prediction and probabilities
        prediction = self.classifier.predict(input_transf)
        prediction_prob = self.classifier.predict_proba(input_transf)[0]
        class_labels = self.classifier.classes_
        pred_class_idx = list(class_labels).index(prediction[0])
        pred_prob = prediction_prob[pred_class_idx]
        
        # Determine confidence level
        confidence = "High" if pred_prob >= 0.8 else "Medium" if pred_prob >= 0.6 else "Low"
        
        # Prepare results
        results = {
            'prediction': prediction[0].upper(),
            'confidence': confidence,
            'probabilities': {
                label.capitalize(): float(prob) 
                for label, prob in zip(class_labels, prediction_prob)
            }
        }
        
        return results

def main():
    # Create predictor instance
    predictor = AttackPredictor()
    
    # Example usage
    test_cases = [
        "Urgent: Your account has been suspended. Click here to verify: http://suspicious-bank.com",
        "SELECT * FROM users WHERE username = 'admin' OR '1'='1'",
        "172.16.0.5,192.168.50.1,715,30494,17,2,1472,1472,1472,1472000000,1000000,2,2,2,2,2,2,2,1000000,1472,1472,1472,2208,1472,2960,2,2944,-1,-1,1,1480,1"
    ]
    
    for i, text in enumerate(test_cases, 1):
        print(f"\nTest Case {i}:")
        print(f"Input: {text}")
        result = predictor.predict(text)
        print(f"Prediction: {result['prediction']}")
        print(f"Confidence: {result['confidence']}")
        print("Probabilities:")
        for label, prob in result['probabilities'].items():
            print(f"- {label}: {prob:.2f}")

if __name__ == "__main__":
    main() 