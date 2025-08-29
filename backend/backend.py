from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import json
from datetime import datetime
import random

app = FastAPI(title="CyberPhantoms Backend", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data for demonstration
mock_calls = [
    {
        "caller": "sip:user1@cyberphantoms.com",
        "callee": "sip:user2@cyberphantoms.com", 
        "callId": f"call-{random.randint(1000, 9999)}",
        "start": datetime.now().strftime("%H:%M:%S"),
        "duration": f"{random.randint(1, 300)}s",
        "status": "Active"
    },
    {
        "caller": "sip:admin@cyberphantoms.com",
        "callee": "sip:support@cyberphantoms.com",
        "callId": f"call-{random.randint(1000, 9999)}",
        "start": datetime.now().strftime("%H:%M:%S"),
        "duration": f"{random.randint(1, 300)}s",
        "status": "Ended"
    }
]

mock_qos = [
    {"metric": "Jitter (ms)", "value": round(random.uniform(0, 50), 2)},
    {"metric": "Latency (ms)", "value": round(random.uniform(50, 200), 2)},
    {"metric": "Packet Loss (%)", "value": round(random.uniform(0, 5), 2)}
]

@app.get("/")
async def root():
    return {"message": "CyberPhantoms VoIP API", "status": "online"}

@app.get("/calls")
async def get_calls():
    """Get recent call logs"""
    return mock_calls

@app.get("/qos")
async def get_qos():
    """Get QoS metrics"""
    return mock_qos

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)