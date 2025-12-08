
import React, { useState } from 'react';
import { Member, ScoreRecord } from '../types';
import { Award, Trophy, Medal, Star, TrendingUp, BarChart3 } from 'lucide-react';

interface ScoringProps {
  members: Member[];
  scores: ScoreRecord[];
  onUpdateScore: (memberId: string, semester: string, score: number, notes: string) => void;
}

export const Scoring: React.FC<ScoringProps> = ({ members, scores, onUpdateScore }) => {
  const [activeTab, setActiveTab] = useState<'grading' | 'ranking'>('grading');
  const [semester, setSemester] = useState('HK1_2023-2024');

  const handleScoreChange = (memberId: string, val: string) => {
    const num = Math.min(10, Math.max(0, Number(val)));
    const currentNote = scores.find(s => s.memberId === memberId && s.semester === semester)?.notes || '';
    onUpdateScore(memberId, semester, num, currentNote);
  };

  const handleNoteChange = (memberId: string, note: string) => {
    const currentScore = scores.find(s => s.memberId === memberId && s.semester === semester)?.score || 0;
    onUpdateScore(memberId, semester, currentScore, note);
  };

  // Ranking Logic
  const getRankings = () => {
      return members.map(m => {
          const memberScores = scores.filter(s => s.memberId === m.id);
          const totalScore = memberScores.reduce((sum, s) => sum + s.score, 0);
          const semesterCount = memberScores.length || 1;
          const avgScore = totalScore > 0 ? (totalScore / semesterCount).toFixed(1) : '0.0';
          return { ...m, totalScore, avgScore: Number(avgScore) };
      }).sort((a, b) => b.totalScore - a.totalScore);
  };

  const rankings = getRankings();

  const getRankIcon = (index: number) => {
      if (index === 0) return <Trophy className="text-yellow-500" fill="currentColor" size={24} />;
      if (index === 1) return <Medal className="text-slate-400" fill="currentColor" size={24} />;
      if (index === 2) return <Medal className="text-amber-600" fill="currentColor" size={24} />;
      return <span className="font-bold text-slate-400 w-6 text-center">{index + 1}</span>;
  };

  const getTierBadge = (avg: number) => {
      if (avg >= 9.0) return <span className="px-2 py-1 rounded bg-cyan-100 text-cyan-700 text-xs font-bold border border-cyan-200">Kim Cương</span>;
      if (avg >= 8.0) return <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200">Vàng</span>;
      if (avg >= 6.5) return <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">Bạc</span>;
      return <span className="px-2 py-1 rounded bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">Đồng</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Thi đua & Khen thưởng</h2>
            <p className="text-slate-500">Đánh giá rèn luyện và xếp hạng thành viên.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('grading')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'grading' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <Award size={18} /> Chấm điểm
            </button>
            <button 
                onClick={() => setActiveTab('ranking')}
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'ranking' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'}`}
            >
                <BarChart3 size={18} /> Xếp hạng tích lũy
            </button>
        </div>
      </div>

      {activeTab === 'grading' ? (
        <>
            <div className="flex justify-end">
                <select 
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={semester} onChange={e => setSemester(e.target.value)}
                >
                    <option value="HK1_2023-2024">Học kỳ 1 (2023-2024)</option>
                    <option value="HK2_2023-2024">Học kỳ 2 (2023-2024)</option>
                    <option value="HK1_2024-2025">Học kỳ 1 (2024-2025)</option>
                    <option value="HK2_2024-2025">Học kỳ 2 (2024-2025)</option>
                </select>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                            <tr>
                                <th className="px-6 py-4">Thành viên</th>
                                <th className="px-6 py-4">Ban chuyên môn</th>
                                <th className="px-6 py-4 text-center">Điểm (0-10)</th>
                                <th className="px-6 py-4">Ghi chú / Đánh giá</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {members.map(member => {
                                const record = scores.find(s => s.memberId === member.id && s.semester === semester);
                                const score = record?.score || 0;
                                return (
                                    <tr key={member.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                 {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full object-cover"/> : member.name.charAt(0)}
                                            </div>
                                            {member.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">{member.department || '-'}</td>
                                        <td className="px-6 py-4 text-center">
                                            <input 
                                                type="number" 
                                                min="0" max="10"
                                                className={`w-16 text-center border rounded-lg py-1 font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                                                    score >= 8 ? 'text-green-600 border-green-200 bg-green-50' : 
                                                    score >= 5 ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-red-600 border-red-200 bg-red-50'
                                                }`}
                                                value={score}
                                                onChange={(e) => handleScoreChange(member.id, e.target.value)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                className="w-full border-b border-transparent hover:border-slate-300 focus:border-indigo-500 bg-transparent outline-none py-1 text-sm text-slate-600 transition-colors"
                                                placeholder="Nhập nhận xét..."
                                                value={record?.notes || ''}
                                                onChange={(e) => handleNoteChange(member.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
             {/* Top 3 Cards */}
             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {rankings.slice(0, 3).map((r, idx) => (
                    <div key={r.id} className={`p-6 rounded-2xl border flex flex-col items-center justify-center text-center relative overflow-hidden ${
                        idx === 0 ? 'bg-gradient-to-b from-yellow-50 to-white border-yellow-200 shadow-md' : 
                        idx === 1 ? 'bg-gradient-to-b from-slate-50 to-white border-slate-200' : 'bg-gradient-to-b from-orange-50 to-white border-orange-200'
                    }`}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20"></div>
                        <div className="mb-3 transform scale-125">
                            {getRankIcon(idx)}
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-sm overflow-hidden mb-3">
                            {r.avatarUrl ? <img src={r.avatarUrl} className="w-full h-full object-cover"/> : <div className="w-full h-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-400">{r.name.charAt(0)}</div>}
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg truncate w-full">{r.name}</h3>
                        <p className="text-slate-500 text-sm mb-2">{r.department || 'Thành viên'}</p>
                        <div className="flex items-center gap-2 mt-2">
                             <span className="text-2xl font-bold text-indigo-600">{r.totalScore}</span>
                             <span className="text-xs text-slate-400 uppercase font-bold">điểm</span>
                        </div>
                    </div>
                ))}
             </div>

             {/* Full List */}
             <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center gap-2">
                    <TrendingUp size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-slate-800">Bảng xếp hạng chi tiết</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase">
                        <tr>
                            <th className="px-6 py-4 text-center w-20">Hạng</th>
                            <th className="px-6 py-4">Thành viên</th>
                            <th className="px-6 py-4">Xếp loại</th>
                            <th className="px-6 py-4 text-center">Trung bình</th>
                            <th className="px-6 py-4 text-right">Tổng điểm</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rankings.map((r, idx) => (
                            <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        {getRankIcon(idx)}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden text-xs font-bold text-slate-500">
                                            {r.avatarUrl ? <img src={r.avatarUrl} className="w-full h-full object-cover"/> : r.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">{r.name}</div>
                                            <div className="text-xs text-slate-500">{r.department}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {getTierBadge(r.avgScore)}
                                </td>
                                <td className="px-6 py-4 text-center font-medium text-slate-600">
                                    {r.avgScore}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="inline-block bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm">
                                        {r.totalScore}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      )}
    </div>
  );
};
