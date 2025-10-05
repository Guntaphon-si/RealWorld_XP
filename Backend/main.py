from fastapi import FastAPI
from routes import start_activity,lifestyle_cat,rf_predict,auth,activity,predict
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
