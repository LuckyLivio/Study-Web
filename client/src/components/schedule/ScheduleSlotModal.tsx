import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs, { Dayjs } from 'dayjs';
import {
  LocationOn as LocationIcon
} from '@mui/icons-material';
import scheduleService, { Course, ScheduleSlot } from '../../services/scheduleService';

interface ScheduleSlotModalProps {
  open: boolean;
  slot: ScheduleSlot | null;
  courses: Course[];
  defaultDay: number;
  onClose: () => void;
  onSubmit: (slot: Omit<ScheduleSlot, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading: boolean;
}

const ScheduleSlotModal: React.FC<ScheduleSlotModalProps> = ({
  open,
  slot,
  courses,
  defaultDay,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<Omit<ScheduleSlot, '_id' | 'createdAt' | 'updatedAt'>>({
    course: '',
    semester: '',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:40',
    location: '',
    weeks: [],
    notes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [startTime, setStartTime] = useState<Dayjs | null>(dayjs('08:00', 'HH:mm'));
  const [endTime, setEndTime] = useState<Dayjs | null>(dayjs('09:40', 'HH:mm'));
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [quickWeekSelection, setQuickWeekSelection] = useState('');

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const allWeeks = Array.from({ length: 20 }, (_, i) => i + 1);
  
  const timeSlotPresets = [
    { label: '第1节课', startTime: '08:00', endTime: '09:40' },
    { label: '第2节课', startTime: '10:00', endTime: '11:40' },
    { label: '第3节课', startTime: '14:00', endTime: '15:40' },
    { label: '第4节课', startTime: '16:00', endTime: '17:40' },
    { label: '第5节课', startTime: '19:00', endTime: '20:40' },
  ];

  useEffect(() => {
    if (open) {
      if (slot) {
        const courseId = typeof slot.course === 'string' ? slot.course : slot.course._id || '';
        setFormData({
          course: courseId,
          semester: slot.semester,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          location: slot.location,
          weeks: slot.weeks,
          notes: slot.notes || ''
        });
        setStartTime(dayjs(slot.startTime, 'HH:mm'));
        setEndTime(dayjs(slot.endTime, 'HH:mm'));
        setSelectedWeeks(slot.weeks);
      } else {
        setFormData({
          course: '',
          semester: '2024-1',
          dayOfWeek: defaultDay,
          startTime: '08:00',
          endTime: '09:40',
          location: '',
          weeks: [],
          notes: ''
        });
        setStartTime(dayjs('08:00', 'HH:mm'));
        setEndTime(dayjs('09:40', 'HH:mm'));
        setSelectedWeeks([]);
      }
      setErrors({});
      setQuickWeekSelection('');
    }
  }, [open, slot, defaultDay]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.course) {
      newErrors.course = '请选择课程';
    }

    if (!formData.semester) {
      newErrors.semester = '请输入学期';
    }

    if (!formData.location.trim()) {
      newErrors.location = '请输入上课地点';
    }

    if (formData.weeks.length === 0) {
      newErrors.weeks = '请选择上课周次';
    }

    if (startTime && endTime && startTime.isAfter(endTime)) {
      newErrors.time = '开始时间不能晚于结束时间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        startTime: startTime?.format('HH:mm') || '08:00',
        endTime: endTime?.format('HH:mm') || '09:40',
        weeks: selectedWeeks
      });
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'dayOfWeek' ? parseInt(value) : value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (field: keyof typeof formData) => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleTimePresetSelect = (preset: any) => {
    setStartTime(dayjs(preset.startTime, 'HH:mm'));
    setEndTime(dayjs(preset.endTime, 'HH:mm'));
    setFormData(prev => ({
      ...prev,
      startTime: preset.startTime,
      endTime: preset.endTime
    }));
  };

  const handleStartTimeChange = (newValue: Dayjs | null) => {
    setStartTime(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        startTime: newValue.format('HH:mm')
      }));
    }
  };

  const handleEndTimeChange = (newValue: Dayjs | null) => {
    setEndTime(newValue);
    if (newValue) {
      setFormData(prev => ({
        ...prev,
        endTime: newValue.format('HH:mm')
      }));
    }
  };

