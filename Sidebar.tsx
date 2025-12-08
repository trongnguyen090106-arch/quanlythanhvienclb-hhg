import React from 'react';
import { LayoutDashboard, Users, Calendar, LogOut, FileText, CheckSquare, Award, ScanLine, MessageSquare, Wallet, Settings, Clock, ChevronRight } from 'lucide-react';
import { Member, MemberRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: Member | null;
  onLogout: () => void;
  clubName?: string;
  clubLogo?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentUser, onLogout, clubName, clubLogo }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard size={18} />, roles: [] },
    { id: 'members', label: 'Thành viên', icon: <Users size={18} />, roles: [] },
    { id: 'events', label: 'Sự kiện', icon: <Calendar size={18} />, roles: [] },
    { id: 'scheduler', label: 'Lịch trình', icon: <Clock size={18} />, roles: [] },
    { id: 'finance', label: 'Tài chính', icon: <Wallet size={18} />, roles: [MemberRole.PRESIDENT, MemberRole.HEAD, MemberRole.SECRETARY] },
    { id: 'documents', label: 'Văn bản', icon: <FileText size={18} />, roles: [] },
    { id: 'tasks', label: 'Nhiệm vụ', icon: <CheckSquare size={18} />, roles: [] },
    { id: 'scoring', label: 'Thi đua', icon: <Award size={18} />, roles: [MemberRole.PRESIDENT, MemberRole.HEAD, MemberRole.SECRETARY] },
    { id: 'attendance', label: 'Điểm danh', icon: <ScanLine size={18} />, roles: [] },
    { id: 'feedback', label: 'Góp ý', icon: <MessageSquare size={18} />, roles: [] },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={18} />, roles: [MemberRole.PRESIDENT] },
  ];

  const filteredItems = menuItems.filter(item => 
    item.roles.length === 0 || (currentUser && item.roles.includes(currentUser.role))
  );

  return (
    <aside className="w-64 bg-white h-screen border-r border-slate-200 flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 shadow-sm sidebar">
      <div className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-200">
                {clubLogo ? <img src={clubLogo} alt="Logo" className="w-full h-full object-cover rounded-xl" /> : 'CLB'}
             </div>
             <div>
                <h1 className="font-extrabold text-slate-800 text-lg leading-tight line-clamp-1 tracking-tight">
                    {clubName || 'ClubManager'}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management System</p>
             </div>
        </div>

        {currentUser && (
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs overflow-hidden flex-shrink-0 shadow-sm">
                    {currentUser.avatarUrl ? <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover"/> : currentUser.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 truncate font-medium">{currentUser.role}</p>
                </div>
            </div>
        )}
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
            }`}
          >
            <div className="flex items-center gap-3">
                <span className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                </span>
                <span className="text-sm">{item.label}</span>
            </div>
            {activeTab === item.id && <ChevronRight size={14} className="opacity-50" />}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
};