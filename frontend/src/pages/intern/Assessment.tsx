import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronRight, Terminal, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { submitCode, runCode, getAssessmentQuestions } from '../../lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssessment } from '../../lib/api';

const SAMPLE_PROBLEM = {
  id: "mock-question-uuid",
  assessment_id: "mock-assessment-uuid",
  title: "Two Sum",
  difficulty: "Easy",
  tags: ["Array", "Hash Table"],
  description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  examples: [
    { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
    { input: "nums = [3,2,4], target = 6", output: "[1,2]" }
  ],
  starterCode: {
    python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
    javascript: "function twoSum(nums, target) {\n    // Write your code here\n};",
  }
};

interface AssessmentInterfaceProps {
  candidateEmail?: string;
}

export function AssessmentInterface({ candidateEmail }: AssessmentInterfaceProps = {}) {
  const { id: assessmentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  
  useEffect(() => {
    if (assessmentId) {
      fetchAssessmentDetails();
      fetchQuestions();
    }
  }, [assessmentId]);

  const fetchAssessmentDetails = async () => {
    try {
      const data = await getAssessment(assessmentId!);
      setTimeLeft(data.duration_minutes * 60);
    } catch (error) {
      console.error("Failed to fetch assessment details:", error);
    }
  };

  useEffect(() => {
    if (timeLeft === null || isSuccess) return;

    if (timeLeft <= 0) {
      // Time is up!
      setOutput((prev) => prev + "\n\n⏰ Time's up! Auto-submitting your code...");
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSuccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Anti-paste proctoring
  const handlePaste = (e: any) => {
    e.preventDefault();
    alert("⚠️ Proctoring Alert: Copy-pasting is disabled during this assessment.");
  };

  const fetchQuestions = async () => {
    try {
      const data = await getAssessmentQuestions(assessmentId!);
      setQuestions(data);
      if (data.length > 0) {
        const starter = data[0].starter_code || { python: "def solve():\n    pass", javascript: "function solve() {\n}" };
        setCode(starter.python || "");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  const handleLanguageChange = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    if (currentQuestion?.starter_code) {
      setCode(currentQuestion.starter_code[lang] || "");
    }
  };

  const handleRun = async () => {
    if (!user && !candidateEmail) {
      setOutput('Error: You must be logged in or provide a valid email to run.');
      return;
    }

    setIsExecuting(true);
    setOutput('Compiling and running against public test cases...\n');
    
    try {
      const result = await runCode({
        user_id: user?.id,
        candidate_email: candidateEmail,
        question_id: currentQuestion.id,
        assessment_id: assessmentId!,
        code: code,
        language: language,
      });

      const passedCount = result.test_cases?.filter((tc: any) => tc.passed).length || 0;
      const totalCount = result.test_cases?.length || 0;
      const passStatus = result.passed ? "All public test cases passed!" : "Some test cases failed.";
      
      let tcDetails = "";
      if (result.test_cases) {
        result.test_cases.forEach((tc: any, idx: number) => {
          tcDetails += `\nTest Case ${idx + 1}: ${tc.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
          tcDetails += `Input: ${tc.input}\n`;
          tcDetails += `Expected Output: ${tc.expected_output}\n`;
          tcDetails += `Actual Output: ${tc.actual_output || 'N/A'}\n`;
          tcDetails += `----------------------------------------\n`;
        });
      }

      setOutput(`Status: ${result.status}\n${passStatus} (${passedCount}/${totalCount})\nRuntime: ${result.runtime_ms}ms\nMemory: ${result.memory_kb}KB\n${tcDetails}\n(Note: Click 'Submit' to evaluate against all hidden test cases and get AI feedback)`);
    } catch (error: any) {
      setOutput(`Error executing code: ${error.message}\nMake sure the FastAPI backend is running.`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (!user && !candidateEmail) {
      setOutput('Error: You must be logged in or provide a valid email to submit.');
      return;
    }
    
    setIsExecuting(true);
    setOutput('Submitting code to Judge0 for hidden test cases...\nEvaluating complexity with Gemini AI...');
    setAiFeedback(null);
    
    try {
      const result = await submitCode({
        user_id: user?.id,
        candidate_email: candidateEmail,
        question_id: currentQuestion.id,
        assessment_id: assessmentId!,
        code: code,
        language: language,
      });

      const passedCount = result.test_cases?.filter((tc: any) => tc.passed).length || 0;
      const totalCount = result.test_cases?.length || 0;

      let tcDetails = "";
      if (result.test_cases) {
        result.test_cases.forEach((tc: any, idx: number) => {
          tcDetails += `\nTest Case ${idx + 1}: ${tc.passed ? '✅ PASSED' : '❌ FAILED'}\n`;
          tcDetails += `Input: ${tc.input}\n`;
          tcDetails += `Expected Output: ${tc.expected_output}\n`;
          tcDetails += `Actual Output: ${tc.actual_output || 'N/A'}\n`;
          tcDetails += `----------------------------------------\n`;
        });
      }

      setOutput(`Status: ${result.status}\nScore: ${result.score}/100\nTest Cases: ${passedCount}/${totalCount} passed\nRuntime: ${result.runtime_ms}ms\nMemory: ${result.memory_kb}KB\n${tcDetails}`);
      if (result.score === 100) {
        setIsSuccess(true);
      } else {
        setIsSuccess(true); // Still consider it "finished" to stop timer
      }
      if (result.ai_feedback) {
        setAiFeedback(result.ai_feedback);
      }
    } catch (error: any) {
      setOutput(`Error submitting code: ${error.message}\nMake sure the FastAPI backend is running.`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetEditorState(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      resetEditorState(currentQuestionIndex - 1);
    }
  };

  const resetEditorState = (idx: number) => {
    setIsSuccess(false);
    setOutput('');
    setAiFeedback(null);
    const nextQ = questions[idx];
    const starter = nextQ.starter_code || { python: "def solve():\n    pass", javascript: "function solve() {\n}" };
    setCode(starter[language] || "");
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      resetEditorState(currentQuestionIndex + 1);
    } else {
      // Assessment complete
      navigate('/dashboard');
    }
  };

  if (!questions.length) {
    return <div className="h-screen flex items-center justify-center">Loading questions...</div>;
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden" onPasteCapture={handlePaste}>
      {/* Navbar */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-primary">{currentQuestion.title}</span>
          <div className="flex items-center ml-4 gap-2">
            <button 
              onClick={handlePrevious} 
              disabled={currentQuestionIndex === 0}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-muted-foreground disabled:opacity-30 transition-colors"
            >
              Prev
            </button>
            <span className="text-muted-foreground text-sm font-medium w-24 text-center">
              {currentQuestionIndex + 1} of {questions.length}
            </span>
            <button 
              onClick={handleSkip} 
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-2 py-1 bg-muted hover:bg-muted/80 rounded text-xs text-muted-foreground disabled:opacity-30 transition-colors"
            >
              Skip
            </button>
          </div>
          {timeLeft !== null && (
            <span className={`ml-6 px-3 py-1 rounded text-sm font-bold ${timeLeft < 300 ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse' : 'bg-muted/50 text-foreground border border-border'}`}>
              Time Left: {formatTime(timeLeft)}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-muted rounded-md p-1">
            <button 
              onClick={() => handleLanguageChange('python')}
              className={`px-3 py-1 rounded text-sm transition-all ${language === 'python' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              Python
            </button>
            <button 
              onClick={() => handleLanguageChange('javascript')}
              className={`px-3 py-1 rounded text-sm transition-all ${language === 'javascript' ? 'bg-background shadow-sm' : 'text-muted-foreground'}`}
            >
              JavaScript
            </button>
          </div>
          
          <button 
            onClick={handleRun}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-4 h-4" /> Run
          </button>
          
          <button 
            onClick={handleSubmit}
            disabled={isExecuting}
            className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50 shadow-[0_0_15px_rgba(170,59,255,0.4)]"
          >
            <Send className="w-4 h-4" /> Submit
          </button>
        </div>
      </header>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Description */}
        <div className="w-1/3 min-w-[300px] border-r border-border overflow-y-auto p-6 bg-card/20">
          <div className="flex items-center gap-3 mb-6">
            <h1 className="text-2xl font-bold">{currentQuestion.title}</h1>
            <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">{currentQuestion.difficulty || 'Easy'}</span>
          </div>
          
          <div className="prose prose-invert prose-sm max-w-none mb-8 whitespace-pre-wrap text-muted-foreground">
            {currentQuestion.description}
          </div>
          
          <div className="space-y-6">
            {currentQuestion.test_cases?.filter((tc: any) => !tc.is_hidden).map((ex: any, idx: number) => (
              <div key={idx} className="bg-muted/50 p-4 rounded-lg border border-border">
                <p className="text-sm font-medium mb-2">Example {idx + 1}:</p>
                <div className="font-mono text-sm text-muted-foreground">
                  <div><span className="text-foreground">Input:</span> {ex.input}</div>
                  <div><span className="text-foreground">Output:</span> {ex.expected_output}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Editor & Console */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 15,
                lineHeight: 1.6,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                fontFamily: 'JetBrains Mono, Menlo, Monaco, Courier New, monospace',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on'
              }}
            />
          </div>
          
          {/* Console / Output */}
          <div className="h-1/3 border-t border-border bg-card flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                Console
              </div>
              {aiFeedback && (
                <div className="flex items-center gap-2 text-xs font-medium text-primary">
                  <Sparkles className="w-4 h-4" /> AI Feedback Generated
                </div>
              )}
              {isSuccess && (
                <button
                  onClick={handleNextQuestion}
                  className="ml-auto flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm font-medium transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
              {output || <span className="text-muted-foreground">Click 'Run' to execute your code locally, or 'Submit' to evaluate against backend hidden test cases.</span>}
              
              <AnimatePresence>
                {aiFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex gap-4"
                  >
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-primary mb-1 font-sans">Gemini AI Evaluation</h4>
                      <p className="text-muted-foreground font-sans leading-relaxed">{aiFeedback}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
