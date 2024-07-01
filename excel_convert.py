import pandas as pd
import requests

def convert_excel_to_csv(url, excel_path='afl.xlsx', csv_path='afl.csv'):
    response = requests.get(url)
    if response.status_code == 200:
        with open(excel_path, 'wb') as f:
            f.write(response.content)
    else:
        raise Exception(f"Failed to download file: HTTP {response.status_code}")

    df = pd.read_excel(excel_path)
    df.to_csv(csv_path, index=False)
    print(f"Excel file has been converted to CSV and saved as {csv_path}")