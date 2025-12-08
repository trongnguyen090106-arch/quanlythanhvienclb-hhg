import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (u: string, p: string) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-600 p-3 rounded-xl text-white mb-4">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">ClubManager AI</h1>
            <p className="text-slate-500">Đăng nhập hệ thống quản lý</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập (ID)</label>
                <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input 
                    type="password" 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <button 
                type="submit" 
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
            >
                Đăng nhập
            </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-400">
            <p>Liên hệ Chủ nhiệm CLB để cấp tài khoản.</p>
            <p className="mt-2">Demo Account: admin / admin</p>
        </div>
      </div>
    </div>
  );
};