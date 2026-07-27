import React, { useState, useRef } from 'react';
import { TrainingProgram, Employee, TrainingType } from '../types';
import { exportProgramsCSV } from '../utils/storage';
import { downloadProgramTemplateCSV, parseProgramsCSVText } from '../utils/csvImport';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Video, 
  MapPin, 
  Calendar, 
  Users, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  X,
  Download,
  Upload,
  FileText
} from 'lucide-react';

interface ProgramsViewProps {
  programs: TrainingProgram[];
  employees: Employee[];
  onAddProgram: () => void;
  onEditProgram: (program: TrainingProgram) => void;
  onDeleteProgram: (id: string) => void;
  onManageParticipants: (program: TrainingProgram) => void;
  onExportPrograms: (includeParticipants?: boolean) => void;
  onImportPrograms: (importedList: TrainingProgram[]) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({
  programs,
  employees,
  onAddProgram,
  onEditProgram,
  onDeleteProgram,
  onManageParticipants,
  onExportPrograms,
  onImportPrograms
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const imported = parseProgramsCSVText(text);
        if (imported.length > 0) {
          onImportPrograms(imported);
        } else {
          alert('Không tìm thấy dữ liệu chương trình đào tạo hợp lệ trong file. Vui lòng tải file mẫu Excel/CSV để kiểm tra cấu trúc!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredPrograms = programs.filter(prog => {
    // Text search
    const matchesSearch = 
      prog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.locationOrLink.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = !selectedType || prog.type === selectedType;

    // Date range filter
    let matchesDate = true;
    if (fromDate && prog.endDate < fromDate) {
      matchesDate = false;
    }
    if (toDate && prog.startDate > toDate) {
      matchesDate = false;
    }

    return matchesSearch && matchesType && matchesDate;
  });

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setFromDate('');
    setToDate('');
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

      {/* Top Header & Main Action */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Chương Trình Đào Tạo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý các lớp đào tạo trực tiếp & trực tuyến, nhập file Excel/CSV mẫu & xuất báo cáo chi tiết.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tải File Mẫu Excel/CSV */}
          <button
            onClick={downloadProgramTemplateCSV}
            title="Tải file mẫu Excel/CSV nhập danh sách chương trình đào tạo"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <FileText className="w-4 h-4 text-amber-600" />
            <span>Tải File Mẫu</span>
          </button>

          {/* Nhập từ File Excel/CSV */}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Tải lên file Excel/CSV để thêm hàng loạt khóa đào tạo"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <Upload className="w-4 h-4 text-sky-600" />
            <span>Nhập File Excel/CSV</span>
          </button>

          {/* Export Without Participants List */}
          <button
            onClick={() => exportProgramsCSV(filteredPrograms, employees, false)}
            title="Xuất báo cáo tổng quan chương trình đào tạo (Không kèm danh sách nhân viên)"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất Báo Cáo (Không DS NV)</span>
          </button>

          {/* Export With Detailed Participants List */}
          <button
            onClick={() => exportProgramsCSV(filteredPrograms, employees, true)}
            title="Xuất báo cáo chi tiết kèm tên danh sách nhân viên tham dự"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Xuất Chi Tiết (Có DS NV)</span>
          </button>

          <button
            onClick={onAddProgram}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Khóa Đào Tạo Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Date Range Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên khóa, mã, giảng viên, địa điểm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-700"
            >
              <option value="">Tất cả hình thức</option>
              <option value="in_person">Trực tiếp</option>
              <option value="online">Trực tuyến</option>
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={resetFilters}
            className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition flex items-center justify-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>

        {/* Date Range Picker Row (Từ ngày -> Đến ngày) */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-indigo-600" />
            Lọc theo khoảng thời gian:
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Từ ngày:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Đến ngày:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {(fromDate || toDate) && (
            <span className="text-indigo-600 font-medium text-[11px] bg-indigo-50 px-2 py-0.5 rounded">
              Đang lọc theo thời gian
            </span>
          )}
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPrograms.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
            Không tìm thấy chương trình đào tạo nào phù hợp với bộ lọc.
          </div>
        ) : (
          filteredPrograms.map((program) => {
            const isOnline = program.type === 'online';

            return (
              <div
                key={program.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                      {program.code}
                    </span>

                    {/* Format Badge */}
                    {isOnline ? (
                      <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                        <Video className="w-3 h-3" /> Trực tuyến
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Trực tiếp
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 
                    onClick={() => onManageParticipants(program)}
                    className="font-bold text-slate-900 text-base line-clamp-2 hover:text-indigo-600 transition cursor-pointer"
                  >
                    {program.title}
                  </h3>

                  {/* Program Meta */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{program.startDate} đến {program.endDate}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{program.locationOrLink}</span>
                    </div>

                    <div className="text-slate-500 text-[11px] pt-1">
                      Giảng viên: <strong className="text-slate-700">{program.instructor}</strong>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Enrolled Employees & Actions */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onManageParticipants(program)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
                    title="Quản lý nhân viên tham dự"
                  >
                    <Users className="w-4 h-4" />
                    <span>{program.participantIds.length} nhân viên tham dự</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditProgram(program)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition"
                      title="Sửa thông tin chương trình"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDeleteProgram(program.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa chương trình"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
