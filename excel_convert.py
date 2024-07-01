import pandas as pd
import aiohttp
import aiofiles

async def convert_excel_to_csv(url, excel_path='afl.xlsx', csv_path='afl.csv'):
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            if response.status == 200:
                data = await response.read()
                async with aiofiles.open(excel_path, mode='wb') as f:
                    await f.write(data)
            else:
                raise Exception(f"Failed to download file: HTTP {response.status}")

    df = pd.read_excel(excel_path)
    df.to_csv(csv_path, index=False)
    print(f"Excel file has been converted to CSV and saved as {csv_path}")