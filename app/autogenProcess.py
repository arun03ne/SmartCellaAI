import math
from typing import Annotated
from autogen import AssistantAgent,UserProxyAgent
import requests
from app.prompts import WarehouseManager_prompt,warehouse_prompt,shipmentCost_prompt,inputParser_prompt
import os
import pandas as pd

class Autogen:
    def auto_warehouse(self, textInput : str)->str:
        print("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", os.getenv('API_KEY'))
        llm_config = {"config_list": [
        {"model": os.getenv('DEPLOYMENT_NAME'), 
        "base_url": os.getenv('API_BASE'), 
            "api_type": "azure",
            "temperature":0.0,
            "api_key": os.getenv('API_KEY'),
            "api_version": "2024-08-01-preview"}]
        }
         
        environment_warehouseurl = os.getenv('WAREHOUSEURL')
        if not environment_warehouseurl :
            environment_warehouseurl = "/warehouses"

        warehouseManager_prompt= WarehouseManager_prompt.replace("{WAREHOUSE_URL}", environment_warehouseurl)
        
        # user input
        userProxy= UserProxyAgent(name ="user",
                                is_termination_msg=lambda msg : msg.get("content") is not None and "TERMINATE" in msg["content"],
                                human_input_mode="NEVER", 
                                code_execution_config=False, 
                                max_consecutive_auto_reply=10)
  

        inputParserAssistant = AssistantAgent(name="fileParser", llm_config= llm_config,
        system_message=inputParser_prompt,
        max_consecutive_auto_reply=10)

        #Central warehouse agent to get list of warehouses and corr. details.
        warehouseCentralAssistant = AssistantAgent(name="warehouseCentral", llm_config=llm_config,
        system_message=f"{warehouseManager_prompt } With final result include TERMINATE message.",
        max_consecutive_auto_reply=10)

        #reading from excel/ api 
        data_source = get_data_from_excel()
        warehouse_promptSystemMessage= warehouse_prompt.replace("{data_source}", data_source)
        print("##############################################################",warehouse_promptSystemMessage)                                                        
        warehouseAgentAssistant = AssistantAgent(
            name="Warehouse_Assistant",
            system_message=f"{warehouse_promptSystemMessage} With final result include TERMINATE message.",
            llm_config=llm_config,
            description="Warehouse Assistant who can give information about stock and storage.",
        )
        
        shipmentCostAssistant = AssistantAgent(
            name="shipmentCost_Assistant",
            system_message=f"{shipmentCost_prompt} Afer final result is reply with TERMINATE message. ",
            llm_config=llm_config,
            description="Shipment cost Assistant who can calculate the total shipping cost for each order item.",
        )

      
        warehouseCentralAssistant.register_for_llm(name="get_json_response", description="Get warehouses api")(get_json_response)

        userProxy.register_for_execution(name="get_json_response")(get_json_response)

        warehouseCentralAssistant.register_for_llm(name="haversine", description="caclualte distance with haversine")(haversine)

        userProxy.register_for_execution(name="haversine")(haversine)

        return userProxy.initiate_chats(
            [{"recipient":inputParserAssistant,
                "message":textInput,
                "summary_method":"last_msg",
                "max_turns":1
                },
                {"recipient":warehouseCentralAssistant,
                "message":"Return warehouse details",
                "summary_method":"last_msg",
                "max_consecutive_auto_reply":1,
                "max_turns":10
                },
                {"recipient":warehouseAgentAssistant,
                "message":"Return warehouse stock details",
                "summary_method":"last_msg",
                "max_turns":1
                },
                {"recipient":shipmentCostAssistant,
                "message":"Return shipment cost",
                "summary_method":"last_msg",
                "max_turns":1
                }
                ]
            
        )
        ############################################ code to remove
    ''''    chat_history = response.chat_history
    result_to_process = ''
    for item in chat_history:
        if "```" in item["content"]:
            result_to_process = item["content"]
            break
    sub_str1 = "```json"
    sub_str2 = "```"
    result_str = ""
    # getting elements in between
    split_str = result_to_process.split(sub_str1)
    for str_element in split_str[1:]:
        remaining_split_str = str_element.split(sub_str2, 1)
        if len(remaining_split_str) == 2:   
            res_str = remaining_split_str[0]
            result_str = result_str + res_str
    print("\n  ++++++++++++++++++  \n" + result_str)

    result_json = json.loads(result_str)
    print(type(result_json))
    # Create a mapping from warehouse_data based on "Warehouse ID"
    distance_mapping = {entry["Warehouse ID"]: entry["distance"] for entry in get_warehouse_data()}
    # Add "distance" to result_json where "Warehouse ID" matches
    for item in result_json["Available Items"]:
        warehouse_id = item["Warehouse ID"]
        if warehouse_id in distance_mapping:
            item["distance"] = distance_mapping[warehouse_id]
    print("\n  ==================================  \n")
    print(json.dumps(result_json))
    ############################################ code to remove
'''

def termination_msg(x):
    return isinstance(x, dict) and "TERMINATE" == str(x.get("content", ""))[-9:].upper()
    #method to call an http end point and get response
def get_json_response(url : Annotated[str , "url"])-> str:
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()  # Check for HTTP errors
        return response.json()  # Parse the response as JSON
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

#method to caculate distance 
def haversine(lat1: Annotated[float , "customer latitude"], lon1: Annotated[float , "customer longitude"], 
              lat2: Annotated[float , "warehouse latitude"], lon2: Annotated[float , "warehouse longitude"])->float:
    R = 6371  # Earth's radius in kilometers

    # Convert latitude and longitude from degrees to radians
    lat1 = math.radians(lat1)


    
    lon1 = math.radians(lon1)
    lat2 = math.radians(lat2)
    lon2 = math.radians(lon2)

    # Haversine formula
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    a = math.sin(delta_lat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(delta_lon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    distance = R * c

    return distance

def get_data_from_excel():
    data = pd.read_excel(r'app/stock-sample.xlsx', sheet_name=r'warehouse')
    json_data = data.to_json(orient='records')
    print(json_data)
    return json_data