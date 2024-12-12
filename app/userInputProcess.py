import base64
import json
from pydantic import BaseModel
import logging

import requests
# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
    handlers=[
        logging.FileHandler("app.log"),  # Log to a file
        logging.StreamHandler()  # Log to console
    ]
)
 
system_prompt = "You are a helpful assistant for extracting invoice data."

class InputRequest(BaseModel):
    text: str = None
    
 
 
    def get_item_details_from_image(self, prompt_template: str, api_base: str, deployment_name: str, api_key: str):
       
    
        try:
           
            # Construct the API endpoint
            base_url = f"{api_base}openai/deployments/{deployment_name}"
            endpoint = f"{base_url}/chat/completions?api-version=2023-05-15"
    
            # Prepare the request payload
            data = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt_template},
                            {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{self.text}"}}
                        ]
                    }
                ],
                "max_tokens": 2000
            }
    
            # Make the HTTP POST request
            headers = {
                "Content-Type": "application/json",
                "api-key": api_key
            }
            response = requests.post(endpoint, headers=headers, json=data)
    
            if response.status_code != 200:
                return {"error": f"Error: {response.reason}"}
    
            # Parse the JSON response to extract the assistant's reply
            response_data = response.json()
            assistant_content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
    
            # Example processing: Extract structured items if possible
            items = []
            if assistant_content:
                try:
                    # Attempt to parse the assistant's content as JSON
                    items = json.loads(assistant_content)
                except json.JSONDecodeError:
                    items = [{"info": assistant_content}]
    
            return {"items": items}
    
        except Exception as e:
            return {"error": str(e)}
    
    
    '''def get_item_details_from_text(text: str, prompt_template: str):
        logging.info("Analyzing text input")
        try:
            # Construct the API endpoint
            endpoint = f"{api_base}openai/deployments/{deployment_name}/chat/completions?api-version=2023-05-15"
    
            # Prepare the request payload
            data = {
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": [{"type": "text", "text": prompt_template}, {"type": "text", "text": text}]}
                ],
                "max_tokens": 2000
            }
    
            # Make the HTTP POST request
            headers = {
                "Content-Type": "application/json",
                "api-key": api_key
            }
            response = requests.post(endpoint, headers=headers, json=data)
    
            if response.status_code != 200:
                return {"error": f"Error: {response.reason}"}
    
            # Parse the JSON response to extract the assistant's reply
            response_data = response.json()
            assistant_content = response_data.get("choices", [{}])[0].get("message", {}).get("content", "")
    
            # Example processing: Extract structured items if possible
            items = []
            if assistant_content:
                try:
                    items = json.loads(assistant_content)  # Attempt to parse JSON if present
                except json.JSONDecodeError:
                    items = [{"info": assistant_content}]
    
            return {"items": items}
    
        except Exception as e:
            logging.error(f"Error in text analysis: {e}")
            return {"error": str(e)}
            '''
    