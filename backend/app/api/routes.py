from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.applications import router as applications_router
from app.api.documents import router as documents_router
from app.api.news import router as news_router
from app.api.search import router as search_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(applications_router)
api_router.include_router(documents_router)
api_router.include_router(news_router)
api_router.include_router(search_router)
