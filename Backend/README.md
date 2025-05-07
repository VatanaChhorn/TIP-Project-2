# Flask Authentication Backend

This is a Flask-based authentication backend with MongoDB integration, designed to work with ML services in an Anaconda container.

## Features

- User registration and login
- JWT-based authentication
- MongoDB integration
- Admin user support
- CORS enabled
- ML detection processing and storage
- Dashboard statistics and visualization data

## Prerequisites

- Python 3.8+
- MongoDB
- Anaconda (for ML integration)
- Postman (for API testing)
- MongoDB Compass (optional, for database visualization)

## Setup

1. Create and activate a conda environment:

```bash
conda create -n auth_backend python=3.8
conda activate auth_backend
```

2. Install dependencies:

```bash
pip install flask-pymongo flask flask-restful flask-jwt-extended flask-cors pymongo python-dotenv bcrypt python-dateutil
```

3. Set up environment variables:

- Update the values in `.env` with your configuration:

```
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
MONGO_URI=mongodb://localhost:27017/auth_db
```

4. MongoDB Setup (Choose one option):

### Option 1: Local MongoDB (Recommended for Development)

```bash
# Install MongoDB (if not already installed)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB as a service (runs in background)
brew services start mongodb-community

# To stop MongoDB service
brew services stop mongodb-community

# To check MongoDB status
brew services list | grep mongodb
```

### Option 2: Docker MongoDB skip

```bash
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Stop MongoDB container
docker stop mongodb

# Start MongoDB container
docker start mongodb
```

### Option 3: MongoDB Atlas (Cloud) skip

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and update `.env`:

```
MONGO_URI=your_mongodb_atlas_connection_string
```

5. Run the application:

```bash
python app.py
```

## Viewing MongoDB Data

### Option 1: MongoDB Compass (Recommended)

1. Download and install [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect using: `mongodb://localhost:27017`
3. Browse to `auth_db` database and `users` collection

### Option 2: MongoDB Shell

```bash
# Connect to MongoDB
mongosh

# Switch to your database
use auth_db

# View all collections
show collections

# View all users
db.users.find().pretty()
```

### Option 3: Python Script

Run the provided script to view database contents:

```bash
python view_db.py
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info

### ML Endpoints

- `POST /api/ml/process` - Process a CSV file for ML detection
- `GET /api/ml/metrics/<model_type>` - Get metrics images for a specific model type
  - Supported model types: 'sqli', 'sms', 'ddos'
  - Returns base64 encoded images of performance metrics
- `GET /api/ml/metrics` - Get metrics images for all model types
  - Returns base64 encoded images for all models' performance metrics
- `GET /api/ml/detections` - Get all detection results
- `GET /api/ml/detections/<detection_type>` - Get detection results by type (phishing, sqli, ddos)
- `GET /api/ml/detections/<detection_type>/<detection_id>` - Get a specific detection by ID

### Dashboard Endpoints

- `GET /api/dashboard/stats` - Get statistics for the dashboard
  - Optional query parameter: `user_id` - Filter results by user ID
  - Returns:
    - Total number of scans
    - Usage by day for the last 7 days
    - Counts of detection types (DDOS, Phishing, SQLi, Ham/Benign)
  - Malicious detection thresholds:
    - DDOS: `detection_data.prediction.probabilities.malicious > 0.5`
    - SQLI/PHISHING: `detection_data.prediction.probabilities.malicious > 0.5`
    - Anything below 0.5 is counted as HAM or Benign

## Testing with Postman

1. **Create a new Collection**:

   - Name it "Auth API"
   - Add base URL: `http://localhost:5001`

2. **Register a new user**:

   - Method: POST
   - URL: `{{base_url}}/api/auth/register`
   - Body (raw JSON):

   ```json
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Login**:

   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (raw JSON):

   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

4. **Get Current User**:

   - Method: GET
   - URL: `{{base_url}}/api/auth/me`
   - Headers:
     - `Authorization: Bearer {{access_token}}`

5. **Get Dashboard Stats**:
   - Method: GET
   - URL: `{{base_url}}/api/dashboard/stats`
   - Headers (optional):
     - `Authorization: Bearer {{access_token}}`
   - Query Parameters (optional):
     - `user_id`: ID of the user to filter results

## Environment Variables in Postman

Create an environment with these variables:

- `base_url`: `http://localhost:5001`
- `access_token`: (set after login)
- `refresh_token`: (set after login)

## Example Usage with curl

### Register a new user

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### Get Dashboard Stats

```bash
# Get stats for all users
curl -X GET http://localhost:5001/api/dashboard/stats

# Get stats for a specific user
curl -X GET http://localhost:5001/api/dashboard/stats?user_id=your_user_id

# Get stats with JWT authentication
curl -X GET http://localhost:5001/api/dashboard/stats \
  -H "Authorization: Bearer your_access_token"
```

## Dashboard Response Format

```json
{
  "total_scans": 1250,
  "usage_by_day": [
    { "date": "2023-05-01", "count": 120 },
    { "date": "2023-05-02", "count": 145 },
    { "date": "2023-05-03", "count": 190 },
    { "date": "2023-05-04", "count": 210 },
    { "date": "2023-05-05", "count": 185 },
    { "date": "2023-05-06", "count": 155 },
    { "date": "2023-05-07", "count": 245 }
  ],
  "detection_counts": {
    "counts": {
      "ddos": 350,
      "phishing": 275,
      "sqli": 225,
      "ham": 400
    },
    "percentages": {
      "ddos": 28.0,
      "phishing": 22.0,
      "sqli": 18.0,
      "ham": 32.0
    },
    "total": 1250
  }
}
```

## Testing the Dashboard API

A test script is provided to verify the dashboard API is working correctly:

```bash
python test_dashboard.py
```

## Integration with ML Services

This backend is designed to be easily integrated with ML services running in an Anaconda container. The authentication system can be used to secure ML endpoints and manage user access to ML features.

## Security Notes

- Always use HTTPS in production
- Keep your secret keys secure
- Regularly rotate JWT secrets
- Implement rate limiting in production
- Store sensitive data in environment variables
- Use strong password hashing (already implemented with bcrypt)
