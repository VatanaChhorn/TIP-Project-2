import sys
import json
from pathlib import Path
from pprint import pformat
from bson import json_util
from bson.objectid import ObjectId

project_root = str(Path(__file__).resolve().parent.parent.parent)
sys.path.append(project_root)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, jwt_required
from werkzeug.utils import secure_filename
import os

from ML.main import MLDetectionSystem
from ML.src.metrics_manager import MetricsManager
from routes.detection_results import save_detection_results
from models.user import mongo

ml_bp = Blueprint("ml", __name__)

detection_system = MLDetectionSystem()
metrics_manager = MetricsManager()


@ml_bp.route("/process", methods=["POST"])
def process_file():
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
    except:
        pass

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not file.filename.endswith(".csv"):
        return jsonify({"error": "Only CSV files are allowed"}), 400

    try:
        filename = secure_filename(file.filename)
        temp_path = os.path.join("/tmp", filename)
        file.save(temp_path)

        result = detection_system.process_input(temp_path)

        os.remove(temp_path)

        if "error" in result:
            return jsonify({"error": result["error"]}), 500

        formatted_results = {"phishing": [], "sqli": [], "ddos": []}

        for r in result["results"]:
            if r["prediction"] and "error" not in r["prediction"]:
                attack_type = r["classification"]["prediction"].lower()
                if attack_type in ["phishing", "sqli", "ddos"]:
                    formatted_results[attack_type].append(
                        {
                            "classification": r["classification"],
                            "prediction": r["prediction"],
                            "row_index": r.get("row_index"),
                        }
                    )

        for attack_type in list(formatted_results.keys()):
            if not formatted_results[attack_type]:
                del formatted_results[attack_type]

        if formatted_results:
            saved_results = save_detection_results(formatted_results, user_id)
            result["saved_results"] = True

        return jsonify(result)

    except Exception as e:
        print(f"Error processing file: {str(e)}")
        return jsonify({"error": str(e)}), 500


@ml_bp.route("/metrics/<model_type>", methods=["GET"])
def get_model_metrics(model_type):
    try:
        metrics = metrics_manager.get_metrics_for_model(model_type)
        if "error" in metrics:
            return jsonify(metrics), 400
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@ml_bp.route("/metrics", methods=["GET"])
def get_all_metrics():
    try:
        metrics = metrics_manager.get_all_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
