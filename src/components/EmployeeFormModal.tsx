import React, { useState, useEffect, useRef } from 'react';
import { Employee } from '../types';
import { DEPARTMENTS, POSITIONS } from '../data/initialData';
import { X, UserPlus, Save, Building2, Briefcase, Search, Check, ChevronDown } from 'lucide-react';

interface EmployeeFormModalProps {
  isOpen: boolean;
  employeeToEdit: Employee | null;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => void;
}

export const EmployeeFormModal: React.FC<EmployeeFormModalProps> = ({
  isOpen,
  employeeToEdit,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [position, setPosition] = useState(POSITIONS[0]);

  // Searchable Department dropdown state
  const [deptSearch, setDeptSearch] = useState('');
  const [isDeptOpen, setIsDeptOpen] = useState(false);
  const deptDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (employeeToEdit) {
      setFullName(employeeToEdit.fullName);
      setDepartment(employeeToEdit.department || DEPARTMENTS[0]);
      setDeptSearch(employeeToEdit.department || DEPARTMENTS[0]);
      setPosition(POSITIONS.includes(employeeToEdit.position) ? employeeToEdit.position : 'Khác');
    } else {
      setFullName('');
      setDepartment(DEPARTMENTS[0]);
      setDeptSearch(DEPARTMENTS[0]);
      setPosition('Bác sĩ');
    }
  }, [employeeToEdit, isOpen]);

  // Click outside listener for department dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target as Node)) {
        setIsDeptOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDepartments = DEPARTMENTS.filter(d => 
    d.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    // Use department from deptSearch or fallback
    const finalDept = deptSearch.trim() || department || DEPARTMENTS[0];

    onSave({
      fullName: fullName.trim(),
      department: finalDept,
      position
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-fade-in">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-inner">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {employeeToEdit ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
              </h3>
              <p className="text-xs text-slate-400">Nhập thông tin họ tên, khoa/phòng và chức danh nhân sự</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          {/* Họ và Tên */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 text-xs">Họ và Tên Nhân Viên *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white font-medium text-slate-900 text-xs transition"
              placeholder="Nhập đầy đủ họ và tên (VD: Nguyễn Văn An)..."
            />
          </div>

          {/* Khoa / Phòng với Tìm Kiếm Trực Tiếp */}
          <div className="relative" ref={deptDropdownRef}>
            <label className="block font-semibold text-slate-800 mb-1.5 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                Khoa / Phòng *
              </span>
              <span className="text-[11px] text-indigo-600 font-normal">Gõ từ khóa để tìm nhanh</span>
            </label>

            <div className="relative">
              <input
                type="text"
                required
                value={deptSearch}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setIsDeptOpen(true);
                }}
                onFocus={() => setIsDeptOpen(true)}
                placeholder="Nhập hoặc gõ từ khóa để tìm Khoa/Phòng..."
                className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900 font-medium transition text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setIsDeptOpen(!isDeptOpen)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDeptOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Dropdown Options List */}
            {isDeptOpen && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100">
                {filteredDepartments.length === 0 ? (
                  <div className="p-3 text-slate-500 text-center text-xs">
                    Không tìm thấy khoa/phòng phù hợp.
                  </div>
                ) : (
                  filteredDepartments.map((deptName) => {
                    const isSelected = deptName === deptSearch;
                    return (
                      <div
                        key={deptName}
                        onClick={() => {
                          setDepartment(deptName);
                          setDeptSearch(deptName);
                          setIsDeptOpen(false);
                        }}
                        className={`px-3.5 py-2.5 cursor-pointer text-xs flex items-center justify-between transition ${
                          isSelected ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span>{deptName}</span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Chức Danh (Bác sĩ, Điều dưỡng, Khác) */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 text-xs flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              Chức Danh *
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {POSITIONS.map((pos) => {
                const isChecked = position === pos;
                return (
                  <label
                    key={pos}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition text-xs font-semibold ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/80 text-indigo-800 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="position"
                      value={pos}
                      checked={isChecked}
                      onChange={() => setPosition(pos)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>{pos}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition text-xs"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{employeeToEdit ? 'Lưu Thay Đổi' : 'Thêm Nhân Viên'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

