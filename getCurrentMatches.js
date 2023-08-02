const axios = require('axios');
const cheerio = require('cheerio');

function fetchTable(url = 'https://www.austadiums.com/sport/comp/afl/events', tableId = 'SportsTable') {
  return new Promise((resolve, reject) => {
    axios.get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const tableHtml = $(`#${tableId}`).prop('outerHTML');

        if (tableHtml) {
          resolve(tableHtml);
        } else {
          reject(`Table with ID "${tableId}" not found.`);
        }
      })
      .catch((error) => {
        reject(`An error occurred while fetching the table: ${error}`);
      });
  });
}

module.exports = fetchTable;
