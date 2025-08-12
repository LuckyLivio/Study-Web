import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
  Event as EventIcon,
  School as SchoolIcon,
  Alarm as AlarmIcon,
  Quiz as QuizIcon
} from '@mui/icons-material';
import { Course, ScheduleSlot } from '../../services/scheduleService';
import { Reminder } from '../../services/reminderService';
import reminderService from '../../services/reminderService';

interface CalendarViewProps {
  schedule: { [dayOfWeek: number]: ScheduleSlot[] };
  courses: Course[];
  currentSemester: string;
  currentWeek: number;
  onSemesterChange: (semester: string) => void;
  onWeekChange: (week: number) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  type: 'course' | 'exam' | 'reminder';
  date: Date;
  time?: string;
  location?: string;
  color: string;
  description?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  courses,
  currentSemester,
  currentWeek,
  onSemesterChange,
  onWeekChange
}) => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const shortDayNames = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    loadReminders();
  }, []);

  useEffect(() => {
    generateEvents();
  }, [schedule, courses, reminders, currentDate]);

  const loadReminders = async () => {
    try {
      const response = await reminderService.getReminders({
        page: 1,
        limit: 100,
        isCompleted: false
      });
      if (response.success && response.data?.reminders) {
        setReminders(response.data.reminders);
      }
    } catch (error) {
      console.error('加载提醒失败:', error);
    }
  };

  const generateEvents = () => {
    const eventList: CalendarEvent[] = [];

    // 添加课程事件
    Object.entries(schedule).forEach(([dayOfWeek, slots]) => {
      slots.forEach(slot => {
        const course = courses.find(c => c._id === slot.course || c._id === (slot.course as Course)?._id);
        if (course && slot.weeks.includes(currentWeek)) {
          const eventDate = getDateForDayOfWeek(parseInt(dayOfWeek), currentDate);
          eventList.push({
            id: `course-${slot._id}`,
            title: course.name,
            type: 'course',
            date: eventDate,
            time: `${slot.startTime.substring(0, 5)}-${slot.endTime.substring(0, 5)}`,
            location: slot.location,
            color: course.color || theme.palette.primary.main,
            description: `教师: ${course.teacher}`
          });
        }
      });
    });

    // 添加考试事件（从课程中提取）
    courses.forEach(course => {
      if ((course as any).examDate) {
        const examDate = new Date((course as any).examDate);
        if (isDateInCurrentView(examDate)) {
          eventList.push({
            id: `exam-${course._id}`,
            title: `${course.name} 考试`,
            type: 'exam',
            date: examDate,
            time: (course as any).examTime,
            location: (course as any).examLocation,
            color: theme.palette.error.main,
            description: `考试形式: ${(course as any).examType || '未知'}`
          });
        }
      }
    });

    // 添加提醒事件
    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.reminderTime);
      if (isDateInCurrentView(reminderDate)) {
        eventList.push({
          id: `reminder-${reminder._id}`,
          title: reminder.title,
          type: 'reminder',
          date: reminderDate,
          time: reminder.reminderTime.substring(11, 16),
          color: getPriorityColor(reminder.priority),
          description: reminder.description
        });
      }
    });

    setEvents(eventList);
  };

  const getDateForDayOfWeek = (dayOfWeek: number, baseDate: Date): Date => {
    const date = new Date(baseDate);
    const currentDay = date.getDay();
    const diff = dayOfWeek - currentDay;
    date.setDate(date.getDate() + diff);
    return date;
  };

  const isDateInCurrentView = (date: Date): boolean => {
    if (viewMode === 'week') {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return date >= weekStart && date <= weekEnd;
    } else {
      return date.getMonth() === currentDate.getMonth() && 
             date.getFullYear() === currentDate.getFullYear();
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case '高': return theme.palette.error.main;
      case '中': return theme.palette.warning.main;
      case '低': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getMonthDays = (): Date[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      days.push(new Date(startDate));
      startDate.setDate(startDate.getDate() + 1);
    }
    return days;
  };

  const getWeekDays = (): Date[] => {
    const weekStart = getWeekStart(currentDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
      onWeekChange(Math.max(1, currentWeek - 1));
    } else {
      newDate.setDate(newDate.getDate() + 7);
      onWeekChange(Math.min(20, currentWeek + 1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderEventChip = (event: CalendarEvent) => {
    const getEventIcon = () => {
      switch (event.type) {
        case 'course': return <SchoolIcon sx={{ fontSize: 12 }} />;
        case 'exam': return <QuizIcon sx={{ fontSize: 12 }} />;
        case 'reminder': return <AlarmIcon sx={{ fontSize: 12 }} />;
        default: return <EventIcon sx={{ fontSize: 12 }} />;
      }
    };

    return (
      <Tooltip
        key={event.id}
        title={
          <Box>
            <Typography variant="subtitle2">{event.title}</Typography>
            {event.time && <Typography variant="caption">时间: {event.time}</Typography>}
            {event.location && <Typography variant="caption">地点: {event.location}</Typography>}
            {event.description && <Typography variant="caption">{event.description}</Typography>}
          </Box>
        }
      >
        <Chip
          icon={getEventIcon()}
          label={event.title}
          size="small"
          sx={{
            backgroundColor: event.color,
            color: 'white',
            fontSize: '0.7rem',
            height: 20,
            mb: 0.5,
            maxWidth: '100%',
            '& .MuiChip-label': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }
          }}
        />
      </Tooltip>
    );
  };

  const renderMonthView = () => {
    const days = getMonthDays();
    
    return (
      <Grid container spacing={1}>
        {/* 星期标题 */}
        {shortDayNames.map((dayName, index) => (
          <Box key={index} sx={{ flex: '1 1 14.28%', textAlign: 'center' }}>
            <Typography 
              variant="subtitle2" 
              align="center" 
              sx={{ 
                fontWeight: 'bold',
                color: index === 0 || index === 6 ? 'error.main' : 'text.primary',
                py: 1
              }}
            >
              {dayName}
            </Typography>
          </Box>
        ))}
        
        {/* 日期格子 */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <Box key={index} sx={{ flex: '1 1 14.28%' }}>
              <Card
                sx={{
                  minHeight: 120,
                  backgroundColor: isCurrentMonth ? 'background.paper' : 'grey.50',
                  border: isToday ? 2 : 1,
                  borderColor: isToday ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: isCurrentMonth ? 'action.hover' : 'grey.100'
                  }
                }}
              >
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: isToday ? 'bold' : 'normal',
                      color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                      mb: 1
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dayEvents.slice(0, 3).map(event => renderEventChip(event))}
                    {dayEvents.length > 3 && (
                      <Typography variant="caption" color="text.secondary">
                        +{dayEvents.length - 3} 更多
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Grid>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays();
    const timeSlots = [
      '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
      '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
    ];
    
    return (
      <Box>
        {/* 星期标题 */}
        <Box sx={{ display: 'flex', mb: 2 }}>
          <Box sx={{ width: '80px', textAlign: 'center' }}>
            <Typography variant="subtitle2" align="center" sx={{ fontWeight: 'bold' }}>
              时间
            </Typography>
          </Box>
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <Box key={index} sx={{ flex: '1 1 14.28%' }}>
                <Paper 
                  sx={{ 
                    p: 1, 
                    textAlign: 'center',
                    backgroundColor: isToday ? 'primary.main' : 'background.paper',
                    color: isToday ? 'primary.contrastText' : 'text.primary'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {dayNames[day.getDay()]}
                  </Typography>
                  <Typography variant="body2">
                    {day.getDate()}
                  </Typography>
                  <Badge badgeContent={dayEvents.length} color="error" sx={{ mt: 0.5 }}>
                    <EventIcon fontSize="small" />
                  </Badge>
                </Paper>
              </Box>
            );
          })}
        </Box>
        
        {/* 时间表格 */}
        <Paper sx={{ overflow: 'auto', maxHeight: 600 }}>
          {timeSlots.map((time, timeIndex) => (
            <Box key={timeIndex} sx={{ display: 'flex', minHeight: 60, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ width: '80px', p: 1, textAlign: 'center', borderRight: 1, borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">
                  {time}
                </Typography>
              </Box>
              {days.map((day, dayIndex) => {
                const dayEvents = getEventsForDate(day).filter(event => 
                  event.time && event.time.startsWith(time.substring(0, 2))
                );
                
                return (
                  <Box key={dayIndex} sx={{ flex: '1 1 14.28%' }}>
                    <Box sx={{ p: 0.5, minHeight: 50, borderRight: 1, borderColor: 'divider' }}>
                      {dayEvents.map(event => renderEventChip(event))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Paper>
      </Box>
    );
  };

  return (
    <Box>
      {/* 控制栏 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            {viewMode === 'month' 
              ? `${currentDate.getFullYear()}年 ${monthNames[currentDate.getMonth()]}`
              : `${currentDate.getFullYear()}年 第${currentWeek}周`
            }
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => viewMode === 'month' ? navigateMonth('prev') : navigateWeek('prev')}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={goToToday}>
              <TodayIcon />
            </IconButton>
            <IconButton onClick={() => viewMode === 'month' ? navigateMonth('next') : navigateWeek('next')}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>学期</InputLabel>
            <Select
              value={currentSemester}
              label="学期"
              onChange={(e) => onSemesterChange(e.target.value)}
            >
              <MenuItem value="2024-1">2024春季</MenuItem>
              <MenuItem value="2024-2">2024秋季</MenuItem>
              <MenuItem value="2023-1">2023春季</MenuItem>
              <MenuItem value="2023-2">2023秋季</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant={viewMode === 'month' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('month')}
            size="small"
          >
            月视图
          </Button>
          <Button
            variant={viewMode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('week')}
            size="small"
          >
            周视图
          </Button>
        </Box>
      </Box>
      
      {/* 事件统计 */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip 
          icon={<SchoolIcon />} 
          label={`课程: ${events.filter(e => e.type === 'course').length}`}
          color="primary"
          variant="outlined"
        />
        <Chip 
          icon={<QuizIcon />} 
          label={`考试: ${events.filter(e => e.type === 'exam').length}`}
          color="error"
          variant="outlined"
        />
        <Chip 
          icon={<AlarmIcon />} 
          label={`提醒: ${events.filter(e => e.type === 'reminder').length}`}
          color="warning"
          variant="outlined"
        />
      </Box>
      
      {/* 日历视图 */}
      <Paper sx={{ p: 2 }}>
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </Paper>
    </Box>
  );
};

export default CalendarView;