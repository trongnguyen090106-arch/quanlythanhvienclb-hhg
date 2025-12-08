import React, { useState } from 'react';
import { Task, Member, MemberRole } from '../types';
import { CheckSquare, Clock, AlertCircle, Plus, Check } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  members: Member[];
  currentUser: Member;
  onAddTask: (task: Task) => void;
  onUpdateTask: (taskId: string, status: Task['status']) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ tasks, members, currentUser, onAddTask, onUpdateTask }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  
  const [newTask, setNewTask] = useState({
    title: '',
    assigneeId: '',
    description: '',
    dueDate: ''
  });

  const canAssign = currentUser.role === MemberRole.PRESIDENT || currentUser.role === MemberRole.HEAD;
  
  // Filter logic: 
  // - President sees all.
  // - Heads see their department tasks.
  // - Members see assigned tasks.
  const visibleTasks = tasks.filter(t => {
      if (filter === 'my') return t.assigneeId === currentUser.id;
      if (currentUser.role === MemberRole.PRESIDENT) return true;
      if (currentUser.role === MemberRole.HEAD) return t.department === currentUser.department;
      return t.assigneeId === currentUser.id;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const assignee = members.find(m => m.id === newTask.assigneeId);
    onAddTask({
        id: Math.random().toString(36).substr(2, 9),
        title: newTask.title,
        assigneeId: newTask.assigneeId,
        description: newTask.description,
        status: 'todo',
        dueDate: newTask.dueDate,
        department: assignee?.department
    });
    setIsModalOpen(false);
    setNewTask({ title: '', assigneeId: '', description: '', dueDate: '' });
  };

  const getStatusColor = (status: Task['status']) => {
      switch(status) {
          case 'todo': return 'bg-slate-100 text-slate-600';
          case 'in-progress': return 'bg-blue-100 text-blue-600';
          case 'done': return 'bg-green-100 text-green-600';
      }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Quản lý Nhiệm vụ</h2>
            <p className="text-slate-500">Phân công và theo dõi tiến độ công việc.</p>
        </div>
        {canAssign && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
            >
                <Plus size={20} />
                Giao nhiệm vụ
            </button>
        )}
      </div>

      <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
              Tất cả
          </button>
          <button 
            onClick={() => setFilter('my')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'my' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
              Của tôi
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['todo', 'in-progress', 'done'].map((status) => (
            <div key={status} className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold text-slate-700 uppercase text-sm mb-4 flex items-center justify-between">
                    {status === 'todo' ? 'Cần làm' : status === 'in-progress' ? 'Đang thực hiện' : 'Hoàn thành'}
                    <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                        {visibleTasks.filter(t => t.status === status).length}
                    </span>
                </h3>
                <div className="space-y-3">
                    {visibleTasks.filter(t => t.status === status).map(task => {
                        const assignee = members.find(m => m.id === task.assigneeId);
                        return (
                            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                <h4 className="font-semibold text-slate-800 mb-1">{task.title}</h4>
                                <p className="text-xs text-slate-500 mb-3">{task.description}</p>
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Clock size={14} /> {task.dueDate}
                                    </div>
                                    <div className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                                        {assignee?.name}
                                    </div>
                                </div>
                                
                                {task.assigneeId === currentUser.id && status !== 'done' && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                        {status === 'todo' && (
                                            <button onClick={() => onUpdateTask(task.id, 'in-progress')} className="flex-1 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded hover:bg-blue-100">
                                                Bắt đầu
                                            </button>
                                        )}
                                        {status === 'in-progress' && (
                                            <button onClick={() => onUpdateTask(task.id, 'done')} className="flex-1 py-1 bg-green-50 text-green-600 text-xs font-medium rounded hover:bg-green-100">
                                                Hoàn thành
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Giao nhiệm vụ mới</h3>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tên nhiệm vụ</label>
                        <input required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Người thực hiện</label>
                        <select required className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                             value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                            <option value="">Chọn thành viên...</option>
                            {members.map(m => (
                                <option key={m.id} value={m.id}>{m.name} - {m.department}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Hạn chót</label>
                        <input required type="date" className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                        <textarea className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none h-24"
                            value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">Hủy</button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium">Giao việc</button>
                    </div>
                </form>
            </div>
          </div>
      )}
    </div>
  );
};