from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.applications import router as applications_router
from app.api.complaints import router as complaints_router
from app.api.decisions import router as decisions_router
from app.api.documents import router as documents_router
from app.api.news import router as news_router
from app.api.search import router as search_router
from app.api.stats import router as stats_router
from app.api.support import router as support_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(applications_router)
api_router.include_router(complaints_router)
api_router.include_router(decisions_router)
api_router.include_router(documents_router)
api_router.include_router(news_router)
api_router.include_router(search_router)
api_router.include_router(stats_router)
api_router.include_router(support_router)
