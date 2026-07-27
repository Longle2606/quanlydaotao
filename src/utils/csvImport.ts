import { Employee, TrainingProgram, TrainingType } from '../types';

// Download sample Excel/CSV template for importing Employees
export function downloadEmployeeTemplateCSV(): void {
  const headers = ['Họ và Tên', 'Khoa/Phòng', 'Chức Danh'];
  const sampleRows = [
    ['Nguyễn Thị Mai', 'Khoa Nội Tổng quát', 'Điều dưỡng'],
    ['Trần Văn Nam', 'Khoa cấp cứu', 'Bác sĩ'],
    ['Lê Phương Thảo', 'Khoa Dược', 'Khác']
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...sampleRows.map(r => r.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'mau_nhap_nhan_vien.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Download sample Excel/CSV template for importing Training Programs
export function downloadProgramTemplateCSV(): void {
  const headers = ['Mã Khóa', 'Tên Chương Trình Đào Tạo', 'Hình Thức', 'Từ Ngày', 'Đến Ngày', 'Địa Điểm Hoặc Link', 'Giảng Viên', 'Mô Tả'];
  const sampleRows = [
    [
      'DT2026-06',
      'Tập huấn Cấp cứu Ngừng tuần hoàn nâng cao 2026',
      'Trực tiếp',
      '2026-09-01',
      '2026-09-03',
      'Hội trường A - Tầng 3',
      'ThS.BS Trần Văn Nam - Bệnh viện Chợ Rẫy',
      'Huấn luyện kỹ năng thực hành ép tim, sốc điện và hồi sức hô hấp tuần hoàn'
    ],
    [
      'DT2026-07',
      'Cập nhật Quy định về Kế đơn thuốc điện tử & An toàn người bệnh',
      'Trực tuyến',
      '2026-09-10',
      '2026-09-12',
      'https://zoom.us/j/999888777',
      'Hội đồng Dược lâm sàng',
      'Hướng dẫn tuân thủ quy chế kê đơn thuốc điện tử quốc gia'
    ]
  ];

  const csvContent = '\uFEFF' + [
    headers.join(','),
    ...sampleRows.map(r => r.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'mau_nhap_chuong_trinh_dao_tao.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper to split CSV row respecting quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

// Parse CSV string into list of Employees
export function parseEmployeesCSVText(csvText: string): Employee[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  // Ignore header line
  const dataLines = lines.slice(1);
  const newEmployees: Employee[] = [];

  dataLines.forEach((line, index) => {
    const cols = parseCSVLine(line);
    if (cols.length < 1) return;

    let fullName = '';
    let department = 'Khoa Khám bệnh';
    let position = 'Khác';

    // Handle 3-column format [Họ tên, Khoa/Phòng, Chức danh] or legacy [Mã, Họ tên, Khoa/Phòng, Chức danh...]
    if (cols.length >= 3 && (cols[0].startsWith('NV') || cols[0].startsWith('emp'))) {
      fullName = cols[1];
      department = cols[2] || 'Khoa Khám bệnh';
      position = cols[3] || 'Khác';
    } else {
      fullName = cols[0];
      department = cols[1] || 'Khoa Khám bệnh';
      position = cols[2] || 'Khác';
    }

    if (!fullName) return;

    newEmployees.push({
      id: `emp-import-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      fullName,
      department,
      position,
      createdAt: new Date().toISOString().slice(0, 10)
    });
  });

  return newEmployees;
}

// Parse CSV string into list of TrainingPrograms
export function parseProgramsCSVText(csvText: string): TrainingProgram[] {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  const dataLines = lines.slice(1);
  const newPrograms: TrainingProgram[] = [];

  dataLines.forEach((line, index) => {
    const cols = parseCSVLine(line);
    if (cols.length < 2) return;

    const code = cols[0] || `DT2026-${Math.floor(10 + Math.random() * 90)}`;
    const title = cols[1];
    const typeRaw = (cols[2] || '').toLowerCase();
    const type: TrainingType = typeRaw.includes('trực tuyến') || typeRaw.includes('online') || typeRaw.includes('zoom') ? 'online' : 'in_person';

    const startDate = cols[3] || new Date().toISOString().slice(0, 10);
    const endDate = cols[4] || startDate;
    const locationOrLink = cols[5] || (type === 'online' ? 'https://zoom.us/j/...' : 'Hội trường lớn A');
    const instructor = cols[6] || 'Ban Đào tạo';
    const description = cols[7] || '';

    if (!title) return;

    newPrograms.push({
      id: `prog-import-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
      code,
      title,
      type,
      startDate,
      endDate,
      locationOrLink,
      instructor,
      description,
      participantIds: [],
      createdAt: new Date().toISOString().slice(0, 10)
    });
  });

  return newPrograms;
}
