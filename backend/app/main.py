from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import users, demographics, questionnaire, sts_assessment, exercises, recommendations, video_analysis

app = FastAPI(
    title="Physiotherapy Exercise Recommendation API",
    description="Backend API for OA Knee Exercise Recommendation System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(demographics.router, prefix="/api/demographics", tags=["Demographics"])
app.include_router(questionnaire.router, prefix="/api/questionnaire", tags=["Questionnaire"])
app.include_router(sts_assessment.router, prefix="/api/sts-assessment", tags=["STS Assessment"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["Exercises"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(video_analysis.router, prefix="/api/video-analysis", tags=["Video Analysis"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
