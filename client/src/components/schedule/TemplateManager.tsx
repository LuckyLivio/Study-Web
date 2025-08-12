import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  FormControlLabel,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Schedule as ScheduleIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import scheduleService, { ScheduleTemplate } from '../../services/scheduleService';

interface TemplateManagerProps {
  onTemplateApply: (template: ScheduleTemplate) => void;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  onTemplateApply,
  onSuccess,
  onError
}) => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<ScheduleTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await scheduleService.getScheduleTemplates();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      onError('加载模板失败');
      console.error('加载模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      isDefault: false
    });
    setModalOpen(true);
  };

  const handleEditTemplate = (template: ScheduleTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      isDefault: template.isDefault || false
    });
    setModalOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!formData.name.trim()) {
      onError('请输入模板名称');
      return;
    }

    try {
      setLoading(true);
      
      if (editingTemplate) {
        // 更新模板
        const response = await scheduleService.updateScheduleTemplate(editingTemplate._id!, {
          name: formData.name,
          description: formData.description,
          isDefault: formData.isDefault
        });
        
        if (response.success) {
          onSuccess('模板更新成功');
          loadTemplates();
          setModalOpen(false);
        } else {
          onError('模板更新失败');
        }
      } else {
        // 创建新模板
        const response = await scheduleService.createScheduleTemplate({
          name: formData.name,
          description: formData.description,
          timeSlots: [],
          isDefault: formData.isDefault
        });
        
        if (response.success) {
          onSuccess('模板创建成功');
          loadTemplates();
          setModalOpen(false);
        } else {
          onError('模板创建失败');
        }
      }
    } catch (error) {
      onError(editingTemplate ? '模板更新失败' : '模板创建失败');
      console.error('保存模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (template: ScheduleTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      setLoading(true);
      await scheduleService.deleteScheduleTemplate(templateToDelete._id!);
      onSuccess('模板删除成功');
      loadTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      onError('模板删除失败');
      console.error('删除模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (template: ScheduleTemplate) => {
    try {
      setLoading(true);
      await scheduleService.setDefaultTemplate(template._id!);
      onSuccess('默认模板设置成功');
      loadTemplates();
    } catch (error) {
      onError('设置默认模板失败');
      console.error('设置默认模板失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (template: ScheduleTemplate) => {
    onTemplateApply(template);
    onSuccess(`已应用模板：${template.name}`);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  return (
    <Box>
      {/* 头部操作栏 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          课表模板管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTemplate}
          disabled={loading}
        >
          创建模板
        </Button>
      </Box>

      {/* 模板列表 */}
      {templates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ScheduleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无课表模板
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            创建您的第一个课表模板，方便快速应用课程安排
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
            sx={{ mt: 2 }}
          >
            创建模板
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {templates.map((template) => (
            <Card
              key={template._id}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: template.isDefault ? '2px solid' : '1px solid',
                borderColor: template.isDefault ? 'primary.main' : 'divider'
              }}
            >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="h6" component="div" noWrap>
                      {template.name}
                    </Typography>
                    {template.isDefault && (
                      <Chip
                        icon={<StarIcon />}
                        label="默认"
                        color="primary"
                        size="small"
                      />
                    )}
                  </Box>
                  
                  {template.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {template.description}
                    </Typography>
                  )}
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      课程数量：{template.courses?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      创建时间：{new Date(template.createdAt || '').toLocaleDateString()}
                    </Typography>
                    {template.updatedAt && template.updatedAt !== template.createdAt && (
                      <Typography variant="body2" color="text.secondary">
                        更新时间：{new Date(template.updatedAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleApplyTemplate(template)}
                    startIcon={<DownloadIcon />}
                  >
                    应用
                  </Button>
                  
                  {!template.isDefault && (
                    <IconButton
                      size="small"
                      onClick={() => handleSetDefault(template)}
                      title="设为默认"
                    >
                      <StarBorderIcon />
                    </IconButton>
                  )}
                  
                  <IconButton
                    size="small"
                    onClick={() => handleEditTemplate(template)}
                    title="编辑"
                  >
                    <EditIcon />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(template)}
                    color="error"
                    title="删除"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* 使用说明 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>模板功能说明：</strong>
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>创建模板：</strong>将当前课表保存为模板，方便后续学期使用<br/>
          • <strong>应用模板：</strong>快速应用已保存的课表模板到当前学期<br/>
          • <strong>默认模板：</strong>设置常用的模板为默认，新学期自动应用<br/>
          • <strong>模板管理：</strong>支持编辑模板信息和删除不需要的模板
        </Typography>
      </Alert>

      {/* 创建/编辑模板对话框 */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTemplate ? '编辑模板' : '创建模板'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="模板名称"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="输入模板名称..."
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="模板描述"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="输入模板描述（可选）..."
            sx={{ mb: 2 }}
          />
          
          <FormControlLabel
            control={
              <Switch
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
            }
            label="设为默认模板"
          />
          
          {formData.isDefault && (
            <Alert severity="info" sx={{ mt: 2 }}>
              设为默认模板后，新学期将自动应用此模板的课程安排。
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>取消</Button>
          <Button
            onClick={handleSaveTemplate}
            variant="contained"
            disabled={loading || !formData.name.trim()}
          >
            {editingTemplate ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除模板</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除模板 "{templateToDelete?.name}" 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            此操作不可撤销，模板中的所有课程安排将被永久删除。
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

export default TemplateManager;