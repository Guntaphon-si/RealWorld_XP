from fastapi import FastAPI
from routes import start_activity,lifestyle_cat,auth,activity,predict,dashboard_routes,rf_predict
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lifestyle_cat.router, prefix="/api", tags=["lifestyle_cat"])
app.include_router(rf_predict.router, prefix="/api", tags=["stress_level"])
app.include_router(start_activity.router, prefix="/api", tags=["Start Activity"])
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(activity.router, prefix="/api", tags=["activity"])
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(dashboard_routes.router, prefix="/api/dashboard", tags=["dashboard"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to RealWorld XP API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)