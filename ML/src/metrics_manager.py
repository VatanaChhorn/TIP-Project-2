from pathlib import Path
import base64
from typing import Dict, List
import os

class MetricsManager:
    """A class to manage and retrieve model performance metrics.
    
    This class handles loading performance metrics images and converting them to base64
    format for easy transmission to the backend/frontend.
    """
    
    def __init__(self):
        """Initialize the MetricsManager with paths to metric files."""
        self.base_path = Path(__file__).parent / "models"
        self.metrics_paths = {
            "sqli": self.base_path / "sqli_metrics",
            "sms": self.base_path / "sms_metrics",
            "ddos": self.base_path / "ddos_metrics"
        }
        
        # Define metric files for each model type
        self.metric_files = {
            "sqli": ["performance_metrics.png", "roc_curve.png", "confusion_matrix.png"],
            "sms": ["performance_metrics.png", "roc_curve.png", "confusion_matrix.png"],
            "ddos": ["voting_performance.png", "rf_performance.png", "gb_performance.png"]
        }

    def _image_to_base64(self, image_path: Path) -> str:
        """Convert an image file to base64 string.
        
        Args:
            image_path (Path): Path to the image file
            
        Returns:
            str: Base64 encoded string of the image, or empty string if error
        """
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"Error converting image to base64: {str(e)}")
            return ""

    def get_metrics_for_model(self, model_type: str) -> Dict[str, str]:
        """Get metrics for a specific model type.
        
        Args:
            model_type (str): Type of model ('sqli', 'sms', or 'ddos')
            
        Returns:
            Dict[str, str]: Dictionary containing base64 encoded metrics images
        """
        model_type = model_type.lower()
        if model_type not in self.metrics_paths:
            return {"error": f"Unknown model type: {model_type}"}
            
        metrics = {}
        metrics_path = self.metrics_paths[model_type]
        
        for metric_file in self.metric_files[model_type]:
            file_path = metrics_path / metric_file
            if file_path.exists():
                metrics[metric_file.replace(".png", "")] = self._image_to_base64(file_path)
        
        return metrics

    def get_all_metrics(self) -> Dict[str, Dict[str, str]]:
        """Get all model metrics.
        
        Returns:
            Dict[str, Dict[str, str]]: Dictionary containing metrics for all models
        """
        return {
            model_type: self.get_metrics_for_model(model_type)
            for model_type in self.metrics_paths.keys()
        }