import { useAuthStore } from '../../store/authStore';
import { LogOut, ArrowRight, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function InternDashboard() {
  const { user, signOut } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">CodeArena</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>
      
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome back!</h1>
          <p className="text-muted-foreground text-lg">You have 1 pending assessment waiting for you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Assessment Card */}
          <div className="p-6 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-primary/5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Data Structures Evaluation</h3>
              <span className="px-2 py-1 text-xs rounded-full bg-primary/20 text-primary border border-primary/20">Pending</span>
            </div>
            <p className="text-muted-foreground text-sm mb-8">Complete 3 algorithms in Python, Java, or C++.</p>
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span className="bg-muted px-3 py-1 rounded-md">60 minutes</span>
              <Link 
                to="/assessment/1" 
                className="flex items-center gap-1 text-primary group-hover:underline font-medium"
              >
                Start Test <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
