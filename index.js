const tf = require('@tensorflow/tfjs-node');
const csv = require('csv-parser');
const fs = require('fs');

function minMaxScaler(data) {
  const min = data.reduce((acc, val) => val.map((v, i) => Math.min(v, acc[i])), Array(data[0].length).fill(Infinity));
  const max = data.reduce((acc, val) => val.map((v, i) => Math.max(v, acc[i])), Array(data[0].length).fill(-Infinity));

  return {
    transform: (data) => data.map(row => row.map((value, i) => (value - min[i]) / (max[i] - min[i]))),
    inverseTransform: (data) => data.map(row => row.map((value, i) => value * (max[i] - min[i]) + min[i])),
  };
}

function modifyTeamName(teamName) {
  const replaceDict = {
    'Geelong Cats': 'Geelong',
    'Brisbane Lions': 'Brisbane',
    'Gold Coast Suns': 'Gold Coast',
    'Sydney Swans': 'Sydney',
    'Adelaide Crows': 'Adelaide',
    'West Coast Eagles': 'West Coast',
  };

  return replaceDict[teamName] || teamName;
}

function predictMatch(team1, team2) {
  team1 = modifyTeamName(team1);
  team2 = modifyTeamName(team2);

  const scores = [];
  fs.createReadStream('afl.csv')
    .pipe(csv())
    .on('data', (row) => {
      if (
        ((row['Home Team'] === team1) && (row['Away Team'] === team2)) ||
        ((row['Home Team'] === team2) && (row['Away Team'] === team1))
      ) {
        scores.push([parseFloat(row['Home Score']), parseFloat(row['Away Score'])]);
      }
    })
    .on('end', () => {
      const scaler = minMaxScaler(scores);
      const normalizedScores = scaler.transform(scores);

      const sequenceLength = 4;
      const X = [];
      const y = [];

      for (let i = sequenceLength; i < normalizedScores.length; i++) {
        X.push(normalizedScores.slice(i - sequenceLength, i));
        y.push(normalizedScores[i]);
      }

      const X_train = X.slice(0, -10);
      const y_train = y.slice(0, -10);
      const X_test = X.slice(-10);
      const y_test = y.slice(-10);

      const model = tf.sequential();
      model.add(tf.layers.lstm({ units: 50, inputShape: [X_train[0].length, 2] }));
      model.add(tf.layers.dense({ units: 2 }));

      model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

      model.fit(tf.tensor(X_train), tf.tensor(y_train), { epochs: 20, batchSize: 1 }).then(() => {
        const predictions = model.predict(tf.tensor(X_test));
        const reversedPredictions = scaler.inverseTransform(predictions.arraySync());

        console.log('Predictions:', reversedPredictions);
        console.log('Actual values:', y_test);
      });
    });
}

// Example usage
predictMatch( 'Geelong Cats', 'Brisbane Lions');
