import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Plus, Users, Code, Activity, Search, X, PenTool, ChevronRight, Trash2, Download } from 'lucide-react';
import { getAssessments, createAssessmentFromBank, getSubmissions, updateAssessment, deleteAssessment } from '../../lib/api';
import jsPDF from 'jspdf';

export function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<any>(null);
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ topic: '', language: 'Python', title: '', description: '', difficulty: 'Easy', duration_minutes: 60, num_questions: 5, candidate_emails: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assData, subData] = await Promise.all([
        getAssessments(),
        getSubmissions()
      ]);
      setAssessments(assData);
      setSubmissions(subData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    try {
      const newAssessment = await createAssessmentFromBank({
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        duration_minutes: formData.duration_minutes,
        num_questions: formData.num_questions,
        created_by: user.id,
        candidate_emails: formData.candidate_emails
      });
      setGeneratedLink(`${window.location.origin}/test/${newAssessment.id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to create assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessment) return;
    setIsLoading(true);
    try {
      await updateAssessment(editingAssessment.id, {
        title: editingAssessment.title,
        description: editingAssessment.description,
        difficulty: editingAssessment.difficulty,
        duration_minutes: editingAssessment.duration_minutes,
        candidate_emails: editingAssessment.candidate_emails,
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to update assessment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this assessment? This action cannot be undone.")) return;
    
    try {
      await deleteAssessment(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete assessment:', error);
    }
  };

  // Metrics Calculation
  const uniqueInterns = new Set(submissions.map(s => s.candidate_email)).size;
  // Let's define "Pending AI Reviews" as submissions that have an AI feedback pending,
  // but for now we'll just count how many submissions happened today as a placeholder for activity,
  // or just count submissions that don't have a perfect score needing review.
  const pendingReviews = submissions.filter(s => s.score < 100).length;

  const downloadPDF = (candidateEmail: string, assessmentTitle: string, subs: any[]) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Candidate Assessment Report", 20, 20);
      
      doc.setFontSize(12);
      doc.text(`Candidate: ${candidateEmail || "Unknown"}`, 20, 30);
      doc.text(`Assessment: ${assessmentTitle}`, 20, 40);
      
      let y = 60;
      subs.forEach((sub, idx) => {
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        const qTitle = sub.questions?.title || `Question ${idx + 1}`;
        const qDesc = sub.questions?.description || "";
        
        doc.setFontSize(14);
        doc.text(qTitle, 20, y);
        y += 10;
        
        // Add description
        doc.setFontSize(10);
        doc.setTextColor(100);
        const splitDesc = doc.splitTextToSize(qDesc, 170);
        doc.text(splitDesc, 20, y);
        y += (splitDesc.length * 5) + 5;
        
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.text(`Score: ${sub.score}/100 | Runtime: ${sub.runtime_ms}ms | Memory: ${sub.memory_kb}KB`, 20, y);
        y += 10;
        
        doc.text("Submitted Code:", 20, y);
        y += 5;
        
        doc.setFont("courier", "normal");
        const splitCode = doc.splitTextToSize(sub.code || '', 170);
        for (let i = 0; i < splitCode.length; i++) {
          if (y > 280) {
            doc.addPage();
            y = 20;
          }
          doc.text(splitCode[i], 20, y);
          y += 5;
        }
        
        doc.setFont("helvetica", "normal");
        y += 10;
      });
      
      doc.save(`${candidateEmail}_Report.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <Code className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">CodeArena Admin</span>
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
      
      {/* Main Content */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground">Monitor platform activity and manage assessments.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all font-medium shadow-[0_0_15px_rgba(170,59,255,0.3)]"
          >
            <Plus className="w-4 h-4" /> Create Assessment
          </button>
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-card border border-border rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Code className="w-16 h-16" />
            </div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> Total Assessments</h2>
            <p className="text-4xl font-bold text-foreground">{assessments.length}</p>
            <p className="text-xs text-green-500 mt-2">+2 this week</p>
          </div>
          
          <div className="p-6 bg-card border border-border rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Users className="w-16 h-16" />
            </div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Active Interns</h2>
            <p className="text-4xl font-bold text-foreground">{uniqueInterns}</p>
            <p className="text-xs text-green-500 mt-2">All time</p>
          </div>
          
          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
            <h2 className="text-sm font-medium text-primary mb-4">Pending Manual Reviews</h2>
            <p className="text-4xl font-bold text-primary">{pendingReviews}</p>
            <p className="text-xs text-primary/70 mt-2">Submissions with non-perfect scores</p>
          </div>
        </div>

        {/* Assessments Table Area */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Assessments</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:border-primary outline-none w-64"
              />
            </div>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Candidates</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessments.map((assessment) => {
                const assessmentSubmissions = submissions.filter(s => s.assessment_id === assessment.id);
                // Group submissions by candidate
                const groupedSubs = assessmentSubmissions.reduce((acc, sub) => {
                  if (!acc[sub.candidate_email]) acc[sub.candidate_email] = [];
                  acc[sub.candidate_email].push(sub);
                  return acc;
                }, {} as Record<string, any[]>);
                const candidates = Object.keys(groupedSubs);

                return (
                <React.Fragment key={assessment.id}>
                  <tr className="hover:bg-muted/10 transition-colors cursor-pointer" onClick={() => setExpandedAssessmentId(expandedAssessmentId === assessment.id ? null : assessment.id)}>
                    <td className="px-6 py-4 font-medium text-foreground flex items-center gap-2">
                      {assessment.title}
                      {expandedAssessmentId === assessment.id ? <ChevronRight className="w-4 h-4 rotate-90 transition-transform" /> : <ChevronRight className="w-4 h-4 transition-transform" />}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{assessment.duration_minutes} min</td>
                    <td className="px-6 py-4 text-muted-foreground">{candidates.length}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        assessment.status === 'Active' 
                          ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {assessment.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingAssessment(assessment); setIsEditModalOpen(true); }}
                          className="text-primary hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          <PenTool className="w-3 h-3" /> Edit
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, assessment.id)}
                          className="text-red-500 hover:text-red-600 hover:underline text-sm font-medium flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded Submissions View */}
                  {expandedAssessmentId === assessment.id && candidates.length > 0 && (
                    <tr className="bg-muted/5">
                      <td colSpan={5} className="px-8 py-4">
                        <div className="bg-background border border-border rounded-lg overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b border-border">
                              <tr>
                                <th className="px-4 py-2 text-left font-medium">Candidate Email</th>
                                <th className="px-4 py-2 text-left font-medium">Avg Score</th>
                                <th className="px-4 py-2 text-left font-medium">Questions Completed</th>
                                <th className="px-4 py-2 text-right font-medium">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {candidates.map(email => {
                                const subs = groupedSubs[email];
                                const avgScore = Math.round(subs.reduce((sum: number, s: any) => sum + s.score, 0) / subs.length);
                                return (
                                <tr key={email}>
                                  <td className="px-4 py-3">{email}</td>
                                  <td className="px-4 py-3 font-medium text-primary">{avgScore}%</td>
                                  <td className="px-4 py-3 text-muted-foreground">{subs.length}</td>
                                  <td className="px-4 py-3 text-right">
                                    <button 
                                      onClick={() => downloadPDF(email, assessment.title, subs)}
                                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                                    >
                                      <Download className="w-3 h-3" /> PDF Report
                                    </button>
                                  </td>
                                </tr>
                              )})}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                  {expandedAssessmentId === assessment.id && candidates.length === 0 && (
                    <tr className="bg-muted/5">
                      <td colSpan={5} className="px-8 py-6 text-center text-muted-foreground text-sm">
                        No candidates have taken this assessment yet.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )})}
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No assessments found. Create one to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 pr-8">Create Assessment</h2>
            
            {generatedLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <h3 className="text-green-500 font-semibold mb-2">Assessment Created Successfully!</h3>
                  <p className="text-sm text-muted-foreground mb-4">Share this link with the candidate:</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={generatedLink} 
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(generatedLink)}
                      className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setGeneratedLink(null);
                    setFormData({ topic: '', language: 'Python', title: '', description: '', difficulty: 'Easy', duration_minutes: 60, num_questions: 5, candidate_emails: '' });
                  }}
                  className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                >
                  Done
                </button>
              </div>
            ) : (
            <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                      placeholder="e.g. React Frontend Challenge"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                    <textarea 
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none h-24 resize-none"
                      placeholder="Describe the assessment objectives..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
                    <select 
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Number of Questions</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="20"
                      value={formData.num_questions}
                      onChange={(e) => setFormData({...formData, num_questions: parseInt(e.target.value)})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Candidate Emails (comma-separated)</label>
                    <textarea 
                      required
                      value={formData.candidate_emails}
                      onChange={(e) => setFormData({...formData, candidate_emails: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none resize-none h-20"
                      placeholder="intern1@example.com, intern2@example.com"
                    />
                  </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (minutes)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isLoading ? 'Creating...' : 'Create Assessment'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && editingAssessment && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-6 pr-8">Edit Assessment</h2>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  value={editingAssessment.title}
                  onChange={(e) => setEditingAssessment({...editingAssessment, title: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
                <textarea 
                  required
                  value={editingAssessment.description}
                  onChange={(e) => setEditingAssessment({...editingAssessment, description: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none h-24 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Difficulty</label>
                <select 
                  value={editingAssessment.difficulty}
                  onChange={(e) => setEditingAssessment({...editingAssessment, difficulty: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Duration (minutes)</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  value={editingAssessment.duration_minutes}
                  onChange={(e) => setEditingAssessment({...editingAssessment, duration_minutes: parseInt(e.target.value)})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Candidate Emails (comma separated)</label>
                <textarea 
                  value={editingAssessment.candidate_emails || ''}
                  onChange={(e) => setEditingAssessment({...editingAssessment, candidate_emails: e.target.value})}
                  placeholder="intern1@example.com, intern2@example.com"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:border-primary outline-none h-20 resize-none text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 flex items-center gap-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
