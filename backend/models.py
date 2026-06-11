from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID

class AssessmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    difficulty: str
    duration_minutes: int
    created_by: UUID

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    candidate_emails: Optional[str] = None

class QuestionCreate(BaseModel):
    assessment_id: UUID
    title: str
    description: str
    difficulty: str
    question_type: str = "coding"
    constraints: Optional[str] = None
    input_format: Optional[str] = None
    output_format: Optional[str] = None
    starter_code: Optional[Dict[str, str]] = None
    test_cases: Optional[List[Dict[str, Any]]] = None

class SubmissionCreate(BaseModel):
    user_id: Optional[UUID] = None
    candidate_email: Optional[str] = None
    question_id: UUID
    assessment_id: UUID
    code: str
    language: str

class TestCaseResult(BaseModel):
    input: str
    expected_output: str
    actual_output: Optional[str] = None
    passed: bool
    status: str

class SubmissionResult(BaseModel):
    status: str
    score: float
    runtime_ms: int
    memory_kb: int
    ai_feedback: Optional[str] = None
    test_cases: Optional[List[TestCaseResult]] = None
