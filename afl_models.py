import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
import numpy as np

def min_max_scaler(data):
    scaler = MinMaxScaler()
    return scaler.fit_transform(data)

def modify_team_name(team_name):
    replace_dict = {
        'Geelong Cats': 'Geelong',
        'Brisbane Lions': 'Brisbane',
        'Gold Coast Suns': 'Gold Coast',
        'Sydney Swans': 'Sydney',
        'Adelaide Crows': 'Adelaide',
        'West Coast Eagles': 'West Coast',
    }
    return replace_dict.get(team_name, team_name)

def predict_match(team1, team2):
    team1 = modify_team_name(team1)
    team2 = modify_team_name(team2)

    df = pd.read_csv('afl.csv')
    scores = df[((df['Home Team'] == team1) & (df['Away Team'] == team2)) |
                ((df['Home Team'] == team2) & (df['Away Team'] == team1))]
    
    if scores.empty:
        return None

    scores = scores[['Home Score', 'Away Score']].values
    normalized_scores = min_max_scaler(scores)

    sequence_length = 4
    X, y = [], []

    for i in range(sequence_length, len(normalized_scores)):
        X.append(normalized_scores[i-sequence_length:i])
        y.append(normalized_scores[i])

    X, y = np.array(X), np.array(y)

    X_train, y_train = X[:-10], y[:-10]
    X_test, y_test = X[-10:], y[-10:]

    if len(X_train) == 0:
        return None

    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(50, input_shape=(X_train.shape[1], X_train.shape[2])),
        tf.keras.layers.Dense(2)
    ])

    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(X_train, y_train, epochs=20, batch_size=1, verbose=0)

    predictions = model.predict(X_test)
    
    scaler = MinMaxScaler()
    scaler.fit(scores)
    reversed_predictions = scaler.inverse_transform(predictions)

    return {
        'predictions': reversed_predictions.tolist(),
        'actual_values': y_test.tolist()
    }