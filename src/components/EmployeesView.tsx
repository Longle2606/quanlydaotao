import React, { useState, useRef } from 'react';
import { Employee, TrainingProgram } from '../types';
import { DEPARTMENTS, POSITIONS } from '../data/initialData';
import { exportEmployeeHistoryCSV, exportEmployeesCSV } from '../utils/storage';
import { downloadEmployeeTemplateCSV, parseEmployeesCSVText } from '../utils/csvImport';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  History, 
  UserCheck, 
  UserX, 
  Building2, 
  Briefcase,
  Phone,
  Mail,
  X,
  FileSpreadsheet,
  Download,
  Upload,
  FileText
} from 'lucide-react';

interface EmployeesViewProps {
  employees: Employee[];
  programs: TrainingProgram[];
  onAddEmployee: () => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onViewHistory: (employee: Employee) => void;
  onExportEmployees: (departmentName?: string) => void;
  onImportEmployees: (importedList: Employee[]) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  programs,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewHistory,
  onExportEmployees,
  onImportEmployees
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  // Multi-employee selection state for exporting training history
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const imported = parseEmployeesCSVText(text);
        if (imported.length > 0) {
          onImportEmployees(imported);
        } else {
          alert('Không tìm thấy dữ liệu nhân viên hợp lệ trong file. Vui lòng tải file mẫu Excel/CSV để kiểm tra cấu trúc!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Count training courses per employee
  const courseCountMap = new Map<string, number>();
  programs.forEach(p => {
    p.participantIds.forEach(id => {
      courseCountMap.set(id, (courseCountMap.get(id) || 0) + 1);
    });
  });

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = !selectedDept || emp.department === selectedDept;
    const matchesPosition = !selectedPosition || emp.position === selectedPosition;

    return matchesSearch && matchesDept && matchesPosition;
  });

  // Checkbox selection logic
  const isAllSelected = filteredEmployees.length > 0 && filteredEmployees.every(e => selectedIds.includes(e.id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredEmployees.map(e => e.id));
    }
  };

  const toggleSelectEmployee = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportSelectedHistory = () => {
    const selectedEmps = employees.filter(e => selectedIds.includes(e.id));
    if (selectedEmps.length === 0) return;
    exportEmployeeHistoryCSV(selectedEmps, programs);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden File Input for Excel/CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".csv,.txt"
        className="hidden"
      />

      {/* Top Action & Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-indigo-600" />
            Danh Sách Nhân Viên
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin chi tiết nhân sự, khoa/phòng, chức danh, xuất báo cáo theo khoa/phòng & nhập file Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tải File Mẫu Excel/CSV */}
          <button
            onClick={downloadEmployeeTemplateCSV}
            title="Tải file mẫu Excel/CSV nhập danh sách nhân viên"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Tải File Mẫu</span>
          </button>

          {/* Nhập từ File Excel/CSV */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Tải lên file Excel/CSV để thêm hàng loạt nhân viên"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Nhập File Excel/CSV</span>
          </button>

          {/* Xuất NV theo Khoa/Phòng */}
          <button
            onClick={() => exportEmployeesCSV(filteredEmployees, selectedDept || undefined)}
            title={selectedDept ? `Xuất danh sách nhân viên khoa: ${selectedDept}` : 'Xuất toàn bộ danh sách nhân viên'}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{selectedDept ? `Xuất NV (${selectedDept})` : 'Xuất Danh Sách CSV'}</span>
          </button>

          {/* Thêm NV Mới thủ công */}
          <button
            onClick={onAddEmployee}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Nhân Viên</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo họ và tên, khoa/phòng, chức danh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Department */}
        <div className="relative">
          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none text-slate-700"
          >
            <option value="">Tất cả Khoa / Phòng ({DEPARTMENTS.length})</option>
            {DEPARTMENTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Filter Position */}
        <div className="relative">
          <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white appearance-none text-slate-700"
          >
            <option value="">Tất cả Chức danh</option>
            {POSITIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Selection Action Bar (when 1 or more employees selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-900 text-white rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in border border-indigo-700">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold px-2.5 py-1 rounded-full">
              Đã chọn {selectedIds.length} nhân viên
            </span>
            <span className="text-xs text-indigo-200 hidden md:inline">
              (Có thể chọn 1 hoặc nhiều nhân viên để xuất lịch sử các chương trình đào tạo đã tham dự)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelectedHistory}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Chương Trình Tham Dự ({selectedIds.length} NV)</span>
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="bg-indigo-800 hover:bg-indigo-700 text-indigo-200 hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}

      {/* Employees Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    title="Chọn / Bỏ chọn tất cả"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Khoa / Phòng</th>
                <th className="py-3 px-4">Chức Danh</th>
                <th className="py-3 px-4 text-center">Tham Gia Đào Tạo</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Không tìm thấy nhân viên nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => {
                  const count = courseCountMap.get(employee.id) || 0;
                  const isSelected = selectedIds.includes(employee.id);

                  return (
                    <tr 
                      key={employee.id} 
                      className={`transition ${
                        isSelected ? 'bg-indigo-50/60 hover:bg-indigo-50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectEmployee(employee.id)}
                          className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block text-sm">
                          {employee.fullName}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {employee.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50/80 text-indigo-700 px-2.5 py-1 rounded-md">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                          {employee.position}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onViewHistory(employee)}
                          className="inline-flex items-center gap-1 bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold px-2.5 py-1 rounded-full text-xs transition"
                          title="Xem lịch sử khóa đào tạo"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>{count} khóa</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          onClick={() => onViewHistory(employee)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition"
                          title="Xem lịch sử đào tạo"
                        >
                          <History className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => exportEmployeeHistoryCSV(employee, programs)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title="Xuất CSV lịch sử các khóa đã tham dự"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditEmployee(employee)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="Chỉnh sửa thông tin"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteEmployee(employee.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa nhân viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
          <span>Hiển thị <strong>{filteredEmployees.length}</strong> / {employees.length} nhân viên</span>
        </div>
      </div>
    </div>
  );
};
