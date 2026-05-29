import tensorflow as tf
from tensorflow.keras import layers, models
import datetime
import os

# Keras mensyaratkan callback sebagai subclass
class CustomMonitorCallback(tf.keras.callbacks.Callback):
    def on_epoch_end(self, epoch, logs=None):
        if epoch % 10 == 0:
            print(f"Epoch {epoch} | Loss: {logs.get('loss'):.4f} | Val Accuracy: {logs.get('val_accuracy'):.4f}")

def build_persona_model(input_dim: int) -> tf.keras.Model:
    inputs = tf.keras.Input(shape=(input_dim,))
    
    x = layers.Dense(128, activation='relu')(inputs)
    x = layers.Dropout(0.3)(x)
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(32, activation='relu')(x)
    
    outputs = layers.Dense(3, activation='softmax')(x)
    
    model = models.Model(inputs=inputs, outputs=outputs)
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def train_and_save_model(X_train, y_train, X_val, y_val, model_save_path: str):
    model = build_persona_model(input_dim=X_train.shape[1])
    
    # Konfigurasi TensorBoard & Callbacks
    log_dir = os.path.join("logs", "tensorboard", datetime.datetime.now().strftime("%Y%m%d-%H%M%S"))
    
    callbacks = [
        tf.keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=1),
        tf.keras.callbacks.EarlyStopping(monitor='val_loss', patience=7, restore_best_weights=True),
        CustomMonitorCallback()
    ]
    
    print("Memulai pelatihan model...")
    model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=50,
        batch_size=32,
        callbacks=callbacks,
        verbose=0
    )
    
    model.save(model_save_path)
    print(f"Model berhasil disimpan di {model_save_path}")