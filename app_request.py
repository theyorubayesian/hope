import json

import requests

# Explanation
url = "http://127.0.0.1:8000/api/v1/explanation/"
sample = {
    "id": "4567890",
    "tweet": "I hate how this country this but I have hope."
}

headers = {"Content-type": "application/json"}
response = requests.post(url, data=json.dumps(sample), headers=headers)
print("Status Code: ", response.status_code)
print("Explanation: ", response.content)

# Classification
url = "http://127.0.0.1:8000/api/v1/sentiment/"
sample = [{
    "id": "4567890",
    "tweet": "I hate how this country this but I have hope."
}, {"id": "456789", "tweet": "I don dey wait for Atiku"}]

headers = {"Content-type": "application/json"}
response = requests.post(url, data=json.dumps(sample), headers=headers)
print("Status Code: ", response.status_code)
print("Sentiment: ", response.json())
