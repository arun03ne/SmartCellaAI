import base64
import math
from typing import Annotated, Optional, Union

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
import requests

from fastapi.responses import JSONResponse
from app.warehouseData import get_warehouses,Warehouse
from typing import List
import os

from dotenv import load_dotenv
from app.userInputProcess import InputRequest
import logging
from app.autogenProcess import Autogen
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()
# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
    format='%(asctime)s - %(levelname)s - %(message)s',  # Log format
    handlers=[
        logging.FileHandler("app.log"),  # Log to a file
        logging.StreamHandler()  # Log to console
    ]
)


app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/processInput")
async def processInput(chatRequest: Optional[str] = Form(None), file: UploadFile = File(None)):
    """
    Route to handle file uploads and return extracted item details.
    """
    
    logging.info("Received a request to /analyze")
    result = ""
    if chatRequest :
        print(chatRequest)
        result =chatRequest
        #inputProcess = InputRequest(chatRequest)
        #result = inputProcess.get_item_details_from_text("", "Please extract all item details from this content. Create a JSON array including the items, their quantities, and the address. Additionally, include the latitude and longitude for the address.")
        
 
    elif  file:
                
        file_content = await file.read()
        base64_content = base64.b64encode(file_content).decode('utf-8')

        # Analyze the document
        inputProcess = InputRequest(text=base64_content)
        result = inputProcess.get_item_details_from_image("Please extract all details from the purchase order.", os.getenv('API_BASE_CHAT'),os.getenv('DEPLOYMENT_NAME_CHAT'), os.getenv('API_KEY_CHAT'))
        
        
        
    else:
        raise HTTPException(status_code=400, detail="No input provided")
    
    auto = Autogen()
    print("**********************************************************",result)
    return auto.auto_warehouse(result)

@app.get("/")
def read_root():
    api_base = "https://oai-learning.openai.azure.com/"
    deployment_name = "gpt-4o"
    api_key = ""#"6pJKAl6L2Kb3QolQlDw6qooTk1uj7Pa23eu1qaCcGuNriDqDsNaGJQQJ99AKACYeBjFXJ3w3AAABACOG6jv9"
   
    
    

    '''agent = ConversableAgent(name="simple-agent", llm_config= llm_config,
    code_execution_config=False,
    human_input_mode= "NEVER")

    response = agent.generate_reply([{"role":"user","content":"what is the value of PI"}])
    print( response)'''
    return {"Hello": "all good"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

@app.get("/warehouses")
def get_warehouseDetails() -> List[Warehouse]:
    return  get_warehouses()

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )
