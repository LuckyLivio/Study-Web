import api from './api';

// 课程相关接口
export interface Course {
  _id?: string;
  name: string;
  courseCode: string;
  teacher: string;
  department: string;
  credits: number;
  description?: string;
  tags: string[];
  color: string;
  rating?: number;
  review?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 课表时间段接口
export interface ScheduleSlot {
  _id?: string;
  course: string | Course;
  semester: string;
  dayOfWeek: number; // 0-6 (周日到周六)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  weeks: number[]; // 周次数组
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 课表模板接口
export interface ScheduleTemplate {
  _id?: string;
  name: string;
  description?: string;
  timeSlots: {
    period: number;
    startTime: string;
    endTime: string;
  }[];
  courses?: Course[];
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// 上传文件接口
export interface ScheduleFile {
  _id?: string;
  filename: string;
  originalName: string;
  fileType: 'image' | 'excel';
  filePath: string;
  fileSize: number;
  notes?: string;
  uploadDate?: string;
}

export interface SharedSchedule {
  _id: string;
  name: string;
  owner: string;
  semester: string;
  description?: string;
  courses: Course[];
  scheduleSlots: ScheduleSlot[];
  isPublic: boolean;
  shareCode?: string;
  tags: string[];
  statistics: {
    totalCourses: number;
    totalCredits: number;
    averageRating: number;
    busyHours: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleComparison {
  schedules: {
    _id: string;
    name: string;
    owner: string;
    statistics: SharedSchedule['statistics'];
  }[];
  analysis: {
    commonCourses: string[];
    timeConflicts: {
      day: number;
      time1: string;
      time2: string;
      schedule1: string;
      schedule2: string;
    }[];
    commonFreeTime: {
      day: number;
      startTime: string;
      endTime: string;
      duration: number;
    }[];
    statistics: {
      totalSchedules: number;
      commonCourses: number;
      timeConflicts: number;
      commonFreeSlots: number;
      scheduleStats: {
        name: string;
        owner: string;
        totalCourses: number;
        totalCredits: number;
        averageRating: number;
        busyHours: number;
      }[];
    };
  };
}

// API响应接口
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    courses?: T[];
    pagination: {
      current: number;
      total: number;
      count: number;
      limit: number;
    };
  };
}

class ScheduleService {
  // 课程管理
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<Course>> {
    const response = await api.get('/schedule/courses', { params });
    return response.data || response;
  }

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    const response = await api.get(`/schedule/courses/${id}`);
    return response.data || response;
  }

  async createCourse(course: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Course>> {
    const response = await api.post('/schedule/courses', course);
    return response.data || response;
  }

  async updateCourse(id: string, course: Partial<Course>): Promise<ApiResponse<Course>> {
    const response = await api.put(`/schedule/courses/${id}`, course);
    return response.data || response;
  }

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/schedule/courses/${id}`);
    return response.data || response;
  }

  async updateCourseRating(id: string, rating: number, review?: string): Promise<ApiResponse<Course>> {
    const response = await api.put(`/schedule/courses/${id}/rating`, {
      rating,
      review
    });
    return response.data || response;
  }

  async getCourseTags(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/schedule/courses/tags');
    return response.data || response;
  }

  async getDepartments(): Promise<ApiResponse<string[]>> {
    const response = await api.get('/schedule/courses/departments');
    return response.data || response;
  }

  // 课表管理
  async getSchedule(params: {
    semester: string;
    week?: number;
  }): Promise<ApiResponse<{ [dayOfWeek: number]: ScheduleSlot[] }>> {
    const response = await api.get('/schedule/schedule', { params });
    return response.data || response;
  }

  async addScheduleSlot(slot: Omit<ScheduleSlot, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ScheduleSlot>> {
    const response = await api.post('/schedule/schedule/slots', slot);
    return response.data || response;
  }

  async updateScheduleSlot(id: string, slot: Partial<ScheduleSlot>): Promise<ApiResponse<ScheduleSlot>> {
    const response = await api.put(`/schedule/schedule/slots/${id}`, slot);
    return response.data || response;
  }

  async deleteScheduleSlot(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/schedule/schedule/slots/${id}`);
    return response.data || response;
  }

  async batchAddScheduleSlots(slots: Omit<ScheduleSlot, '_id' | 'createdAt' | 'updatedAt'>[]): Promise<ApiResponse<{
    created: ScheduleSlot[];
    errors: { index: number; error: string }[];
  }>> {
    const response = await api.post('/schedule/schedule/slots/batch', { slots });
    return response.data || response;
  }

