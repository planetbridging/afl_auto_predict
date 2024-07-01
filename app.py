from flask import Flask, render_template
from afl_models import predict_match
from excel_convert import convert_excel_to_csv
from get_current_matches import fetch_table
import pandas as pd
from datetime import datetime
import asyncio

app = Flask(__name__)

URL_EXCEL_AFL = 'https://www.aussportsbetting.com/historical_data/afl.xlsx'

@app.route('/afl')
def afl():
    predictions = asyncio.run(refreshing())
    return render_template('afl.html', predictions=predictions)

async def refreshing():
    await convert_excel_to_csv(URL_EXCEL_AFL)
    html = await fetch_table()
    matches = parse_table(html)
    
    predictions = []
    for match in matches:
        try:
            output = await predict_match(match[1], match[2])
            predictions.append([match[0], match[1], match[2], output])
        except Exception as e:
            print(f"Unable to process team: {e}")
            predictions.append([match[0], match[1], match[2], None])
    
    print(f"Refreshed on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    return predictions

def parse_table(html):
    df = pd.read_html(html)[0]
    matches = []
    for _, row in df.iterrows():
        if 'AFL' in row['Event']:
            date = row['Date']
            time = row['Time']
            event = row['Event'].replace('AFL: ', '')
            venue = row['Venue']
            teams = event.split(' v ')
            if len(teams) > 1:
                row_string = f"{date},{time},{event},{venue},"
                matches.append([row_string, teams[0], teams[1]])
    return matches

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5008)