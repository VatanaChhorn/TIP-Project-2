import pandas as pd

# Read the CSV files
unseen_data = pd.read_csv('unseen_data.csv')
spam_data = pd.read_csv('csv/spam_text_only.csv')
sqli_data = pd.read_csv('csv/sqli_sentence_only.csv')

# Create a new column in spam_data and sqli_data to match unseen_data's structure
spam_data['attack_type'] = 'Spam'
sqli_data['attack_type'] = 'SQLi'

# Combine all dataframes
combined_data = pd.concat([unseen_data, spam_data, sqli_data], ignore_index=True)

# Save the combined data to a new CSV file
combined_data.to_csv('combined_data.csv', index=False)

print("Files have been combined successfully into combined_data.csv") 