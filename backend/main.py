from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assessments, submissions

app = FastAPI(
    title="CodeArena AI Backend",
    description="API for CodeArena AI Assessment Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to the frontend URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assessments.router, prefix="/api/v1/assessments", tags=["Assessments"])
app.include_router(submissions.router, prefix="/api/v1/submissions", tags=["Submissions"])

@app.get("/")
async def root():
    return {"message": "Welcome to CodeArena AI API"}
