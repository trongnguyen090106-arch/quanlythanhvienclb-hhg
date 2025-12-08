
import React, { useState, useRef } from 'react';
import { ClubEvent, Member, AIBadgeDesign } from '../types';
import { generateEventIdeas, generateMarketingContent, generateCertificateQuote, generateBadgeDesign } from '../services/geminiService';
import { Sparkles, Calendar, MapPin, DollarSign, Users, PenTool, Loader2, Award, Download, Image as ImageIcon, Upload, Trash2, Tag, Palette } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface EventListProps {
  events: ClubEvent[];
  members: Member[];
  onAddEvent: (event: Omit<ClubEvent, 'id'>) => void;
}

export const EventList: React.FC<EventListProps> = ({ events, members, onAddEvent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [aiContent, setAiContent] = useState('');
  const [aiMode, setAiMode] = useState<'idea' | 'marketing'>('idea');
  
  // Certificate State
  const [selectedEventForCert, setSelectedEventForCert] = useState<ClubEvent | null>(null);
  const [certQuote, setCertQuote] = useState('');
  const [certMember, setCertMember] = useState<Member | null>(null);

  // Badge State
  const [selectedEventForBadge, setSelectedEventForBadge] = useState<ClubEvent | null>(null);
  const [badgeMember, setBadgeMember] = useState<Member | null>(null);
  const [badgeMode, setBadgeMode] = useState<'template' | 'upload' | 'ai'>('template');
  const [badgeBgImage, setBadgeBgImage] = useState('');
  const [aiBadgeDesign, setAiBadgeDesign] = useState<AIBadgeDesign | null>(null);
  
  // AI Form Inputs
  const [clubType, setClubType] = useState('Công nghệ phần mềm');
  const [season, setSeason] = useState('Mùa hè');
  const [selectedEventForMarketing, setSelectedEventForMarketing] = useState<ClubEvent | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    location: '',
    description: '',
    budget: 0,
    attendees: 0,
    imageUrl: ''
  });

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEvent(newEvent);
    setIsModalOpen(false);
    setNewEvent({ title: '', date: '', location: '', description: '', budget: 0, attendees: 0, imageUrl: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBadgeBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setBadgeBgImage(reader.result as string);
          reader.readAsDataURL(file);
      }
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    setAiContent('');
    try {
        if (aiMode === 'idea') {
            const result = await generateEventIdeas(clubType, season);
            setAiContent(result);
        } else if (aiMode === 'marketing' && selectedEventForMarketing) {
            const result = await generateMarketingContent(selectedEventForMarketing);
            setAiContent(result);
        }
    } catch (error) {
        setAiContent('Đã có lỗi xảy ra.');
    } finally {
        setAiLoading(false);
    }
  };

  const handleAiBadgeDesign = async () => {
      if (!selectedEventForBadge) return;
      setAiLoading(true);
      const design = await generateBadgeDesign(selectedEventForBadge.title);
      setAiBadgeDesign(design);
      setAiLoading(false);
  };

  const openMarketingModal = (event: ClubEvent) => {
    setSelectedEventForMarketing(event);
    setAiMode('marketing');
    setAiContent('');
    setIsAiModalOpen(true);
  };

  const openIdeaModal = () => {
    setAiMode('idea');
    setAiContent('');
    setIsAiModalOpen(true);
  };

  const openCertModal = async (event: ClubEvent) => {
      setSelectedEventForCert(event);
      if (event.attendanceList && event.attendanceList.length > 0) {
          const firstMem = members.find(m => m.id === event.attendanceList![0]);
          if (firstMem) setCertMember(firstMem);
      } else {
        setCertMember(members[0]);
      }
      setAiLoading(true);
      const quote = await generateCertificateQuote(event.title);
      setCertQuote(quote);
      setAiLoading(false);
      setIsCertModalOpen(true);
  };

  const openBadgeModal = (event: ClubEvent) => {
      setSelectedEventForBadge(event);
      setBadgeMember(members[0]); // Default first member
      setIsBadgeModalOpen(true);
      setBadgeMode('template'); // Reset mode
      setAiBadgeDesign(null);
  };

  const downloadCertificate = () => {
      const svg = document.getElementById('certificate-svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, 800, 600);
              const a = document.createElement('a');
              a.download = `Certificate_${selectedEventForCert?.title}_${certMember?.name}.png`;
              a.href = canvas.toDataURL('image/png');
              a.click();
          }
      };
  };

   const downloadBadge = () => {
      const svg = document.getElementById('badge-svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const img = new Image();
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
      
      img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 400;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.drawImage(img, 0, 0, 400, 600);
              const a = document.createElement('a');
              a.download = `Badge_${selectedEventForBadge?.title}_${badgeMember?.name}.png`;
              a.href = canvas.toDataURL('image/png');
              a.click();
          }
      };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Sự kiện CLB</h2>
            <p className="text-slate-500">Lên kế hoạch và quản lý hoạt động.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={openIdeaModal}
                className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
                <Sparkles size={20} />
                AI Gợi ý
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
                <Calendar size={20} />
                Tạo sự kiện
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => {
            const isPast = new Date(event.date) < new Date();
            const attendeeCount = event.attendanceList?.length || 0;

            return (
            <div key={event.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group overflow-hidden flex flex-col">
                {/* Event Image */}
                <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                    {event.imageUrl ? (
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
                            <ImageIcon className="text-indigo-100" size={64} />
                        </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-center min-w-[60px]">
                        <div className="text-xs font-bold text-slate-500 uppercase">{new Date(event.date).toLocaleDateString('vi-VN', {month: 'short'})}</div>
                        <div className="text-xl font-extrabold text-indigo-600 leading-none">{new Date(event.date).getDate()}</div>
                    </div>
                    <div className="absolute top-4 left-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm ${isPast ? 'bg-slate-100/90 text-slate-500 backdrop-blur-md' : 'bg-blue-500/90 text-white backdrop-blur-md'}`}>
                            {isPast ? 'Đã kết thúc' : 'Sắp tới'}
                        </span>
                    </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1" title={event.title}>{event.title}</h3>
                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 flex-1">{event.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 mb-6">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-indigo-500"/>
                            <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-indigo-500"/>
                            {attendeeCount} / {event.attendees} tham gia
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-indigo-500"/>
                            {event.budget.toLocaleString('vi-VN')} đ
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex flex-wrap justify-between items-center gap-2">
                        <div className="flex gap-2 w-full">
                            {!isPast && (
                                <button 
                                    onClick={() => openBadgeModal(event)}
                                    className="flex-1 text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Tag size={16} />
                                    Thẻ Sự Kiện
                                </button>
                            )}
                            <button 
                                onClick={() => openMarketingModal(event)}
                                className="flex-1 text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <PenTool size={16} />
                                Viết bài
                            </button>
                            {isPast && (
                                <button 
                                    onClick={() => openCertModal(event)}
                                    className="flex-1 text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Award size={16} />
                                    Chứng nhận
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )})}
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-up">
                <h3 className="text-2xl font-bold text-slate-800 mb-6">Tạo sự kiện mới</h3>
                <form onSubmit={handleAddEvent} className="space-y-5">
                    
                    {/* Image Upload */}
                    <div>
                         <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-2 block">Ảnh bìa sự kiện</label>
                         <div className="relative w-full h-40 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden group hover:border-indigo-400 transition-colors">
                             {newEvent.imageUrl ? (
                                 <img src={newEvent.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="text-center p-4">
                                     <ImageIcon size={32} className="text-slate-400 mx-auto mb-2 group-hover:text-indigo-400" />
                                     <p className="text-xs text-slate-400">Nhấn để tải ảnh lên (16:9)</p>
                                 </div>
                             )}
                             <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept="image/*"
                                onChange={handleFileChange}
                             />
                             {newEvent.imageUrl && (
                                 <button 
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setNewEvent({...newEvent, imageUrl: ''}); }}
                                    className="absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-50 z-10 shadow-sm"
                                 >
                                     <Trash2 size={16} />
                                 </button>
                             )}
                         </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Tên sự kiện</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="VD: Workshop AI..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ngày tổ chức</label>
                            <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                        </div>
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Địa điểm</label>
                            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Mô tả chi tiết</label>
                        <textarea className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none transition-all"
                             value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ngân sách (VNĐ)</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newEvent.budget} onChange={e => setNewEvent({...newEvent, budget: Number(e.target.value)})} />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Dự kiến tham gia</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                value={newEvent.attendees} onChange={e => setNewEvent({...newEvent, attendees: Number(e.target.value)})} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy bỏ</button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">Tạo sự kiện</button>
                    </div>
                </form>
             </div>
        </div>
      )}

      {/* AI Assistant Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl flex flex-col max-h-[90vh]">
                <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg text-white">
                        <Sparkles size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                        {aiMode === 'idea' ? 'Trợ lý ý tưởng AI' : 'Trợ lý truyền thông AI'}
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {aiMode === 'idea' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình CLB</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                                    value={clubType} onChange={e => setClubType(e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Thời điểm/Mùa</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200" 
                                    value={season} onChange={e => setSeason(e.target.value)} />
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm text-slate-500 mb-1">Đang viết bài cho sự kiện:</p>
                            <p className="font-semibold text-slate-800">{selectedEventForMarketing?.title}</p>
                        </div>
                    )}

                    {aiContent && (
                        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-slate-700 text-sm leading-relaxed">
                            <div className="prose prose-sm max-w-none prose-indigo">
                                <ReactMarkdown>
                                    {aiContent}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                     <button onClick={() => setIsAiModalOpen(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">Đóng</button>
                     <button 
                        onClick={handleAiGenerate} 
                        disabled={aiLoading}
                        className="px-6 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium flex items-center gap-2 disabled:opacity-70"
                    >
                        {aiLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {aiLoading ? 'Đang suy nghĩ...' : 'Tạo nội dung'}
                    </button>
                </div>
             </div>
        </div>
      )}

      {/* Certificate Modal */}
      {isCertModalOpen && selectedEventForCert && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-4xl p-6 shadow-xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
                  <div className="flex-1 space-y-4">
                      <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <Award className="text-amber-500"/> Cấp chứng nhận
                      </h3>
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Chọn thành viên</label>
                          <select 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            value={certMember?.id || ''}
                            onChange={(e) => setCertMember(members.find(m => m.id === e.target.value) || null)}
                          >
                              {selectedEventForCert.attendanceList && selectedEventForCert.attendanceList.length > 0 ? (
                                  selectedEventForCert.attendanceList.map(mid => {
                                      const m = members.find(mem => mem.id === mid);
                                      return m ? <option key={m.id} value={m.id}>{m.name}</option> : null;
                                  })
                              ) : (
                                  members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
                              )}
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Chỉ hiện thành viên đã điểm danh (hoặc tất cả nếu chưa điểm danh).</p>
                      </div>
                      
                      <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Lời chúc (AI)</label>
                          <div className="flex gap-2">
                            <textarea 
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none h-24"
                                value={certQuote}
                                onChange={(e) => setCertQuote(e.target.value)}
                            ></textarea>
                            <button onClick={async () => {
                                setAiLoading(true);
                                const q = await generateCertificateQuote(selectedEventForCert.title);
                                setCertQuote(q);
                                setAiLoading(false);
                            }} className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100" title="Tạo lại">
                                <Sparkles size={18}/>
                            </button>
                          </div>
                      </div>

                      <button 
                        onClick={downloadCertificate}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                          <Download size={20} /> Tải chứng nhận
                      </button>
                      <button onClick={() => setIsCertModalOpen(false)} className="w-full py-2 text-slate-500 hover:text-slate-800">Đóng</button>
                  </div>

                  {/* Certificate Preview - Rendered as SVG for high quality download */}
                  <div className="flex-1 bg-slate-200 rounded-xl p-4 flex items-center justify-center overflow-hidden">
                      <svg id="certificate-svg" width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto shadow-lg bg-white">
                          {/* Background */}
                          <rect x="0" y="0" width="800" height="600" fill="#fff" />
                          <rect x="20" y="20" width="760" height="560" fill="none" stroke="#d4af37" strokeWidth="4" />
                          <rect x="30" y="30" width="740" height="540" fill="none" stroke="#d4af37" strokeWidth="1" strokeDasharray="5,5" />
                          
                          {/* Corner Ornaments */}
                          <path d="M 20 100 L 20 20 L 100 20" stroke="#d4af37" strokeWidth="4" fill="none" />
                          <path d="M 780 100 L 780 20 L 700 20" stroke="#d4af37" strokeWidth="4" fill="none" />
                          <path d="M 20 500 L 20 580 L 100 580" stroke="#d4af37" strokeWidth="4" fill="none" />
                          <path d="M 780 500 L 780 580 L 700 580" stroke="#d4af37" strokeWidth="4" fill="none" />

                          {/* Content */}
                          <text x="400" y="100" textAnchor="middle" fontFamily="serif" fontSize="40" fontWeight="bold" fill="#333">CHỨNG NHẬN</text>
                          <text x="400" y="140" textAnchor="middle" fontFamily="serif" fontSize="24" fill="#666">HOÀN THÀNH TÍCH CỰC</text>
                          
                          <text x="400" y="200" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fill="#555">Chứng nhận thành viên:</text>
                          <text x="400" y="250" textAnchor="middle" fontFamily="serif" fontSize="48" fontWeight="bold" fill="#1e40af" style={{textTransform: 'uppercase'}}>{certMember?.name || 'TÊN THÀNH VIÊN'}</text>
                          
                          <text x="400" y="300" textAnchor="middle" fontFamily="sans-serif" fontSize="18" fill="#555">Đã tham gia tích cực và hoàn thành sự kiện:</text>
                          <text x="400" y="340" textAnchor="middle" fontFamily="serif" fontSize="32" fontWeight="bold" fill="#333">{selectedEventForCert.title}</text>
                          
                          <text x="400" y="380" textAnchor="middle" fontFamily="sans-serif" fontSize="16" fill="#666">Tổ chức ngày {new Date(selectedEventForCert.date).toLocaleDateString('vi-VN')}</text>

                          {/* Quote */}
                          <text x="400" y="440" textAnchor="middle" fontFamily="serif" fontStyle="italic" fontSize="18" fill="#4b5563" width="600">"{certQuote}"</text>

                          {/* Signatures */}
                          <line x1="100" y1="500" x2="300" y2="500" stroke="#999" strokeWidth="1" />
                          <text x="200" y="520" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#666">Chủ nhiệm CLB</text>
                          
                          <line x1="500" y1="500" x2="700" y2="500" stroke="#999" strokeWidth="1" />
                          <text x="600" y="520" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#666">Ban Tổ Chức</text>

                          <text x="400" y="580" textAnchor="middle" fontSize="10" fill="#ccc">ID: {selectedEventForCert.id}-{certMember?.id}</text>
                      </svg>
                  </div>
              </div>
          </div>
      )}

      {/* Badge Generation Modal */}
      {isBadgeModalOpen && selectedEventForBadge && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-5xl p-6 shadow-xl flex flex-col md:flex-row gap-6 max-h-[90vh] overflow-y-auto">
                 {/* Configuration Panel */}
                 <div className="flex-1 space-y-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Tag className="text-teal-500"/> Thẻ đeo sự kiện (Event Badge)
                    </h3>

                    {/* Member Selection */}
                    <div>
                         <label className="block text-sm font-medium text-slate-700 mb-1">Chọn thành viên</label>
                          <select 
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none"
                            value={badgeMember?.id || ''}
                            onChange={(e) => setBadgeMember(members.find(m => m.id === e.target.value) || null)}
                          >
                              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                          </select>
                    </div>

                    {/* Mode Selection */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => { setBadgeMode('template'); setAiBadgeDesign(null); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${badgeMode === 'template' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            Mẫu có sẵn
                        </button>
                        <button 
                            onClick={() => { setBadgeMode('upload'); setAiBadgeDesign(null); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${badgeMode === 'upload' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                        >
                            <Upload size={16}/> Tải ảnh
                        </button>
                        <button 
                            onClick={() => { setBadgeMode('ai'); handleAiBadgeDesign(); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${badgeMode === 'ai' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md' : 'bg-slate-100 text-slate-600'}`}
                        >
                            <Sparkles size={16}/> AI Design
                        </button>
                    </div>

                    {/* Mode Specific Controls */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-[100px]">
                        {badgeMode === 'template' && (
                             <p className="text-sm text-slate-500 text-center py-4">Sử dụng mẫu thẻ tiêu chuẩn của CLB.</p>
                        )}
                        {badgeMode === 'upload' && (
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Tải hình nền (400x600)</label>
                                <input type="file" accept="image/*" onChange={handleBadgeBgUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            </div>
                        )}
                        {badgeMode === 'ai' && (
                            <div className="text-center space-y-3">
                                <p className="text-sm text-slate-500">AI sẽ tự động tạo phối màu và họa tiết dựa trên tên sự kiện.</p>
                                <button 
                                    onClick={handleAiBadgeDesign} 
                                    disabled={aiLoading}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold hover:bg-purple-200 flex items-center gap-2 mx-auto"
                                >
                                    {aiLoading ? <Loader2 className="animate-spin" size={16}/> : <Palette size={16}/>}
                                    {aiLoading ? 'Đang thiết kế...' : 'Thiết kế lại'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="pt-4 space-y-2">
                        <button 
                            onClick={downloadBadge}
                            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} /> Tải thẻ về máy
                        </button>
                        <button onClick={() => setIsBadgeModalOpen(false)} className="w-full py-2 text-slate-500 hover:text-slate-800">Đóng</button>
                    </div>
                 </div>

                 {/* Badge Preview */}
                 <div className="flex-1 bg-slate-200 rounded-xl p-8 flex items-center justify-center overflow-hidden">
                     <svg id="badge-svg" width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" className="w-[300px] h-[450px] shadow-2xl bg-white rounded-lg">
                         <defs>
                             {/* Gradients */}
                             <linearGradient id="defaultGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#0f172a" />
                                <stop offset="100%" stopColor="#334155" />
                             </linearGradient>
                             <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" opacity="0.1"/>
                             </pattern>
                             <clipPath id="badgeAvatarClip">
                                <circle cx="200" cy="240" r="80" />
                            </clipPath>
                         </defs>

                         {/* Background Layer */}
                         {badgeMode === 'template' ? (
                             <>
                                <rect width="400" height="600" fill="url(#defaultGradient)" />
                                <rect width="400" height="600" fill="url(#gridPattern)" />
                                <rect x="0" y="450" width="400" height="150" fill="#fff" />
                             </>
                         ) : badgeMode === 'upload' && badgeBgImage ? (
                             <image href={badgeBgImage} width="400" height="600" preserveAspectRatio="xMidYMid slice" />
                         ) : badgeMode === 'ai' && aiBadgeDesign ? (
                             <>
                                 <rect width="400" height="600" style={{ fill: 'white' }} /> {/* fallback */}
                                 {/* We use a foreignObject to apply complex CSS gradients that SVG doesn't support natively as well as CSS */}
                                 <foreignObject width="400" height="600">
                                     <div style={{ 
                                         width: '100%', height: '100%', 
                                         background: aiBadgeDesign.gradient,
                                         position: 'relative'
                                     }}>
                                         <div style={{
                                             position: 'absolute', inset: 0,
                                             backgroundImage: `radial-gradient(${aiBadgeDesign.accentColor} 2px, transparent 2px)`,
                                             backgroundSize: '30px 30px',
                                             opacity: aiBadgeDesign.patternOpacity
                                         }}></div>
                                     </div>
                                 </foreignObject>
                                 <rect x="0" y="450" width="400" height="150" fill="white" fillOpacity="0.9" />
                             </>
                         ) : (
                             // Fallback for AI loading or default
                             <rect width="400" height="600" fill="#f1f5f9" />
                         )}

                         {/* Hole for Lanyard */}
                         <circle cx="200" cy="30" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />

                         {/* Event Title Top */}
                         <text x="200" y="80" textAnchor="middle" fontFamily="sans-serif" fontSize="24" fontWeight="bold" 
                            fill={badgeMode === 'ai' && aiBadgeDesign ? aiBadgeDesign.textColor : "white"}
                            style={{textTransform: 'uppercase'}}
                        >
                             {selectedEventForBadge.title.length > 20 ? selectedEventForBadge.title.substring(0, 18) + '...' : selectedEventForBadge.title}
                         </text>
                         <text x="200" y="110" textAnchor="middle" fontFamily="sans-serif" fontSize="16" 
                            fill={badgeMode === 'ai' && aiBadgeDesign ? aiBadgeDesign.textColor : "white"} opacity="0.8"
                        >
                             {new Date(selectedEventForBadge.date).toLocaleDateString('vi-VN')}
                         </text>

                         {/* Avatar */}
                         <circle cx="200" cy="240" r="85" fill="white" fillOpacity="0.3" />
                         <circle cx="200" cy="240" r="80" fill="#cbd5e1" />
                         {badgeMember?.avatarUrl ? (
                             <image href={badgeMember.avatarUrl} x="120" y="160" width="160" height="160" preserveAspectRatio="xMidYMid slice" clipPath="url(#badgeAvatarClip)" />
                         ) : (
                             <text x="200" y="265" textAnchor="middle" fontSize="60" fill="#64748b">{badgeMember?.name.charAt(0)}</text>
                         )}

                         {/* User Info */}
                         <rect x="50" y="340" width="300" height="60" rx="10" fill="white" fillOpacity="0.9" />
                         <text x="200" y="375" textAnchor="middle" fontFamily="sans-serif" fontSize="22" fontWeight="bold" fill="#1e293b">
                             {badgeMember?.name}
                         </text>
                         <text x="200" y="395" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#64748b" style={{textTransform: 'uppercase', letterSpacing: '1px'}}>
                             {badgeMember?.role === 'Chủ nhiệm' ? 'ORGANIZER' : badgeMember?.role === 'Trưởng ban' ? 'STAFF' : 'GUEST'}
                         </text>

                         {/* Footer Info */}
                         <text x="200" y="520" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fill="#64748b" fontWeight="bold">
                             {selectedEventForBadge.location}
                         </text>
                         <rect x="150" y="540" width="100" height="30" rx="4" fill="#000" />
                         <text x="200" y="560" textAnchor="middle" fontFamily="monospace" fontSize="14" fill="white" letterSpacing="2">
                             VIP ACCESS
                         </text>
                     </svg>
                 </div>
             </div>
        </div>
      )}
    </div>
  );
};
