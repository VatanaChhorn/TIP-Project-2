from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from models.user import User
from werkzeug.security import check_password_hash
from .dashboard import get_detection_counts

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.find_by_email(data['email']):
        return jsonify({'message': 'Email already registered'}), 400
    
    if User.find_by_username(data['username']):
        return jsonify({'message': 'Username already taken'}), 400
    
    is_admin = data.get('is_admin', False)
    user = User(
        username=data['username'],
        email=data['email'],
        password=data['password'],
        is_admin=is_admin
    )
    
    user.save()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_json()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    user = User.find_by_email(data['email'])
    
    if not user or not user.verify_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_json()
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    return jsonify({'access_token': access_token}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()
    user = User.find_by_id(current_user_id)
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    return jsonify({'user': user.to_json()}), 200 

@auth_bp.route('/userList', methods=['GET'])
def get_user_list():
    users = User.get_all_users()
    user_list = []
    for user in users:
        totalScan = get_detection_counts(user.id)
        count = totalScan.get("total", 0)
        user_data = user.to_json()
        user_data['totalScan'] = count
        user_list.append(user_data)
    return jsonify({'users': user_list}), 200