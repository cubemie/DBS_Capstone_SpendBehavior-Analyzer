import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, Model
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix
import datetime
import os
import pickle

df = pd.read_csv('data/user_profiles.csv')
# Feature hasil EDA
features = [
    'impulse_score',
    'weekend_ratio',
    'night_ratio',
    'std_amount'
]

X = df[features]
y = df['spending_persona']

# 2. ENCODE LABEL
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)
y_categorical = tf.keras.utils.to_categorical(y_encoded)

print("\n[INFO] Distribusi label:")
print(df['spending_persona'].value_counts())

# 3. TRAIN TEST SPLIT
# stratify penting untuk dataset imbalance
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_categorical,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

# 4. NORMALIZATION
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 5. CUSTOM FEATURE ATTENTION LAYER
class FeatureAttention(layers.Layer):
    def __init__(self, **kwargs):
        super(FeatureAttention, self).__init__(**kwargs)

    def build(self, input_shape):
        self.w = self.add_weight(
            name='feature_weight',
            shape=(input_shape[-1],),
            initializer='ones',
            trainable=True
        )

        super(FeatureAttention, self).build(input_shape)

    def call(self, inputs):
        return inputs * self.w

# 6. CUSTOM CALLBACK
class EarlyStopAtTarget(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):

        val_acc = logs.get('val_accuracy')

        if epoch > 10 and val_acc >= 0.95:
            print(
                f"\n[INFO] Target akurasi 95% tercapai pada epoch {epoch}. Training dihentikan."
            )

            self.model.stop_training = True

# 7. BUILD MODEL
inputs = layers.Input(
    shape=(len(features),),
    name="input_layer"
)

x = FeatureAttention(name="attention_layer")(inputs)
x = layers.Dense(64, activation='relu')(x)
x = layers.Dropout(0.3)(x)
x = layers.Dense(32, activation='relu')(x)
x = layers.Dropout(0.2)(x)

outputs = layers.Dense(
    3,
    activation='softmax',
    name="output_layer"
)(x)

model = Model(
    inputs=inputs,
    outputs=outputs,
    name="SpendingBehaviorModel"
)
# 8. COMPILE MODEL
model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# 9. CALLBACKS
log_dir = os.path.join(
    "logs",
    "fit",
    datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
)

tensorboard_callback = tf.keras.callbacks.TensorBoard(
    log_dir=log_dir,
    histogram_freq=1
)

early_stopping = tf.keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)

# 10. CLASS WEIGHT
# Karena dataset imbalance

class_weight = {
    0: 1.0,
    1: 1.0,
    2: 20.0
}

# 11. TRAINING
print("\n[INFO] Mulai melatih model...")

history = model.fit(
    X_train_scaled,
    y_train,
    epochs=100,
    batch_size=16,
    validation_data=(X_test_scaled, y_test),
    callbacks=[
        tensorboard_callback,
        EarlyStopAtTarget(),
        early_stopping
    ],
    class_weight=class_weight,
    verbose=1
)

# 12. EVALUATION
print("\n[INFO] Evaluasi model...")

loss, accuracy = model.evaluate(
    X_test_scaled,
    y_test,
    verbose=0
)

print(f"\nTest Loss     : {loss:.4f}")
print(f"Test Accuracy : {accuracy:.4f}")

# 13. PREDICTION REPORT
y_pred_probs = model.predict(X_test_scaled)

y_pred = np.argmax(y_pred_probs, axis=1)
y_true = np.argmax(y_test, axis=1)

print("\n[INFO] Classification Report:\n")
print(
    classification_report(
        y_true,
        y_pred,
        target_names=encoder.classes_
    )
)

print("\n[INFO] Confusion Matrix:\n")

print(confusion_matrix(y_true, y_pred))

# 14. SAVE MODEL
os.makedirs("models", exist_ok=True)
model.save('models/spending_persona_model.keras')
print("\n[INFO] Model disimpan di folder 'models/'")

# 15. SAVE SCALER
with open('models/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("[INFO] Scaler berhasil disimpan di 'models/scaler.pkl'")

# 16. SAVE LABEL ENCODER
with open('models/label_encoder.pkl', 'wb') as f:
    pickle.dump(encoder, f)

print("[INFO] Label encoder berhasil disimpan.")