from datetime import datetime
from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
import uuid

mongo = PyMongo()

class User:
    def __init__(self, username, email, password, is_admin=False):
        self.id = str(uuid.uuid4())
        self.username = username
        self.email = email
        self.password = generate_password_hash(password)
        self.is_admin = is_admin
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    @classmethod
    def from_dict(cls, data):
        user = cls.__new__(cls)
        user.id = data['_id']
        user.username = data['username']
        user.email = data['email']
        user.password = data['password']
        user.is_admin = data['is_admin']
        user.created_at = data['created_at']
        user.updated_at = data['updated_at']
        return user

    def save(self):
        user_data = {
            '_id': self.id,
            'username': self.username,
            'email': self.email,
            'password': self.password,
            'is_admin': self.is_admin,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        }
        mongo.db.users.insert_one(user_data)
        return self.id

    @staticmethod
    def find_by_email(email):
        user_data = mongo.db.users.find_one({'email': email})
        if user_data:
            return User.from_dict(user_data)
        return None

    @staticmethod
    def find_by_username(username):
        user_data = mongo.db.users.find_one({'username': username})
        if user_data:
            return User.from_dict(user_data)
        return None

    @staticmethod
    def find_by_id(user_id):
        user_data = mongo.db.users.find_one({'_id': user_id})
        if user_data:
            return User.from_dict(user_data)
        return None

    def verify_password(self, password):
        return check_password_hash(self.password, password)

    def to_json(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at,
            'updated_at': self.updated_at
        } 