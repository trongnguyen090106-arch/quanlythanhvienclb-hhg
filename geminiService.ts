
import { GoogleGenAI } from "@google/genai";
import { ClubEvent, StudySession, AIBadgeDesign } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateEventIdeas = async (clubType: string, season: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key chưa được cấu hình.");

  try {
    const prompt = `Tôi đang quản lý một câu lạc bộ về chủ đề: "${clubType}". 
    Hiện tại đang là mùa: "${season}".
    Hãy gợi ý cho tôi 3 ý tưởng sự kiện độc đáo, chi tiết và hấp dẫn để tổ chức cho các thành viên. 
    Trả về kết quả dưới dạng danh sách ngắn gọn, có định dạng Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });

    return response.text || "Không thể tạo ý tưởng lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi gọi AI.";
  }
};

export const generateMarketingContent = async (event: ClubEvent): Promise<string> => {
  if (!apiKey) throw new Error("API Key chưa được cấu hình.");

  try {
    const prompt = `Viết một bài đăng Facebook hấp dẫn, sử dụng nhiều emoji để quảng bá sự kiện sau của câu lạc bộ:
    - Tên sự kiện: ${event.title}
    - Thời gian: ${event.date}
    - Địa điểm: ${event.location}
    - Nội dung: ${event.description}
    
    Hãy viết giọng văn trẻ trung, sôi nổi, kêu gọi mọi người tham gia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể tạo nội dung lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi gọi AI.";
  }
};

export const generateDocumentContent = async (type: string, topic: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key chưa được cấu hình.");

  try {
    const prompt = `Soạn thảo một văn bản hành chính câu lạc bộ sinh viên theo chuẩn Việt Nam (Cộng hòa xã hội chủ nghĩa Việt Nam...).
    Loại văn bản: ${type}
    Chủ đề/Nội dung chính: ${topic}
    
    Hãy trình bày rõ ràng, có tiêu ngữ, kính gửi, nội dung chính và phần ký tên (để trống tên người ký). Trả về định dạng Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không thể soạn thảo văn bản lúc này.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Đã xảy ra lỗi khi gọi AI.";
  }
};

export const generateCertificateQuote = async (eventName: string): Promise<string> => {
  if (!apiKey) return "Ghi nhận sự đóng góp tích cực của bạn.";

  try {
    const prompt = `Viết một câu chúc ngắn gọn (1 câu, dưới 20 từ), trang trọng và đầy cảm hứng để in lên giấy chứng nhận hoàn thành sự kiện "${eventName}" cho thành viên câu lạc bộ.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "Ghi nhận sự đóng góp tích cực của bạn.";
  } catch (error) {
    return "Ghi nhận sự đóng góp tích cực của bạn.";
  }
}

export const suggestSchedule = async (schedule: StudySession[]): Promise<string> => {
  if (!apiKey) return "Vui lòng tự kiểm tra lịch.";
  
  try {
    const scheduleText = schedule.map(s => `- Thứ ${s.dayOfWeek}: ${s.startTime} đến ${s.endTime} (${s.subject})`).join('\n');
    const prompt = `Tôi là chủ nhiệm CLB. Đây là lịch học bận rộn của các thành viên trong tuần:
    ${scheduleText}
    
    Dựa trên lịch bận trên, hãy phân tích và gợi ý cho tôi 3 khung giờ tốt nhất trong tuần để tổ chức họp CLB hoặc sinh hoạt chung mà ít bị trùng lịch học nhất.
    Giải thích ngắn gọn tại sao chọn giờ đó.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Không tìm thấy gợi ý.";
  } catch (error) {
    return "Lỗi kết nối AI.";
  }
}

export const extractEventFromDocument = async (docContent: string, docTitle: string): Promise<Partial<ClubEvent>> => {
  if (!apiKey) throw new Error("API Key Missing");

  try {
    const prompt = `Phân tích văn bản kế hoạch sau và trích xuất thông tin để tạo sự kiện.
    Tiêu đề văn bản: ${docTitle}
    Nội dung: ${docContent}
    
    Hãy trả về duy nhất một JSON object (không có markdown code block) với các trường sau:
    {
      "title": "Tên sự kiện ngắn gọn",
      "date": "YYYY-MM-DD (Nếu không tìm thấy, để ngày mai)",
      "time": "HH:mm",
      "location": "Địa điểm tổ chức",
      "description": "Mô tả tóm tắt (dưới 50 từ)",
      "budget": 0 (Số tiền kinh phí dự kiến, chỉ lấy số),
      "attendees": 0 (Số lượng người dự kiến)
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Extract Event Error", error);
    return { title: docTitle };
  }
};

export const generateBadgeDesign = async (eventTitle: string): Promise<AIBadgeDesign> => {
  if (!apiKey) return { gradient: 'linear-gradient(to right, #4f46e5, #7c3aed)', textColor: '#ffffff', accentColor: '#ffffff', patternOpacity: 0.1 };

  try {
    const prompt = `Hãy thiết kế thẻ đeo sự kiện (Event Badge) cho sự kiện: "${eventTitle}".
    Trả về một JSON object chứa mã màu CSS phù hợp với chủ đề sự kiện:
    {
      "gradient": "Mã CSS linear-gradient(...) đẹp mắt, hiện đại",
      "textColor": "Mã màu hex cho chữ (thường là #fff hoặc #000 để tương phản)",
      "accentColor": "Mã màu hex để làm điểm nhấn viền hoặc icon",
      "patternOpacity": 0.1 (độ đậm nhạt của họa tiết nền từ 0.05 đến 0.2)
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    return { gradient: 'linear-gradient(to right, #2563eb, #db2777)', textColor: '#ffffff', accentColor: '#fbbf24', patternOpacity: 0.15 };
  }
};
