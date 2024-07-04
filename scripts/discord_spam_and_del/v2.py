import asyncio
import aiohttp
import json


authKey = "YOUR_AUTH_KEY"
channel_id = "YOUR_CHANNEL_ID"
content = "YOUR_MESSAGE"
url = f"https://discord.com/api/v9/channels/{channel_id}/messages"
quantity = 5


headers = {
    'Authorization': authKey,
}

payload = {
    "mobile_network_type": "unknown",
    "content": content,
    "flags": 0
}


async def send_message(session, _):
    while True:
        async with session.post(url, headers=headers, json=payload) as response:
            res_json = await response.json()
            if response.status == 429:  # Rate limited
                retry_after = res_json.get('retry_after', 1)
                print(f"Rate limited. Retrying after {retry_after} seconds.")
                await asyncio.sleep(retry_after)
            else:
                print(res_json.get('content'))
                return res_json.get('id')

async def delete_message(session, message_id):
    del_url = f"{url}/{message_id}"
    async with session.delete(del_url, headers=headers) as del_response:
        del_res_text = await del_response.text()
        print(del_res_text)

async def send_and_delete_message(session, index):
    message_id = await send_message(session, index)
    if message_id:
        await delete_message(session, message_id)

async def main():
    async with aiohttp.ClientSession() as session:
        tasks = [send_and_delete_message(session, i) for i in range(quantity)]
        await asyncio.gather(*tasks)

# Run the main function
asyncio.run(main())
