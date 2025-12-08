
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, Settings as SettingsIcon, Upload, Trash2, Image } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({...formData, clubLogoUrl: reader.result as string});
          };
          reader.readAsDataURL(file);
      }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <SettingsIcon size={24} />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-slate-800">Cài đặt hệ thống</h2>
              <p className="text-slate-500">Cấu hình thông tin chung và tham số ứng dụng.</p>
          </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Logo Câu Lạc Bộ</label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden relative">
                            {formData.clubLogoUrl ? (
                                <img src={formData.clubLogoUrl} alt="Club Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Image size={32} className="text-slate-400" />
                            )}
                        </div>
                        <div className="space-y-2">
                             <div className="flex gap-2">
                                <label className="cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <Upload size={16} /> Tải ảnh lên
                                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                </label>
                                {formData.clubLogoUrl && (
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, clubLogoUrl: undefined})}
                                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                             </div>
                             <p className="text-xs text-slate-400">Định dạng JPG, PNG. Tối đa 2MB.</p>
                        </div>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tên Câu Lạc Bộ</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.clubName}
                        onChange={e => setFormData({...formData, clubName: e.target.value})}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Học kỳ hiện tại</label>
                     <select 
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.currentSemester}
                        onChange={e => setFormData({...formData, currentSemester: e.target.value})}
                    >
                        <option value="HK1_2023-2024">Học kỳ 1 (2023-2024)</option>
                        <option value="HK2_2023-2024">Học kỳ 2 (2023-2024)</option>
                        <option value="HK1_2024-2025">Học kỳ 1 (2024-2025)</option>
                        <option value="HK2_2024-2025">Học kỳ 2 (2024-2025)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mức đóng phí mặc định (VNĐ)</label>
                    <input 
                        type="number" 
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={formData.defaultFee}
                        onChange={e => setFormData({...formData, defaultFee: Number(e.target.value)})}
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                    type="submit" 
                    className={`px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all ${saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    <Save size={18} />
                    {saved ? 'Đã lưu cài đặt' : 'Lưu thay đổi'}
                </button>
            </div>
        </form>
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">Vùng nguy hiểm</h3>
          <p className="text-red-600 text-sm mb-4">Các thao tác này sẽ ảnh hưởng đến dữ liệu hệ thống.</p>
          <button className="px-4 py-2 border border-red-200 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
              Xóa toàn bộ dữ liệu (Demo only)
          </button>
      </div>
    </div>
  );
};
