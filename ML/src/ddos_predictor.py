import pandas as pd
import numpy as np
import joblib
import os

class DDoSDataCleaner:
    @staticmethod
    def cleanInputData(data):
        if ' Label' in data.columns:
            new_X = data.drop([' Label', 'SimillarHTTP', 'Unnamed: 0', 'attack_type'], axis=1, errors='ignore')
        else:
            new_X = data.drop(['SimillarHTTP', 'Unnamed: 0', 'attack_type'], axis=1, errors='ignore')

        return new_X.replace([np.inf, -np.inf], np.nan).dropna(axis=0)

class DDoSPredictor:
    def __init__(self, model_path='../models/ddos/ddos_model.pkl'):
        """
        Initializes the DDoSPredictor class by loading the model and preprocessing tools.

        Parameters:
        -----------
        model_path : str
            Path to the trained model file
        """
        self.model_info = joblib.load(model_path)
        self.voting_clf = self.model_info['voting_classifier']
        self.feature_info = self.model_info['feature_info']
        self.selected_features = self.model_info['selected_features']
        self.label_encoder = self.model_info['label_encoder']
        self.scaler_numerical = self.model_info['scaler_numerical']
        self.scaler_features = self.model_info['scaler_features']
        self.numerical_cols = self.model_info['numerical_cols']
        self.categorical_cols = list(self.feature_info.keys())
        print(f"Model loaded successfully from {model_path}")

    def _preprocess(self, new_X):
        """
        Preprocesses the data for prediction.

        Parameters:
        -----------
        new_X : DataFrame
            Raw input data

        Returns:
        --------
        new_X_scaled : DataFrame
            Preprocessed and scaled feature set
        """
        for col in self.categorical_cols:
            if col in new_X.columns:
                hasher = self.feature_info[col]['hasher']
                hashed_col_names = self.feature_info[col]['col_names']
                col_data = new_X[col].astype(str).tolist()
                hashed_features = hasher.transform(col_data)
                hashed_df = pd.DataFrame(hashed_features.toarray(), columns=hashed_col_names, index=new_X.index)
                new_X = new_X.drop(col, axis=1)
                new_X = pd.concat([new_X, hashed_df], axis=1)

        numerical_present = [col for col in self.numerical_cols if col in new_X.columns]
        if numerical_present:
            new_X[numerical_present] = self.scaler_numerical.transform(new_X[numerical_present])

        for column in self.selected_features:
            if column not in new_X.columns:
                new_X[column] = 0

        new_X_selected = new_X[self.selected_features]
        new_X_scaled = self.scaler_features.transform(new_X_selected)

        return new_X_scaled

    def predict(self, data):
        """
        Predicts DDoS labels on new data.

        Parameters:
        -----------
        data : DataFrame
            Input data for prediction

        Returns:
        --------
        predictions_df : DataFrame
            DataFrame with predictions
        """
        new_X_scaled = self._preprocess(data)
        predictions = self.voting_clf.predict(new_X_scaled)
        predictions_labels = self.label_encoder.inverse_transform(predictions)

        results = pd.DataFrame({
            'Predicted': predictions_labels
        })

        return results

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        data_path = sys.argv[1]
    else:
        data_path = "../../data/unseen_data.csv"
        print(f"No data path provided, using default: {data_path}")

    data = pd.read_csv(data_path)
    print(f"Loaded new data with shape: {data.shape}")
    data = DDoSDataCleaner.cleanInputData(data)

    predictor = DDoSPredictor()
    try:
        results = predictor.predict(data)

        print("\nPrediction Results:")
        print("-" * 50)
        print(results.head(10))

        output_file = "predictions_output.csv"
        results.to_csv(output_file, index=False)
        print(f"\nFull predictions saved to {output_file}")

        if 'Predicted' in results.columns:
            print("\nAttack Type Distribution in Predictions:")
            print(results['Predicted'].value_counts())

    except Exception as e:
        print(f"Error during prediction: {e}")