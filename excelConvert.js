const axios = require('axios');
const fs = require('fs');
const ExcelJS = require('exceljs');

function convertExcelToCSV(url, excelPath = 'afl.xlsx', csvPath = 'afl.csv') {
  return new Promise((resolve, reject) => {
    // Download the Excel file
    axios({
      method: 'get',
      url,
      responseType: 'arraybuffer',
    })
      .then((response) => {
        fs.writeFileSync(excelPath, response.data);

        // Read the Excel file
        const workbook = new ExcelJS.Workbook();
        workbook.xlsx.readFile(excelPath).then(() => {
          const worksheet = workbook.worksheets[0];

          // Convert to CSV
          const csvWriter = workbook.csv.writeBuffer({ sheetId: worksheet.id });
          csvWriter.then((buffer) => {
            const csvContent = buffer.toString();
            const lines = csvContent.split('\n');
            const newCsvContent = lines.slice(1).join('\n'); // Remove the first line

            fs.writeFileSync(csvPath, newCsvContent);
            resolve(`Excel file has been converted to CSV (with the top line removed) and saved as ${csvPath}`);
          });
        });
      })
      .catch((error) => {
        reject(`An error occurred while downloading or converting the file: ${error}`);
      });
  });
}

module.exports = convertExcelToCSV;
