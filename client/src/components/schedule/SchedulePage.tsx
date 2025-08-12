import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  School as CourseIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Compare as CompareIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import scheduleService, { Course, ScheduleSlot } from '../../services/scheduleService';
import CourseList from './CourseList';
import ScheduleView from './ScheduleView';
import FileUpload from './FileUpload';
import CourseModal from './CourseModal';
import ScheduleSlotModal from './ScheduleSlotModal';
import TemplateSettings from './TemplateSettings';
import ScheduleComparison from './ScheduleComparison';
import CalendarView from './CalendarView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `schedule-tab-${index}`,
    'aria-controls': `schedule-tabpanel-${index}`,
  };
}

const SchedulePage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<{ [dayOfWeek: number]: ScheduleSlot[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 模态框状态
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [scheduleSlotModalOpen, setScheduleSlotModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1); // 默认周一
  
  // 当前学期
  const [currentSemester, setCurrentSemester] = useState('2024-1');
  const [currentWeek, setCurrentWeek] = useState<number>(1);

  useEffect(() => {
    loadCourses();
    loadSchedule();
  }, [currentSemester, currentWeek]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getCourses({ isActive: true });
      if (response.success && response.data?.courses) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      setError('加载课程列表失败');
      console.error('加载课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getSchedule({
        semester: currentSemester,
        week: currentWeek
      });
      if (response.success && response.data) {
        setSchedule(response.data);
      }
    } catch (error) {
      setError('加载课表失败');
      console.error('加载课表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCourseCreate = () => {
    setSelectedCourse(null);
    setCourseModalOpen(true);
  };

  const handleCourseEdit = (course: Course) => {
    setSelectedCourse(course);
    setCourseModalOpen(true);
  };

  const handleCourseModalClose = () => {
    setCourseModalOpen(false);
    setSelectedCourse(null);
  };

  const handleCourseSubmit = async (courseData: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      if (selectedCourse) {
        await scheduleService.updateCourse(selectedCourse._id!, courseData);
        setSuccess('课程更新成功');
      } else {
        await scheduleService.createCourse(courseData);
        setSuccess('课程创建成功');
      }
      handleCourseModalClose();
      loadCourses();
    } catch (error) {
      setError(selectedCourse ? '更新课程失败' : '创建课程失败');
      console.error('课程操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseDelete = async (courseId: string) => {
    try {
      setLoading(true);
      await scheduleService.deleteCourse(courseId);
      setSuccess('课程删除成功');
      loadCourses();
      loadSchedule(); // 重新加载课表
    } catch (error) {
      setError('删除课程失败');
      console.error('删除课程失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSlotCreate = (dayOfWeek: number) => {
    setSelectedDay(dayOfWeek);
    setSelectedSlot(null);
    setScheduleSlotModalOpen(true);
  };

  const handleScheduleSlotEdit = (slot: ScheduleSlot) => {
    setSelectedSlot(slot);
    setScheduleSlotModalOpen(true);
  };

  const handleScheduleSlotModalClose = () => {
    setScheduleSlotModalOpen(false);
    setSelectedSlot(null);
  };

  const handleScheduleSlotSubmit = async (slotData: Omit<ScheduleSlot, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      if (selectedSlot) {
        await scheduleService.updateScheduleSlot(selectedSlot._id!, slotData);
        setSuccess('课表更新成功');
      } else {
        await scheduleService.addScheduleSlot({
          ...slotData,
          semester: currentSemester
        });
        setSuccess('课表添加成功');
      }
      handleScheduleSlotModalClose();
      loadSchedule();
    } catch (error) {
      setError(selectedSlot ? '更新课表失败' : '添加课表失败');
      console.error('课表操作失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSlotDelete = async (slotId: string) => {
    try {
      setLoading(true);
      await scheduleService.deleteScheduleSlot(slotId);
      setSuccess('课表删除成功');
      loadSchedule();
    } catch (error) {
      setError('删除课表失败');
      console.error('删除课表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUploadSuccess = () => {
    setSuccess('文件上传成功');
    loadSchedule(); // 重新加载课表
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  const getFabIcon = () => {
    switch (tabValue) {
      case 0:
        return <ScheduleIcon />;
      case 2:
        return <AddIcon />;
      case 3:
        return <UploadIcon />;
      case 4:
        return <SettingsIcon />;
      default:
        return <AddIcon />;
    }
  };

  const handleFabClick = () => {
    switch (tabValue) {
      case 0:
        handleScheduleSlotCreate(1); // 默认周一
        break;
      case 2:
        handleCourseCreate();
        break;
      default:
        break;
    }
  };

  return (
    <Box>
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="课表管理标签">
            <Tab
              icon={<ScheduleIcon />}
              label="课表视图"
              {...a11yProps(0)}
            />
            <Tab
              icon={<CalendarIcon />}
              label="日历视图"
              {...a11yProps(1)}
            />
            <Tab
              icon={<CourseIcon />}
              label="课程管理"
              {...a11yProps(2)}
            />
            <Tab
              icon={<UploadIcon />}
              label="文件上传"
              {...a11yProps(3)}
            />
            <Tab
              icon={<SettingsIcon />}
              label="模板设置"
              {...a11yProps(4)}
            />
            <Tab
              icon={<CompareIcon />}
              label="课表比对"
              {...a11yProps(5)}
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ScheduleView
            schedule={schedule}
            courses={courses}
            currentSemester={currentSemester}
            currentWeek={currentWeek}
            onSemesterChange={setCurrentSemester}
            onWeekChange={setCurrentWeek}
            onSlotCreate={handleScheduleSlotCreate}
            onSlotEdit={handleScheduleSlotEdit}
            onSlotDelete={handleScheduleSlotDelete}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <CalendarView
            schedule={schedule}
            courses={courses}
            currentSemester={currentSemester}
            currentWeek={currentWeek}
            onSemesterChange={setCurrentSemester}
            onWeekChange={setCurrentWeek}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <CourseList
            courses={courses}
            onCourseEdit={handleCourseEdit}
            onCourseDelete={handleCourseDelete}
            onRefresh={loadCourses}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <FileUpload
            onUploadSuccess={handleFileUploadSuccess}
            onError={setError}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <TemplateSettings />
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <ScheduleComparison
            currentSchedule={schedule}
            currentCourses={courses}
            currentSemester={currentSemester}
          />
        </TabPanel>
      </Paper>

      {/* 浮动操作按钮 */}
      {(tabValue === 0 || tabValue === 2) && (
        <Fab
          color="primary"
          aria-label="添加"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleFabClick}
        >
          {getFabIcon()}
        </Fab>
      )}

      {/* 课程模态框 */}
      <CourseModal
        open={courseModalOpen}
        course={selectedCourse}
        onClose={handleCourseModalClose}
        onSubmit={handleCourseSubmit}
        loading={loading}
      />

      {/* 课表时间段模态框 */}
      <ScheduleSlotModal
        open={scheduleSlotModalOpen}
        slot={selectedSlot}
        courses={courses}
        defaultDay={selectedDay}
        onClose={handleScheduleSlotModalClose}
        onSubmit={handleScheduleSlotSubmit}
        loading={loading}
      />

      {/* 消息提示 */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* 全局加载指示器 */}
      {loading && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 9999,
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default SchedulePage;