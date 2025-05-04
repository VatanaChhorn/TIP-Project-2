from main import MLDetectionSystem
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent / "src"))

def clean_file_path(path: str) -> str:
    """Remove quotes and extra whitespace from file path."""
    return path.strip().strip("'").strip('"')

def main():
    try:
        # Initialize the detection system
        detection_system = MLDetectionSystem()
        
        print("\nEnter the path to your input file:")
        file_path = clean_file_path(input("> "))
        
        try:
            result = detection_system.process_input(file_path)
            
            if 'error' in result:
                print(f"\nError: {result['error']}")
                if 'classification' in result:
                    print("\nClassification Results:")
                    print(f"Predicted Attack Type: {result['classification']['prediction']}")
                    print(f"Confidence: {result['classification']['confidence']}")
                    print("Probabilities:")
                    for label, prob in result['classification']['probabilities'].items():
                        print(f"- {label}: {prob:.2f}")
            else:
                print(f"\n=== {result['model_name']} ===")
                print(f"\nFile: {result['text']}")
                print(f"Prediction: {result['prediction']}")
                
                print("\nClassification Results:")
                print(f"Predicted Attack Type: {result['classification']['prediction']}")
                print(f"Confidence: {result['classification']['confidence']}")
                print("Probabilities:")
                for label, prob in result['classification']['probabilities'].items():
                    print(f"- {label}: {prob:.2f}")
            
        except Exception as e:
            print(f"Error processing file: {str(e)}")
                
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        print("Please check your model files and try again")

if __name__ == "__main__":
    main() 