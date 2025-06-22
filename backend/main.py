from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Dict, Any, Optional, List
import uvicorn
import requests
import uuid
import os
import json
from datetime import datetime, date
from pathlib import Path

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Data persistence file
DATA_FILE = Path("weather_data.json")

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}

def load_data():
    """Load weather data from file if it exists"""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, 'r') as f:
                data = json.load(f)
                weather_storage.update(data)
                print(f"Loaded {len(data)} weather records from storage")
        except Exception as e:
            print(f"Error loading data: {e}")

def save_data():
    """Save weather data to file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(weather_storage, f, indent=2, default=str)
    except Exception as e:
        print(f"Error saving data: {e}")

# Load existing data on startup
load_data()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "message": "Backend is running"}

# Add sample data if storage is empty
if not weather_storage:
    sample_weather_data = {
        "date": "2024-01-15",
        "location": "New York",
        "notes": "Sample weather data for testing",
        "weather_data": {
            "temperature": 45,
            "description": "Partly cloudy",
            "humidity": 65,
            "wind_speed": 12,
            "pressure": 1013,
            "visibility": 10,
            "feels_like": 42,
            "uv_index": 3,
            "precipitation": 0,
            "cloud_cover": 60
        },
        "created_at": datetime.now().isoformat()
    }
    
    sample_id = "sample-123"
    weather_storage[sample_id] = sample_weather_data
    save_data()
    print(f"Sample weather data available at ID: {sample_id}")

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""
    
    @validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
    
    @validator('location')
    def validate_location(cls, v):
        if not v.strip():
            raise ValueError('Location cannot be empty')
        if len(v.strip()) < 2:
            raise ValueError('Location must be at least 2 characters')
        return v.strip()
    
    @validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 500:
            raise ValueError('Notes cannot exceed 500 characters')
        return v

class WeatherResponse(BaseModel):
    id: str
    message: str = "Weather request created successfully"

class WeatherDataResponse(BaseModel):
    id: str
    date: str
    location: str
    notes: str
    weather_data: Dict[str, Any]
    created_at: str

@app.post("/weather", response_model=WeatherResponse, status_code=status.HTTP_201_CREATED)
async def create_weather_request(request: WeatherRequest):
    """
    Handle weather request with enhanced validation and error handling:
    1. Receive and validate form data (date, location, notes)
    2. Call WeatherStack API for the location
    3. Store combined data with unique ID
    4. Return the ID to frontend
    """
    try:
        # Get WeatherStack API key from environment variable
        api_key = os.getenv("WEATHERSTACK_API_KEY")
        
        if not api_key:
            # For demo purposes, create realistic mock weather data
            import random
            weather_data = {
                "temperature": random.randint(15, 35),
                "description": random.choice(["Sunny", "Partly cloudy", "Cloudy", "Light rain", "Clear"]),
                "humidity": random.randint(30, 90),
                "wind_speed": random.randint(5, 25),
                "pressure": random.randint(1000, 1030),
                "visibility": random.randint(5, 15),
                "feels_like": random.randint(12, 38),
                "uv_index": random.randint(1, 10),
                "precipitation": random.randint(0, 10),
                "cloud_cover": random.randint(0, 100),
                "wind_direction": random.choice(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]),
                "sunrise": "06:30",
                "sunset": "18:45"
            }
        else:
            # Call WeatherStack API with better error handling
            url = "http://api.weatherstack.com/current"
            params = {
                "access_key": api_key,
                "query": request.location,
                "units": "m"  # Metric units
            }
            
            response = requests.get(url, params=params, timeout=10)
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Weather service is currently unavailable"
                )
            
            weather_response = response.json()
            
            if "error" in weather_response:
                error_info = weather_response["error"].get("info", "Unknown error")
                if "API key" in error_info:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Weather service configuration error"
                    )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Location not found: {error_info}"
                    )
            
            current = weather_response.get("current", {})
            location = weather_response.get("location", {})
            
            weather_data = {
                "temperature": current.get("temperature"),
                "description": current.get("weather_descriptions", [""])[0],
                "humidity": current.get("humidity"),
                "wind_speed": current.get("wind_speed"),
                "pressure": current.get("pressure"),
                "visibility": current.get("visibility"),
                "feels_like": current.get("feelslike"),
                "uv_index": current.get("uv_index"),
                "precipitation": current.get("precip"),
                "cloud_cover": current.get("cloudcover"),
                "wind_direction": current.get("wind_dir"),
                "sunrise": location.get("localtime"),
                "sunset": location.get("localtime")
            }
        
        # Generate unique ID
        weather_id = str(uuid.uuid4())
        
        # Store combined data with timestamp
        weather_storage[weather_id] = {
            "id": weather_id,
            "date": request.date,
            "location": request.location,
            "notes": request.notes,
            "weather_data": weather_data,
            "created_at": datetime.now().isoformat()
        }
        
        # Persist data to file
        save_data()
        
        return WeatherResponse(id=weather_id)
        
    except requests.Timeout:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Weather service request timed out"
        )
    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather service error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@app.get("/weather/{weather_id}", response_model=WeatherDataResponse)
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID with enhanced error handling.
    """
    if weather_id not in weather_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weather data with ID '{weather_id}' not found"
        )
    
    return weather_storage[weather_id]

@app.get("/weather", response_model=List[WeatherDataResponse])
async def list_weather_data():
    """
    List all weather data entries.
    """
    items = list(weather_storage.values())
    items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return items

@app.delete("/weather/{weather_id}")
async def delete_weather_data(weather_id: str):
    """
    Delete weather data by ID.
    """
    if weather_id not in weather_storage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Weather data with ID '{weather_id}' not found"
        )
    
    del weather_storage[weather_id]
    save_data()
    
    return {"message": f"Weather data with ID '{weather_id}' deleted successfully"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)