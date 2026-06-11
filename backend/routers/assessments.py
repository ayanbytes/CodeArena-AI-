from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from models import AssessmentCreate, QuestionCreate
from database import supabase
import random
import re

router = APIRouter()

@router.get("/")
async def get_assessments():
    try:
        response = supabase.table('assessments').select('*').order('created_at', desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{assessment_id}")
async def get_assessment(assessment_id: str):
    try:
        response = supabase.table('assessments').select('*').eq('id', assessment_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{assessment_id}")
async def update_assessment(assessment_id: str, payload: dict):
    try:
        response = supabase.table('assessments').update(payload).eq('id', assessment_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Assessment not found")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{assessment_id}")
async def delete_assessment(assessment_id: str):
    try:
        # First delete all associated submissions
        supabase.table('submissions').delete().eq('assessment_id', assessment_id).execute()
        
        # Then delete all associated questions
        supabase.table('questions').delete().eq('assessment_id', assessment_id).execute()
        
        # Finally delete the assessment
        response = supabase.table('assessments').delete().eq('id', assessment_id).execute()
        return {"status": "success"}
    except Exception as e:
        print(f"Error deleting assessment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class AssessmentGenerate(BaseModel):
    topic: str
    language: str
    duration_minutes: int
    created_by: str

class AssessmentFromBank(BaseModel):
    title: str
    description: str
    difficulty: str
    duration_minutes: int
    num_questions: int
    created_by: str
    candidate_emails: str

@router.post("/from-bank")
async def generate_assessment_from_bank(payload: AssessmentFromBank):
    try:
        # Fetch questions from bank with matching difficulty
        bank_resp = supabase.table('question_bank').select('*').eq('difficulty', payload.difficulty).execute()
        questions = bank_resp.data
        if not questions:
            raise HTTPException(status_code=404, detail=f"No questions found for difficulty: {payload.difficulty}")
        
        # 1. Insert into assessments
        assessment_data = {
            "title": payload.title,
            "description": payload.description,
            "difficulty": payload.difficulty,
            "duration_minutes": payload.duration_minutes,
            "created_by": payload.created_by,
            "candidate_emails": payload.candidate_emails,
            "is_active": True
        }
        assessment_resp = supabase.table('assessments').insert(assessment_data).execute()
        new_assessment = assessment_resp.data[0]
        
        # Pick multiple random questions
        num_to_pick = min(payload.num_questions, len(questions))
        selected_questions = random.sample(questions, num_to_pick)
        
        # 2. Insert into questions
        question_inserts = []
        for q in selected_questions:
            clean_title = re.sub(r'^\d+\.\s*', '', q["title"])
            question_inserts.append({
                "assessment_id": new_assessment["id"],
                "title": clean_title,
                "description": q["description"],
                "difficulty": q["difficulty"],
                "test_cases": q["test_cases"]
            })
            
        if question_inserts:
            supabase.table('questions').insert(question_inserts).execute()
        
        return new_assessment
    except Exception as e:
        import traceback
        print(f"Error creating from bank: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_assessment(payload: AssessmentGenerate):
    try:
        from services.gemini import generate_assessment_content
        content = generate_assessment_content(payload.topic, payload.language)
        
        # 1. Insert into assessments
        assessment_data = {
            "title": content["title"],
            "description": content["description"],
            "duration_minutes": payload.duration_minutes,
            "created_by": payload.created_by,
            "is_active": True
        }
        assessment_resp = supabase.table('assessments').insert(assessment_data).execute()
        new_assessment = assessment_resp.data[0]
        
        # 2. Insert into questions
        question_data = {
            "assessment_id": new_assessment["id"],
            "title": content["title"],
            "description": content["description"],
            "test_cases": content["test_cases"],
            "points": 10
        }
        supabase.table('questions').insert(question_data).execute()
        
        return new_assessment
    except Exception as e:
        import traceback
        print(f"Error generating assessment: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def create_assessment(assessment: AssessmentCreate):
    try:
        data = assessment.model_dump()
        data['created_by'] = str(data['created_by'])
        response = supabase.table('assessments').insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{assessment_id}/questions")
async def get_assessment_questions(assessment_id: str):
    try:
        response = supabase.table('questions').select('*').eq('assessment_id', assessment_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{assessment_id}/questions")
async def add_question(assessment_id: str, question: QuestionCreate):
    try:
        data = question.model_dump()
        data['assessment_id'] = assessment_id
        response = supabase.table('questions').insert(data).execute()
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
