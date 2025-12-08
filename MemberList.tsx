import React, { useState, useEffect } from 'react';
import { Member, MemberRole, MemberStatus, AppSettings } from '../types';
import { Search, Plus, Filter, MoreHorizontal, User, CreditCard, Mail, Key, Upload, Trash2, FileSpreadsheet, Download, X, Printer } from 'lucide-react';

interface MemberListProps {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (id: string, updates: Partial<Member>) => void;
  currentUser: Member;
  settings?: AppSettings;
}

export const MemberList: React.FC<MemberListProps> = ({ members, onAddMember, onUpdateMember, currentUser, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showCard, setShowCard] = useState<Member | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState('');
  
  // State for Print View
  const [showPrintView, setShowPrintView] = useState(false);

  const isPresident = currentUser.role === MemberRole.PRESIDENT;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: MemberRole.MEMBER,
    department: '',
    status: MemberStatus.ACTIVE,
    joinedDate: new Date().toISOString().split('T')[0],
    username: '',
    password: '',
    avatarUrl: ''
  });

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch QR Code as Base64 when showing card to ensure it downloads correctly
  useEffect(() => {
    if (showCard) {
        setQrCodeBase64(''); // Reset
        const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${JSON.stringify({id: showCard.id, name: showCard.name, role: showCard.role})}`;
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => setQrCodeBase64(reader.result as string);
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                console.error("QR Fetch Error", err);
                setQrCodeBase64(url); // Fallback to URL
            });
    }
  }, [showCard]);

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
        name: '',
        email: '',
        phone: '',
        role: MemberRole.MEMBER,
        department: '',
        status: MemberStatus.ACTIVE,
        joinedDate: new Date().toISOString().split('T')[0],
        username: '',
        password: '',
        avatarUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        department: member.department || '',
        status: member.status,
        joinedDate: member.joinedDate,
        username: member.username || '',
        password: member.password || '',
        avatarUrl: member.avatarUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
        onUpdateMember(editingMember.id, formData);
    } else {
        onAddMember(formData);
    }
    setIsModalOpen(false);
  };

  const exportToCSV = () => {
      const headers = ['ID,Name,Email,Phone,Role,Department,Status,JoinedDate'];
      const rows = members.map(m => 
          `${m.id},"${m.name}",${m.email},${m.phone},${m.role},"${m.department || ''}",${m.status},${m.joinedDate}`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "members_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const downloadCard = () => {
      const svg = document.getElementById('member-card-svg');
      if (!svg || !showCard) return;
      
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 1000;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              // Draw white background
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0,0, 1000, 600);
              ctx.drawImage(img, 0, 0, 1000, 600);
              const a = document.createElement('a');
              a.download = `MemberCard_${showCard.id}.png`;
              a.href = canvas.toDataURL('image/png');
              a.click();
          }
      };
  };

  const handlePrintList = () => {
      setShowPrintView(true);
      setTimeout(() => {
          window.print();
          // Optional: close print view after printing, but better to let user close it
      }, 500);
  };

  const getStatusColor = (status: MemberStatus) => {
    switch(status) {
        case MemberStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case MemberStatus.INACTIVE: return 'bg-slate-100 text-slate-600 border-slate-200';
        case MemberStatus.ALUMNI: return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Thành viên</h2>
            <p className="text-slate-500 mt-1">Quản lý hồ sơ, thẻ thành viên và tài khoản.</p>
        </div>
        <div className="flex gap-2">
            <button onClick={handlePrintList} className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors">
                <Printer size={20} /> In / Xuất PDF
            </button>
            <button onClick={exportToCSV} className="bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl flex items-center gap-2 font-medium transition-colors">
                <FileSpreadsheet size={20} /> Xuất CSV
            </button>
            {isPresident && (
                <button 
                    onClick={handleOpenAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
                >
                    <Plus size={20} />
                    Thêm mới
                </button>
            )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] overflow-hidden no-print">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Tìm kiếm thành viên..." 
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="px-5 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 flex items-center gap-2 font-medium">
                <Filter size={20} />
                Bộ lọc
            </button>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-5">Thành viên</th>
                        <th className="px-6 py-5">Ban</th>
                        <th className="px-6 py-5">Vai trò</th>
                        <th className="px-6 py-5">Trạng thái</th>
                        <th className="px-6 py-5 text-right">Thao tác</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white shadow-sm">
                                        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover"/> : <User size={24} />}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-base">{member.name}</div>
                                        <div className="text-xs text-slate-500">{member.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium text-sm">{member.department || '-'}</td>
                            <td className="px-6 py-4">
                                <span className="text-slate-700 text-sm">{member.role}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(member.status)}`}>
                                    {member.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setShowCard(member)}
                                        title="Thẻ thành viên"
                                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <CreditCard size={18} />
                                    </button>
                                    <button 
                                        onClick={() => window.open(`mailto:${member.email}`)}
                                        title="Gửi mail"
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Mail size={18} />
                                    </button>
                                    {(isPresident || currentUser.id === member.id) && (
                                        <button 
                                            onClick={() => handleOpenEdit(member)}
                                            title="Chỉnh sửa"
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <MoreHorizontal size={18} />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Legal Print View Overlay */}
      {showPrintView && (
          <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
              {/* Toolbar */}
              <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex justify-between items-center no-print z-50 shadow-md">
                   <div className="flex items-center gap-2">
                       <Printer size={20} />
                       <span className="font-bold">Xem trước bản in (Nhấn Ctrl+P để lưu PDF)</span>
                   </div>
                   <button onClick={() => setShowPrintView(false)} className="px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Đóng</button>
              </div>

              {/* Document Content */}
              <div className="print-container max-w-[210mm] mx-auto p-10 pt-20">
                  <div className="legal-header">
                        <div className="legal-header-left">
                            <div className="ten-don-vi" style={{ fontWeight: 'bold' }}>{settings?.clubName || 'CÂU LẠC BỘ'}</div>
                            <div className="so-ky-hieu">Số: ... / DS-TV</div>
                        </div>
                        <div className="legal-header-right">
                            <div className="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                            <div className="tieu-ngu">Độc lập - Tự do - Hạnh phúc</div>
                            <div className="italic mt-2">
                                ......., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                            </div>
                        </div>
                  </div>

                  <div className="document-title">DANH SÁCH THÀNH VIÊN</div>

                  <table className="legal-table">
                      <thead>
                          <tr>
                              <th style={{width: '5%'}}>STT</th>
                              <th style={{width: '25%'}}>Họ và tên</th>
                              <th style={{width: '15%'}}>Chức vụ</th>
                              <th style={{width: '20%'}}>Ban chuyên môn</th>
                              <th style={{width: '15%'}}>Số điện thoại</th>
                              <th style={{width: '20%'}}>Email</th>
                          </tr>
                      </thead>
                      <tbody>
                          {filteredMembers.map((m, index) => (
                              <tr key={m.id}>
                                  <td style={{textAlign: 'center'}}>{index + 1}</td>
                                  <td>{m.name}</td>
                                  <td>{m.role}</td>
                                  <td>{m.department}</td>
                                  <td style={{textAlign: 'center'}}>{m.phone}</td>
                                  <td>{m.email}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>

                  <div className="signature-section">
                        <div className="signature-block">
                            <div className="signature-title">NGƯỜI LẬP DANH SÁCH</div>
                            <div className="signature-role">(Ký, ghi rõ họ tên)</div>
                            <div className="signature-space"></div>
                            <div style={{fontWeight: 'bold'}}>{currentUser.name}</div>
                        </div>
                        <div className="signature-block">
                            <div className="signature-title">CHỦ NHIỆM CLB</div>
                            <div className="signature-role">(Ký, đóng dấu)</div>
                            <div className="signature-space"></div>
                        </div>
                  </div>
              </div>
          </div>
      )}

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">
                    {editingMember ? 'Cập nhật hồ sơ' : 'Thêm thành viên mới'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                             <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Ảnh đại diện</label>
                             <div className="flex items-center gap-6">
                                 <div className="relative w-24 h-24 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 group hover:border-indigo-400 transition-colors">
                                     {formData.avatarUrl ? (
                                         <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                                     ) : (
                                         <User size={32} className="text-slate-400 group-hover:text-indigo-400" />
                                     )}
                                     <input 
                                        type="file" 
                                        id="avatar-upload" 
                                        className="hidden" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                     />
                                 </div>
                                 <div className="flex-1 space-y-3">
                                     <div className="flex gap-3">
                                          <label 
                                             htmlFor="avatar-upload"
                                             className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm font-bold text-indigo-600 cursor-pointer hover:bg-indigo-100 flex items-center gap-2 w-fit transition-colors"
                                         >
                                             <Upload size={16} /> Tải ảnh
                                         </label>
                                          {formData.avatarUrl && (
                                             <button 
                                                 type="button"
                                                 onClick={() => setFormData({...formData, avatarUrl: ''})}
                                                 className="px-4 py-2 text-red-600 text-sm font-bold hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 flex items-center gap-2"
                                             >
                                                 <Trash2 size={16} /> Xóa
                                             </button>
                                          )}
                                     </div>
                                     <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
                                 </div>
                             </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Họ và tên</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Email</label>
                            <input required type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Số điện thoại</label>
                            <input type="tel" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ngày tham gia</label>
                            <input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={formData.joinedDate} onChange={e => setFormData({...formData, joinedDate: e.target.value})} />
                        </div>
                    </div>

                    {/* Permission Section */}
                    {isPresident && (
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                                <Key size={16} /> Phân quyền & Tài khoản
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Username (ID)</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Password</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="********" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Vai trò</label>
                                    <select className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as MemberRole})}>
                                        {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ban chuyên môn</label>
                                    <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Trạng thái</label>
                                    <select className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as MemberStatus})}>
                                        {Object.values(MemberStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy bỏ</button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">
                            {editingMember ? 'Lưu thay đổi' : 'Tạo thành viên'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Member Card Modal (SVG) */}
      {showCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print" onClick={() => setShowCard(null)}>
            <div className="bg-white rounded-3xl overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Thẻ thành viên điện tử</h3>
                    <button onClick={() => setShowCard(null)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
                </div>
                
                <div className="p-4 bg-slate-100 flex justify-center">
                    <svg id="member-card-svg" width="500" height="300" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[500px] shadow-lg rounded-xl">
                        <defs>
                            <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#4f46e5" />
                                <stop offset="100%" stopColor="#7c3aed" />
                            </linearGradient>
                            <pattern id="pattern-circles" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse" patternContentUnits="userSpaceOnUse">
                                <circle cx="10" cy="10" r="1" fill="#fff" fillOpacity="0.2" />
                            </pattern>
                             <clipPath id="avatarClip">
                                <circle cx="200" cy="300" r="120" />
                            </clipPath>
                        </defs>
                        
                        {/* Background */}
                        <rect width="1000" height="600" fill="url(#cardGradient)" rx="40" ry="40" />
                        <rect width="1000" height="600" fill="url(#pattern-circles)" rx="40" ry="40" />
                        
                        {/* Club Info Top Left */}
                        {settings?.clubLogoUrl && (
                             <image href={settings.clubLogoUrl} x="50" y="40" height="80" width="80" preserveAspectRatio="xMidYMid slice" />
                        )}
                        <text x={settings?.clubLogoUrl ? "150" : "50"} y="80" fontFamily="sans-serif" fontSize="32" fontWeight="bold" fill="white">
                            {settings?.clubName || 'CLB SINH VIÊN'}
                        </text>
                        <text x={settings?.clubLogoUrl ? "150" : "50"} y="115" fontFamily="sans-serif" fontSize="20" fontWeight="normal" fill="white" opacity="0.8">
                            MEMBER CARD
                        </text>

                        {/* ID Badge Top Right */}
                        <rect x="750" y="40" width="200" height="60" rx="30" fill="white" fillOpacity="0.2" />
                        <text x="850" y="82" textAnchor="middle" fontFamily="monospace" fontSize="28" fontWeight="bold" fill="white" letterSpacing="2">
                            {showCard.id.toUpperCase()}
                        </text>

                        {/* Content Area - White Curve */}
                        <path d="M 0 350 Q 500 250 1000 350 L 1000 600 L 0 600 Z" fill="white" />
                        
                        {/* Avatar */}
                        <circle cx="200" cy="300" r="128" fill="white" />
                        <circle cx="200" cy="300" r="120" fill="#f1f5f9" />
                        {showCard.avatarUrl ? (
                             <image href={showCard.avatarUrl} x="80" y="180" height="240" width="240" preserveAspectRatio="xMidYMid slice" clipPath="url(#avatarClip)" />
                        ) : (
                             <text x="200" y="320" textAnchor="middle" fontFamily="sans-serif" fontSize="80" fill="#cbd5e1">{showCard.name.charAt(0)}</text>
                        )}

                        {/* Details Right Side */}
                        <text x="380" y="420" fontFamily="sans-serif" fontSize="48" fontWeight="bold" fill="#1e293b">
                            {showCard.name}
                        </text>
                        
                        <text x="380" y="470" fontFamily="sans-serif" fontSize="24" fill="#64748b" fontWeight="bold">
                            {showCard.role.toUpperCase()}
                        </text>
                        <text x="380" y="500" fontFamily="sans-serif" fontSize="20" fill="#94a3b8">
                            {showCard.department || 'Thành viên chính thức'}
                        </text>
                        <text x="380" y="540" fontFamily="sans-serif" fontSize="18" fill="#94a3b8">
                           Ngày tham gia: {new Date(showCard.joinedDate).toLocaleDateString('vi-VN')}
                        </text>
                        
                        {/* QR Code Bottom Right */}
                        <rect x="820" y="420" width="140" height="140" fill="white" stroke="#e2e8f0" rx="10" />
                        {qrCodeBase64 && (
                            <image href={qrCodeBase64} x="830" y="430" height="120" width="120" />
                        )}

                        {/* Bottom Decoration */}
                        <rect x="0" y="580" width="1000" height="20" fill="#4f46e5" />
                    </svg>
                </div>
                
                <div className="p-6 flex gap-3 justify-end bg-white">
                    <button 
                        onClick={downloadCard}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-transform hover:-translate-y-0.5"
                    >
                        <Download size={20} /> Tải thẻ về máy
                    </button>
                    <button onClick={() => setShowCard(null)} className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Đóng</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};