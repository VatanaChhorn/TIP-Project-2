# ML Detection System - Final Implementation

This is the final implementation of the ML Detection System that can classify and analyze different types of network attacks.

## Project Structure
```
final_implementation/
├── README.md
├── environment.yml
├── main.py
├── models/
│   ├── classifier/
│   │   └── pipeline.pkl
│   ├── sqli/
│   │   └── sqli_detector_model.pkl
│   ├── phishing/
│   │   └── sms_detector_model.pkl
│   └── ddos/
│       └── ddos_detector_model.pkl
└── src/
    ├── sqli_detector.py
    ├── sms_spam_detector.py
    └── ddos_detector.py
```

## Setup

1. Create and activate the Conda environment:
```bash
conda env create -f environment.yml
conda activate ml_detection_env
```

2. Download required NLTK data:
```bash
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

## Usage

1. Run the main script:
```bash
python main.py
```

2. Enter your input text when prompted. The system will:
   - First classify the type of attack
   - Then use the appropriate model to get detailed predictions
   - Show both classification results and specific model predictions

## Example Inputs

1. SQL Injection:
```
SELECT * FROM users WHERE username = '' OR '1'='1' --' AND password = 'anything'
```

2. Phishing/SMS:
```
WINNER!!! You've been selected to receive a $900,000 prize reward! To claim, call 09061701461.
```

3. DDoS:
```
7000,192.168.1.10-10.0.0.20-12345-80-6,192.168.1.10,12345,10.0.0.20,80,6,2025-04-26 12:34:56.789012,5000,10,8,12000.0,9500.0,1500.0,200.0,1000.0,150.0,1400.0,300.0,1187.5,200.0,4300.0,3.6,294.1176,50.0,600.0,10.0,4000.0,555.5556,100.0,800.0,50.0,3000.0,428.5714,75.0,700.0,20.0,2,1,0,0,32,32,2.0,1.6,200.0,1500.0,1194.4444,300.0,90000.0,1,1,0,3,16,0,0,0,0.8,1194.4444,1100.0,1187.5,32,12000.0,10.0,2400.0,9500.0,8.0,1900.0,5,6000,4,4750,64240,64240,10,1460,300.0,50.0,700.0,20.0,400.0,100.0,800.0,30.0,0,0,Normal,Benign
```

## Models

The system uses four main components:

1. Classifier: Determines the type of attack (SQL Injection, Phishing, or DDoS)
2. SQL Injection Detector: Analyzes SQL injection attempts
3. Phishing/SMS Detector: Identifies phishing and SMS scams
4. DDoS Detector: Detects DDoS attacks

## Note

The models were trained using scikit-learn version 1.6.1. If you see version mismatch warnings, you can upgrade scikit-learn:
```bash
pip install scikit-learn==1.6.1
``` 