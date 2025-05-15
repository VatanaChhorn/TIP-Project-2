from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import mongo
from datetime import datetime, timedelta
from bson import json_util
import json
import logging

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

dashboard_bp = Blueprint("dashboard", __name__)

def parse_json(data):
    return json.loads(json_util.dumps(data))

@dashboard_bp.route("/stats", methods=["GET"])
@jwt_required(optional=True)
def get_dashboard_stats():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            user_id = get_jwt_identity()
        query_filter = {}
        if user_id:
            query_filter = {"user_id": user_id}
        total_phishing = mongo.db.phishing_detections.count_documents(query_filter)
        total_sqli = mongo.db.sqli_detections.count_documents(query_filter)
        total_ddos = mongo.db.ddos_detections.count_documents(query_filter)
        total_scans = total_phishing + total_sqli + total_ddos
        usage_by_day = get_usage_by_day(user_id)
        detection_counts = get_detection_counts(user_id)
        result = {
            "total_scans": total_scans,
            "usage_by_day": usage_by_day,
            "detection_counts": detection_counts,
        }
        return jsonify(result)
    except Exception as e:
        logger.error(f"Error retrieving dashboard stats: {str(e)}")
        return jsonify({"error": str(e)}), 500


def get_usage_by_day(user_id=None):
    try:
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        date_range = [(today - timedelta(days=i)) for i in range(7)]
        date_range.reverse()
        results = []
        query_filter = {}
        if user_id:
            query_filter = {"user_id": user_id}
        for date in date_range:
            next_date = date + timedelta(days=1)
            date_query = {
                **query_filter,
                "created_at": {"$gte": date, "$lt": next_date},
            }
            phishing_count = mongo.db.phishing_detections.count_documents(date_query)
            sqli_count = mongo.db.sqli_detections.count_documents(date_query)
            ddos_count = mongo.db.ddos_detections.count_documents(date_query)
            day_count = phishing_count + sqli_count + ddos_count
            formatted_date = date.strftime("%Y-%m-%d")
            results.append({"date": formatted_date, "count": day_count})
        return results
    except Exception as e:
        logger.error(f"Error in get_usage_by_day: {str(e)}")
        raise


def get_detection_counts(user_id=None):
    try:
        detection_counts = {
            "ddos": 0,
            "phishing": 0,
            "sqli": 0,
            "ham": 0,
        }
        query_filter = {}
        if user_id:
            query_filter = {"user_id": user_id}
        phishing_docs = list(mongo.db.phishing_detections.find(query_filter))
        sqli_docs = list(mongo.db.sqli_detections.find(query_filter))
        ddos_docs = list(mongo.db.ddos_detections.find(query_filter))
        for doc in ddos_docs:
            detection_data = doc.get("detection_data", {})
            prediction = detection_data.get("prediction", {})
            probabilities = prediction.get("probabilities", {})
            malicious_prob = probabilities.get("malicious", 0)
            if malicious_prob > 0.5:
                detection_counts["ddos"] += 1
            else:
                detection_counts["ham"] += 1
        for doc in phishing_docs:
            detection_data = doc.get("detection_data", {})
            prediction = detection_data.get("prediction", {})
            probabilities = prediction.get("probabilities", {})
            malicious_prob = probabilities.get("malicious", 0)
            if malicious_prob > 0.5:
                detection_counts["phishing"] += 1
            else:
                detection_counts["ham"] += 1
        for doc in sqli_docs:
            detection_data = doc.get("detection_data", {})
            prediction = detection_data.get("prediction", {})
            probabilities = prediction.get("probabilities", {})
            malicious_prob = probabilities.get("malicious", 0)
            if malicious_prob > 0.5:
                detection_counts["sqli"] += 1
            else:
                detection_counts["ham"] += 1
        total = sum(detection_counts.values())
        percentages = {}
        if total > 0:
            for key, value in detection_counts.items():
                percentages[key] = round((value / total) * 100, 1)
        else:
            percentages = {key: 0 for key in detection_counts.keys()}
        return {"counts": detection_counts, "percentages": percentages, "total": total}
    except Exception as e:
        logger.error(f"Error in get_detection_counts: {str(e)}")
        raise