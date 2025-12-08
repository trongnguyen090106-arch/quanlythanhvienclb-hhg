import React, { useState, useRef, useEffect } from 'react';
import { Transaction, Member, AppSettings } from '../types';
import { Wallet, TrendingUp, TrendingDown, Plus, Search, Camera, XCircle, Printer, ArrowDownLeft, ArrowUpRight, FileSpreadsheet } from 'lucide-react';

interface FinanceManagerProps {
  transactions: Transaction[];
  members: Member[];
  settings: AppSettings;
  onAddTransaction: (t: Transaction) => void;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({ transactions, members, settings, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Print View State
  const [showPrintView, setShowPrintView] = useState(false);

  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    type: 'income',
    date: new Date().toISOString().split('T')[0],
    amount: settings.defaultFee,
    category: 'Membership Fee',
    description: '',
    memberId: ''
  });

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) return;
    
    onAddTransaction({
        id: Math.random().toString(36).substr(2, 9),
        date: newTransaction.date!,
        description: newTransaction.description!,
        amount: Number(newTransaction.amount),
        type: newTransaction.type as 'income' | 'expense',
        category: newTransaction.category!,
        memberId: newTransaction.memberId
    });
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTransaction({
        type: 'income',
        date: new Date().toISOString().split('T')[0],
        amount: settings.defaultFee,
        category: 'Membership Fee',
        description: '',
        memberId: ''
    });
  };

  const startCamera = async () => {
    try {
      setIsScannerOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err) {
      alert("Không thể truy cập camera.");
      setIsScannerOpen(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setScanning(false);
    }
    setIsScannerOpen(false);
  };

  const handleScanData = (data: string) => {
      try {
          const parsed = JSON.parse(data);
          if (parsed.id && parsed.name) {
              setNewTransaction({
                  ...newTransaction,
                  type: 'income',
                  amount: settings.defaultFee,
                  category: 'Membership Fee',
                  memberId: parsed.id,
                  description: `Thu lệ phí kỳ ${settings.currentSemester} - ${parsed.name}`
              });
              stopCamera();
              setIsModalOpen(true);
          }
      } catch (e) {
          // ignore invalid json
      }
  };

  const simulateScan = () => {
      const member = members[Math.floor(Math.random() * members.length)];
      handleScanData(JSON.stringify({ id: member.id, name: member.name }));
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const handlePrintReport = () => {
      setShowPrintView(true);
      setTimeout(() => {
          window.print();
      }, 500);
  };

  const exportToCSV = () => {
      const headers = ['ID,Date,Description,Category,Type,Amount,MemberID'];
      const rows = transactions.map(t => 
          `${t.id},${t.date},"${t.description}",${t.category},${t.type},${t.amount},${t.memberId || ''}`
      );
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tài chính</h2>
            <p className="text-slate-500 mt-1">Quản lý thu chi và ngân sách câu lạc bộ.</p>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={startCamera}
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium shadow-md transition-all"
            >
                <Camera size={18} />
                <span className="hidden sm:inline">Quét đóng phí</span>
            </button>
            <button 
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5"
            >
                <Plus size={18} />
                Giao dịch
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wallet size={80} className="text-indigo-600" />
              </div>
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Quỹ hiện tại</p>
                  <h3 className="text-3xl font-extrabold text-slate-800">{balance.toLocaleString('vi-VN')} đ</h3>
              </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Tổng thu</p>
                  <h3 className="text-3xl font-extrabold text-emerald-600">+{totalIncome.toLocaleString('vi-VN')}</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <TrendingUp size={24} />
              </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)] flex items-center justify-between">
              <div>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Tổng chi</p>
                  <h3 className="text-3xl font-extrabold text-red-600">-{totalExpense.toLocaleString('vi-VN')}</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <TrendingDown size={24} />
              </div>
          </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden no-print">
        <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
             <h3 className="font-bold text-slate-800 text-lg">Lịch sử giao dịch</h3>
             <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <button onClick={exportToCSV} className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-green-600 transition-colors" title="Xuất Excel">
                    <FileSpreadsheet size={20} />
                </button>
                <button onClick={handlePrintReport} className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors" title="In / Xuất PDF">
                    <Printer size={20} />
                </button>
             </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4 rounded-tl-2xl">Ngày</th>
                        <th className="px-6 py-4">Nội dung</th>
                        <th className="px-6 py-4">Danh mục</th>
                        <th className="px-6 py-4 text-right rounded-tr-2xl">Số tiền</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {transactions
                        .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(t => (
                        <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4 text-slate-600 text-sm font-medium">{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                            <td className="px-6 py-4">
                                <div className="font-semibold text-slate-800">{t.description}</div>
                                {t.memberId && <div className="text-xs text-slate-400 mt-0.5">ID: {t.memberId}</div>}
                            </td>
                            <td className="px-6 py-4">
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    {t.category}
                                </span>
                            </td>
                            <td className={`px-6 py-4 text-right font-bold text-sm ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('vi-VN')}
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
              <div className="fixed top-0 left-0 right-0 bg-slate-800 text-white p-4 flex justify-between items-center no-print z-50 shadow-md">
                   <div className="flex items-center gap-2">
                       <Printer size={20} />
                       <span className="font-bold">Xem trước Báo cáo (Nhấn Ctrl+P để lưu PDF)</span>
                   </div>
                   <button onClick={() => setShowPrintView(false)} className="px-4 py-1 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Đóng</button>
              </div>

              <div className="print-container max-w-[210mm] mx-auto p-10 pt-20">
                  <div className="legal-header">
                        <div className="legal-header-left">
                            <div className="ten-don-vi" style={{ fontWeight: 'bold' }}>{settings?.clubName || 'CÂU LẠC BỘ'}</div>
                            <div className="so-ky-hieu">Số: ... / BC-TC</div>
                        </div>
                        <div className="legal-header-right">
                            <div className="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                            <div className="tieu-ngu">Độc lập - Tự do - Hạnh phúc</div>
                            <div className="italic mt-2">
                                ......., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                            </div>
                        </div>
                  </div>

                  <div className="document-title">BÁO CÁO TÌNH HÌNH TÀI CHÍNH</div>

                  <div className="mb-4">
                      <p><strong>Kính gửi:</strong> Ban Chủ Nhiệm {settings.clubName}</p>
                      <p>Dưới đây là bảng kê chi tiết các khoản thu chi của câu lạc bộ.</p>
                  </div>

                  <table className="legal-table">
                      <thead>
                          <tr>
                              <th style={{width: '10%'}}>Ngày</th>
                              <th style={{width: '40%'}}>Nội dung</th>
                              <th style={{width: '15%'}}>Loại</th>
                              <th style={{width: '15%'}}>Danh mục</th>
                              <th style={{width: '20%'}}>Số tiền (VNĐ)</th>
                          </tr>
                      </thead>
                      <tbody>
                          {transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(t => (
                              <tr key={t.id}>
                                  <td style={{textAlign: 'center'}}>{new Date(t.date).toLocaleDateString('vi-VN')}</td>
                                  <td>{t.description}</td>
                                  <td style={{textAlign: 'center'}}>{t.type === 'income' ? 'Thu' : 'Chi'}</td>
                                  <td style={{textAlign: 'center'}}>{t.category}</td>
                                  <td style={{textAlign: 'right'}}>{t.amount.toLocaleString('vi-VN')}</td>
                              </tr>
                          ))}
                      </tbody>
                      <tfoot>
                          <tr>
                              <td colSpan={4} style={{textAlign: 'right', fontWeight: 'bold'}}>TỔNG THU:</td>
                              <td style={{textAlign: 'right', fontWeight: 'bold'}}>{totalIncome.toLocaleString('vi-VN')}</td>
                          </tr>
                          <tr>
                              <td colSpan={4} style={{textAlign: 'right', fontWeight: 'bold'}}>TỔNG CHI:</td>
                              <td style={{textAlign: 'right', fontWeight: 'bold'}}>{totalExpense.toLocaleString('vi-VN')}</td>
                          </tr>
                          <tr>
                              <td colSpan={4} style={{textAlign: 'right', fontWeight: 'bold'}}>TỒN QUỸ:</td>
                              <td style={{textAlign: 'right', fontWeight: 'bold'}}>{balance.toLocaleString('vi-VN')}</td>
                          </tr>
                      </tfoot>
                  </table>

                  <div className="signature-section">
                        <div className="signature-block">
                            <div className="signature-title">NGƯỜI LẬP BIỂU</div>
                            <div className="signature-role">(Ký, ghi rõ họ tên)</div>
                            <div className="signature-space"></div>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 no-print">
            <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-scale-up">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                    {newTransaction.memberId ? 'Xác nhận đóng phí' : 'Thêm giao dịch'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                        <button 
                            type="button"
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${newTransaction.type === 'income' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setNewTransaction({...newTransaction, type: 'income'})}
                        >
                            <ArrowDownLeft size={16} /> Thu tiền
                        </button>
                        <button 
                             type="button"
                             className={`flex-1 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${newTransaction.type === 'expense' ? 'bg-white shadow-sm text-red-600' : 'text-slate-400 hover:text-slate-600'}`}
                             onClick={() => setNewTransaction({...newTransaction, type: 'expense'})}
                        >
                            <ArrowUpRight size={16} /> Chi tiền
                        </button>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Số tiền (VNĐ)</label>
                        <input required type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xl text-slate-800"
                            value={newTransaction.amount} onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})} />
                    </div>

                     <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Danh mục</label>
                        <select className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={newTransaction.category} onChange={e => setNewTransaction({...newTransaction, category: e.target.value})}>
                            <option value="Membership Fee">Lệ phí thành viên</option>
                            <option value="Event Support">Hỗ trợ sự kiện</option>
                            <option value="Sponsorship">Tài trợ</option>
                            <option value="Equipment">Mua sắm thiết bị</option>
                            <option value="Other">Khác</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Mô tả</label>
                        <textarea required className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none h-24 resize-none focus:ring-2 focus:ring-indigo-500"
                             value={newTransaction.description} onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 mb-1 block">Ngày giao dịch</label>
                         <input required type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            value={newTransaction.date} onChange={e => setNewTransaction({...newTransaction, date: e.target.value})} />
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-50">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold">Hủy</button>
                        <button type="submit" className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200">Lưu lại</button>
                    </div>
                </form>
            </div>
        </div>
      )}

       {/* Scanner Modal */}
       {isScannerOpen && (
          <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center p-4">
              <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80"></video>
                   <button onClick={stopCamera} className="absolute top-4 right-4 text-white bg-white/20 p-2 rounded-full backdrop-blur-sm z-50">
                      <XCircle size={28} />
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 border-2 border-indigo-500 rounded-2xl relative animate-pulse shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                          {/* Corner markers */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1 rounded-br-lg"></div>
                      </div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
                      <button onClick={simulateScan} className="bg-indigo-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:scale-105 transition-transform">
                          (Demo) Tìm thấy thẻ
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};