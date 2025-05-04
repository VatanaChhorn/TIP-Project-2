import sys
from pathlib import Path
import pandas as pd
import glob

# Add src directory to Python path
sys.path.append(str(Path(__file__).parent / "src"))

from sqli_detector import SQLiDetector
from sms_spam_detector import SMSDetector
from ddos_predictor import DDoSPredictor
from predict import AttackPredictor
from ddos_predictor import DDoSDataCleaner


class MLDetectionSystem:
    def __init__(self):
        # Initialize the classifier
        self.classifier_path = (
            Path(__file__).parent / "models" / "classifier" / "pipeline.pkl"
        )
        self.classifier = AttackPredictor(pipeline_path=self.classifier_path)

        # Initialize SQL Injection detector
        self.sqli_model_path = (
            Path(__file__).parent / "models" / "sqli" / "sqli_detector_model.pkl"
        )
        self.sqli_detector = SQLiDetector(model_path=self.sqli_model_path)

        # Initialize Phishing/SMS detector
        self.phishing_model_path = (
            Path(__file__).parent / "models" / "phishing" / "sms_detector_model.pkl"
        )
        self.phishing_detector = SMSDetector(model_path=self.phishing_model_path)

        # Initialize DDoS detector
        self.ddos_model_path = (
            Path(__file__).parent / "models" / "ddos" / "ddos_model.pkl"
        )
        self.ddos_detector = DDoSPredictor(model_path=self.ddos_model_path)

        print("Successfully loaded all models")

    def process_input(self, filePath: str) -> dict:
        """Process input through the classifier and then the specific model."""
        try:
            # Read the CSV file
            try:
                df = pd.read_csv(filePath)
            except Exception as e:
                return {"error": f"Error reading CSV file: {str(e)}"}

            # Process each row individually
            results = []
            for idx, row in df.iterrows():
                # Convert row to string for classification
                row = row.dropna()
                text = ",".join(map(str, row))
                
                # Get classification for this row
                classification = self.classifier.predict(text)
                attack_type = classification["prediction"].lower()
                
                # Process with appropriate model based on classification
                if attack_type == "sqli":
                    prediction = self.process_sqli_samples(pd.DataFrame([row]))
                    model_name = "SQL INJECTION DETECTION"
                elif attack_type == "phishing":
                    prediction = self.process_sms_samples(pd.DataFrame([row]))
                    model_name = "PHISHING/SMS SCAM DETECTION"
                elif attack_type == "ddos":
                    prediction = self.process_ddos_samples(pd.DataFrame([row]))
                    model_name = "DDoS ATTACK PREDICTION"
                else:
                    prediction = [{"error": f"Unknown attack type: {attack_type}"}]
                    model_name = "UNKNOWN"
                
                # Add result for this row
                results.append({
                    "row_index": idx,
                    "classification": classification,
                    "model_name": model_name,
                    "prediction": prediction[0] if prediction else None
                })
            
            # Save results to CSV
            output_df = pd.DataFrame(results)
            output_path = str(Path(filePath).parent / "detection_results.csv")
            output_df.to_csv(output_path, index=False)
            
            print(results)
            return {
                "results": results,
                "output_file": output_path
            }

        except Exception as e:
            return {"error": f"Error processing file: {str(e)}"}

    def process_classification(self, df: str) -> list:
        # Take first 5 rows or less
        df = df.head(5)
        # Convert each row to string for classification
        text = df.apply(lambda x: ",".join(map(str, x)), axis=1).to_list()
        text = "\n".join(text)  # Join rows with newlines for classification

        return self.classifier.predict(text)

    def process_sqli_samples(self, df: str) -> list:
        """Process SQLi samples from a CSV file.
        
        Returns:
            list: List of dictionaries containing:
                - input (dict): Original input data with column names as keys
                - prediction (str): Either "✅ Safe Query" or "🚨 SQL Injection"
                - probabilities (dict): Confidence scores for 'safe' and 'malicious' classes
                - predicted_label (str): Always "sqli" for this detector
        """
        try:
            results = []
            for idx, row in df.iterrows():
                # Store original input
                input_data = {col: str(val) for col, val in row.items()}
                
                # Convert row to string for prediction
                text = ",".join(map(str, row))
                
                # Get prediction for this row
                result = self.sqli_detector.predict_text(text)
                result["input"] = input_data
                result["predicted_label"] = "sqli"
                results.append(result)

            return results

        except Exception as e:
            return [{"error": str(e)}]

    def process_sms_samples(self, df: str) -> list:
        """Process SMS/Phishing samples from a CSV file.
        
        Returns:
            list: List of dictionaries containing:
                - input (dict): Original input data with column names as keys
                - prediction (str): Either "✅ Safe Message" or "🚨 Spam Message"
                - probabilities (dict): Confidence scores for 'safe' and 'malicious' classes
                - predicted_label (str): Always "phishing" for this detector
        """
        try:
            results = []
            for idx, row in df.iterrows():
                # Store original input
                input_data = {col: str(val) for col, val in row.items()}
                
                # Convert row to string for prediction
                text = ",".join(map(str, row))
                
                # Get prediction for this row
                result = self.phishing_detector.predict_text(text)
                result["input"] = input_data
                result["predicted_label"] = "phishing"
                results.append(result)

            return results

        except Exception as e:
            return [{"error": str(e)}]

    def process_ddos_samples(self, df: str) -> list:
        """Process DDoS samples from a CSV file.
        
        Returns:
            list: List of dictionaries containing:
                - input (dict): Original input data with column names as keys
                - prediction (str): Either "✅ Safe Message" or "🚨 Spam Message" 
                - probabilities (dict): Confidence scores for 'safe' and 'malicious' classes
                - predicted_label (str): Always "ddos" for this detector
        """
        try:
            # Clean the input data
            cleaned_df = DDoSDataCleaner.cleanInputData(df)
            
            # Get predictions
            predictions = self.ddos_detector.predict(cleaned_df)
            
            # Debug information
            print("Cleaned DataFrame shape:", cleaned_df.shape)
            print("Predictions shape:", predictions.shape)
            print("Cleaned DataFrame index:", cleaned_df.index.tolist())
            print("Predictions index:", predictions.index.tolist())
            
            # Reset index to ensure alignment
            cleaned_df = cleaned_df.reset_index(drop=True)
            predictions = predictions.reset_index(drop=True)
            
            # Add predictions as a new column to the original DataFrame
            cleaned_df['prediction'] = predictions
            
            print("Final DataFrame with predictions:")
            print(cleaned_df[['Flow ID', 'prediction']].tail())
            
            # Convert DataFrame to list of dictionaries with predictions
            results = []
            for idx, row in cleaned_df.iterrows():
                input_data = {col: str(val) for col, val in row.items()}
                result = {
                    "input": input_data,
                    "prediction": row['prediction'],
                    "predicted_label": "ddos"
                }
                results.append(result)
            
            return results

        except Exception as e:
            return [{"error": str(e)}]