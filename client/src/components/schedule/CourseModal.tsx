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
  Chip,
  Box,
  Typography,
  Rating,
  Autocomplete,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Star as StarIcon
} from '@mui/icons-material';
import scheduleService, { Course } from '../../services/scheduleService';

interface CourseModalProps {
  open: boolean;
  course: Course | null;
  onClose: () => void;
  onSubmit: (course: Omit<Course, '_id' | 'createdAt' | 'updatedAt'>) => void;
  loading: boolean;
}

const CourseModal: React.FC<CourseModalProps> = ({
  open,
  course,
  onClose,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<Omit<Course, '_id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    courseCode: '',
    teacher: '',
    department: '',
    credits: 1,
    description: '',
    tags: [],
    color: '#FF6B6B',
    rating: 0,
    review: '',
    isActive: true
  });

  const [departments, setDepartments] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showColorPicker, setShowColorPicker] = useState(false);

  const defaultColors = scheduleService.getDefaultColors();

  useEffect(() => {
    if (open) {
      loadDepartments();
      loadTags();
      if (course) {
        setFormData({
          name: course.name,
          courseCode: course.courseCode,
          teacher: course.teacher,
          department: course.department,
          credits: course.credits,
          description: course.description || '',
          tags: course.tags,
          color: course.color,
          rating: course.rating || 0,
          review: course.review || '',
          isActive: course.isActive
        });
      } else {
        setFormData({
          name: '',
          courseCode: '',
          teacher: '',
          department: '',
          credits: 1,
          description: '',
          tags: [],
          color: scheduleService.getRandomColor(),
          rating: 0,
          review: '',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [open, course]);

  const loadDepartments = async () => {
    try {
      const response = await scheduleService.getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('加载院系列表失败:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await scheduleService.getCourseTags();
      if (response.success && response.data) {
        setAvailableTags(response.data);
      }
    } catch (error) {
      console.error('加载标签列表失败:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '课程名称不能为空';
    }

    if (!formData.courseCode.trim()) {
      newErrors.courseCode = '课程代码不能为空';
    }

    if (!formData.teacher.trim()) {
      newErrors.teacher = '教师姓名不能为空';
    }

    if (!formData.department.trim()) {
      newErrors.department = '院系不能为空';
    }

    if (formData.credits < 0.5 || formData.credits > 10) {
      newErrors.credits = '学分必须在0.5-10之间';
    }

    if (formData.rating !== undefined && (formData.rating < 0 || formData.rating > 5)) {
      newErrors.rating = '评分必须在0-5之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: field === 'credits' || field === 'rating' ? parseFloat(value) || 0 : value
    }));
    
    // 清除对应字段的错误
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

  const handleTagsChange = (event: any, newValue: string[]) => {
    setFormData(prev => ({
      ...prev,
      tags: newValue
    }));
  };

  const handleColorSelect = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
    setShowColorPicker(false);
  };

  const handleRatingChange = (event: any, newValue: number | null) => {
    setFormData(prev => ({
      ...prev,
      rating: newValue || 0
    }));
  };

  return (
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
        {course ? '编辑课程' : '添加课程'}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* 基本信息 */}
          <Typography variant="h6" gutterBottom>
            基本信息
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="课程名称"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Box>
          
            <Box>
              <TextField
                fullWidth
                label="课程代码"
                value={formData.courseCode}
                onChange={handleInputChange('courseCode')}
                error={!!errors.courseCode}
                helperText={errors.courseCode}
                required
              />
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="教师姓名"
                value={formData.teacher}
                onChange={handleInputChange('teacher')}
                error={!!errors.teacher}
                helperText={errors.teacher}
                required
              />
            </Box>
          
            <Box>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>院系</InputLabel>
                <Select
                  value={formData.department}
                  label="院系"
                  onChange={handleSelectChange('department')}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                  <MenuItem value="其他">其他</MenuItem>
                </Select>
                {errors.department && (
                  <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <TextField
                fullWidth
                label="学分"
                type="number"
                value={formData.credits}
                onChange={handleInputChange('credits')}
                error={!!errors.credits}
                helperText={errors.credits}
                inputProps={{ min: 0.5, max: 10, step: 0.5 }}
                required
              />
            </Box>
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="课程描述"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
              placeholder="请输入课程的详细描述..."
            />
          </Box>
          
          {/* 标签和颜色 */}
          <Typography variant="h6" gutterBottom>
            标签和外观
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 2 }}>
            <Box>
              <Autocomplete
                multiple
                freeSolo
                options={availableTags}
                value={formData.tags}
                onChange={handleTagsChange}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="标签"
                    placeholder="输入标签并按回车添加"
                  />
                )}
              />
            </Box>
          
            <Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  课程颜色
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<PaletteIcon />}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  sx={{
                    backgroundColor: formData.color,
                    color: 'white',
                    '&:hover': {
                      backgroundColor: formData.color,
                      opacity: 0.8
                    }
                  }}
                >
                  选择颜色
                </Button>
                
                {showColorPicker && (
                  <Box sx={{ mt: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {defaultColors.map((color) => (
                        <Box
                          key={color}
                          sx={{
                            width: 32,
                            height: 32,
                            backgroundColor: color,
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: formData.color === color ? 3 : 1,
                            borderColor: formData.color === color ? 'primary.main' : 'divider',
                            '&:hover': {
                              transform: 'scale(1.1)'
                            }
                          }}
                          onClick={() => handleColorSelect(color)}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
          
          {/* 评价 */}
          <Typography variant="h6" gutterBottom>
            课程评价
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Box>
                <Typography variant="body2" gutterBottom>
                  评分
                </Typography>
                <Box display="flex" alignItems="center">
                  <Rating
                    value={formData.rating}
                    onChange={handleRatingChange}
                    precision={0.5}
                    size="large"
                    icon={<StarIcon fontSize="inherit" />}
                    emptyIcon={<StarIcon fontSize="inherit" />}
                  />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    {formData.rating && formData.rating > 0 ? formData.rating.toFixed(1) : '未评分'}
                  </Typography>
                </Box>
                {errors.rating && (
                  <Typography variant="caption" color="error">
                    {errors.rating}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          
          <Box>
            <TextField
              fullWidth
              label="课程评价"
              multiline
              rows={3}
              value={formData.review}
              onChange={handleInputChange('review')}
              placeholder="请输入对这门课程的评价和建议..."
            />
          </Box>
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
          {loading ? '保存中...' : (course ? '更新' : '创建')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CourseModal;