import React, { useState } from 'react';
import { Document, Member, MemberRole, ClubEvent } from '../types';
import { FileText, Plus, Download, Trash2, CheckCircle, Sparkles, Loader2, FileCheck, Printer, Eye, X, Upload, Paperclip, File, CalendarPlus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateDocumentContent, extractEventFromDocument } from '../services/geminiService';

interface DocumentManagerProps {
  documents: Document[];
  currentUser: Member;
  onAddDocument: (doc: Document) => void;
  onUpdateDocument: (id: string, status: Document['status']) => void;
  onDeleteDocument: (id: string) => void;
  onAddEvent: (event: Omit<ClubEvent, 'id'>) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ 
  documents, currentUser, onAddDocument, onUpdateDocument, onDeleteDocument, onAddEvent 
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewDoc, setViewDoc] = useState<Document | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [extractedEvent, setExtractedEvent] = useState<any>(null);
  
  // State for Compose
  const [newDoc, setNewDoc] = useState({
    title: '',
    type: 'proposal' as Document['type'],
    content: '',
    topic: ''
  });

  // State for Upload
  const [uploadData, setUploadData] = useState({
      title: '',
      type: 'proposal' as Document['type'],
      fileUrl: '',
      fileName: '',
      mimeType: ''
  });

  const isPresident = currentUser.role === MemberRole.PRESIDENT;

  // --- Handlers for Text Editor ---
  const handleAiDraft = async () => {
    if (!newDoc.topic) return;
    setLoading(true);
    try {
        const content = await generateDocumentContent(newDoc.type, newDoc.topic);
        setNewDoc(prev => ({ ...prev, content }));
    } catch (e) {
        alert('Lỗi tạo văn bản');
    } finally {
        setLoading(false);
    }
  };

  const handleSaveTextDoc = () => {
    const doc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        title: newDoc.title,
        type: newDoc.type,
        content: newDoc.content,
        status: isPresident ? 'approved' : 'draft', 
        createdBy: currentUser.name,
        createdAt: new Date().toISOString().split('T')[0],
        approvedBy: isPresident ? currentUser.name : undefined
    };
    onAddDocument(doc);
    setIsEditorOpen(false);
    setNewDoc({ title: '', type: 'proposal', content: '', topic: '' });
  };

  // --- Handlers for File Upload ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setUploadData({
                  ...uploadData,
                  fileUrl: reader.result as string,
                  fileName: file.name,
                  mimeType: file.type,
                  title: uploadData.title || file.name // Auto fill title if empty
              });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSaveUploadDoc = (e: React.FormEvent) => {
      e.preventDefault();
      if (!uploadData.fileUrl) return;

      const doc: Document = {
          id: Math.random().toString(36).substr(2, 9),
          title: uploadData.title,
          type: uploadData.type,
          content: '', // Empty for uploaded files
          status: isPresident ? 'approved' : 'draft',
          createdBy: currentUser.name,
          createdAt: new Date().toISOString().split('T')[0],
          approvedBy: isPresident ? currentUser.name : undefined,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName,
          mimeType: uploadData.mimeType
      };
      onAddDocument(doc);
      setIsUploadOpen(false);
      setUploadData({ title: '', type: 'proposal', fileUrl: '', fileName: '', mimeType: '' });
  };

  // --- Handlers for Event Extraction ---
  const handleCreateEventFromDoc = async (doc: Document) => {
      setLoading(true);
      try {
          const contentToAnalyze = doc.content || `File name: ${doc.fileName}`; // If file, we can't read content in frontend easily without OCR/parsing libs, so we fallback to title
          const eventInfo = await extractEventFromDocument(contentToAnalyze, doc.title);
          
          setExtractedEvent({
              title: eventInfo.title || doc.title,
              date: eventInfo.date || new Date().toISOString().split('T')[0],
              time: eventInfo.time || '08:00',
              location: eventInfo.location || 'Hội trường',
              description: eventInfo.description || '',
              budget: eventInfo.budget || 0,
              attendees: eventInfo.attendees || 0,
              imageUrl: ''
          });
          setIsEventModalOpen(true);
      } catch (e) {
          alert("Không thể trích xuất thông tin.");
      } finally {
          setLoading(false);
      }
  };

  const confirmCreateEvent = (e: React.FormEvent) => {
      e.preventDefault();
      onAddEvent(extractedEvent);
      setIsEventModalOpen(false);
      setExtractedEvent(null);
      alert("Đã tạo sự kiện thành công và thêm vào lịch!");
  };

  // --- Handlers for Actions ---
  const handleExportWord = (doc: Document) => {
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${doc.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; line-height: 1.5; font-size: 14pt; }
        .header-table { width: 100%; margin-bottom: 30px; }
        .header-left { text-align: center; width: 40%; vertical-align: top; }
        .header-right { text-align: center; width: 60%; vertical-align: top; }
        .quoc-hieu { font-weight: bold; text-transform: uppercase; font-size: 13pt; }
        .tieu-ngu { font-weight: bold; font-size: 14pt; text-decoration: underline; }
        .ten-don-vi { font-weight: bold; text-transform: uppercase; font-size: 13pt; }
        .title { text-align: center; font-weight: bold; margin: 30px 0; font-size: 16pt; text-transform: uppercase; }
        .footer-table { width: 100%; margin-top: 50px; }
        .footer-cell { text-align: center; width: 50%; vertical-align: top; }
      </style>
      </head>
      <body>
        <table class="header-table">
            <tr>
                <td class="header-left">
                    <div class="ten-don-vi">CÂU LẠC BỘ</div>
                    <div>Số: ...</div>
                </td>
                <td class="header-right">
                    <div class="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div class="tieu-ngu">Độc lập - Tự do - Hạnh phúc</div>
                </td>
            </tr>
        </table>

        <div class="title">${doc.title}</div>
        <div>${doc.content.replace(/\n/g, '<br/>')}</div>
        
        <table class="footer-table">
            <tr>
                <td class="footer-cell">
                    <strong>NGƯỜI LẬP</strong><br/>
                    (Ký, họ tên)<br/><br/><br/>
                    ${doc.createdBy}
                </td>
                <td class="footer-cell">
                    <i>Ngày ... tháng ... năm ...</i><br/>
                    <strong>CHỦ NHIỆM</strong><br/>
                    (Ký, đóng dấu)
                </td>
            </tr>
        </table>
      </body>
      </html>
    `;
    
    const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
      window.print();
  };

  const downloadFile = (doc: Document) => {
      if (!doc.fileUrl) return;
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = doc.fileName || doc.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Văn bản & Đơn từ</h2>
            <p className="text-slate-500 mt-1">Soạn thảo, tải lên và phê duyệt văn bản hành chính.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsUploadOpen(true)}
                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold transition-transform hover:-translate-y-0.5"
            >
                <Upload size={20} />
                Tải tài liệu
            </button>
            <button 
                onClick={() => setIsEditorOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 font-bold transition-transform hover:-translate-y-0.5"
            >
                <Plus size={20} />
                Soạn văn bản
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 no-print">
        {documents.map(doc => (
            <div key={doc.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] hover:shadow-md transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${doc.type === 'proposal' ? 'bg-blue-50 text-blue-600' : doc.type === 'announcement' ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                        {doc.fileUrl ? <Paperclip size={24} /> : <FileText size={24} />}
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                        doc.status === 'approved' ? 'bg-green-50 text-green-700' : 
                        doc.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                        {doc.status === 'approved' ? 'Đã duyệt' : doc.status === 'pending' ? 'Chờ duyệt' : 'Nháp'}
                    </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2 truncate" title={doc.title}>{doc.title}</h3>
                <div className="flex-1">
                     <p className="text-xs text-slate-500 mb-6 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        {doc.createdAt}
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        bởi {doc.createdBy}
                    </p>
                    {doc.fileName && (
                        <div className="mb-4 text-xs font-mono bg-slate-50 p-2 rounded-lg text-slate-500 truncate border border-slate-100 flex items-center gap-1">
                             <File size={12} /> {doc.fileName}
                        </div>
                    )}
                </div>
                
                
                <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                     <button 
                        onClick={() => doc.fileUrl ? downloadFile(doc) : setViewDoc(doc)}
                        className="flex-1 py-2 rounded-lg bg-slate-50 text-slate-600 text-sm font-semibold hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {doc.fileUrl ? <Download size={16} /> : <Eye size={16} />} 
                        {doc.fileUrl ? 'Tải về' : 'Xem'}
                    </button>
                    {/* Event Generation Button */}
                    {(doc.type === 'proposal' || doc.type === 'announcement') && (
                        <button 
                            onClick={() => handleCreateEventFromDoc(doc)}
                            className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Tạo lịch sự kiện từ văn bản này"
                        >
                            <CalendarPlus size={18} />
                        </button>
                    )}
                    <div className="flex gap-1">
                         {!doc.fileUrl && (
                             <button onClick={() => handleExportWord(doc)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Xuất Word"><Download size={18} /></button>
                         )}
                         {isPresident && doc.status === 'pending' && (
                             <button onClick={() => onUpdateDocument(doc.id, 'approved')} className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Duyệt"><CheckCircle size={18} /></button>
                         )}
                         {(isPresident || doc.createdBy === currentUser.name) && (
                            <button onClick={() => onDeleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Xóa"><Trash2 size={18} /></button>
                         )}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Tải tài liệu lên</h3>
                    <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20}/></button>
                </div>

                <form onSubmit={handleSaveUploadDoc} className="space-y-6">
                    <div>
                         <label className="text-sm font-bold text-slate-700 block mb-2">Tập tin</label>
                         <div className="relative w-full h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center group hover:border-indigo-400 transition-colors">
                             <input type="file" required onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                             {uploadData.fileName ? (
                                 <div className="text-center p-4">
                                     <FileCheck size={32} className="text-emerald-500 mx-auto mb-2" />
                                     <p className="text-sm font-bold text-slate-700 break-all">{uploadData.fileName}</p>
                                 </div>
                             ) : (
                                 <div className="text-center p-4">
                                     <Upload size={32} className="text-slate-400 mx-auto mb-2 group-hover:text-indigo-400" />
                                     <p className="text-sm text-slate-500 font-medium">Nhấn hoặc kéo thả file vào đây</p>
                                     <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, IMG...</p>
                                 </div>
                             )}
                         </div>
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Tiêu đề</label>
                        <input type="text" required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} placeholder="Tên văn bản..." />
                    </div>

                    <div>
                        <label className="text-sm font-bold text-slate-700 block mb-2">Loại văn bản</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={uploadData.type} onChange={e => setUploadData({...uploadData, type: e.target.value as any})}>
                            <option value="proposal">Đề xuất/Kế hoạch</option>
                            <option value="announcement">Thông báo</option>
                            <option value="report">Báo cáo</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                         <button type="button" onClick={() => setIsUploadOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy bỏ</button>
                         <button type="submit" className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 flex items-center gap-2">
                             <Upload size={18} /> Lưu tài liệu
                         </button>
                    </div>
                </form>
            </div>
          </div>
      )}

      {/* Text Editor Modal */}
      {isEditorOpen && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-4xl p-8 shadow-2xl h-[85vh] flex flex-col animate-scale-up">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800">Soạn thảo văn bản</h3>
                    <button onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"><X size={20}/></button>
                </div>
                
                <div className="flex flex-col h-full overflow-y-auto custom-scrollbar space-y-6 pr-2">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-2">
                            <label className="text-sm font-bold text-slate-700">Tiêu đề văn bản</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} placeholder="Nhập tiêu đề..." />
                        </div>
                         <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Loại văn bản</label>
                            <select className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                value={newDoc.type} onChange={e => setNewDoc({...newDoc, type: e.target.value as any})}>
                                <option value="proposal">Đề xuất/Kế hoạch</option>
                                <option value="announcement">Thông báo</option>
                                <option value="report">Báo cáo</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold text-sm">
                            <Sparkles size={16} /> AI Assistant
                        </div>
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                placeholder="Mô tả nội dung bạn muốn viết (VD: Kế hoạch tổ chức Trung thu cho 50 người...)" 
                                className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                                value={newDoc.topic}
                                onChange={e => setNewDoc({...newDoc, topic: e.target.value})}
                            />
                            <button 
                                onClick={handleAiDraft}
                                disabled={loading || !newDoc.topic}
                                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-200"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18}/> : 'Viết nháp'}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-slate-700">Nội dung chi tiết</label>
                        <textarea 
                            className="w-full h-full min-h-[300px] p-5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed text-slate-700"
                            value={newDoc.content}
                            onChange={e => setNewDoc({...newDoc, content: e.target.value})}
                            placeholder="Nhập nội dung (Hỗ trợ Markdown)..."
                        ></textarea>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                     <button onClick={() => setIsEditorOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy bỏ</button>
                     <button onClick={handleSaveTextDoc} className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-200">
                        <FileCheck size={18} /> Lưu văn bản
                     </button>
                </div>
            </div>
         </div>
      )}

      {/* Event Creation Modal */}
      {isEventModalOpen && extractedEvent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center gap-3 mb-6 text-purple-600">
                    <Sparkles size={24} />
                    <h3 className="text-2xl font-bold text-slate-800">Xác nhận tạo sự kiện</h3>
                </div>
                <p className="text-slate-500 mb-6 text-sm">
                    AI đã trích xuất thông tin từ văn bản của bạn. Vui lòng kiểm tra và chỉnh sửa trước khi tạo lịch.
                </p>

                <form onSubmit={confirmCreateEvent} className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Tên sự kiện</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={extractedEvent.title} onChange={e => setExtractedEvent({...extractedEvent, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ngày</label>
                            <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={extractedEvent.date} onChange={e => setExtractedEvent({...extractedEvent, date: e.target.value})} />
                        </div>
                        <div>
                             <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Giờ</label>
                            <input type="time" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={extractedEvent.time} onChange={e => setExtractedEvent({...extractedEvent, time: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Địa điểm</label>
                        <input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={extractedEvent.location} onChange={e => setExtractedEvent({...extractedEvent, location: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Kinh phí (VNĐ)</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={extractedEvent.budget} onChange={e => setExtractedEvent({...extractedEvent, budget: Number(e.target.value)})} />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Số người</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={extractedEvent.attendees} onChange={e => setExtractedEvent({...extractedEvent, attendees: Number(e.target.value)})} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy bỏ</button>
                        <button type="submit" className="px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-lg shadow-purple-200">
                            Xác nhận tạo
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* View/Print Document Modal (Text Only) */}
      {viewDoc && !viewDoc.fileUrl && (
          <div className="fixed inset-0 bg-white z-[60] overflow-y-auto">
              <div className="max-w-[210mm] mx-auto min-h-screen bg-white p-8 md:p-12 print-container">
                  {/* Toolbar - Hidden when printing */}
                  <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4 flex justify-between items-center no-print z-50">
                      <h3 className="font-bold text-slate-800 truncate max-w-md">{viewDoc.title}</h3>
                      <div className="flex gap-3">
                          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium">
                              <Printer size={18} /> In / Lưu PDF
                          </button>
                          <button onClick={() => handleExportWord(viewDoc)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg font-medium">
                              <Download size={18} /> Word
                          </button>
                          <button onClick={() => setViewDoc(null)} className="p-2 hover:bg-slate-100 rounded-full">
                              <X size={24} />
                          </button>
                      </div>
                  </div>

                  {/* Document Content - Legal Format */}
                  <div className="mt-16 bg-white document-content">
                        <div className="legal-header">
                            <div className="legal-header-left">
                                <div className="ten-don-vi" style={{ fontWeight: 'bold' }}>CÂU LẠC BỘ</div>
                                <div className="so-ky-hieu">Số: ... / {viewDoc.type === 'proposal' ? 'TTr' : 'TB'}</div>
                            </div>
                            <div className="legal-header-right">
                                <div className="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                                <div className="tieu-ngu">Độc lập - Tự do - Hạnh phúc</div>
                                <div className="italic mt-2">
                                    ......., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                                </div>
                            </div>
                        </div>

                        <div className="document-title">{viewDoc.title}</div>
                        
                        <div className="prose prose-slate max-w-none text-justify text-[13pt] leading-relaxed" style={{fontFamily: 'Times New Roman'}}>
                            <ReactMarkdown>{viewDoc.content}</ReactMarkdown>
                        </div>

                        <div className="signature-section">
                            <div className="signature-block">
                                <div className="signature-title">NGƯỜI LẬP</div>
                                <div className="signature-role">(Ký, họ tên)</div>
                                <div className="signature-space"></div>
                                <div style={{fontWeight: 'bold'}}>{viewDoc.createdBy}</div>
                            </div>
                            <div className="signature-block">
                                <div className="signature-title">CHỦ NHIỆM CLB</div>
                                <div className="signature-role">(Ký, đóng dấu)</div>
                                <div className="signature-space"></div>
                            </div>
                        </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};