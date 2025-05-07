from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import mongo
from datetime import datetime
import logging
import json
from bson import json_util

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def save_detection_results(results, user_id=None):
    saved_results = {"phishing": [], "sqli": [], "ddos": []}
    logger.info(f"Running save_detection_results for user: {user_id}")
    logger.info(
        f"Number of detections: phishing={len(results.get('phishing', []))}, "
        f"sqli={len(results.get('sqli', []))}, ddos={len(results.get('ddos', []))}"
    )
    try:
        if "phishing" in results and results["phishing"]:
            try:
                for detection in results["phishing"]:
                    detection_with_meta = {
                        "user_id": user_id,
                        "created_at": datetime.utcnow(),
                        "detection_data": detection,
                    }
                    result = mongo.db.phishing_detections.insert_one(
                        detection_with_meta
                    )
                    detection_with_meta["_id"] = result.inserted_id
                    saved_results["phishing"].append(detection_with_meta)
                logger.info(
                    f"Successfully saved {len(saved_results['phishing'])} phishing detections"
                )
            except Exception as e:
                logger.error(f"Error saving phishing detections: {str(e)}")
                raise
        if "sqli" in results and results["sqli"]:
            try:
                for detection in results["sqli"]:
                    detection_with_meta = {
                        "user_id": user_id,
                        "created_at": datetime.utcnow(),
                        "detection_data": detection,
                    }
                    result = mongo.db.sqli_detections.insert_one(detection_with_meta)
                    detection_with_meta["_id"] = result.inserted_id
                    saved_results["sqli"].append(detection_with_meta)
                logger.info(
                    f"Successfully saved {len(saved_results['sqli'])} SQLi detections"
                )
            except Exception as e:
                logger.error(f"Error saving SQLi detections: {str(e)}")
                raise
        if "ddos" in results and results["ddos"]:
            try:
                for detection in results["ddos"]:
                    detection_with_meta = {
                        "user_id": user_id,
                        "created_at": datetime.utcnow(),
                        "detection_data": detection,
                    }
                    result = mongo.db.ddos_detections.insert_one(detection_with_meta)
                    detection_with_meta["_id"] = result.inserted_id
                    saved_results["ddos"].append(detection_with_meta)
                logger.info(
                    f"Successfully saved {len(saved_results['ddos'])} DDoS detections"
                )
            except Exception as e:
                logger.error(f"Error saving DDoS detections: {str(e)}")
                raise
        for attack_type in list(saved_results.keys()):
            if not saved_results[attack_type]:
                del saved_results[attack_type]
        if saved_results:
            total_saved = sum(len(items) for items in saved_results.values())
            logger.info(
                f"Successfully saved a total of {total_saved} detection results"
            )
        else:
            logger.warning("No detection results were saved")
        return saved_results
    except Exception as e:
        logger.error(f"Error in save_detection_results: {str(e)}")
        raise e