  const handleWeekToggle = (week: number) => {
    const newWeeks = selectedWeeks.includes(week)
      ? selectedWeeks.filter(w => w !== week)
      : [...selectedWeeks, week].sort((a, b) => a - b);
    
    setSelectedWeeks(newWeeks);
    setFormData(prev => ({
      ...prev,
      weeks: newWeeks
    }));
    
    if (errors.weeks) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.weeks;
        return newErrors;
      });
    }
  };

  const handleQuickWeekSelection = (type: string) => {
    let newWeeks: number[] = [];
    
    switch (type) {
      case 'all':
        newWeeks = allWeeks;
        break;
      case 'odd':
        newWeeks = allWeeks.filter(w => w % 2 === 1);
        break;
      case 'even':
        newWeeks = allWeeks.filter(w => w % 2 === 0);
        break;
      case 'first-half':
        newWeeks = allWeeks.slice(0, 10);
        break;
      case 'second-half':
        newWeeks = allWeeks.slice(10);
        break;
      case 'clear':
        newWeeks = [];
        break;
    }
    
    setSelectedWeeks(newWeeks);
    setFormData(prev => ({
      ...prev,
      weeks: newWeeks
    }));
    setQuickWeekSelection(type);
  };

  const getCourseById = (courseId: string): Course | undefined => {
    return courses.find(course => course._id === courseId);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          {slot ? '编辑课程安排' : '添加课程安排'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {/* 基本信息 */}
            <Typography variant="h6" gutterBottom>
              基本信息
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth error={!!errors.course}>
                  <InputLabel>选择课程</InputLabel>
                  <Select
                    value={formData.course}
                    label="选择课程"
                    onChange={handleSelectChange('course')}
                  >
                    {courses.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        <Box display="flex" alignItems="center">
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              backgroundColor: course.color,
                              borderRadius: 1,
                              mr: 1
                            }}
                          />
                          {course.name} ({course.courseCode})
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.course && (
                    <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                      {errors.course}
                    </Typography>
                  )}
                </FormControl>
              </Box>
            
              <Box>
                <TextField
                  fullWidth
                  label="学期"
                  value={formData.semester}
                  onChange={handleInputChange('semester')}
                  error={!!errors.semester}
                  helperText={errors.semester}
                  placeholder="如：2024-1"
                  required
                />
              </Box>
            </Box>
            
            {/* 时间安排 */}
            <Typography variant="h6" gutterBottom>
              时间安排
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <FormControl fullWidth>
                  <InputLabel>星期</InputLabel>
                  <Select
                    value={formData.dayOfWeek}
                    label="星期"
                    onChange={handleSelectChange('dayOfWeek')}
                  >
                    {dayNames.map((day, index) => (
                      <MenuItem key={index} value={index}>
                        {day}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            
              <Box>
                <TextField
                  fullWidth
                  label="上课地点"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  error={!!errors.location}
                  helperText={errors.location}
                  InputProps={{
                    startAdornment: <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  required
                />
              </Box>
            </Box>
            
            {/* 时间段预设 */}
            <Typography variant="body2" gutterBottom>
              快速选择时间段
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {timeSlotPresets.map((preset) => (
                <Chip
                  key={preset.label}
                  label={`${preset.label} (${preset.startTime}-${preset.endTime})`}
                  onClick={() => handleTimePresetSelect(preset)}
                  variant="outlined"
                  clickable
                />
              ))}
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <MuiTimePicker
                  label="开始时间"
                  value={startTime}
                  onChange={handleStartTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.time,
                      helperText: errors.time
                    }
                  }}
                />
              </Box>
            
              <Box>
                <MuiTimePicker
                  label="结束时间"
                  value={endTime}
                  onChange={handleEndTimeChange}
                  slotProps={{
                    textField: {
                      fullWidth: true
                    }
                  }}
                />
              </Box>
            </Box>
            
            {/* 周次选择 */}
            <Typography variant="h6" gutterBottom>
              上课周次
            </Typography>
            
            <Box>
              <Typography variant="body2" gutterBottom>
                快速选择
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'all' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('all')}
                >
                  全选
                </Button>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'odd' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('odd')}
                >
                  单周
                </Button>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'even' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('even')}
                >
                  双周
                </Button>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'first-half' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('first-half')}
                >
                  前10周
                </Button>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'second-half' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('second-half')}
                >
                  后10周
                </Button>
                <Button
                  size="small"
                  variant={quickWeekSelection === 'clear' ? 'contained' : 'outlined'}
                  onClick={() => handleQuickWeekSelection('clear')}
                  color="error"
                >
                  清空
                </Button>
              </Box>
            </Box>
            
            <Box>
              <Typography variant="body2" gutterBottom>
                选择具体周次（已选择 {selectedWeeks.length} 周）
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {allWeeks.map((week) => (
                  <Chip
                    key={week}
                    label={`第${week}周`}
                    onClick={() => handleWeekToggle(week)}
                    color={selectedWeeks.includes(week) ? 'primary' : 'default'}
                    variant={selectedWeeks.includes(week) ? 'filled' : 'outlined'}
                    clickable
                  />
                ))}
              </Box>
              {errors.weeks && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.weeks}
                </Typography>
              )}
            </Box>
            
            {/* 备注 */}
            <TextField
              fullWidth
              label="备注"
              multiline
              rows={3}
              value={formData.notes}
              onChange={handleInputChange('notes')}
              placeholder="请输入课程安排的备注信息..."
            />
            
            {/* 预览信息 */}
            {formData.course && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>课程安排预览：</strong>
                    {getCourseById(typeof formData.course === 'string' ? formData.course : formData.course._id || '')?.name} - 
                    {dayNames[formData.dayOfWeek]} 
                    {startTime?.format('HH:mm')}-{endTime?.format('HH:mm')} - 
                    {formData.location} - 
                    {scheduleService.getWeeksDisplay(selectedWeeks)}
                  </Typography>
                </Alert>
              </Box>
            )}
          </Box>
          
          {Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              请检查并修正表单中的错误
            </Alert>
          )}
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? '保存中...' : (slot ? '更新' : '添加')}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleSlotModal;