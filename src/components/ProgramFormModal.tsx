import React, { useState, useEffect } from 'react';
import { TrainingProgram, Employee, TrainingType } from '../types';
import { X, BookOpen, Save, Calendar, Video, MapPin, Users, Building2, Search } from 'lucide-react';

interface ProgramFormModalProps {
  isOpen: boolean;
  programToEdit: TrainingProgram | null;
  employees: Employee[];
  onClose: () => void;
  onSave: (programData: Partial<TrainingProgram>) => void;
}

export const ProgramFormModal: React.FC<ProgramFormModalProps> = ({
  isOpen,
  programToEdit,
  employees,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<TrainingType>('in_person');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [locationOrLink, setLocationOrLink] = useState('');
  const [instructor, setInstructor] = useState('');
  const [description, setDescription] = useState('');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (programToEdit) {
      setTitle(programToEdit.title || '');
      setCode(programToEdit.code || '');
      setType(programToEdit.type || 'in_person');
      setStartDate(programToEdit.startDate || '');
      setEndDate(programToEdit.endDate || '');
      setLocationOrLink(programToEdit.locationOrLink || '');
      setInstructor(programToEdit.instructor || '');
      setDescription(programToEdit.description || '');
      setSelectedParticipantIds(programToEdit.participantIds || []);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setTitle('');
      setCode(`DT2026-${Math.floor(10 + Math.random() * 90)}`);
      setType('in_person');
      setStartDate(today);
      setEndDate(today);
      setLocationOrLink('Hội trường lớn A');
      setInstructor('Hội đồng Khoa học & Đào tạo');
      setDescription('');
      setSelectedParticipantIds([]);
    }
    setSearchTerm('');
  }, [programToEdit, isOpen]);

  const toggleParticipant = (empId: string) => {
    if (selectedParticipantIds.includes(empId)) {
      setSelectedParticipantIds(selectedParticipantIds.filter(id => id !== empId));
    } else {
      setSelectedParticipantIds([...selectedParticipantIds, empId]);
    }
  };

  const selectAllDepartment = (deptEmpIds: string[]) => {
    const allSelected = deptEmpIds.every(id => selectedParticipantIds.includes(id));
    if (allSelected) {
      setSelectedParticipantIds(selectedParticipantIds.filter(id => !deptEmpIds.includes(id)));
    } else {
      setSelectedParticipantIds(Array.from(new Set([...selectedParticipantIds, ...deptEmpIds])));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      code: code.trim() || `DT2026-01`,
      type,
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || startDate || new Date().toISOString().slice(0, 10),
      locationOrLink: locationOrLink.trim() || (type === 'online' ? 'https://zoom.us/j/...' : 'Hội trường'),
      instructor: instructor.trim() || 'Ban Đào tạo',
      description: description.trim(),
      participantIds: selectedParticipantIds
    });
    onClose();
  };

  // Hàm loại bỏ dấu tiếng Việt an toàn
  const removeAccents = (str: string) => {
    if (!str) return '';
    return String(str)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  };

  const cleanSearchTerm = removeAccents(searchTerm).toLowerCase().trim();

  // Lọc danh sách nhân viên
  const filteredEmployees = (employees || []).filter((emp: Record<string, any>) => {
    if (!cleanSearchTerm) return true;

    const name = removeAccents(emp.fullName || emp.full_name || emp['Họ và Tên'] || '').toLowerCase();
    const dept = removeAccents(emp.department || emp['Khoa/Phòng'] || '').toLowerCase();
    const pos = removeAccents(emp.position || emp['Chức Danh'] || '').toLowerCase();
    const codeVal = removeAccents(emp.code || emp.id || '').toLowerCase();

    return name.includes(cleanSearchTerm) || dept.includes(cleanSearchTerm) || pos.includes(cleanSearchTerm) || codeVal.includes(cleanSearchTerm);
  });

  // Nhóm theo Khoa/Phòng
  const deptGroups = filteredEmployees.reduce((acc: Record<string, Record<string, any>[]>, emp: Record<string, any>) => {
    const deptName = emp.department || emp['Khoa/Phòng'] || 'Chưa phân khoa';
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(emp);
    return acc;
  }, {});

  const filteredDepts = Object.keys(deptGroups);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {programToEdit ? 'Chỉnh Sửa Chương Trình Đào Tạo' : 'Tạo Chương Trình Đào Tạo Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Thiết lập hình thức, thời gian và gán danh sách nhân viên.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
          {/* Tên chương trình */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Nội Dung / Tên Chương Trình Đào Tạo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 text-xs"
              placeholder="Nhập tên chương trình đào tạo..."
            />
          </div>

          {/* Hình Thức Đào Tạo */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-800 mb-2">Hình Thức Đào Tạo *</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                type === 'in_person' 
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="in_person"
                  checked={type === 'in_person'}
                  onChange={() => setType('in_person')}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="block">Trực Tiếp</span>
                  <span className="text-[10px] text-slate-500 font-normal">Tập trung tại hội trường</span>
                </div>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
                type === 'online' 
                  ? 'bg-sky-50 border-sky-500 text-sky-900 font-bold' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}>
                <input
                  type="radio"
                  name="type"
                  value="online"
                  checked={type === 'online'}
                  onChange={() => setType('online')}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <Video className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="block">Trực Tuyến</span>
                  <span className="text-[10px] text-slate-500 font-normal">Qua Zoom, MS Teams</span>
                </div>
              </label>
            </div>
          </div>

          {/* Ngày tháng */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Từ Ngày *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate < e.target.value) setEndDate(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                Đến Ngày *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Đơn vị tổ chức */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Đơn Vị Tổ Chức / Giảng Viên *
            </label>
            <input
              type="text"
              required
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium"
              placeholder="Nhập tên đơn vị/giảng viên..."
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Mục tiêu & Nội dung Đào tạo</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
              placeholder="Mục tiêu khóa học..."
            />
          </div>

          {/* Danh sách nhân viên & Tìm kiếm */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <label className="block font-bold text-slate-900 text-xs flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Gán Nhân Viên Tham Dự Khóa Học
                </label>
                <p className="text-[11px] text-slate-500">
                  Đã chọn: <strong className="text-indigo-600">{selectedParticipantIds.length}</strong> / {employees.length} nhân viên
                </p>
              </div>

              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Gõ tên nhân viên hoặc khoa/phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {filteredDepts.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  Không tìm thấy nhân viên phù hợp
                </div>
              ) : (
                filteredDepts.map(dept => {
                  const emps = deptGroups[dept];
                  const deptEmpIds = emps.map((e: Record<string, any>) => String(e.id));
                  const allSelected = deptEmpIds.length > 0 && deptEmpIds.every(id => selectedParticipantIds.includes(id));

                  return (
                    <div key={dept} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {dept} ({emps.length} NV)
                        </span>
                        <button
                          type="button"
                          onClick={() => selectAllDepartment(deptEmpIds)}
                          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded transition"
                        >
                          {allSelected ? 'Bỏ chọn cả khoa' : 'Chọn toàn bộ khoa'}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {emps.map((emp: Record<string, any>) => {
                          const empIdStr = String(emp.id);
                          const isChecked = selectedParticipantIds.includes(empIdStr);
                          const empName = emp.fullName || emp.full_name || emp['Họ và Tên'] || 'Không tên';
                          const empPos = emp.position || emp['Chức Danh'] || '';

                          return (
                            <label
                              key={empIdStr}
                              className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition text-[11px] ${
                                isChecked ? 'bg-emerald-50/80 text-emerald-950 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleParticipant(empIdStr)}
                                className="mt-0.5 text-emerald-600 rounded focus:ring-emerald-500"
                              />
                              <div>
                                <span>{empName}</span>
                                {empPos && <span className="block text-[10px] text-slate-500 font-normal">{empPos}</span>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Save className="w-4 h-4" />
              <span>{programToEdit ? 'Lưu Khóa Học' : 'Tạo Khóa Đào Tạo'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};