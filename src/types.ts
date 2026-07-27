export type TrainingType = 'in_person' | 'online';

export type ProgramStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export type AttendanceStatus = 'registered' | 'attended' | 'completed' | 'absent';

export interface Employee {
  id: string;
  fullName: string; // Họ và tên
  department: string; // Khoa / Phòng
  position: string; // Chức danh (Bác sĩ, Điều dưỡng, Khác)
  code?: string; // Mã nhân viên (nếu có)
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface TrainingProgram {
  id: string;
  code: string; // Mã chương trình (e.g. DT2026-01)
  title: string; // Tên chương trình đào tạo
  type: TrainingType; // Trực tiếp | Trực tuyến
  startDate: string; // Từ ngày (YYYY-MM-DD)
  endDate: string; // Đến ngày (YYYY-MM-DD)
  locationOrLink: string; // Địa điểm tổ chức hoặc Đường dẫn học trực tuyến
  instructor: string; // Giảng viên / Đơn vị tổ chức
  description?: string; // Nội dung / Mục tiêu
  participantIds: string[]; // Danh sách ID nhân viên tham dự
  status?: ProgramStatus;
  createdAt: string;
}

export interface ProgramParticipantRecord {
  employeeId: string;
  programId: string;
  attendanceStatus: AttendanceStatus;
  note?: string;
}

export type ActiveTab = 'dashboard' | 'employees' | 'programs';
