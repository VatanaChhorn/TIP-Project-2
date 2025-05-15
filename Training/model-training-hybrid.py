import pandas as pd 
import numpy as np
from pathlib import Path
import os
from sklearn.feature_extraction.text import HashingVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import VotingClassifier, RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_curve, auc, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt
import seaborn as sns

def generate_performance_visualization(y_true, y_pred, y_prob, save_path=None):
    fig = plt.figure(figsize=(15, 10))
    gs = fig.add_gridspec(2, 2)
    
    classes = np.unique(y_true)
    n_classes = len(classes)
    
    ax1 = fig.add_subplot(gs[0, 0])
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
               xticklabels=classes,
               yticklabels=classes,
               ax=ax1)
    ax1.set_title('Confusion Matrix')
    ax1.set_ylabel('True Label')
    ax1.set_xlabel('Predicted Label')
    
    ax2 = fig.add_subplot(gs[0, 1])
    
    fpr = dict()
    tpr = dict()
    roc_auc = dict()
    
    for i in range(n_classes):
        fpr[i], tpr[i], _ = roc_curve(y_true == i, y_prob[:, i])
        roc_auc[i] = auc(fpr[i], tpr[i])
        ax2.plot(fpr[i], tpr[i], lw=2,
                label=f'ROC curve of class {i} (AUC = {roc_auc[i]:.2f})')
    
    ax2.plot([0, 1], [0, 1], 'k--', lw=2)
    ax2.set_xlim([0.0, 1.0])
    ax2.set_ylim([0.0, 1.05])
    ax2.set_xlabel('False Positive Rate')
    ax2.set_ylabel('True Positive Rate')
    ax2.set_title('ROC Curves')
    ax2.legend(loc="lower right")
    
    ax3 = fig.add_subplot(gs[1, :])
    ax3.axis('off')
    
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted')
    recall = recall_score(y_true, y_pred, average='weighted')
    f1 = f1_score(y_true, y_pred, average='weighted')
    
    avg_auc = np.mean([roc_auc[i] for i in range(n_classes)])
    
    metrics_text = (
        f"Model Performance Metrics:\n\n"
        f"Accuracy: {accuracy:.3f}\n"
        f"Precision (weighted): {precision:.3f}\n"
        f"Recall (weighted): {recall:.3f}\n"
        f"F1 Score (weighted): {f1:.3f}\n"
        f"Average AUC-ROC: {avg_auc:.3f}\n\n"
        f"Per-class AUC-ROC:\n"
    )
    
    for i in range(n_classes):
        metrics_text += f"Class {i}: {roc_auc[i]:.3f}\n"
    
    ax3.text(0.1, 0.5, metrics_text, fontsize=12, family='monospace')
    
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches='tight')
        plt.close()
    else:
        plt.show()
        
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'auc_roc': avg_auc,
        'per_class_auc': roc_auc
    }

Path('data').mkdir(exist_ok=True)

print("\n" + "="*80)
print("Loading Split Datasets")
print("="*80)

training_data_path = 'data/training_data_filtered.csv'
print(f"\nLoading training data from {training_data_path}...")
data = pd.read_csv(training_data_path)
print(f"Successfully loaded training data with shape: {data.shape}")

print("\nLabel distribution in training data:")
print(data[' Label'].value_counts())

data = data.drop(['Unnamed: 0', 'attack_type'], axis = 1, errors='ignore')

data_real = data.replace(np.inf, np.nan)
data_real.isnull().sum().sum()
data_df = data_real.dropna(axis=0)
data_df.isnull().sum().sum()

data_X = data_df.drop([' Label', 'SimillarHTTP'], axis = 1)
data_y = data_df[' Label']

data_df.isnull().sum().sum()
data_y.unique()

categorical_cols = ['Flow ID', ' Source IP', ' Destination IP', ' Timestamp']
numerical_cols = [col for col in data_X.columns if col not in categorical_cols]

n_features = 20

feature_info = {}

for col in categorical_cols:
    print(f"Hashing feature: {col}")
    hasher = HashingVectorizer(n_features=n_features, alternate_sign=False)
    
    col_data = data_X[col].astype(str).tolist()
    
    hashed_features = hasher.transform(col_data)
    
    hashed_col_names = [f'{col}_hash_{i}' for i in range(n_features)]
    
    hashed_df = pd.DataFrame(hashed_features.toarray(), columns=hashed_col_names, index=data_X.index)
    
    feature_info[col] = {
        'hasher': hasher,
        'col_names': hashed_col_names
    }
    
    data_X = data_X.drop(col, axis=1)
    data_X = pd.concat([data_X, hashed_df], axis=1)

le = LabelEncoder()
data_y_trans = le.fit_transform(data_y)

