
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { MemberList } from './components/MemberList';
import { EventList } from './components/EventList';
import { DocumentManager } from './components/DocumentManager';
import { TaskManager } from './components/TaskManager';
import { Scoring } from './components/Scoring';
import { Attendance } from './components/Attendance';
import { FinanceManager } from './components/FinanceManager';
import { Settings } from './components/Settings';
import { Scheduler } from './components/Scheduler';
import { Login } from './components/Login';
import { Member, ClubEvent, MemberRole, MemberStatus, Document, Task, ScoreRecord, Transaction, AppSettings, StudySession } from './types';
import { MessageSquare, Menu } from 'lucide-react';

// Mock Data
const INITIAL_MEMBERS: Member[] = [
  { id: 'admin', username: 'admin', password: 'admin', name: 'Nguyễn Văn Chủ Nhiệm', email: 'chunhiem@club.com', phone: '0901234567', role: MemberRole.PRESIDENT, status: MemberStatus.ACTIVE, joinedDate: '2023-01-15' },
  { id: 'head1', username: 'head1', password: '123', name: 'Trần Thị Trưởng Ban', email: 'sukien@club.com', phone: '0909876543', role: MemberRole.HEAD, department: 'Ban Sự Kiện', status: MemberStatus.ACTIVE, joinedDate: '2023-02-20' },
  { id: 'mem1', username: 'mem1', password: '123', name: 'Lê Văn Thành Viên', email: 'member@club.com', phone: '0912345678', role: MemberRole.MEMBER, department: 'Ban Sự Kiện', status: MemberStatus.ACTIVE, joinedDate: '2023-05-10' },
  { id: 'mem2', name: 'Phạm Thị D', email: 'dpham@example.com', phone: '0987654321', role: MemberRole.SECRETARY, status: MemberStatus.ACTIVE, joinedDate: '2023-06-01' },
];

const INITIAL_EVENTS: ClubEvent[] = [
  { id: '1', title: 'Workshop AI Gen', date: '2023-11-20', location: 'Hội trường A', description: 'Tìm hiểu về Gemini và ứng dụng trong học tập.', budget: 2000000, attendees: 50, attendanceList: ['admin', 'head1'] },
  { id: '2', title: 'Team Building Mùa Thu', date: '2023-12-05', location: 'Công viên B', description: 'Gắn kết thành viên mới.', budget: 5000000, attendees: 40 },
];

const INITIAL_DOCS: Document[] = [
    { id: 'd1', title: 'Kế hoạch Tuyển quân Gen 5', type: 'proposal', status: 'approved', content: 'Nội dung chi tiết...', createdBy: 'Trần Thị Trưởng Ban', createdAt: '2023-10-01', approvedBy: 'Nguyễn Văn Chủ Nhiệm' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 't1', date: '2023-10-01', description: 'Thu lệ phí HK1 - Lê Văn Thành Viên', amount: 50000, type: 'income', category: 'Membership Fee', memberId: 'mem1' },
    { id: 't2', date: '2023-10-05', description: 'Mua nước uống Workshop', amount: 150000, type: 'expense', category: 'Event Support' },
];

const INITIAL_SETTINGS: AppSettings = {
    clubName: 'ClubManager AI',
    defaultFee: 50000,
    currentSemester: 'HK1_2023-2024'
};

