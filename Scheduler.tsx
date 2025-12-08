
import React, { useState } from 'react';
import { ClubEvent, StudySession } from '../types';
import { Calendar, Plus, Trash2, AlertTriangle, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { suggestSchedule } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface SchedulerProps {
  events: ClubEvent[];
  studySchedule: StudySession[];
  onAddSession: (session: StudySession) => void;
  onDeleteSession: (id: string) => void;
}

export const Scheduler: React.FC<SchedulerProps> = ({ events, studySchedule, onAddSession, onDeleteSession }) => {
  const [newSession, setNewSession] = useState<Partial<StudySession>>({
    dayOfWeek: 2,
    startTime: '07:00',
    endTime: '09:00',
    subject: ''
  });
  
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const days = [
      { val: 2, name: 'Thứ 2' },
      { val: 3, name: 'Thứ 3' },
      { val: 4, name: 'Thứ 4' },
      { val: 5, name: 'Thứ 5' },
      { val: 6, name: 'Thứ 6' },
      { val: 7, name: 'Thứ 7' },
      { val: 8, name: 'CN' },
  ];

  // Helper to convert time string "07:30" to minutes for comparison
  const timeToMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
  };

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSession.subject || !newSession.startTime || !newSession.endTime) return;
      
      onAddSession({
          id: Math.random().toString(36).substr(2, 9),
          subject: newSession.subject,
          dayOfWeek: newSession.dayOfWeek || 2,
          startTime: newSession.startTime,
          endTime: newSession.endTime
      });
      setNewSession({ ...newSession, subject: '' });
  };

  const handleAiSuggest = async () => {
      setLoadingAi(true);
      const res = await suggestSchedule(studySchedule);
      setAiSuggestion(res);
      setLoadingAi(false);
  };

  // Basic Conflict Detection
  // Check if any Club Event (we assume Club Events have a date, we map date to day of week)
  // For this simple scheduler, we just visualize week days.
  // Note: ClubEvents have specific Dates. We will check if any UPCOMING event falls on this day of week.

  const getDayEvents = (dayOfWeek: number) => {
      // Get study sessions
      const studies = studySchedule.filter(s => s.dayOfWeek === dayOfWeek).sort((a,b) => timeToMin(a.startTime) - timeToMin(b.startTime));
      
      // Get club events that fall on this day of week in the next 7 days (demo logic)
      const today = new Date();
      const nextWeekEvents = events.filter(e => {
          const d = new Date(e.date);
          const diffTime = d.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7 && (d.getDay() + 1 === dayOfWeek || (d.getDay() === 0 && dayOfWeek === 8));
      });

      return { studies, clubEvents: nextWeekEvents };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Lịch Trình & Học Tập</h2>
            <p className="text-slate-500">Cân đối lịch học và hoạt động CLB hợp lý.</p>
        </div>
        <button 
            onClick={handleAiSuggest}
            disabled={loadingAi}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-sm transition-all"
        >
            {loadingAi ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            AI Gợi ý lịch sinh hoạt
        </button>
      </div>

      {aiSuggestion && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 animate-fade-in relative">
              <button onClick={() => setAiSuggestion('')} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">x</button>
              <h3 className="font-bold text-indigo-800 flex items-center gap-2 mb-3">
                  <Sparkles size={18} /> Đề xuất từ AI
              </h3>
              <div className="prose prose-sm prose-indigo max-w-none">
                  <ReactMarkdown>{aiSuggestion}</ReactMarkdown>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Form */}
          <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <BookOpen size={20} className="text-indigo-600" /> Thêm lịch học
                  </h3>
                  <form onSubmit={handleAdd} className="space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Môn học / Công việc</label>
                          <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                value={newSession.subject} onChange={e => setNewSession({...newSession, subject: e.target.value})} placeholder="VD: Toán cao cấp..." />
                      </div>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Thứ</label>
                          <div className="flex flex-wrap gap-2">
                              {days.map(d => (
                                  <button 
                                    key={d.val} type="button"
                                    onClick={() => setNewSession({...newSession, dayOfWeek: d.val})}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${newSession.dayOfWeek === d.val ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                      {d.name === 'CN' ? 'CN' : d.val}
                                  </button>
                              ))}
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Bắt đầu</label>
                              <input required type="time" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={newSession.startTime} onChange={e => setNewSession({...newSession, startTime: e.target.value})} />
                          </div>
                          <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Kết thúc</label>
                              <input required type="time" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={newSession.endTime} onChange={e => setNewSession({...newSession, endTime: e.target.value})} />
                          </div>
                      </div>
                      <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                          <Plus size={18} /> Thêm vào lịch
                      </button>
                  </form>
              </div>
          </div>

          {/* Timetable Grid */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
              <div className="min-w-[600px]">
                  <div className="grid grid-cols-7 gap-2 mb-4">
                      {days.map(d => (
                          <div key={d.val} className="text-center">
                              <div className="font-bold text-slate-700 uppercase text-xs mb-2">{d.name}</div>
                              <div className="h-full min-h-[300px] bg-slate-50 rounded-lg p-2 space-y-2 relative">
                                  {(() => {
                                      const { studies, clubEvents } = getDayEvents(d.val);
                                      return (
                                          <>
                                              {/* Study Blocks */}
                                              {studies.map(s => (
                                                  <div key={s.id} className="bg-white border-l-4 border-slate-400 p-2 rounded shadow-sm text-left group relative">
                                                      <div className="text-xs font-bold text-slate-700 break-words">{s.subject}</div>
                                                      <div className="text-[10px] text-slate-500">{s.startTime} - {s.endTime}</div>
                                                      <button 
                                                        onClick={() => onDeleteSession(s.id)}
                                                        className="absolute top-1 right-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                      >
                                                          <Trash2 size={12} />
                                                      </button>
                                                  </div>
                                              ))}

                                              {/* Club Events Overlays */}
                                              {clubEvents.map(e => {
                                                  // Simple check for overlap with any study session
                                                  // Note: A real implementation would parse hours. 
                                                  // Here we just warn visually if there are study sessions on the same day.
                                                  const conflict = studies.length > 0; 
                                                  return (
                                                      <div key={e.id} className={`p-2 rounded shadow-sm text-left border-l-4 ${conflict ? 'bg-red-50 border-red-500' : 'bg-indigo-50 border-indigo-500'}`}>
                                                          <div className={`text-xs font-bold break-words ${conflict ? 'text-red-700' : 'text-indigo-700'}`}>
                                                              {conflict && <AlertTriangle size={12} className="inline mr-1"/>}
                                                              {e.title}
                                                          </div>
                                                          <div className="text-[10px] text-slate-500">
                                                              {new Date(e.date).toLocaleDateString('vi-VN')}
                                                          </div>
                                                      </div>
                                                  )
                                              })}
                                          </>
                                      )
                                  })()}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
