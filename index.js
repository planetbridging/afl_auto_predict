const tf = require('@tensorflow/tfjs-node');
const csv = require('csv-parser');
const fs = require('fs');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const port = 5008;

const convertExcelToCSV = require('./excelConvert');
const getCurrentMatches = require('./getCurrentMatches');
const predictMatch = require('./aflModels');


const urlExcelAfl = 'https://www.aussportsbetting.com/historical_data/afl.xlsx';
var htmlString= "refreshing";

(async () => {
// Example usage
//predictMatch( 'Geelong Cats', 'Brisbane Lions');


/*convertExcelToCSV(urlExcelAfl)
  .then((message) => console.log(message))
  .catch((error) => console.error(error));*/
  
   

    //console.log(lstPredictions[0]);
    //console.log(lstPredictions[0][3]["predictions"]);
    //var tblRow = createPredictionRow([lstPredictions[0],lstPredictions[1],lstPredictions[2],lstPredictions[0][3]["predictions"]]);
    //console.log(tblRow);

    await refreshing();

    setInterval(refreshing, 24 * 60 * 60 * 1000);

    // Route to return the HTML string
app.get('/afl', (req, res) => {
    res.send(htmlString);
  });
  
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
})();

async function refreshing(){

    await convertExcelToCSV(urlExcelAfl);

    var lstPredictions = [];
    var html = await getCurrentMatches();
    var lst = await parseTable(html);
      //console.log(lst);
  
      for(var i in lst){
          try{
          var output = await predictMatch(lst[i][1], lst[i][2]);
          //console.log(lst[i][0] +","+lst[i][1] +","+lst[i][2] +"," ,output);
              lstPredictions.push([lst[i][0],lst[i][1],lst[i][2],output]);
          }catch{
              console.log("unable to process team");
              lstPredictions.push([lst[i][0],lst[i][1],lst[i][2],[]]);
          }
      }

      htmlString = createTable(lstPredictions);
      console.log("refreshed",new Date().toDateString());
}

function createTableHeader() {
    return `
      <thead>
        <tr>
          <th>Time of Match</th>
          <th>Teams</th>
          <th>Predicted Winner</th>
          <th>Predictions</th>
        </tr>
      </thead>
    `;
  }

function createTable(items) {
    const headerHtml = createTableHeader();

    var trHtml = "";

    for(var i in items){
        try{
            var tblRow = createPredictionRow([items[i][0],items[i][1],items[i][2],items[i][3]["predictions"]]);
        trHtml += tblRow;
        }catch{}
    }
    //const rowHtml = createPredictionRow(item); // Assuming createPredictionRow is defined as before
  
    return `
      <table class="table table-dark">
        ${headerHtml}
        <tbody>
          ${trHtml}
        </tbody>
      </table>
    `;
  }

function createPredictionRow(item) {
    const [timeOfMatch, team1, team2, predictions] = item;
  
    // Calculate the total scores for both teams
    const totalScores = predictions.reduce(
      (totals, [score1, score2]) => [totals[0] + score1, totals[1] + score2],
      [0, 0]
    );
  
    // Determine the winner
    const winner = totalScores[0] > totalScores[1] ? team1 : team2;
  
    // Create the HTML for the predictions
const predictionsHtml = predictions
.map(([score1, score2]) => `<li>${Math.round(score1)} vs ${Math.round(score2)}</li>`)
.join('');

  
    // Create the HTML for the table row
    const rowHtml = `
      <tr>
        <td>${timeOfMatch}</td>
        <td>${team1} vs ${team2}</td>
        <td>${winner} will win</td>
        <td>
          <ul>
            ${predictionsHtml}
          </ul>
        </td>
      </tr>
    `;
  
    return rowHtml;
  }


async function parseTable(html) {
    var lst = [];
    const $ = cheerio.load(html);
    const table = $('#SportsTable');
  
    table.find('tr').each(async (i, row) => {
      const cols = $(row).find('td');
      if (cols.length > 0) {
        const date = $(cols[0]).text().trim();
        const time = $(cols[1]).text().trim();
        const event = $(cols[2]).text().trim();
        const venue = $(cols[3]).text().trim();
        let match = [];
  
        if (event.includes('AFL')) {
          match = event.replace('AFL: ', '');
          const teams = match.split(' v ');
  
          if (teams.length > 1) {
            const rowString = `${date},${time},${event},${venue},`;
  
            try {
              // Assuming predict_match is a function you have defined elsewhere
              //predict_match(rowString, teams[0], teams[1]);
              //console.log(rowString);
              //console.log(teams[0], teams[1]);
              lst.push([rowString,teams[0], teams[1]]);
              /*try{
                var output = await predictMatch(teams[0], teams[1]);
                console.log(output);
              }catch{
                console.log("unable to process team");
              }*/
             
            } catch (error) {
              console.error('An error occurred while predicting the match:', error);
            }
          }
        }
      }
    });
    return lst;
  }


//-----------


/*

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


*/