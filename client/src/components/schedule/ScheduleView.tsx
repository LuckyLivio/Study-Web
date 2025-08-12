import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Chip,
  Menu,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import scheduleService, { Course, ScheduleSlot } from '../../services/scheduleService';

interface ScheduleViewProps {
  schedule: { [dayOfWeek: number]: ScheduleSlot[] };
  courses: Course[];
  currentSemester: string;
  currentWeek: number;
  onSemesterChange: (semester: string) => void;
  onWeekChange: (week: number) => void;
  onSlotCreate: (dayOfWeek: number) => void;
  onSlotEdit: (slot: ScheduleSlot) => void;
  onSlotDelete: (slotId: string) => void;
  loading: boolean;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  courses,
  currentSemester,
  currentWeek,
  onSemesterChange,
  onWeekChange,
  onSlotCreate,
  onSlotEdit,
  onSlotDelete,
  loading
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const timeSlots = [
    { period: 1, startTime: '08:00', endTime: '09:40' },
    { period: 2, startTime: '10:00', endTime: '11:40' },
    { period: 3, startTime: '14:00', endTime: '15:40' },
    { period: 4, startTime: '16:00', endTime: '17:40' },
    { period: 5, startTime: '19:00', endTime: '20:40' },
  ];

  const semesters = [
    '2024-1', '2024-2', '2023-1', '2023-2'
  ];

  const weeks = Array.from({ length: 20 }, (_, i) => i + 1);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, slot: ScheduleSlot) => {
    setAnchorEl(event.currentTarget);
    setSelectedSlot(slot);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSlot(null);
  };

  const handleEdit = () => {
    if (selectedSlot) {
      onSlotEdit(selectedSlot);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedSlot && selectedSlot._id) {
      onSlotDelete(selectedSlot._id);
    }
    handleMenuClose();
  };

  const getCourseInfo = (courseId: string): Course | null => {
    return courses.find(course => course._id === courseId) || null;
  };

  const getSlotForTimeAndDay = (dayOfWeek: number, timeSlot: any): ScheduleSlot | null => {
    const daySlots = schedule[dayOfWeek] || [];
    return daySlots.find(slot => {
      const slotStart = slot.startTime.substring(0, 5);
      const slotEnd = slot.endTime.substring(0, 5);
      return slotStart === timeSlot.startTime && slotEnd === timeSlot.endTime;
    }) || null;
  };

  const isSlotInCurrentWeek = (slot: ScheduleSlot): boolean => {
    return slot.weeks.includes(currentWeek);
  };

  const renderSlotContent = (slot: ScheduleSlot) => {
    const course = typeof slot.course === 'string' 
      ? getCourseInfo(slot.course)
      : slot.course as Course;
    
    if (!course) return null;

    const isCurrentWeek = isSlotInCurrentWeek(slot);

    return (
      <Card
        sx={{
          height: '100%',
          minHeight: 120,
          backgroundColor: course.color,
          color: 'white',
          opacity: isCurrentWeek ? 1 : 0.5,
          cursor: 'pointer',
          position: 'relative',
          '&:hover': {
            opacity: isCurrentWeek ? 0.9 : 0.6,
            transform: 'scale(1.02)'
          }
        }}
        onClick={() => onSlotEdit(slot)}
      >
        <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {course.name}
            </Typography>
            <IconButton
              size="small"
              sx={{ color: 'white', p: 0.5 }}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(e, slot);
              }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Box>
          
          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
            {course.teacher}
          </Typography>
          
          {slot.location && (
            <Box display="flex" alignItems="center" mb={0.5}>
              <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
              <Typography variant="caption">
                {slot.location}
              </Typography>
            </Box>
          )}
          
          <Box display="flex" alignItems="center" mb={0.5}>
            <TimeIcon sx={{ fontSize: 12, mr: 0.5 }} />
            <Typography variant="caption">
              {scheduleService.formatTime(slot.startTime)} - {scheduleService.formatTime(slot.endTime)}
            </Typography>
          </Box>
          
          <Typography variant="caption" display="block">
            {scheduleService.getWeeksDisplay(slot.weeks)}
          </Typography>
          
          {!isCurrentWeek && (
            <Chip
              label="非当前周"
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.6rem'
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderEmptySlot = (dayOfWeek: number, timeSlot: any) => {
    return (
      <Card
        sx={{
          height: '100%',
          minHeight: 120,
          border: '2px dashed',
          borderColor: 'grey.300',
          backgroundColor: 'grey.50',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.50'
          }
        }}
        onClick={() => onSlotCreate(dayOfWeek)}
      >
        <Box textAlign="center">
          <AddIcon sx={{ fontSize: 32, color: 'grey.400', mb: 1 }} />
          <Typography variant="caption" color="text.secondary">
            添加课程
          </Typography>
        </Box>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 控制面板 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr 2fr'
            },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <FormControl fullWidth>
            <InputLabel>学期</InputLabel>
            <Select
              value={currentSemester}
              label="学期"
              onChange={(e) => onSemesterChange(e.target.value)}
            >
              {semesters.map((semester) => (
                <MenuItem key={semester} value={semester}>
                  {semester.replace('-', '学年第')}学期
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth>
            <InputLabel>周次</InputLabel>
            <Select
              value={currentWeek}
              label="周次"
              onChange={(e) => onWeekChange(Number(e.target.value))}
            >
              {weeks.map((week) => (
                <MenuItem key={week} value={week}>
                  第{week}周
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box display="flex" alignItems="center" justifyContent="flex-end">
            <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              当前显示：{currentSemester.replace('-', '学年第')}学期 第{currentWeek}周
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 课表网格 */}
      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 800 }}>
            {/* 表头 */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                backgroundColor: 'grey.100'
              }}
            >
              <Box sx={{ p: 2, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  时间\星期
                </Typography>
              </Box>
              {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => (
                <Box key={dayOfWeek} sx={{ p: 2, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {dayNames[dayOfWeek]}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* 时间段行 */}
            {timeSlots.map((timeSlot) => (
              <Box
                key={timeSlot.period}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(8, 1fr)',
                  borderBottom: 1,
                  borderColor: 'divider'
                }}
              >
                {/* 时间列 */}
                <Box
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRight: 1,
                    borderColor: 'divider',
                    backgroundColor: 'grey.50',
                    minHeight: 140
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    第{timeSlot.period}节
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {timeSlot.startTime}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {timeSlot.endTime}
                  </Typography>
                </Box>

                {/* 课程列 */}
                {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
                  const slot = getSlotForTimeAndDay(dayOfWeek, timeSlot);
                  return (
                    <Box key={dayOfWeek} sx={{ p: 1, borderRight: 1, borderColor: 'divider', minHeight: 140 }}>
                      {slot ? renderSlotContent(slot) : renderEmptySlot(dayOfWeek, timeSlot)}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>

      {/* 课程统计 */}
      <Paper sx={{ p: 2, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          课表统计
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          <Box textAlign="center">
            <Typography variant="h4" color="primary">
              {Object.values(schedule).flat().length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              总课程安排
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="success.main">
              {Object.values(schedule).flat().filter(slot => isSlotInCurrentWeek(slot)).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              本周课程
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="info.main">
              {courses.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              课程总数
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h4" color="warning.main">
              {courses.reduce((sum, course) => sum + course.credits, 0)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          编辑课程安排
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          删除课程安排
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ScheduleView;