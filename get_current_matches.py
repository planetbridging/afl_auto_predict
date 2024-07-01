import aiohttp

async def fetch_table(url='https://www.austadiums.com/sport/comp/afl/events', table_id='SportsTable'):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                html = await response.text()
                return html
            else:
                raise Exception(f"Failed to fetch table: HTTP {response.status}")