from fastapi import FastAPI
from routes import predict,lifestyle_cat,activity
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # ตอนทดสอบใส่ * ไปก่อนได้
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Register routers
app.include_router(predict.router, prefix="/api", tags=["predict"])
app.include_router(lifestyle_cat.router, prefix="/api", tags=["lifestyle_cat"])
app.include_router(activity.router, prefix="/api", tags=["activity"])