import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Rating,
  Avatar,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import scheduleService, { Course } from '../../services/scheduleService';

interface CourseListProps {
  courses: Course[];
  onCourseEdit: (course: Course) => void;
  onCourseDelete: (courseId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  onCourseEdit,
  onCourseDelete,
  onRefresh,
  loading
}) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(courses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  useEffect(() => {
    setFilteredCourses(courses);
    loadDepartments();
    loadTags();
  }, [courses]);

  useEffect(() => {
    filterCourses();
  }, [searchTerm, selectedDepartment, courses]);

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
        setTags(response.data);
      }
    } catch (error) {
      console.error('加载标签列表失败:', error);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDepartment) {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    setFilteredCourses(filtered);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, course: Course) => {
    setAnchorEl(event.currentTarget);
    setSelectedCourse(course);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCourse(null);
  };

  const handleEdit = () => {
    if (selectedCourse) {
      onCourseEdit(selectedCourse);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedCourse) {
      setCourseToDelete(selectedCourse);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      onCourseDelete(courseToDelete._id!);
    }
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatCredits = (credits: number) => {
    return `${credits}学分`;
  };

  if (loading && courses.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* 搜索和筛选 */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 2fr 1fr'
            },
            gap: 2,
            alignItems: 'center'
          }}
        >
          <TextField
            fullWidth
            placeholder="搜索课程名称、教师、课程代码或标签..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel>院系筛选</InputLabel>
            <Select
              value={selectedDepartment}
              label="院系筛选"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="">全部院系</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={loading}
          >
            刷新
          </Button>
        </Box>
      </Box>

      {/* 课程统计 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          共找到 {filteredCourses.length} 门课程
        </Typography>
      </Box>

      {/* 课程列表 */}
      {filteredCourses.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight={300}
          textAlign="center"
        >
          <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {courses.length === 0 ? '暂无课程' : '未找到匹配的课程'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {courses.length === 0 ? '点击右下角的 + 按钮添加第一门课程' : '尝试调整搜索条件或筛选器'}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}
        >
            {filteredCourses.map((course) => (
              <Card
                key={course._id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
              >
                {/* 课程颜色条 */}
                <Box
                  sx={{
                    height: 4,
                    backgroundColor: course.color,
                  }}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                  {/* 头部：课程名称和操作菜单 */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box flex={1}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {course.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.courseCode}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, course)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  {/* 教师和院系信息 */}
                  <Box display="flex" alignItems="center" mb={1}>
                    <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.teacher}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={2}>
                    <SchoolIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {course.department} • {formatCredits(course.credits)}
                    </Typography>
                  </Box>

                  {/* 课程描述 */}
                  {course.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {course.description}
                    </Typography>
                  )}

                  {/* 标签 */}
                  {course.tags.length > 0 && (
                    <Box mb={2}>
                      {course.tags.slice(0, 3).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                      {course.tags.length > 3 && (
                        <Chip
                          label={`+${course.tags.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      )}
                    </Box>
                  )}

                  {/* 评分 */}
                  {course.rating && (
                    <Box display="flex" alignItems="center" mt="auto">
                      <Rating
                        value={course.rating}
                        readOnly
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {course.rating.toFixed(1)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
        </Box>
      )}

      {/* 操作菜单 */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          编辑课程
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          删除课程
        </MenuItem>
      </Menu>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除课程</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除课程 "{courseToDelete?.name}" 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            删除后，相关的课表安排也将被移除，此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseList;