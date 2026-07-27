/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Employee, TrainingProgram, ActiveTab } from './types';
import { 
  loadEmployees, 
  saveEmployees, 
  loadPrograms, 
  savePrograms, 
  resetToSampleData,
  exportEmployeesCSV,
  exportProgramsCSV
} from './utils/storage';

import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { ProgramsView } from './components/ProgramsView';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { EmployeeHistoryModal } from './components/EmployeeHistoryModal';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { ProgramFormModal } from './components/ProgramFormModal';
import { LoginView } from './components/LoginView';

export default function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('training_app_auth') === 'true';
  });
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem('training_app_user') || 'Quản trị viên';
  });

  // Modals state
  const [selectedProgramForDetail, setSelectedProgramForDetail] = useState<TrainingProgram | null>(null);
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] = useState<Employee | null>(null);

  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const [isProgramFormOpen, setIsProgramFormOpen] = useState(false);
  const [programToEdit, setProgramToEdit] = useState<TrainingProgram | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Auth Handlers
  const handleLoginSuccess = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
    localStorage.setItem('training_app_auth', 'true');
    localStorage.setItem('training_app_user', username);
    notify(`Xin chào, ${username}! Đã đăng nhập thành công.`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('training_app_auth');
    localStorage.removeItem('training_app_user');
  };

  // Load initial data
  useEffect(() => {
    localStorage.removeItem('daotao_app_employees_v1');
    localStorage.removeItem('daotao_app_programs_v1');
    const loadedEmps = loadEmployees();
    const loadedProgs = loadPrograms();
    setEmployees(loadedEmps);
    setPrograms(loadedProgs);
  }, []);

  // Show auto-dismiss notification
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Sync state & local storage
  const updateEmployees = (newEmps: Employee[]) => {
    setEmployees(newEmps);
    saveEmployees(newEmps);
  };

  const updatePrograms = (newProgs: TrainingProgram[]) => {
    setPrograms(newProgs);
    savePrograms(newProgs);
  };

  // Reset demo data handler
  const handleResetData = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu?')) {
      const { employees: initialEmps, programs: initialProgs } = resetToSampleData();
      setEmployees(initialEmps);
      setPrograms(initialProgs);
      notify('Đã khôi phục dữ liệu mẫu ban đầu thành công!');
    }
  };

  // Employee CRUD handlers
  const handleOpenAddEmployee = () => {
    setEmployeeToEdit(null);
    setIsEmployeeFormOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEmployeeFormOpen(true);
  };

  const handleSaveEmployee = (empData: Partial<Employee>) => {
    if (employeeToEdit) {
      // Update existing
      const updated = employees.map(e => e.id === employeeToEdit.id ? { ...e, ...empData } as Employee : e);
      updateEmployees(updated);
      notify(`Đã cập nhật thông tin nhân viên "${empData.fullName}"`);
    } else {
      // Add new
      const newEmp: Employee = {
        id: `emp-${Date.now()}`,
        code: empData.code || `NV${Math.floor(100 + Math.random() * 900)}`,
        fullName: empData.fullName || 'Nhân viên mới',
        department: empData.department || 'Khoa/Phòng',
        position: empData.position || 'Chức danh',
        email: empData.email,
        phone: empData.phone,
        status: empData.status || 'active',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      updateEmployees([newEmp, ...employees]);
      notify(`Đã thêm mới nhân viên "${newEmp.fullName}"`);
    }
  };

  const handleDeleteEmployee = (empId: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;

    if (window.confirm(`Bạn có chắc muốn xóa nhân viên "${target.fullName}"?`)) {
      const filtered = employees.filter(e => e.id !== empId);
      updateEmployees(filtered);

      // Also clean up from program participant lists
      const updatedProgs = programs.map(p => ({
        ...p,
        participantIds: p.participantIds.filter(id => id !== empId)
      }));
      updatePrograms(updatedProgs);

      notify(`Đã xóa nhân viên "${target.fullName}" khỏi hệ thống.`);
    }
  };

  // Training Program CRUD handlers
  const handleOpenAddProgram = () => {
    setProgramToEdit(null);
    setIsProgramFormOpen(true);
  };

  const handleOpenEditProgram = (prog: TrainingProgram) => {
    setProgramToEdit(prog);
    setIsProgramFormOpen(true);
  };

  const handleSaveProgram = (progData: Partial<TrainingProgram>) => {
    if (programToEdit) {
      // Update existing program
      const updated = programs.map(p => p.id === programToEdit.id ? { ...p, ...progData } as TrainingProgram : p);
      updatePrograms(updated);
      notify(`Đã cập nhật chương trình đào tạo "${progData.title}"`);
    } else {
      // Add new program
      const newProg: TrainingProgram = {
        id: `prog-${Date.now()}`,
        code: progData.code || `DT2026-${Math.floor(10 + Math.random() * 90)}`,
        title: progData.title || 'Chương trình đào tạo mới',
        type: progData.type || 'in_person',
        startDate: progData.startDate || new Date().toISOString().slice(0, 10),
        endDate: progData.endDate || new Date().toISOString().slice(0, 10),
        locationOrLink: progData.locationOrLink || 'Hội trường',
        instructor: progData.instructor || 'Ban Đào Tạo',
        description: progData.description,
        participantIds: progData.participantIds || [],
        status: progData.status || 'upcoming',
        createdAt: new Date().toISOString().slice(0, 10)
      };
      updatePrograms([newProg, ...programs]);
      notify(`Đã tạo khóa đào tạo mới "${newProg.title}"`);
    }
  };

  const handleDeleteProgram = (progId: string) => {
    const target = programs.find(p => p.id === progId);
    if (!target) return;

    if (window.confirm(`Bạn có chắc muốn xóa chương trình đào tạo "${target.title}"?`)) {
      const filtered = programs.filter(p => p.id !== progId);
      updatePrograms(filtered);
      notify(`Đã xóa chương trình đào tạo.`);
    }
  };

  // Update participant list for a specific program
  const handleUpdateProgramParticipants = (programId: string, updatedParticipantIds: string[]) => {
    const updated = programs.map(p => p.id === programId ? { ...p, participantIds: updatedParticipantIds } : p);
    updatePrograms(updated);

    // Keep detail modal state fresh
    if (selectedProgramForDetail && selectedProgramForDetail.id === programId) {
      setSelectedProgramForDetail({ ...selectedProgramForDetail, participantIds: updatedParticipantIds });
    }
    notify('Đã cập nhật danh sách nhân viên tham dự khóa đào tạo.');
  };

  // Import handlers for Excel/CSV
  const handleImportEmployees = (importedList: Employee[]) => {
    const updated = [...importedList, ...employees];
    updateEmployees(updated);
    notify(`Đã nhập thành công ${importedList.length} nhân viên từ file Excel/CSV!`);
  };

  const handleImportPrograms = (importedList: TrainingProgram[]) => {
    const updated = [...importedList, ...programs];
    updatePrograms(updated);
    notify(`Đã nhập thành công ${importedList.length} chương trình đào tạo từ file Excel/CSV!`);
  };

  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* Top Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onResetData={handleResetData}
        onExportEmployees={() => exportEmployeesCSV(employees)}
        onExportPrograms={() => exportProgramsCSV(programs, employees)}
        onOpenAddEmployee={handleOpenAddEmployee}
        onOpenAddProgram={handleOpenAddProgram}
        totalEmployees={employees.length}
        totalPrograms={programs.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-bounce flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            employees={employees}
            programs={programs}
            onSelectProgram={(prog) => setSelectedProgramForDetail(prog)}
            onGoToPrograms={() => setActiveTab('programs')}
            onGoToEmployees={() => setActiveTab('employees')}
          />
        )}

        {activeTab === 'employees' && (
          <EmployeesView
            employees={employees}
            programs={programs}
            onAddEmployee={handleOpenAddEmployee}
            onEditEmployee={handleOpenEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onViewHistory={(emp) => setSelectedEmployeeForHistory(emp)}
            onExportEmployees={(dept) => exportEmployeesCSV(employees, dept)}
            onImportEmployees={handleImportEmployees}
          />
        )}

        {activeTab === 'programs' && (
          <ProgramsView
            programs={programs}
            employees={employees}
            onAddProgram={handleOpenAddProgram}
            onEditProgram={handleOpenEditProgram}
            onDeleteProgram={handleDeleteProgram}
            onManageParticipants={(prog) => setSelectedProgramForDetail(prog)}
            onExportPrograms={() => exportProgramsCSV(programs, employees)}
            onImportPrograms={handleImportPrograms}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hệ Thống Quản Lý Đào Tạo & Bồi Dưỡng Nhân Sự</span>
          <span className="text-slate-400">Đào Tạo Trực Tiếp & Trực Tuyến • Tích hợp báo cáo CSV</span>
        </div>
      </footer>

      {/* Modals */}
      <ProgramDetailModal
        program={selectedProgramForDetail}
        employees={employees}
        onClose={() => setSelectedProgramForDetail(null)}
        onUpdateParticipants={handleUpdateProgramParticipants}
      />

      <EmployeeHistoryModal
        employee={selectedEmployeeForHistory}
        programs={programs}
        onClose={() => setSelectedEmployeeForHistory(null)}
      />

      <EmployeeFormModal
        isOpen={isEmployeeFormOpen}
        employeeToEdit={employeeToEdit}
        onClose={() => setIsEmployeeFormOpen(false)}
        onSave={handleSaveEmployee}
      />

      <ProgramFormModal
        isOpen={isProgramFormOpen}
        programToEdit={programToEdit}
        employees={employees}
        onClose={() => setIsProgramFormOpen(false)}
        onSave={handleSaveProgram}
      />
    </div>
  );
}
