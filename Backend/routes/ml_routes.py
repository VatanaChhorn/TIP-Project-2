import sys
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(project_root)

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

from ML.main import MLDetectionSystem
from ML.src.metrics_manager import MetricsManager

ml_bp = Blueprint('ml', __name__)

# Initialize ML detection system and metrics manager
detection_system = MLDetectionSystem()
metrics_manager = MetricsManager()

@ml_bp.route('/process', methods=['POST'])
def process_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Only CSV files are allowed'}), 400
    
    try:
        # Save the file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join('/tmp', filename)
        file.save(temp_path)
        
        # Process the file using ML detection system
        result = detection_system.process_input(temp_path)
        
        # Clean up the temporary file
        os.remove(temp_path)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/metrics/<model_type>', methods=['GET'])
def get_model_metrics(model_type):
    """
    Get metrics images for a specific model type.
    
    Args:
        model_type (str): Type of model ('sqli', 'sms', or 'ddos')
        
    Returns:
        JSON response containing base64 encoded metrics images
    """
    try:
        metrics = metrics_manager.get_metrics_for_model(model_type)
        if "error" in metrics:
            return jsonify(metrics), 400
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/metrics', methods=['GET'])
def get_all_metrics():
    """
    Get metrics images for all model types.
    
    Returns:
        JSON response containing base64 encoded metrics images for all models
    """
    try:
        metrics = metrics_manager.get_all_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 