const INITIAL_SCHEDULE: StudySession[] = [
    { id: 's1', subject: 'Tiếng Anh chuyên ngành', dayOfWeek: 2, startTime: '07:00', endTime: '11:00'},
    { id: 's2', subject: 'Lập trình Web', dayOfWeek: 4, startTime: '13:00', endTime: '16:00'},
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Member | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [events, setEvents] = useState<ClubEvent[]>(INITIAL_EVENTS);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCS);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [studySchedule, setStudySchedule] = useState<StudySession[]>(INITIAL_SCHEDULE);
  const [loginError, setLoginError] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Auth Logic
  const handleLogin = (u: string, p: string) => {
    const user = members.find(m => m.username === u && m.password === p);
    if (user) {
        setCurrentUser(user);
        setLoginError('');
    } else {
        setLoginError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      setActiveTab('dashboard');
  };

  // Data Handlers
  const handleAddMember = (data: Omit<Member, 'id'>) => {
    setMembers([{ ...data, id: Math.random().toString(36).substr(2, 9) }, ...members]);
  };

  const handleUpdateMember = (id: string, updates: Partial<Member>) => {
      setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleAddEvent = (data: Omit<ClubEvent, 'id'>) => {
    setEvents([{ ...data, id: Math.random().toString(36).substr(2, 9) }, ...events]);
  };

  const handleUpdateEvent = (id: string, updates: Partial<ClubEvent>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  // Special handler for creating event from doc manager then switching view
  const handleCreateEventFromDoc = (data: Omit<ClubEvent, 'id'>) => {
      handleAddEvent(data);
      setActiveTab('events');
  }

  if (!currentUser) {
      return <Login onLogin={handleLogin} error={loginError} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard members={members} events={events} />;
      case 'members':
        return <MemberList members={members} onAddMember={handleAddMember} onUpdateMember={handleUpdateMember} currentUser={currentUser} settings={settings} />;
      case 'events':
        return <EventList events={events} members={members} onAddEvent={handleAddEvent} />;
      case 'scheduler':
        return <Scheduler 
            events={events} 
            studySchedule={studySchedule} 
            onAddSession={(s) => setStudySchedule([...studySchedule, s])} 
            onDeleteSession={(id) => setStudySchedule(studySchedule.filter(s => s.id !== id))}
        />;
      case 'documents':
        return <DocumentManager 
            documents={documents} 
            currentUser={currentUser} 
            onAddDocument={(d) => setDocuments([d, ...documents])}
            onUpdateDocument={(id, status) => setDocuments(documents.map(d => d.id === id ? {...d, status} : d))}
            onDeleteDocument={(id) => setDocuments(documents.filter(d => d.id !== id))}
            onAddEvent={handleCreateEventFromDoc}
        />;
      case 'tasks':
        return <TaskManager 
            tasks={tasks} members={members} currentUser={currentUser}
            onAddTask={(t) => setTasks([t, ...tasks])}
            onUpdateTask={(id, s) => setTasks(tasks.map(t => t.id === id ? {...t, status: s} : t))}
        />;
      case 'scoring':
        return <Scoring members={members} scores={scores} 
            onUpdateScore={(mid, sem, val, note) => {
                const exists = scores.find(s => s.memberId === mid && s.semester === sem);
                if (exists) {
                    setScores(scores.map(s => s.memberId === mid && s.semester === sem ? {...s, score: val, notes: note} : s));
                } else {
                    setScores([...scores, { memberId: mid, semester: sem, score: val, notes: note}]);
                }
            }}
        />;
      case 'finance':
        return <FinanceManager transactions={transactions} members={members} settings={settings} onAddTransaction={(t) => setTransactions([t, ...transactions])} />;
      case 'attendance':
        return <Attendance events={events} members={members} onUpdateEvent={handleUpdateEvent} />;
      case 'settings':
        return <Settings settings={settings} onUpdateSettings={setSettings} />;
      case 'feedback':
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
                <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Hòm thư góp ý</h2>
                <p className="text-slate-500 mb-6">Gửi ý kiến đóng góp ẩn danh tới Ban Chủ Nhiệm.</p>
                <textarea className="w-full h-32 p-4 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Nhập nội dung góp ý..."></textarea>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Gửi góp ý</button>
            </div>
        );
      default:
        return <Dashboard members={members} events={events} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex font-sans text-slate-900">
      {/* Sidebar - Hidden on print */}
      <div className={`fixed inset-y-0 left-0 z-40 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 no-print`}>
         <Sidebar 
            activeTab={activeTab} 
            setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false); }} 
            currentUser={currentUser} 
            onLogout={handleLogout} 
            clubName={settings.clubName}
            clubLogo={settings.clubLogoUrl} 
        />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 md:hidden no-print" onClick={() => setSidebarOpen(false)}></div>
      )}
      
      {/* Mobile Header - Hidden on print */}
      <div className="fixed top-0 left-0 right-0 bg-white p-4 shadow-sm md:hidden z-20 flex justify-between items-center no-print">
        <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
                <Menu size={24} />
            </button>
            <h1 className="font-bold text-indigo-600 truncate max-w-[200px]">{settings.clubName}</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
             {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} className="w-full h-full object-cover"/> : null}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-6 pt-24 md:pt-8 min-h-screen transition-all print-no-margin">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
