import sys
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(project_root)

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os

from ML.main import MLDetectionSystem

ml_bp = Blueprint('ml', __name__)

# Initialize ML detection system
detection_system = MLDetectionSystem()

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