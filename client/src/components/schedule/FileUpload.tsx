import React, { useState, useEffect, useCallback } from 'react';
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
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Image as ImageIcon,
  TableChart as ExcelIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  DragIndicator as DragIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import scheduleService, { ScheduleFile } from '../../services/scheduleService';

interface FileUploadProps {
  onUploadSuccess: () => void;
  onError: (error: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  onError
}) => {
  const [files, setFiles] = useState<ScheduleFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<ScheduleFile | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<ScheduleFile | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await scheduleService.getUploadedFiles();
      if (response.success && response.data) {
        setFiles(response.data);
      }
    } catch (error) {
      onError('加载文件列表失败');
      console.error('加载文件失败:', error);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    // 验证文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      onError('不支持的文件类型，请上传图片或Excel文件');
      return;
    }
    
    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      onError('文件大小超过限制（最大10MB）');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await scheduleService.uploadScheduleFile(file, notes);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (response.success) {
        onUploadSuccess();
        loadFiles();
        setNotes('');
        setTimeout(() => {
          setUploadProgress(0);
        }, 1000);
      } else {
        onError('文件上传失败');
      }
    } catch (error) {
      onError('文件上传失败');
      console.error('上传失败:', error);
    } finally {
      setUploading(false);
    }
  }, [notes, onUploadSuccess, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    disabled: uploading
  });

  const handleDeleteClick = (file: ScheduleFile) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await scheduleService.deleteUploadedFile(fileToDelete._id!);
      loadFiles();
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (error) {
      onError('删除文件失败');
      console.error('删除文件失败:', error);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFileToDelete(null);
  };

  const handlePreview = (file: ScheduleFile) => {
    setPreviewFile(file);
    setPreviewDialogOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewDialogOpen(false);
    setPreviewFile(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    return fileType === 'image' ? <ImageIcon /> : <ExcelIcon />;
  };

  const getFileTypeLabel = (fileType: string) => {
    return fileType === 'image' ? '图片' : 'Excel';
  };

  return (
    <Box>
      {/* 上传区域 */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.50' : 'grey.50',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: uploading ? 'grey.300' : 'primary.main',
            backgroundColor: uploading ? 'grey.50' : 'primary.50'
          }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? '放开文件以上传' : '拖拽文件到此处或点击选择文件'}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          支持图片格式：JPEG, PNG, GIF, WebP
        </Typography>
        <Typography variant="body2" color="text.secondary">
          支持表格格式：Excel (.xls, .xlsx)
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          最大文件大小：10MB
        </Typography>
        
        {uploading && (
          <Box sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              上传进度：{uploadProgress}%
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 备注输入 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          label="文件备注（可选）"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="为上传的文件添加备注信息..."
          disabled={uploading}
        />
      </Paper>

      {/* 文件列表 */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          已上传的文件 ({files.length})
        </Typography>
        
        {files.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
            textAlign="center"
          >
            <UploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              暂无上传文件
            </Typography>
            <Typography variant="body2" color="text.secondary">
              上传您的课表图片或Excel文件开始管理
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
            {files.map((file) => (
              <Card
                key={file._id}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getFileIcon(file.fileType)}
                      <Chip
                        label={getFileTypeLabel(file.fileType)}
                        size="small"
                        color={file.fileType === 'image' ? 'primary' : 'secondary'}
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    
                    <Typography variant="subtitle2" gutterBottom noWrap>
                      {file.originalName}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      大小：{formatFileSize(file.fileSize)}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      上传时间：{new Date(file.uploadDate || '').toLocaleString()}
                    </Typography>
                    
                    {file.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: 'grey.100',
                          borderRadius: 1,
                          fontSize: '0.75rem'
                        }}
                      >
                        {file.notes}
                      </Typography>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    {file.fileType === 'image' && (
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(file)}
                        title="预览"
                      >
                        <ViewIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(file)}
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
      </Paper>

      {/* 使用说明 */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" gutterBottom>
          <strong>使用说明：</strong>
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>图片文件：</strong>可以上传课表截图，方便查看和备份<br/>
          • <strong>Excel文件：</strong>可以上传课表数据文件，后续可能支持自动解析<br/>
          • <strong>文件管理：</strong>支持预览图片文件和删除不需要的文件<br/>
          • <strong>备注功能：</strong>为每个文件添加备注，方便识别和管理
        </Typography>
      </Alert>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除文件</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除文件 "{fileToDelete?.originalName}" 吗？
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 图片预览对话框 */}
      <Dialog
        open={previewDialogOpen}
        onClose={handlePreviewClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          图片预览 - {previewFile?.originalName}
        </DialogTitle>
        <DialogContent>
          {previewFile && (
            <Box
              component="img"
              src={`/api/schedule/files/${previewFile._id}/preview`}
              alt={previewFile.originalName}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
              onError={(e) => {
                // 如果图片加载失败，显示占位符
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7ml6Dms5XpooTop4jlm748L3RleHQ+PC9zdmc+';
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePreviewClose}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileUpload;