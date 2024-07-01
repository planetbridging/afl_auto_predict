import requests

def fetch_table(url='https://www.austadiums.com/sport/comp/afl/events', table_id='SportsTable'):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        raise Exception(f"Failed to fetch table: HTTP {response.status_code}")