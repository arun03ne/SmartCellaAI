# warehouse.py
from dataclasses import dataclass


@dataclass
class Warehouse:
    code : str
    postal_code: str
    latitude: float
    longitude: float
    url: str
def get_warehouses():
    warehouses = [
        Warehouse("WH001", "110001", 28.6328, 77.2197, "http://WH001.com/1"),
        Warehouse("WH002", "560001", 12.9716, 77.5946, "http://WH002.com/2"),
        Warehouse("WH003", "400001", 18.9388, 72.8354, "http://WH003.com/3")
    ]
    return warehouses