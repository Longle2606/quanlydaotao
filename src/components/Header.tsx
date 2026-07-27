import React from 'react';
import { ActiveTab } from '../types';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  BarChart3, 
  RotateCcw, 
  Download,
  Plus,
  LogOut,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onResetData: () => void;
  onExportEmployees: () => void;
  onExportPrograms: () => void;
  onOpenAddEmployee: () => void;
  onOpenAddProgram: () => void;
  totalEmployees: number;
  totalPrograms: number;
  currentUser?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetData,
  onExportEmployees,
  onExportPrograms,
  onOpenAddEmployee,
  onOpenAddProgram,
  totalEmployees,
  totalPrograms,
  currentUser = 'Quản trị viên',
  onLogout
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Quản Lý Đào Tạo
                <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium px-2 py-0.5 rounded-full">
                  Hệ thống Đào tạo & Bồi dưỡng
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Quản lý nhân viên, khoa/phòng, chức danh & lịch đào tạo trực tiếp / trực tuyến
              </p>
            </div>
          </div>

          {/* Quick Actions & Tools */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 mr-2">
              <button
                onClick={onExportEmployees}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1.5"
                title="Xuất CSV Nhân viên"
              >
                <Download className="w-3.5 h-3.5 text-sky-400" />
                <span>Xuất NV</span>
              </button>
              <button
                onClick={onExportPrograms}
                className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-700 rounded transition flex items-center gap-1.5"
                title="Xuất CSV Đào tạo"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Xuất Đào tạo</span>
              </button>
              <button
                onClick={onResetData}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-amber-300 hover:bg-slate-700 rounded transition flex items-center gap-1.5"
                title="Khôi phục dữ liệu mẫu ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Nạp mẫu</span>
              </button>
            </div>

            {/* Quick Add Buttons */}
            {activeTab === 'employees' ? (
              <button
                onClick={onOpenAddEmployee}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm nhân viên</span>
              </button>
            ) : activeTab === 'programs' ? (
              <button
                onClick={onOpenAddProgram}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo chương trình</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onOpenAddEmployee}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-2.5 py-2 rounded-lg transition flex items-center gap-1 border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Nhân viên</span>
                </button>
                <button
                  onClick={onOpenAddProgram}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo khóa đào tạo</span>
                </button>
              </div>
            )}

            {/* Logout & User Profile */}
            {onLogout && (
              <div className="flex items-center gap-2 border-l border-slate-800 pl-2 ml-1">
                <div className="hidden lg:flex items-center gap-1.5 text-xs text-indigo-300 font-medium bg-indigo-950/60 border border-indigo-800/60 px-2.5 py-1 rounded-lg">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{currentUser}</span>
                </div>
                <button
                  onClick={onLogout}
                  title="Đăng xuất khỏi hệ thống"
                  className="bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-medium px-2.5 py-2 rounded-lg transition border border-slate-700/80 flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-2 pb-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Tổng quan</span>
          </button>

          <button
            onClick={() => setActiveTab('employees')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'employees'
                ? 'bg-slate-800 text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Nhân viên</span>
            <span className="ml-1 bg-slate-700/80 text-slate-300 text-xs px-2 py-0.5 rounded-full font-sans">
              {totalEmployees}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition border-b-2 ${
              activeTab === 'programs'
                ? 'bg-slate-800 text-indigo-400 border-indigo-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Chương trình Đào tạo</span>
            <span className="ml-1 bg-slate-700/80 text-slate-300 text-xs px-2 py-0.5 rounded-full font-sans">
              {totalPrograms}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
