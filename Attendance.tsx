
import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, XCircle, CheckCircle, Search, UserCheck } from 'lucide-react';
import { ClubEvent, Member } from '../types';

interface AttendanceProps {
  events: ClubEvent[];
  members: Member[];
  onUpdateEvent: (eventId: string, updates: Partial<ClubEvent>) => void;
}

export const Attendance: React.FC<AttendanceProps> = ({ events, members, onUpdateEvent }) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{name: string, time: string} | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get active events or events today
  const activeEvents = events.filter(e => {
      const eventDate = new Date(e.date);
      const today = new Date();
      // Show events from yesterday, today, and future
      const diffTime = eventDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      return diffDays >= -1; 
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
      }
    } catch (err) {
      alert("Không thể truy cập camera. Hãy kiểm tra quyền truy cập.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setScanning(false);
    }
  };

  // Logic to handle "Scan"
  const handleScanSuccess = (memberId: string) => {
      if (!selectedEvent) return;
      const member = members.find(m => m.id === memberId);
      if (member) {
          const currentList = selectedEvent.attendanceList || [];
          if (!currentList.includes(memberId)) {
              onUpdateEvent(selectedEvent.id, { attendanceList: [...currentList, memberId] });
          }
          setScannedResult({
              name: member.name,
              time: new Date().toLocaleTimeString('vi-VN')
          });
          // Stop camera briefly or keep scanning? Let's stop to show success then user can restart
          stopCamera(); 
      }
  };

  // Mock Scan for demo
  const simulateScan = () => {
      // Find a random member not yet attended
      const currentList = selectedEvent?.attendanceList || [];
      const candidate = members.find(m => !currentList.includes(m.id));
      if (candidate) {
          handleScanSuccess(candidate.id);
      } else {
          alert("Tất cả thành viên đã được điểm danh!");
      }
  };

  const toggleAttendance = (memberId: string) => {
      if (!selectedEvent) return;
      const currentList = selectedEvent.attendanceList || [];
      let newList;
      if (currentList.includes(memberId)) {
          newList = currentList.filter(id => id !== memberId);
      } else {
          newList = [...currentList, memberId];
      }
      onUpdateEvent(selectedEvent.id, { attendanceList: newList });
  };

  useEffect(() => {
      return () => stopCamera();
  }, []);

  if (activeEvents.length === 0) {
      return (
          <div className="text-center py-10">
              <h2 className="text-xl font-bold text-slate-700">Không có sự kiện nào gần đây</h2>
              <p className="text-slate-500">Hãy tạo sự kiện mới để bắt đầu điểm danh.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Điểm danh sự kiện</h2>
                <p className="text-slate-500">Quét mã QR hoặc điểm danh thủ công.</p>
            </div>
            <div className="w-full md:w-64">
                <select 
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-white font-medium shadow-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={selectedEventId}
                    onChange={(e) => {
                        setSelectedEventId(e.target.value);
                        setScannedResult(null);
                        stopCamera();
                    }}
                >
                    <option value="">-- Chọn sự kiện --</option>
                    {activeEvents.map(e => (
                        <option key={e.id} value={e.id}>{e.title} ({new Date(e.date).toLocaleDateString('vi-VN')})</option>
                    ))}
                </select>
            </div>
       </div>

       {selectedEvent ? (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Camera/Scanner */}
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">Camera Quét QR</h3>
                            {scanning && <span className="text-xs animate-pulse text-red-500 font-bold">● Đang quét</span>}
                        </div>
                        
                        <div className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] w-full flex items-center justify-center">
                            {scanning ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-80"></video>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-48 border-2 border-indigo-500 rounded-lg relative animate-pulse">
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-indigo-500 -mt-1 -ml-1"></div>
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-indigo-500 -mt-1 -mr-1"></div>
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-indigo-500 -mb-1 -ml-1"></div>
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-indigo-500 -mb-1 -mr-1"></div>
                                        </div>
                                    </div>
                                    <button onClick={simulateScan} className="absolute bottom-4 bg-white/90 text-indigo-900 px-4 py-1 rounded-full text-xs font-bold shadow-lg z-10 hover:bg-white">
                                        (Demo Scan)
                                    </button>
                                    <button onClick={stopCamera} className="absolute top-2 right-2 text-white bg-black/50 p-1 rounded-full">
                                        <XCircle size={20} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center p-6">
                                    <Camera size={48} className="text-slate-600 mx-auto mb-2" />
                                    <button onClick={startCamera} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                                        Bật Camera
                                    </button>
                                </div>
                            )}
                        </div>

                        {scannedResult && (
                            <div className="mt-4 bg-green-50 border border-green-200 p-3 rounded-lg flex items-center gap-3 animate-fade-in">
                                <CheckCircle className="text-green-600" size={20} />
                                <div className="flex-1">
                                    <p className="font-bold text-green-800">{scannedResult.name}</p>
                                    <p className="text-xs text-green-600">Đã điểm danh lúc {scannedResult.time}</p>
                                </div>
                                <button onClick={() => { setScannedResult(null); startCamera(); }} className="text-green-700 font-medium text-sm hover:underline">
                                    Quét tiếp
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: List & Manual */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                    <div className="p-4 border-b border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-700">Danh sách tham gia</h3>
                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">
                                {selectedEvent.attendanceList?.length || 0} / {members.length}
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Tìm tên thành viên..." 
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map(member => {
                            const isPresent = selectedEvent.attendanceList?.includes(member.id);
                            return (
                                <div key={member.id} 
                                    onClick={() => toggleAttendance(member.id)}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isPresent ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isPresent ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-500'}`}>
                                            {member.avatarUrl ? <img src={member.avatarUrl} className="w-full h-full rounded-full object-cover"/> : member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-medium ${isPresent ? 'text-indigo-900' : 'text-slate-700'}`}>{member.name}</p>
                                            <p className="text-xs text-slate-500">{member.department || 'Thành viên'}</p>
                                        </div>
                                    </div>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${isPresent ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'}`}>
                                        {isPresent && <CheckCircle size={14} />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
           </div>
       ) : (
           <div className="flex flex-col items-center justify-center h-64 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
               <UserCheck size={48} className="text-slate-400 mb-2" />
               <p className="text-slate-500">Vui lòng chọn sự kiện để bắt đầu điểm danh</p>
           </div>
       )}
    </div>
  );
};
