import { Employee, TrainingProgram } from '../types';
import { INITIAL_EMPLOYEES, INITIAL_PROGRAMS } from '../data/initialData';

const EMPLOYEES_KEY = 'daotao_app_employees_v2';
const PROGRAMS_KEY = 'daotao_app_programs_v2';

export function loadEmployees(): Employee[] {
  try {
    const data = localStorage.getItem(EMPLOYEES_KEY);
    if (!data) {
      saveEmployees(INITIAL_EMPLOYEES);
      return INITIAL_EMPLOYEES;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading employees:', error);
    return INITIAL_EMPLOYEES;
  }
}

export function saveEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
  } catch (error) {
    console.error('Error saving employees:', error);
  }
}

export function loadPrograms(): TrainingProgram[] {
  try {
    const data = localStorage.getItem(PROGRAMS_KEY);
    if (!data) {
      savePrograms(INITIAL_PROGRAMS);
      return INITIAL_PROGRAMS;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading programs:', error);
    return INITIAL_PROGRAMS;
  }
}

export function savePrograms(programs: TrainingProgram[]): void {
  try {
    localStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error('Error saving programs:', error);
  }
}

export function resetToSampleData(): { employees: Employee[]; programs: TrainingProgram[] } {
  saveEmployees(INITIAL_EMPLOYEES);
  savePrograms(INITIAL_PROGRAMS);
  return { employees: INITIAL_EMPLOYEES, programs: INITIAL_PROGRAMS };
}

// Utility to export CSV report
export function exportEmployeesCSV(employees: Employee[], departmentName?: string): void {
  const headers = ['Họ và Tên', 'Khoa/Phòng', 'Chức Danh'];
  const rows = employees.map(e => [
    `"${e.fullName}"`,
    `"${e.department}"`,
    `"${e.position}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const suffix = departmentName ? departmentName.toLowerCase().replace(/\s+/g, '_') : 'tat_ca';
  link.setAttribute('download', `danh_sach_nhan_vien_${suffix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export training history for 1 or multiple employees
export function exportEmployeeHistoryCSV(employees: Employee | Employee[], programs: TrainingProgram[]): void {
  const empList = Array.isArray(employees) ? employees : [employees];
  if (empList.length === 0) return;

  const headers = ['Họ và Tên', 'Khoa/Phòng', 'Chức Danh', 'Mã Khóa', 'Tên Chương Trình Đào Tạo', 'Hình Thức', 'Từ Ngày', 'Đến Ngày'];
  
  const rows: string[][] = [];

  empList.forEach(emp => {
    const attendedPrograms = programs.filter(p => p.participantIds.includes(emp.id));

    if (attendedPrograms.length === 0) {
      rows.push([
        `"${emp.fullName}"`,
        `"${emp.department}"`,
        `"${emp.position}"`,
        '---',
        '"Chưa tham gia khóa nào"',
        '---',
        '---',
        '---'
      ]);
    } else {
      attendedPrograms.forEach(p => {
        const typeText = p.type === 'in_person' ? 'Trực tiếp' : 'Trực tuyến';

        rows.push([
          `"${emp.fullName}"`,
          `"${emp.department}"`,
          `"${emp.position}"`,
          p.code,
          `"${p.title}"`,
          typeText,
          p.startDate,
          p.endDate
        ]);
      });
    }
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);

  const downloadName = empList.length === 1
    ? `lich_su_dao_tao_${empList[0].fullName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`
    : `chuong_trinh_tham_du_${empList.length}_nhan_vien_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export programs CSV report - with option to exclude/include detailed participant names
export function exportProgramsCSV(programs: TrainingProgram[], employees: Employee[], includeParticipants: boolean = true): void {
  const empMap = new Map(employees.map(e => [e.id, e.fullName]));

  const headers = includeParticipants 
    ? ['Mã Khóa', 'Tên chương trình', 'Hình thức', 'Từ ngày', 'Đến ngày', 'Địa điểm/Link', 'Giảng viên', 'Số NV tham dự', 'Danh sách NV tham dự']
    : ['Mã Khóa', 'Tên chương trình', 'Hình thức', 'Từ ngày', 'Đến ngày', 'Địa điểm/Link', 'Giảng viên', 'Số NV tham dự'];

  const rows = programs.map(p => {
    const typeText = p.type === 'in_person' ? 'Trực tiếp' : 'Trực tuyến';

    const baseRow = [
      p.code,
      `"${p.title}"`,
      typeText,
      p.startDate,
      p.endDate,
      `"${p.locationOrLink}"`,
      `"${p.instructor}"`,
      p.participantIds.length
    ];

    if (includeParticipants) {
      const participantsList = p.participantIds.map(id => empMap.get(id) || id).join('; ');
      baseRow.push(`"${participantsList}"`);
    }

    return baseRow;
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const suffix = includeParticipants ? 'chi_tiet' : 'tong_quan';
  link.setAttribute('download', `bao_cao_dao_tao_${suffix}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
