import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, Code } from 'lucide-react';
import { AssessmentInterface } from './Assessment';

export function TestGate() {
  const { id } = useParams<{ id: string }>();
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsVerified(true);
    }
  };

  if (isVerified) {
    return <AssessmentInterface candidateEmail={email} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Code className="w-32 h-32" />
        </div>
        
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Code className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            CodeArena
          </h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-2">Assessment Login</h2>
          <p className="text-muted-foreground text-sm">
            Please enter the email address your assessment link was sent to.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-all shadow-[0_0_15px_rgba(170,59,255,0.3)] hover:shadow-[0_0_25px_rgba(170,59,255,0.5)]"
          >
            Start Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
