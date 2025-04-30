from pymongo import MongoClient
from pprint import pprint

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['auth_db']

# Get all users
users = db.users.find()
print("\nAll Users:")
for user in users:
    pprint(user)
    print("-" * 50)

# Close the connection
client.close() 