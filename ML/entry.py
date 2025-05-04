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
            else:
                print(f"\nResults saved to: {result['output_file']}")
                print("\nProcessing Summary:")
                print("-" * 50)
                
                # Count results by model type
                model_counts = {}
                for r in result['results']:
                    model_name = r['model_name']
                    model_counts[model_name] = model_counts.get(model_name, 0) + 1
                
                # Print summary
                for model_name, count in model_counts.items():
                    print(f"{model_name}: {count} rows")
                
                # Print first few results as example
                print("\nExample Results (first 3 rows):")
                print("-" * 50)
                for r in result['results'][:3]:
                    print(f"\nRow {r['row_index']}:")
                    print(f"Model: {r['model_name']}")
                    print(f"Classification: {r['classification']['prediction']}")
                    if r['prediction']:
                        if 'error' in r['prediction']:
                            print(f"Error: {r['prediction']['error']}")
                        else:
                            print(f"Prediction: {r['prediction']['prediction']}")
                            if 'probabilities' in r['prediction']:
                                print("Probabilities:")
                                for label, prob in r['prediction']['probabilities'].items():
                                    print(f"- {label}: {prob}")
            
        except Exception as e:
            print(f"Error processing file: {str(e)}")
                
    except Exception as e:
        print(f"Fatal error: {str(e)}")
        print("Please check your model files and try again")

if __name__ == "__main__":
    main() 