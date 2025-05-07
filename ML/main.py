import sys
from pathlib import Path
import pandas as pd
import glob

sys.path.append(str(Path(__file__).parent / "src"))

from sqli_detector import SQLiDetector
from sms_spam_detector import SMSDetector
from ddos_predictor import DDoSPredictor
from predict import AttackPredictor
from ddos_predictor import DDoSDataCleaner


class MLDetectionSystem:
    def __init__(self):
        self.classifier_path = (
            Path(__file__).parent / "models" / "classifier" / "pipeline.pkl"
        )
        self.classifier = AttackPredictor(pipeline_path=self.classifier_path)

        self.sqli_model_path = (
            Path(__file__).parent / "models" / "sqli" / "sqli_detector_model.pkl"
        )
        self.sqli_detector = SQLiDetector(model_path=self.sqli_model_path)

        self.phishing_model_path = (
            Path(__file__).parent / "models" / "phishing" / "sms_detector_model.pkl"
        )
        self.phishing_detector = SMSDetector(model_path=self.phishing_model_path)

        self.ddos_model_path = (
            Path(__file__).parent / "models" / "ddos" / "ddos_model.pkl"
        )
        self.ddos_detector = DDoSPredictor(model_path=self.ddos_model_path)

        print("Successfully loaded all models")

    def process_input(self, filePath: str) -> dict:
        try:
            try:
                df = pd.read_csv(filePath)
            except Exception as e:
                return {"error": f"Error reading CSV file: {str(e)}"}

            results = []
            for idx, row in df.iterrows():
                row = row.dropna()
                text = ",".join(map(str, row))
                
                classification = self.classifier.predict(text)
                attack_type = classification["prediction"].lower()
                
                if attack_type == "sqli":
                    prediction = self.process_sqli_samples(pd.DataFrame([row]))
                    model_name = "SQL INJECTION DETECTION"
                elif attack_type == "phishing":
                    prediction = self.process_sms_samples(pd.DataFrame([row]))
                    model_name = "PHISHING/SMS SCAM DETECTION"
                    if prediction and 'probabilities' in prediction[0]:
                        prob = prediction[0]['probabilities'].get('malicious', 0)
                        if 0.4 <= prob <= 0.6:
                            prediction[0]['prediction'] = "Potential Malicious Message"
                elif attack_type == "ddos":
                    prediction = self.process_ddos_samples(pd.DataFrame([row]))
                    model_name = "DDoS ATTACK PREDICTION"
                else:
                    prediction = [{"error": f"Unknown attack type: {attack_type}"}]
                    model_name = "UNKNOWN"
                
                results.append({
                    "row_index": idx,
                    "classification": classification,
                    "model_name": model_name,
                    "prediction": prediction[0] if prediction else None
                })
            
            output_df = pd.DataFrame(results)
            output_path = str(Path(filePath).parent / "detection_results.csv")
            output_df.to_csv(output_path, index=False)
            
            return {
                "results": results,
                "output_file": output_path
            }

        except Exception as e:
            return {"error": f"Error processing file: {str(e)}"}

    def process_classification(self, df: str) -> list:
        df = df.head(5)
        text = df.apply(lambda x: ",".join(map(str, x)), axis=1).to_list()
        text = "\n".join(text)

        return self.classifier.predict(text)

    def process_sqli_samples(self, df: str) -> list:
        try:
            results = []
            for idx, row in df.iterrows():
                input_data = {col: str(val) for col, val in row.items()}
                
                text = ",".join(map(str, row))
                
                result = self.sqli_detector.predict_text(text)
                result["input"] = input_data
                result["predicted_label"] = "sqli"
                results.append(result)

            return results

        except Exception as e:
            return [{"error": str(e)}]

    def process_sms_samples(self, df: str) -> list:
        try:
            results = []
            for idx, row in df.iterrows():
                input_data = {col: str(val) for col, val in row.items()}
                
                text = ",".join(map(str, row))
                
                result = self.phishing_detector.predict_text(text)
                result["input"] = input_data
                result["predicted_label"] = "phishing"
                results.append(result)

            return results

        except Exception as e:
            return [{"error": str(e)}]

    def process_ddos_samples(self, df: str) -> list:
        try:
            cleaned_df = DDoSDataCleaner.cleanInputData(df)
            predictions = self.ddos_detector.predict(cleaned_df)
            cleaned_df = cleaned_df.reset_index(drop=True)
            predictions = predictions.reset_index(drop=True)
            cleaned_df['prediction'] = predictions['Predicted']
            cleaned_df['benign_probability'] = predictions['BENIGN_Probability']
            cleaned_df['ddos_probability'] = predictions['DDoS_Probability']
            
            results = []
            for idx, row in cleaned_df.iterrows():
                input_data = {col: str(val) for col, val in row.items() if col not in ['prediction', 'benign_probability', 'ddos_probability']}
                result = {
                    "input": input_data,
                    "prediction": row['prediction'],
                    "probabilities": {
                        "safe": float(row['benign_probability']),
                        "malicious": float(row['ddos_probability'])
                    },
                    "predicted_label": "ddos"
                }
                results.append(result)
            
            return results

        except Exception as e:
            return [{"error": str(e)}]