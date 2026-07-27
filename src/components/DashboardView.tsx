import React, { useState } from 'react';
import { Employee, TrainingProgram } from '../types';
import { 
  Users, 
  BookOpen, 
  Video, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Building2, 
  Award, 
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  Filter
} from 'lucide-react';

interface DashboardViewProps {
  employees: Employee[];
  programs: TrainingProgram[];
  onSelectProgram: (program: TrainingProgram) => void;
  onGoToPrograms: () => void;
  onGoToEmployees: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  employees,
  programs,
  onSelectProgram,
  onGoToPrograms,
  onGoToEmployees
}) => {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Extract list of all available years from programs
  const availableYears = Array.from<string>(
    new Set(
      programs
        .map(p => p.startDate ? p.startDate.slice(0, 4) : new Date().getFullYear().toString())
        .filter((y): y is string => Boolean(y) && y.length === 4)
    )
  ).sort((a: string, b: string) => b.localeCompare(a));

  // If no year found, default to current year
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString());
  }

  // Calculate year breakdown stats
  const yearStatsMap: Record<string, {
    inPerson: number;
    online: number;
    total: number;
    totalParticipants: number;
  }> = {};

  programs.forEach(p => {
    const year = p.startDate ? p.startDate.slice(0, 4) : '2026';
    if (!yearStatsMap[year]) {
      yearStatsMap[year] = {
        inPerson: 0,
        online: 0,
        total: 0,
        totalParticipants: 0
      };
    }

    if (p.type === 'in_person') yearStatsMap[year].inPerson += 1;
    else if (p.type === 'online') yearStatsMap[year].online += 1;

    yearStatsMap[year].total += 1;
    yearStatsMap[year].totalParticipants += p.participantIds.length;
  });

  const yearStatsList = Object.keys(yearStatsMap)
    .sort((a, b) => b.localeCompare(a))
    .map(year => ({
      year,
      ...yearStatsMap[year]
    }));

  // Filter programs based on selected year for summary metrics
  const filteredPrograms = selectedYear === 'all' 
    ? programs 
    : programs.filter(p => (p.startDate ? p.startDate.slice(0, 4) : '2026') === selectedYear);

  const activeEmployees = employees;
  const inPersonPrograms = filteredPrograms.filter(p => p.type === 'in_person');
  const onlinePrograms = filteredPrograms.filter(p => p.type === 'online');

  // Compute unique participants total
  const uniqueParticipants = new Set(filteredPrograms.flatMap(p => p.participantIds)).size;

  // Department participation stats
  const deptMap: Record<string, { total: number; trained: number }> = {};
  
  employees.forEach(emp => {
    if (!deptMap[emp.department]) {
      deptMap[emp.department] = { total: 0, trained: 0 };
    }
    deptMap[emp.department].total += 1;
  });

  const empInProgramsSet = new Map<string, number>();
  filteredPrograms.forEach(p => {
    p.participantIds.forEach(id => {
      empInProgramsSet.set(id, (empInProgramsSet.get(id) || 0) + 1);
    });
  });

  employees.forEach(emp => {
    if (empInProgramsSet.has(emp.id) && deptMap[emp.department]) {
      deptMap[emp.department].trained += 1;
    }
  });

  const deptList = Object.entries(deptMap).map(([dept, data]) => ({
    department: dept,
    total: data.total,
    trained: data.trained,
    rate: Math.round((data.trained / (data.total || 1)) * 100)
  }));

  // Top active training participants
  const topParticipants = employees
    .map(e => ({
      ...e,
      courseCount: empInProgramsSet.get(e.id) || 0
    }))
    .sort((a, b) => b.courseCount - a.courseCount)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Hero Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30 font-medium mb-3">
              <TrendingUp className="w-3.5 h-3.5" /> Thống kê Tổng quan Công tác Đào tạo
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Tổng quan Hoạt động Bồi dưỡng & Đào tạo
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Theo dõi số lượng khóa học trực tiếp & trực tuyến hiển thị chi tiết theo từng năm, khoa/phòng và chức danh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Year Selector */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-2">
              <span className="text-xs text-slate-300 flex items-center gap-1 pl-2 font-medium">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Năm:
              </span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="all">Tất cả các năm</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onGoToPrograms}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm px-4 py-2.5 rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <span>Xem danh sách Đào tạo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div 
          onClick={onGoToEmployees}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nhân viên
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{activeEmployees.length}</span>
            <span className="text-xs text-slate-500">nhân sự</span>
          </div>
        </div>

        {/* Total Programs */}
        <div 
          onClick={onGoToPrograms}
          className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Khóa Đào tạo {selectedYear !== 'all' ? `(${selectedYear})` : ''}
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{filteredPrograms.length}</span>
            <span className="text-xs text-slate-500">chương trình</span>
          </div>
        </div>

        {/* In-Person Training */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đào tạo Trực tiếp {selectedYear !== 'all' ? `(${selectedYear})` : ''}
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-700">{inPersonPrograms.length}</span>
            <span className="text-xs text-slate-500">khóa học</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Tổ chức tập trung tại hội trường / phòng huấn luyện
          </p>
        </div>

        {/* Online Training */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Đào tạo Trực tuyến {selectedYear !== 'all' ? `(${selectedYear})` : ''}
            </span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-sky-700">{onlinePrograms.length}</span>
            <span className="text-xs text-slate-500">khóa học</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Học E-learning, Zoom, MS Teams, Google Meet
          </p>
        </div>
      </div>

      {/* SECTION: Yearly Summary Overview Table & Breakdown Cards (Requirement: Thống kê số lượng Đào tạo Trực tiếp & Trực tuyến theo NĂM) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Tổng Quan Số Lượng Đào Tạo Trực Tiếp & Trực Tuyến Theo Năm
            </h3>
            <p className="text-xs text-slate-500">
              Bảng thống kê chi tiết hình thức đào tạo (Trực tiếp, Trực tuyến) và lượt nhân viên tham dự theo từng năm.
            </p>
          </div>
          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 font-semibold px-3 py-1 rounded-full self-start sm:self-auto">
            {yearStatsList.length} năm đào tạo
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-3 px-4">Năm</th>
                <th className="py-3 px-4 text-center">Đào Tạo Trực Tiếp</th>
                <th className="py-3 px-4 text-center">Đào Tạo Trực Tuyến</th>
                <th className="py-3 px-4 text-center">Tổng Số Khóa</th>
                <th className="py-3 px-4 text-right">Lượt NV Tham Gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {yearStatsList.map(item => (
                <tr 
                  key={item.year} 
                  className={`hover:bg-slate-50 transition cursor-pointer ${selectedYear === item.year ? 'bg-indigo-50/50 font-semibold' : ''}`}
                  onClick={() => setSelectedYear(item.year)}
                >
                  <td className="py-3.5 px-4 font-extrabold text-indigo-900 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Năm {item.year}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {item.inPerson} khóa
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-800 border border-sky-200 px-3 py-1 rounded-full font-bold">
                      <Video className="w-3 h-3 text-sky-600" />
                      {item.online} khóa
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-extrabold text-slate-900 text-sm">
                    {item.total} khóa
                  </td>

                  <td className="py-3.5 px-4 text-right font-extrabold text-indigo-700 text-sm">
                    {item.totalParticipants} lượt NV
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Section: Programs Timeline & Department Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active & Upcoming Programs */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Danh Sách Chương Trình Đào Tạo {selectedYear !== 'all' ? `(Năm ${selectedYear})` : ''}
              </h3>
              <p className="text-xs text-slate-500">Các chương trình đào tạo gần đây</p>
            </div>
            <button 
              onClick={onGoToPrograms}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {filteredPrograms.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              Hiện chưa có khóa đào tạo nào trong khoảng thời gian này.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrograms.slice(0, 5).map(program => {
                const isOnline = program.type === 'online';

                return (
                  <div
                    key={program.id}
                    onClick={() => onSelectProgram(program)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {program.code}
                        </span>
                        
                        {/* Format badge */}
                        {isOnline ? (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                            <Video className="w-3 h-3" /> Trực tuyến
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Trực tiếp
                          </span>
                        )}
                      </div>

                      <h4 className="font-semibold text-slate-900 text-sm hover:text-indigo-600 transition">
                        {program.title}
                      </h4>

                      <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {program.startDate} đến {program.endDate}
                        </span>
                        <span className="flex items-center gap-1 max-w-xs truncate">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {program.locationOrLink}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Số NV tham dự</span>
                        <span className="text-sm font-bold text-indigo-700">
                          {program.participantIds.length} NV
                        </span>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Department Stats & Top Active Trainees */}
        <div className="space-y-6">
          {/* Department Training Rates */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Tỷ lệ Tham gia theo Khoa/Phòng
            </h3>
            <div className="space-y-3">
              {deptList.slice(0, 5).map(item => (
                <div key={item.department} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-700 truncate max-w-[170px]" title={item.department}>
                      {item.department}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {item.trained}/{item.total} NV ({item.rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(item.rate, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Participants */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" />
              Nhân viên Tích cực Đào tạo
            </h3>
            <div className="divide-y divide-slate-100">
              {topParticipants.map(emp => (
                <div key={emp.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 block">{emp.fullName}</span>
                    <span className="text-slate-500">{emp.position} • {emp.department}</span>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full text-xs shrink-0">
                    {emp.courseCount} khóa
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
