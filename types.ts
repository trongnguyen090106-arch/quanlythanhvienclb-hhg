
export enum MemberRole {
  PRESIDENT = 'Chủ nhiệm',
  HEAD = 'Trưởng ban',
  SECRETARY = 'Thư ký',
  MEMBER = 'Thành viên',
}

export enum MemberStatus {
  ACTIVE = 'Hoạt động',
  INACTIVE = 'Tạm ngưng',
  ALUMNI = 'Cựu thành viên',
}

export interface Member {
  id: string;
  username?: string; // For login
  password?: string; // For login
  name: string;
  email: string;
  phone: string;
  role: MemberRole;
  department?: string; // For Department Heads
  status: MemberStatus;
  joinedDate: string;
  avatarUrl?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  location: string;
  description: string;
  budget: number;
  attendees: number; // Planned number
  attendanceList?: string[]; // Array of Member IDs who actually attended
  imageUrl?: string; // Event Cover Image
}

export interface Document {
  id: string;
  title: string;
  content: string; // HTML or Markdown (empty if file upload)
  type: 'proposal' | 'announcement' | 'report';
  status: 'draft' | 'pending' | 'approved';
  createdBy: string;
  createdAt: string;
  approvedBy?: string;
  // New fields for file upload
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string; // Member ID
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  dueDate: string;
  department?: string;
}

export interface ScoreRecord {
  memberId: string;
  semester: string;
  score: number; // 0-10 scale
  notes: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // e.g., 'Membership Fee', 'Event Support', 'Equipment'
  memberId?: string; // If linked to a specific member
}

export interface AppSettings {
  clubName: string;
  clubLogoUrl?: string;
  defaultFee: number;
  currentSemester: string;
}

export interface StudySession {
  id: string;
  subject: string;
  dayOfWeek: number; // 2 (Mon) to 8 (Sun)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface AIBadgeDesign {
  gradient: string;
  textColor: string;
  accentColor: string;
  patternOpacity: number;
}
