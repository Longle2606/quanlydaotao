/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Employee, TrainingProgram, ActiveTab } from './types';
import { supabase } from './supabaseClient'; // 👈 Import Supabase client đã tạo
import { 
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  // Show auto-dismiss notification
  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

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

  // 🔄 1. FETCH DATA TỪ SUPABASE KHI MỞ TRANG
  const fetchDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      // Lấy danh sách nhân viên từ Supabase
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select('*')
        .order('createdAt', { ascending: false });

      if (empError) console.error('Lỗi lấy danh sách nhân viên:', empError.message);
      else setEmployees(empData || []);

      // Lấy danh sách khóa đào tạo từ Supabase
      const { data: progData, error: progError } = await supabase
        .from('programs')
        .select('*')
        .order('createdAt', { ascending: false });

      if (progError) console.error('Lỗi lấy danh sách khóa học:', progError.message);
      else setPrograms(progData || []);
    } catch (err) {
      console.error('Lỗi kết nối Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDataFromSupabase();
  }, []);

  // ----------------------------------------------------
  // 👤 EMPLOYEE CRUD HANDLERS (KẾT NỐI SUPABASE)
  // ----------------------------------------------------
  const handleOpenAddEmployee = () => {
    setEmployeeToEdit(null);
    setIsEmployeeFormOpen(true);
  };

  const handleOpenEditEmployee = (emp: Employee) => {
    setEmployeeToEdit(emp);
    setIsEmployeeFormOpen(true);
  };

  const handleSaveEmployee = async (empData: Partial<Employee>) => {
    if (employeeToEdit) {
      // Update existing employee in Supabase
      const { error } = await supabase
        .from('employees')
        .update(empData)
        .eq('id', employeeToEdit.id);

      if (error) {
        notify(`Lỗi cập nhật: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã cập nhật thông tin nhân viên "${empData.fullName}"`);
      }
    } else {
      // Add new employee to Supabase
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

      const { error } = await supabase
        .from('employees')
        .insert([newEmp]);

      if (error) {
        notify(`Lỗi thêm mới: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã thêm mới nhân viên "${newEmp.fullName}"`);
      }
    }
  };

  const handleDeleteEmployee = async (empId: string) => {
    const target = employees.find(e => e.id === empId);
    if (!target) return;

    if (window.confirm(`Bạn có chắc muốn xóa nhân viên "${target.fullName}"?`)) {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', empId);

      if (error) {
        notify(`Lỗi khi xóa: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã xóa nhân viên "${target.fullName}" khỏi hệ thống.`);
      }
    }
  };

  // ----------------------------------------------------
  // 📚 TRAINING PROGRAM CRUD HANDLERS (KẾT NỐI SUPABASE)
  // ----------------------------------------------------
  const handleOpenAddProgram = () => {
    setProgramToEdit(null);
    setIsProgramFormOpen(true);
  };

  const handleOpenEditProgram = (prog: TrainingProgram) => {
    setProgramToEdit(prog);
    setIsProgramFormOpen(true);
  };

  const handleSaveProgram = async (progData: Partial<TrainingProgram>) => {
    if (programToEdit) {
      // Update existing program
      const { error } = await supabase
        .from('programs')
        .update(progData)
        .eq('id', programToEdit.id);

      if (error) {
        notify(`Lỗi cập nhật: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã cập nhật chương trình đào tạo "${progData.title}"`);
      }
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

      const { error } = await supabase
        .from('programs')
        .insert([newProg]);

      if (error) {
        notify(`Lỗi tạo khóa học: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã tạo khóa đào tạo mới "${newProg.title}"`);
      }
    }
  };

  const handleDeleteProgram = async (progId: string) => {
    const target = programs.find(p => p.id === progId);
    if (!target) return;

    if (window.confirm(`Bạn có chắc muốn xóa chương trình đào tạo "${target.title}"?`)) {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', progId);

      if (error) {
        notify(`Lỗi khi xóa: ${error.message}`);
      } else {
        fetchDataFromSupabase();
        notify(`Đã xóa chương trình đào tạo.`);
      }
    }
  };

  const handleUpdateProgramParticipants = async (programId: string, updatedParticipantIds: string[]) => {
    const { error } = await supabase
      .from('programs')
      .update({ participantIds: updatedParticipantIds })
      .eq('id', programId);

    if (error) {
      notify(`Lỗi cập nhật danh sách: ${error.message}`);
    } else {
      fetchDataFromSupabase();
      if (selectedProgramForDetail && selectedProgramForDetail.id === programId) {
        setSelectedProgramForDetail({ ...selectedProgramForDetail, participantIds: updatedParticipantIds });
      }
      notify('Đã cập nhật danh sách nhân viên tham dự khóa đào tạo.');
    }
  };

  // Import handlers
  const handleImportEmployees = async (importedList: Employee[]) => {
    const { error } = await supabase.from('employees').insert(importedList);
    if (error) notify(`Lỗi Import: ${error.message}`);
    else {
      fetchDataFromSupabase();
      notify(`Đã nhập thành công ${importedList.length} nhân viên từ file Excel/CSV!`);
    }
  };

  const handleImportPrograms = async (importedList: TrainingProgram[]) => {
    const { error } = await supabase.from('programs').insert(importedList);
    if (error) notify(`Lỗi Import: ${error.message}`);
    else {
      fetchDataFromSupabase();
      notify(`Đã nhập thành công ${importedList.length} chương trình đào tạo!`);
    }
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
        onResetData={fetchDataFromSupabase}
        onExportEmployees={() => exportEmployeesCSV(employees)}
        onExportPrograms={() => exportProgramsCSV(programs, employees)}
        onOpenAddEmployee={handleOpenAddEmployee}
        onOpenAddProgram={handleOpenAddProgram}
        totalEmployees={employees.length}
        totalPrograms={programs.length}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-bounce flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-slate-500 text-sm">
            Đang tải dữ liệu từ Supabase...
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hệ Thống Quản Lý Đào Tạo & Bồi Dưỡng Nhân Sự</span>
          <span className="text-slate-400">Đào Tạo Trực Tiếp & Trực Tuyến • Tích hợp Supabase Cloud</span>
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