scaler = StandardScaler()
data_X[numerical_cols] = scaler.fit_transform(data_X[numerical_cols])

from sklearn.ensemble import ExtraTreesClassifier

print("\nPerforming feature selection...")
model = ExtraTreesClassifier(n_estimators=250, random_state=42)
model.fit(data_X, data_y_trans)

feature_importance_std = pd.Series(model.feature_importances_, index=data_X.columns)
top_features = feature_importance_std.nlargest(40)
print("\nTop 40 features after hashing:")
print(top_features)

data_new_features_X = data_X[top_features.index]

X_train, X_test, y_train, y_test = train_test_split(
    data_new_features_X, data_y_trans, test_size=0.30, random_state=42, stratify=data_y_trans
)

ss_features = StandardScaler()
X_train_std = ss_features.fit_transform(X_train)
X_test_std = ss_features.transform(X_test)

print("\nInitializing models with optimized parameters...")
rf = RandomForestClassifier(
    n_estimators=200,
    max_depth=20, 
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',
    bootstrap=True,
    class_weight='balanced',
    random_state=42,
    n_jobs=-1
)

gb = GradientBoostingClassifier(
    n_estimators=200,
    learning_rate=0.1,
    max_depth=8,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',
    subsample=0.8,
    random_state=42
)

voting_clf = VotingClassifier(
    estimators=[('rf', rf), ('gb', gb)],
    voting='soft',
    weights=[1, 1]
)

print("\nTraining models...")
rf.fit(X_train_std, y_train)
gb.fit(X_train_std, y_train)
voting_clf.fit(X_train_std, y_train)

print("\nEvaluating models...")

rf_y_pred = rf.predict(X_test_std)
rf_accuracy = accuracy_score(y_test, rf_y_pred) * 100
print(f"\nRandom Forest Accuracy: {rf_accuracy:.2f}%")
print("Classification Report for Random Forest:")
print(classification_report(le.inverse_transform(y_test), le.inverse_transform(rf_y_pred)))

rf_y_prob = rf.predict_proba(X_test_std)

print("\nGenerating performance visualization for Random Forest...")
rf_metrics = generate_performance_visualization(
    y_test, 
    rf_y_pred,
    rf_y_prob,
    save_path='rf_performance.png'
)
print("Random Forest performance visualization saved as 'rf_performance.png'")

gb_y_pred = gb.predict(X_test_std)
gb_accuracy = accuracy_score(y_test, gb_y_pred) * 100
print(f"\nGradient Boosting Accuracy: {gb_accuracy:.2f}%")
print("Classification Report for Gradient Boosting:")
print(classification_report(le.inverse_transform(y_test), le.inverse_transform(gb_y_pred)))

gb_y_prob = gb.predict_proba(X_test_std)

print("\nGenerating performance visualization for Gradient Boosting...")
gb_metrics = generate_performance_visualization(
    y_test, 
    gb_y_pred,
    gb_y_prob,
    save_path='gb_performance.png'
)
print("Gradient Boosting performance visualization saved as 'gb_performance.png'")

voting_y_pred = voting_clf.predict(X_test_std)
voting_accuracy = accuracy_score(y_test, voting_y_pred) * 100
print(f"\nVoting Classifier Accuracy: {voting_accuracy:.2f}%")
print("Classification Report for Voting Classifier:")
print(classification_report(le.inverse_transform(y_test), le.inverse_transform(voting_y_pred)))

voting_y_prob = voting_clf.predict_proba(X_test_std)

print("\nGenerating performance visualization for Voting Classifier...")
voting_metrics = generate_performance_visualization(
    y_test, 
    voting_y_pred,
    voting_y_prob,
    save_path='voting_performance.png'
)
print("Voting Classifier performance visualization saved as 'voting_performance.png'")

print("\nRandom Forest Confusion Matrix:")
print(confusion_matrix(y_test, rf_y_pred))

print("\nVoting Classifier Confusion Matrix:")
print(confusion_matrix(y_test, voting_y_pred))

print("\nModel Performance Comparison:")
print("-" * 50)
print(f"{'Model':<20} {'Accuracy':<10} {'Precision':<10} {'Recall':<10} {'F1':<10} {'AUC-ROC':<10}")
print("-" * 50)
print(f"{'Random Forest':<20} {rf_metrics['accuracy']:.3f} {rf_metrics['precision']:.3f} {rf_metrics['recall']:.3f} {rf_metrics['f1']:.3f} {rf_metrics['auc_roc']:.3f}")
print(f"{'Gradient Boosting':<20} {gb_metrics['accuracy']:.3f} {gb_metrics['precision']:.3f} {gb_metrics['recall']:.3f} {gb_metrics['f1']:.3f} {gb_metrics['auc_roc']:.3f}")
print(f"{'Voting Classifier':<20} {voting_metrics['accuracy']:.3f} {voting_metrics['precision']:.3f} {voting_metrics['recall']:.3f} {voting_metrics['f1']:.3f} {voting_metrics['auc_roc']:.3f}")
print("-" * 50)

