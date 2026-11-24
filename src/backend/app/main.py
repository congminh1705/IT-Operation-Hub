from fastapi import FastAPI

from app.health import router as health_router

app = FastAPI(title="IT Operation Hub")
app.include_router(health_router, prefix="/api/v1")
