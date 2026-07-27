import React, { useState } from 'react';
import { TrainingProgram, Employee } from '../types';
import { 
  X, 
  Users, 
  Calendar, 
  MapPin, 
  Video, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Building2, 
  Briefcase, 
  Search,
  CheckCircle2
} from 'lucide-react';

interface ProgramDetailModalProps {
  program: TrainingProgram | null;
  employees: Employee[];
  onClose: () => void;
  onUpdateParticipants: (programId: string, updatedParticipantIds: string[]) => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  employees,
  onClose,
  onUpdateParticipants
}) => {
  if (!program) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');

  // Current participant objects
  const enrolledEmployees = employees.filter(e => program.participantIds.includes(e.id));
  
  // Non-participant objects (available to add)
  const availableEmployees = employees.filter(e => !program.participantIds.includes(e.id));

  // Filter available employees
  const filteredAvailable = availableEmployees.filter(e => {
    const matchesSearch = 
      e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = !selectedDeptFilter || e.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const handleAddParticipant = (employeeId: string) => {
    const newIds = [...program.participantIds, employeeId];
    onUpdateParticipants(program.id, newIds);
  };

  const handleRemoveParticipant = (employeeId: string) => {
    const newIds = program.participantIds.filter(id => id !== employeeId);
    onUpdateParticipants(program.id, newIds);
  };

  const handleAddAllFromDept = (deptName: string) => {
    const deptEmpIds = availableEmployees
      .filter(e => e.department === deptName)
      .map(e => e.id);
    const newIds = Array.from(new Set([...program.participantIds, ...deptEmpIds]));
    onUpdateParticipants(program.id, newIds);
  };

  const exportSingleProgramCSV = () => {
    const headers = ['Họ và Tên', 'Khoa/Phòng', 'Chức Danh'];
    const rows = enrolledEmployees.map(e => [
      `"${e.fullName}"`,
      `"${e.department}"`,
      `"${e.position}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `danh_sach_nv_khoa_${program.code}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/30 text-indigo-300 text-xs px-2.5 py-0.5 rounded font-mono font-bold border border-indigo-500/40">
                {program.code}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                program.type === 'online' 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {program.type === 'in_person' ? 'Trực tiếp' : 'Trực tuyến'}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{program.title}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Từ {program.startDate} đến {program.endDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                {program.locationOrLink}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Program Instructor & Description */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div>
              <strong className="text-slate-800">Giảng viên / Đơn vị tổ chức:</strong> {program.instructor}
            </div>
            {program.description && (
              <div className="text-slate-600">
                <strong className="text-slate-800">Mục tiêu / Nội dung:</strong> {program.description}
              </div>
            )}
          </div>

          {/* Section: Participant Management Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Danh Sách Nhân Viên Tham Dự ({enrolledEmployees.length} NV)
              </h3>
              <p className="text-xs text-slate-500">Quản lý thêm, bớt danh sách nhân sự tham gia khóa đào tạo này</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportSingleProgramCSV}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất danh sách</span>
              </button>

              <button
                onClick={() => setIsAdding(!isAdding)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  isAdding 
                    ? 'bg-slate-200 text-slate-700' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{isAdding ? 'Đóng bảng thêm' : 'Thêm nhân viên'}</span>
              </button>
            </div>
          </div>

          {/* Add Employees Panel (if toggled) */}
          {isAdding && (
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-indigo-950 text-xs uppercase tracking-wider">
                  Chọn nhân viên để thêm vào khóa học
                </h4>
                <span className="text-xs text-indigo-700">
                  Còn {availableEmployees.length} NV chưa tham gia
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tìm theo tên nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />

                <select
                  value={selectedDeptFilter}
                  onChange={(e) => setSelectedDeptFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-700"
                >
                  <option value="">Tất cả Khoa/Phòng</option>
                  {Array.from(new Set(availableEmployees.map(e => e.department))).map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {selectedDeptFilter && (
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAddAllFromDept(selectedDeptFilter)}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-300 px-3 py-1 rounded-lg transition"
                  >
                    + Thêm tất cả NV thuộc "{selectedDeptFilter}"
                  </button>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto divide-y divide-indigo-100 bg-white rounded-lg border border-indigo-100">
                {filteredAvailable.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    Không có nhân viên phù hợp hoặc tất cả đã tham gia khóa học này.
                  </div>
                ) : (
                  filteredAvailable.map(emp => (
                    <div key={emp.id} className="p-2.5 flex items-center justify-between hover:bg-indigo-50/50 transition text-xs">
                      <div>
                        <span className="font-semibold text-slate-900">{emp.fullName}</span>
                        <div className="text-[11px] text-slate-500">
                          {emp.position} • {emp.department}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddParticipant(emp.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-2.5 py-1 rounded text-xs transition"
                      >
                        + Thêm
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Enrolled Employees Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Họ và Tên</th>
                  <th className="py-2.5 px-3">Khoa / Phòng</th>
                  <th className="py-2.5 px-3">Chức Danh</th>
                  <th className="py-2.5 px-3 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrolledEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Chưa có nhân viên nào tham dự khóa đào tạo này. Click "Thêm nhân viên" ở trên để bổ sung.
                    </td>
                  </tr>
                ) : (
                  enrolledEmployees.map(emp => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{emp.fullName}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {emp.department}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <Briefcase className="w-3 h-3 text-indigo-400" />
                          {emp.position}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleRemoveParticipant(emp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Loại bỏ nhân viên khỏi khóa này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Footer */}
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