import joblib

model_info = {
    'voting_classifier': voting_clf,
    'rf': rf,
    'gb': gb,
    'feature_info': feature_info,
    'selected_features': top_features.index,
    'label_encoder': le,
    'scaler_numerical': scaler,
    'scaler_features': ss_features,
    'numerical_cols': numerical_cols
}

joblib.dump(model_info, 'ddos_model.pkl')
print("\nModel saved as 'ddos_model.pkl'")

def predict_ddos(new_data_path):
    model_info = joblib.load('ddos_model.pkl')
    
    new_data = pd.read_csv(new_data_path)
    print(f"Loaded new data with shape: {new_data.shape}")
    
    if ' Label' in new_data.columns:
        new_y = new_data[' Label']
        new_X = new_data.drop([' Label', 'SimillarHTTP', 'Unnamed: 0', 'attack_type'], axis=1, errors='ignore')
    else:
        new_X = new_data.copy()
        new_data.drop(['SimillarHTTP', 'Unnamed: 0', 'attack_type'], axis=1, errors='ignore')
    
    new_X = new_X.replace([np.inf, -np.inf], np.nan)
    new_X = new_X.dropna(axis=0)
    if ' Label' in new_data.columns:
        new_y = new_y[new_X.index]
    
    voting_clf = model_info['voting_classifier']
    feature_info = model_info['feature_info']
    selected_features = model_info['selected_features']
    le = model_info['label_encoder']
    scaler_numerical = model_info['scaler_numerical']
    scaler_features = model_info['scaler_features']
    numerical_cols = model_info['numerical_cols']
    categorical_cols = list(feature_info.keys())
    
    for col in categorical_cols:
        if col in new_X.columns:
            hasher = feature_info[col]['hasher']
            hashed_col_names = feature_info[col]['col_names']
            
            col_data = new_X[col].astype(str).tolist()
            
            hashed_features = hasher.transform(col_data)
            
            hashed_df = pd.DataFrame(hashed_features.toarray(), columns=hashed_col_names, index=new_X.index)
            
            new_X = new_X.drop(col, axis=1)
            new_X = pd.concat([new_X, hashed_df], axis=1)
    
    numerical_present = [col for col in numerical_cols if col in new_X.columns]
    if numerical_present:
        new_X[numerical_present] = scaler_numerical.transform(new_X[numerical_present])
    
    for column in selected_features:
        if column not in new_X.columns:
            print(f"Adding missing column: {column}")
            new_X[column] = 0
    
    new_X_selected = new_X[selected_features]
    
    new_X_scaled = scaler_features.transform(new_X_selected)
    
    predictions = voting_clf.predict(new_X_scaled)
    predictions_labels = le.inverse_transform(predictions)
    
    if ' Label' in new_data.columns:
        results = pd.DataFrame({
            'Actual': new_y,
            'Predicted': predictions_labels,
            'Correct': new_y == predictions_labels
        })
        
        accuracy = results['Correct'].mean() * 100
        print(f"Accuracy on new data: {accuracy:.2f}%")
        
        try:
            new_y_encoded = le.transform(new_y)
            print(classification_report(new_y, predictions_labels))
            print(confusion_matrix(new_y_encoded, predictions))
        except:
            print("Could not generate classification report (possibly due to label mismatch)")
    else:
        results = pd.DataFrame({
            'Predicted': predictions_labels
        })
    
    return results

print("\n" + "="*80)
print("Model Training Complete")
print("="*80)
print(f"\nBest model accuracy: {voting_accuracy:.2f}%")
print(f"To make predictions on new data, use the following command:")
print("predictions = predict_ddos('path/to/new_data.csv')")
print("="*80)

try:
    print("\n" + "="*80)
    print("Testing Ensemble Model on Unseen Data")
    print("="*80)
    predictions_df = predict_ddos('data/unseen_data.csv')
    
    print("\nDetailed Predictions:")
    print("-"*50)
    if 'Actual' in predictions_df.columns:
        for i, row in predictions_df.iterrows():
            actual = row['Actual'] 
            pred = row['Predicted']
            correct = '✅' if row['Correct'] else '❌'
            print(f"Actual: {actual:15} Predicted: {pred:15} {correct}")
except Exception as e:
    print(f"Error testing on unseen data: {e}")
    print("You can still use the predict_ddos function to test on unseen data later.")