  // 课表模板管理
  async getScheduleTemplates(): Promise<ApiResponse<ScheduleTemplate[]>> {
    const response = await api.get('/schedule/templates');
    return response.data || response;
  }

  async createScheduleTemplate(template: Omit<ScheduleTemplate, '_id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ScheduleTemplate>> {
    const response = await api.post('/schedule/templates', template);
    return response.data || response;
  }

  async updateScheduleTemplate(id: string, template: Partial<ScheduleTemplate>): Promise<ApiResponse<ScheduleTemplate>> {
    const response = await api.put(`/schedule/templates/${id}`, template);
    return response.data || response;
  }

  async deleteScheduleTemplate(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/schedule/templates/${id}`);
    return response.data || response;
  }

  async setDefaultTemplate(id: string): Promise<ApiResponse<ScheduleTemplate>> {
    const response = await api.put(`/schedule/templates/${id}/default`);
    return response.data || response;
  }

  // 文件上传管理
  async uploadScheduleFile(file: File, notes?: string): Promise<ApiResponse<ScheduleFile>> {
    const formData = new FormData();
    formData.append('scheduleFile', file);
    if (notes) {
      formData.append('notes', notes);
    }

    const response = await api.post('/schedule/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data || response;
  }

  async getUploadedFiles(): Promise<ApiResponse<ScheduleFile[]>> {
    const response = await api.get('/schedule/files');
    return response.data || response;
  }

  async deleteUploadedFile(id: string): Promise<ApiResponse<void>> {
    const response = await api.delete(`/schedule/files/${id}`);
    return response.data || response;
  }

  // 共享课表相关方法
  // 创建共享课表
  async createSharedSchedule(data: {
    name: string;
    owner: string;
    semester: string;
    description?: string;
    courseIds: string[];
    scheduleSlotIds: string[];
    isPublic: boolean;
    tags?: string[];
  }): Promise<ApiResponse<SharedSchedule>> {
    const response = await api.post('/schedule/shared-schedules', data);
    return response.data || response;
  }

  // 获取公开的共享课表
  async getPublicSharedSchedules(params?: {
    semester?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    schedules: SharedSchedule[];
    pagination: {
      current: number;
      total: number;
      count: number;
    };
  }>> {
    const response = await api.get('/schedule/shared-schedules/public', { params });
    return response.data || response;
  }

  // 通过分享码获取课表
  async getSharedScheduleByCode(shareCode: string): Promise<ApiResponse<SharedSchedule>> {
    const response = await api.get(`/schedule/shared-schedules/code/${shareCode}`);
    return response.data || response;
  }

  // 课表比对分析
  async compareSchedules(scheduleIds: string[]): Promise<ApiResponse<ScheduleComparison>> {
    const response = await api.post('/schedule/shared-schedules/compare', { scheduleIds });
    return response.data || response;
  }

  // 工具方法
  getDayName(dayOfWeek: number): string {
    const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return days[dayOfWeek] || '未知';
  }

  formatTime(time: string): string {
    return time.substring(0, 5); // HH:mm
  }

  getTimeSlotDisplay(startTime: string, endTime: string): string {
    return `${this.formatTime(startTime)} - ${this.formatTime(endTime)}`;
  }

  getWeeksDisplay(weeks: number[]): string {
    if (weeks.length === 0) return '无';
    if (weeks.length === 1) return `第${weeks[0]}周`;
    
    // 连续周次合并显示
    const sortedWeeks = [...weeks].sort((a, b) => a - b);
    const ranges: string[] = [];
    let start = sortedWeeks[0];
    let end = sortedWeeks[0];
    
    for (let i = 1; i < sortedWeeks.length; i++) {
      if (sortedWeeks[i] === end + 1) {
        end = sortedWeeks[i];
      } else {
        ranges.push(start === end ? `第${start}周` : `第${start}-${end}周`);
        start = end = sortedWeeks[i];
      }
    }
    ranges.push(start === end ? `第${start}周` : `第${start}-${end}周`);
    
    return ranges.join(', ');
  }

  // 颜色工具
  getDefaultColors(): string[] {
    return [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
  }

  getRandomColor(): string {
    const colors = this.getDefaultColors();
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export default new ScheduleService();