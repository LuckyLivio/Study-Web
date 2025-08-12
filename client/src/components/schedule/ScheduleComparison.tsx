import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Compare as CompareIcon,
  Schedule as ScheduleIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  School as CourseIcon,
  Analytics as AnalyticsIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import scheduleService, { Course, ScheduleSlot, SharedSchedule, ScheduleComparison as ScheduleComparisonData } from '../../services/scheduleService';



interface ScheduleComparisonProps {
  currentSchedule: { [dayOfWeek: number]: ScheduleSlot[] };
  currentCourses: Course[];
  currentSemester: string;
}

const ScheduleComparison: React.FC<ScheduleComparisonProps> = ({
  currentSchedule,
  currentCourses,
  currentSemester
}) => {
  const [sharedSchedules, setSharedSchedules] = useState<SharedSchedule[]>([]);
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ScheduleComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareFormData, setShareFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff', '#00ffff'];

  useEffect(() => {
    loadSharedSchedules();
  }, []);

  const loadSharedSchedules = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getPublicSharedSchedules({
        semester: currentSemester,
        page: 1,
        limit: 20
      });
      
      if (response.success && response.data) {
        setSharedSchedules(response.data.schedules);
      } else {
        throw new Error(response.message || '获取共享课表失败');
      }
    } catch (error) {
      setError('加载共享课表失败');
      console.error('加载共享课表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareSchedule = async () => {
    try {
      setLoading(true);
      
      const response = await scheduleService.createSharedSchedule({
         name: shareFormData.name,
         owner: 'current_user', // TODO: 从用户上下文获取实际用户信息
         description: shareFormData.description,
         semester: currentSemester,
         courseIds: currentCourses.map(c => c._id).filter((id): id is string => id !== undefined),
         scheduleSlotIds: Object.values(currentSchedule).flat().map(s => s._id).filter((id): id is string => id !== undefined),
         isPublic: shareFormData.isPublic,
         tags: []
       });
      
      if (response.success && response.data) {
        setSuccess(`课表分享成功！${response.data.shareCode ? `分享码: ${response.data.shareCode}` : ''}`);
        loadSharedSchedules();
        setShareDialogOpen(false);
        setShareFormData({ name: '', description: '', isPublic: true });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setError('分享课表失败');
      console.error('分享课表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedSchedules(prev => {
      if (prev.includes(scheduleId)) {
        return prev.filter(id => id !== scheduleId);
      } else {
        return [...prev, scheduleId];
      }
    });
  };

  const performComparison = async () => {
    if (selectedSchedules.length === 0) {
      setError('请至少选择一个课表进行比对');
      return;
    }

    try {
      setLoading(true);
      
      const response = await scheduleService.compareSchedules(selectedSchedules);
      
      if (response.success && response.data) {
        setComparisonResult(response.data);
        setSuccess('课表比对分析完成');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setError('课表比对失败');
      console.error('课表比对失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatisticsChart = () => {
    if (!comparisonResult) return null;

    const chartData = comparisonResult.analysis?.statistics?.scheduleStats?.map((stat: any) => ({
      name: stat.name,
      课程数: stat.totalCourses,
      学分数: stat.totalCredits,
      忙碌时间: stat.busyHours,
      空闲时间: stat.freeHours || 0
    })) || [];

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="课程数" fill="#8884d8" />
          <Bar dataKey="学分数" fill="#82ca9d" />
          <Bar dataKey="忙碌时间" fill="#ffc658" />
          <Bar dataKey="空闲时间" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Box>
      {/* 分享我的课表 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            分享我的课表
          </Typography>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => setShareDialogOpen(true)}
          >
            分享课表
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary">
          将您的课表分享给其他用户，便于进行课表比对和时间协调
        </Typography>
      </Paper>

      {/* 共享课表列表 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          可比对的课表 ({sharedSchedules.length})
        </Typography>
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : sharedSchedules.length === 0 ? (
          <Alert severity="info">
            暂无可比对的课表，请先分享您的课表或等待其他用户分享
          </Alert>
        ) : (
          <Box display="flex" flexWrap="wrap" gap={2}>
            {sharedSchedules.map((schedule) => (
              <Box key={schedule._id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedSchedules.includes(schedule._id!) ? 2 : 1,
                    borderColor: selectedSchedules.includes(schedule._id!) ? 'primary.main' : 'divider'
                  }}
                  onClick={() => handleScheduleSelect(schedule._id!)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <ScheduleIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {schedule.name}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      分享者：{schedule.owner}
                    </Typography>
                    {schedule.description && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {schedule.description}
                      </Typography>
                    )}
                    <Box mt={1}>
                      <Chip
                        label={schedule.isPublic ? '公开' : '私有'}
                        size="small"
                        color={schedule.isPublic ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        )}
        
        {selectedSchedules.length > 0 && (
          <Box mt={3} display="flex" justifyContent="center">
            <Button
              variant="contained"
              size="large"
              startIcon={<CompareIcon />}
              onClick={performComparison}
              disabled={loading}
            >
              开始比对分析 ({selectedSchedules.length + 1}个课表)
            </Button>
          </Box>
        )}
      </Paper>

      {/* 比对结果 */}
      {comparisonResult && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            <AnalyticsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            比对分析结果
          </Typography>

          {/* 统计图表 */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">课表统计对比</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {renderStatisticsChart()}
            </AccordionDetails>
          </Accordion>

          {/* 共同课程 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                共同课程 ({comparisonResult.analysis?.commonCourses?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!comparisonResult.analysis?.commonCourses || comparisonResult.analysis.commonCourses.length === 0 ? (
                <Typography color="text.secondary">没有共同课程</Typography>
              ) : (
                <List>
                  {comparisonResult.analysis.commonCourses.map((course: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CourseIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary={course}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </AccordionDetails>
          </Accordion>

          {/* 共同空闲时间 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                共同空闲时间 ({comparisonResult.analysis?.commonFreeTime?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!comparisonResult.analysis?.commonFreeTime || comparisonResult.analysis.commonFreeTime.length === 0 ? (
                <Typography color="text.secondary">没有共同空闲时间</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>星期</TableCell>
                        <TableCell>开始时间</TableCell>
                        <TableCell>结束时间</TableCell>
                        <TableCell>时长</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonResult.analysis.commonFreeTime.map((time: any, index: number) => {
                        const duration = time.duration || 0;
                        return (
                          <TableRow key={index}>
                            <TableCell>{dayNames[time.day]}</TableCell>
                            <TableCell>{time.startTime}</TableCell>
                            <TableCell>{time.endTime}</TableCell>
                            <TableCell>{Math.floor(duration / 60)}小时{duration % 60}分钟</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>

          {/* 时间冲突 */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                时间冲突 ({comparisonResult.analysis?.timeConflicts?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {!comparisonResult.analysis?.timeConflicts || comparisonResult.analysis.timeConflicts.length === 0 ? (
                <Alert severity="success">没有时间冲突，课表安排合理</Alert>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>星期</TableCell>
                        <TableCell>时间段</TableCell>
                        <TableCell>冲突课程</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonResult.analysis.timeConflicts.map((conflict: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{dayNames[conflict.day]}</TableCell>
                          <TableCell>{conflict.startTime} - {conflict.endTime}</TableCell>
                          <TableCell>
                            {conflict.courses?.map((course: string, i: number) => (
                              <Chip
                                key={i}
                                label={course}
                                size="small"
                                color="error"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </AccordionDetails>
          </Accordion>

          {/* 独有课程 */}
          <Accordion>
             <AccordionSummary expandIcon={<ExpandMoreIcon />}>
               <Typography variant="subtitle1">
                 课表统计信息
               </Typography>
             </AccordionSummary>
             <AccordionDetails>
               <TableContainer>
                 <Table size="small">
                   <TableHead>
                     <TableRow>
                       <TableCell>课表名称</TableCell>
                       <TableCell>拥有者</TableCell>
                       <TableCell>课程数</TableCell>
                       <TableCell>学分</TableCell>
                       <TableCell>忙碌时间</TableCell>
                       <TableCell>平均评分</TableCell>
                     </TableRow>
                   </TableHead>
                   <TableBody>
                     {comparisonResult.analysis.statistics.scheduleStats.map((stat: any, index: number) => (
                       <TableRow key={index}>
                         <TableCell>{stat.name}</TableCell>
                         <TableCell>{stat.owner}</TableCell>
                         <TableCell>{stat.totalCourses}</TableCell>
                         <TableCell>{stat.totalCredits}</TableCell>
                         <TableCell>{stat.busyHours}h</TableCell>
                         <TableCell>{stat.averageRating.toFixed(1)}</TableCell>
                       </TableRow>
                     ))}
                   </TableBody>
                 </Table>
               </TableContainer>
             </AccordionDetails>
           </Accordion>
        </Paper>
      )}

      {/* 分享课表对话框 */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>分享我的课表</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="课表名称"
              value={shareFormData.name}
              onChange={(e) => setShareFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="例如：张三的2024春季课表"
              required
            />
            <TextField
              fullWidth
              label="课表描述"
              value={shareFormData.description}
              onChange={(e) => setShareFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="简单描述您的课表特点"
              multiline
              rows={3}
            />
            <Alert severity="info">
              分享后，其他用户可以看到您的课表并与您进行时间比对分析
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>取消</Button>
          <Button
            onClick={handleShareSchedule}
            variant="contained"
            disabled={!shareFormData.name.trim() || loading}
          >
            {loading ? '分享中...' : '确认分享'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 错误和成功提示 */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default ScheduleComparison;