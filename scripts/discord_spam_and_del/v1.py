from typing import ChainMap
import requests
import time
import json

authKey = "YOUR_AUTH_KEY"
channel_id = "YOUR_CHANNEL_ID"
content = "YOUR_MESSAGE"
url = f"https://discord.com/api/v9/channels/{channel_id}/messages"
quantity = 5


headers = {
    'Authorization': authKey,
}


for i in range(quantity):
    payload={
      "mobile_network_type": "unknown",
      "content": content,
      "flags": 0
    }
    r = requests.post(url, headers=headers, json=payload)
    print(r.json().get('content'))

    message_id = r.json().get('id')

    time.sleep(0.2)

    delurl = url + f"/{message_id}"
    r = requests.delete(delurl, headers=headers)
    print(r.text)


