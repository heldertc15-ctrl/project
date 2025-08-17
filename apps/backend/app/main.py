from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.prediction_router import router as prediction_router

app = FastAPI(
    title="AI Soccer Betting Advisor API",
    description="Backend API for AI Soccer Betting Advisor MVP",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"],  # Frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(prediction_router)

@app.get("/")
async def read_root():
    """Hello World endpoint"""
    return {"message": "Hello World", "service": "AI Soccer Betting Advisor API"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Soccer Betting Advisor API"}