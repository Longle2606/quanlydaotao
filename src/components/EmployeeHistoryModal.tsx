import React from 'react';
import { Employee, TrainingProgram } from '../types';
import { exportEmployeeHistoryCSV } from '../utils/storage';
import { 
  X, 
  History, 
  Building2, 
  Briefcase, 
  BookOpen, 
  Video, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  Download
} from 'lucide-react';

interface EmployeeHistoryModalProps {
  employee: Employee | null;
  programs: TrainingProgram[];
  onClose: () => void;
}

export const EmployeeHistoryModal: React.FC<EmployeeHistoryModalProps> = ({
  employee,
  programs,
  onClose
}) => {
  if (!employee) return null;

  // Filter programs where this employee is a participant
  const attendedPrograms = programs.filter(p => p.participantIds.includes(employee.id));
  const completedCount = attendedPrograms.filter(p => p.status === 'completed').length;
  const inPersonCount = attendedPrograms.filter(p => p.type === 'in_person').length;
  const onlineCount = attendedPrograms.filter(p => p.type === 'online').length;

  const handleExport = () => {
    exportEmployeeHistoryCSV(employee, programs);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded border border-indigo-500/30">
              {employee.position}
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Lịch Sử Đào Tạo: {employee.fullName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-300 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {employee.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {employee.position}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              title="Xuất CSV lịch sử đào tạo cá nhân"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất CSV Lịch Sử</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Stats Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-100 text-center">
              <span className="text-xs text-indigo-600 block">Tổng số khóa tham gia</span>
              <span className="text-2xl font-extrabold text-indigo-900">{attendedPrograms.length}</span>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 text-center">
              <span className="text-xs text-emerald-600 block">Đã hoàn thành</span>
              <span className="text-2xl font-extrabold text-emerald-900">{completedCount}</span>
            </div>

            <div className="bg-sky-50 p-3.5 rounded-xl border border-sky-100 text-center">
              <span className="text-xs text-sky-600 block">Trực tiếp / Online</span>
              <span className="text-lg font-bold text-sky-900">{inPersonCount} Trực tiếp • {onlineCount} Online</span>
            </div>
          </div>

          {/* List of Courses */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              Danh sách các khóa học đã đăng ký / tham dự
            </h3>

            {attendedPrograms.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
                Nhân viên này chưa được gán vào khóa đào tạo nào.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {attendedPrograms.map(prog => (
                  <div key={prog.id} className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {prog.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                          prog.type === 'online' 
                            ? 'bg-sky-50 text-sky-700' 
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {prog.type === 'in_person' ? 'Trực tiếp' : prog.type === 'online' ? 'Trực tuyến' : 'Kết hợp'}
                        </span>
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm">{prog.title}</h4>

                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {prog.startDate} đến {prog.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {prog.locationOrLink}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {prog.status === 'completed' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Hoàn thành
                        </span>
                      ) : (
                        <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Đang/Sắp học
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-5 py-2 rounded-xl transition"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
