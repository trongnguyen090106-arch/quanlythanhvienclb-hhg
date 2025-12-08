import React from 'react';
import { Member, ClubEvent, MemberStatus } from '../types';
import { Users, CalendarCheck, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  members: Member[];
  events: ClubEvent[];
}

export const Dashboard: React.FC<DashboardProps> = ({ members, events }) => {
  const activeMembers = members.filter(m => m.status === MemberStatus.ACTIVE).length;
  const upcomingEvents = events.filter(e => new Date(e.date) > new Date()).length;
  
  // Mock data for chart
  const attendanceData = [
    { name: 'Tháng 1', members: 12 },
    { name: 'Tháng 2', members: 19 },
    { name: 'Tháng 3', members: 15 },
    { name: 'Tháng 4', members: 22 },
    { name: 'Tháng 5', members: 28 },
    { name: 'Tháng 6', members: 25 },
  ];

  const StatCard = ({ title, value, icon, colorClass, trend }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${colorClass}`}>
            {icon}
          </div>
          {trend && (
             <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} className="mr-1"/> {trend}
             </span>
          )}
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{value}</h3>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tổng quan</h2>
            <p className="text-slate-500 mt-1">Chào ngày mới! Dưới đây là tình hình hoạt động của CLB.</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Tổng thành viên" 
          value={members.length} 
          icon={<Users size={22} className="text-indigo-600"/>} 
          colorClass="bg-indigo-50"
          trend="+5%"
        />
        <StatCard 
          title="Đang hoạt động" 
          value={activeMembers} 
          icon={<TrendingUp size={22} className="text-emerald-600"/>} 
          colorClass="bg-emerald-50"
          trend="Ổn định"
        />
        <StatCard 
          title="Sự kiện sắp tới" 
          value={upcomingEvents} 
          icon={<CalendarCheck size={22} className="text-blue-600"/>} 
          colorClass="bg-blue-50"
        />
        <StatCard 
          title="Quỹ hiện tại" 
          value="5.2M" 
          icon={<Wallet size={22} className="text-amber-600"/>} 
          colorClass="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800">Thống kê tham gia</h3>
              <select className="bg-slate-50 border-none text-xs font-semibold text-slate-600 rounded-lg px-3 py-1 outline-none">
                  <option>6 tháng qua</option>
                  <option>Năm nay</option>
              </select>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="members" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32}>
                    {attendanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#818cf8'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Sự kiện gần đây</h3>
             <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Xem tất cả</button>
          </div>
          <div className="space-y-5">
            {events.slice(0, 4).map(event => (
              <div key={event.id} className="flex gap-4 items-center group cursor-pointer">
                <div className="bg-slate-50 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border border-slate-100 group-hover:border-indigo-600">
                  <span className="text-[10px] font-bold uppercase">{new Date(event.date).toLocaleString('vi-VN', { month: 'short' })}</span>
                  <span className="text-xl font-extrabold leading-none mt-0.5">{new Date(event.date).getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{event.title}</h4>
                  <div className="flex items-center text-xs text-slate-400 mt-1 gap-2">
                     <span className="truncate max-w-[120px]">{event.location}</span>
                     <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                     <span>{event.time || '08:00'}</span>
                  </div>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Chưa có sự kiện nào.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};