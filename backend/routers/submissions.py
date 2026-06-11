from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from models import SubmissionCreate, SubmissionResult, TestCaseResult
from database import supabase
from services.execution import execute_code
from services.gemini import generate_feedback

router = APIRouter()

@router.get("/")
async def get_submissions(assessment_id: str = None):
    try:
        query = supabase.table('submissions').select('*, questions(title, description)').order('created_at', desc=True)
        if assessment_id:
            query = query.eq('assessment_id', assessment_id)
        response = query.execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class RunResult(BaseModel):
    status: str
    passed: bool
    runtime_ms: int
    memory_kb: int
    test_cases: List[TestCaseResult]

@router.post("/run", response_model=RunResult)
async def run_code(submission: SubmissionCreate):
    try:
        # Fetch Question details
        question_res = supabase.table('questions').select('*').eq('id', str(submission.question_id)).single().execute()
        if not question_res.data:
            raise HTTPException(status_code=404, detail="Question not found")
            
        question = question_res.data
        test_cases = question.get('test_cases', [])
        
        passed_all = True
        total_runtime = 0
        max_memory = 0
        test_case_results = []
        overall_status = "Accepted"
        
        for tc in test_cases:
            result = execute_code(
                code=submission.code,
                language=submission.language,
                input_data=tc.get('input', ''),
                expected_output=tc.get('expected_output', '')
            )
            
            # Use stdout if present, otherwise stderr, otherwise compile output
            actual = result.get('stdout')
            if not actual and result.get('stderr'):
                actual = result.get('stderr')
            if not actual and result.get('compile_output'):
                actual = result.get('compile_output')
                
            test_case_results.append(TestCaseResult(
                input=tc.get('input', ''),
                expected_output=tc.get('expected_output', ''),
                actual_output=str(actual) if actual else None,
                passed=result['passed'],
                status=result['status']
            ))
            
            if not result['passed']:
                passed_all = False
                overall_status = result['status']
            
            total_runtime += result['runtime']
            max_memory = max(max_memory, result['memory'])

        if not test_cases:
            overall_status = "No Test Cases"

        return RunResult(
            status=overall_status,
            passed=passed_all,
            runtime_ms=int(total_runtime),
            memory_kb=int(max_memory),
            test_cases=test_case_results
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=SubmissionResult)
async def submit_code(submission: SubmissionCreate):
    try:
        # 1. Fetch Question details (to get test cases and description)
        question_res = supabase.table('questions').select('*').eq('id', str(submission.question_id)).single().execute()
        if not question_res.data:
            raise HTTPException(status_code=404, detail="Question not found")
            
        question = question_res.data
        test_cases = question.get('test_cases', [])
        
        # 2. Execute Code against Judge0 (simplified: run first test case)
        # In a real app, you would loop through all test cases
        passed_all = True
        total_runtime = 0
        max_memory = 0
        test_case_results = []
        overall_status = "Accepted"
        
        for tc in test_cases:
            result = execute_code(
                code=submission.code,
                language=submission.language,
                input_data=tc.get('input', ''),
                expected_output=tc.get('expected_output', '')
            )
            
            actual = result.get('stdout')
            if not actual and result.get('stderr'):
                actual = result.get('stderr')
            if not actual and result.get('compile_output'):
                actual = result.get('compile_output')
                
            test_case_results.append(TestCaseResult(
                input=tc.get('input', ''),
                expected_output=tc.get('expected_output', ''),
                actual_output=str(actual) if actual else None,
                passed=result['passed'],
                status=result['status']
            ))
            
            if not result['passed']:
                passed_all = False
                overall_status = result['status']
                
            total_runtime += result['runtime']
            max_memory = max(max_memory, result['memory'])

        if not test_cases:
            overall_status = "No Test Cases"

        score = 100.0 if passed_all else 0.0

        # 3. Generate AI Feedback
        ai_feedback = generate_feedback(
            code=submission.code,
            language=submission.language,
            problem_description=question['description']
        )

        # 4. Save Submission to Database
        sub_data = {
            "user_id": str(submission.user_id) if submission.user_id else None,
            "candidate_email": submission.candidate_email,
            "question_id": str(submission.question_id),
            "assessment_id": str(submission.assessment_id),
            "code": submission.code,
            "language": submission.language,
            "score": score,
            "ai_feedback": ai_feedback,
            "status": "completed",
            "runtime_ms": int(total_runtime),
            "memory_kb": int(max_memory)
        }
        
        supabase.table('submissions').insert(sub_data).execute()

        # Return result to frontend
        return SubmissionResult(
            status=overall_status,
            score=score,
            runtime_ms=int(total_runtime),
            memory_kb=int(max_memory),
            ai_feedback=ai_feedback,
            test_cases=test_case_results
        )
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
