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
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Preview as PreviewIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { blogService, Blog, BlogFormData } from '../../services/blogService';

interface BlogModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  blog?: Blog | null;
  categories: string[];
  existingTags: string[];
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

const BlogModal: React.FC<BlogModalProps> = ({
  open,
  onClose,
  onSave,
  blog,
  categories,
  existingTags,
}) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: '日记',
    status: '草稿',
    isPublic: true,
  });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // 初始化表单数据
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        tags: blog.tags ? blog.tags.join(', ') : '',
        category: blog.category || '',
        status: blog.status || '草稿',
        isPublic: blog.isPublic !== undefined ? blog.isPublic : true,
      });
      setSelectedTags(blog.tags || []);
    } else {
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        tags: '',
        category: categories.length > 0 ? categories[0] : '日记',
        status: '已发布',
        isPublic: true,
      });
      setSelectedTags([]);
    }
    setTabValue(0);
    setError(null);
    setNewTag('');
    setNewCategory('');
    setShowNewCategory(false);
    setFeaturedImage(null);
    setImagePreview(null);
  }, [blog, open]);

  // 处理输入变化
  const handleInputChange = (field: keyof BlogFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 处理标签添加
  const handleAddTag = () => {
    if (newTag && newTag.trim() && !selectedTags.includes(newTag.trim())) {
      const updatedTags = [...selectedTags, newTag.trim()];
      setSelectedTags(updatedTags);
      setFormData(prev => ({ ...prev, tags: updatedTags.join(', ') }));
      setNewTag('');
    }
  };

  // 处理标签删除
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(updatedTags);
    setFormData(prev => ({ ...prev, tags: updatedTags.join(', ') }));
  };

  // 处理分类选择
  const handleCategoryChange = (value: string) => {
    if (value === 'new') {
      setShowNewCategory(true);
    } else {
      setFormData(prev => ({ ...prev, category: value }));
      setShowNewCategory(false);
    }
  };

  // 处理新分类添加
  const handleAddCategory = () => {
    if (newCategory && newCategory.trim()) {
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setShowNewCategory(false);
      setNewCategory('');
    }
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理保存
  const handleSave = async () => {
    if (!formData.title || !formData.title.trim() || !formData.content || !formData.content.trim()) {
      setError('标题和内容不能为空');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submitData: BlogFormData = {
        ...formData,
        featuredImage: featuredImage || undefined,
      };

      if (blog) {
        await blogService.updateBlog(blog._id, submitData);
      } else {
        await blogService.createBlog(submitData);
      }

      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || '保存失败');
      console.error('Error saving blog:', err);
    } finally {
      setLoading(false);
    }
  };

  // Markdown 渲染组件
  const MarkdownRenderer = ({ content }: { content: string }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ inline, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={tomorrow as any}
              language={match[1]}
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {blog ? '编辑博客' : '新建博客'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 基本信息 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box>
            <TextField
              fullWidth
              label="标题"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              required
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ flex: '1 1 300px' }}>
            <FormControl fullWidth>
              <InputLabel>分类</InputLabel>
              <Select
                value={showNewCategory ? 'new' : formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                label="分类"
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
                <MenuItem value="new">+ 新建分类</MenuItem>
              </Select>
            </FormControl>
            {showNewCategory && (
              <Box sx={{ display: 'flex', mt: 1 }}>
                <TextField
                  size="small"
                  label="新分类名称"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button onClick={handleAddCategory} variant="outlined">
                  添加
                </Button>
              </Box>
            )}
            </Box>
            
            <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>状态</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="状态"
              >
                <MenuItem value="草稿">草稿</MenuItem>
                <MenuItem value="已发布">已发布</MenuItem>
                <MenuItem value="私密">私密</MenuItem>
              </Select>
            </FormControl>
            </Box>
            
            <Box sx={{ minWidth: 150 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublic}
                  onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                />
              }
              label="公开可见"
            />
            </Box>
          </Box>
        </Box>

        {/* 标签管理 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            标签
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                deleteIcon={<CloseIcon />}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              label="添加标签"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              sx={{ flexGrow: 1 }}
            />
            <Button onClick={handleAddTag} variant="outlined" startIcon={<AddIcon />}>
              添加
            </Button>
          </Box>
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              常用标签：
            </Typography>
            {existingTags.slice(0, 10).map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mt: 0.5 }}
                onClick={() => {
                  if (!selectedTags.includes(tag)) {
                    const updatedTags = [...selectedTags, tag];
                    setSelectedTags(updatedTags);
                    setFormData(prev => ({ ...prev, tags: updatedTags.join(', ') }));
                  }
                }}
              />
            ))}
          </Box>
        </Box>

        {/* 摘要 */}
        <TextField
          fullWidth
          label="摘要（可选）"
          value={formData.excerpt}
          onChange={(e) => handleInputChange('excerpt', e.target.value)}
          multiline
          rows={2}
          sx={{ mb: 3 }}
          helperText="如果不填写，将自动从内容中提取"
        />

        {/* 特色图片 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            特色图片（可选）
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="featured-image-upload"
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="featured-image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<ImageIcon />}
            >
              选择图片
            </Button>
          </label>
          {imagePreview && (
            <Box sx={{ mt: 2 }}>
              <img
                src={imagePreview}
                alt="预览"
                style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
              />
            </Box>
          )}
        </Box>

        {/* 内容编辑区域 */}
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
            <Tab icon={<EditIcon />} label="编辑" />
            <Tab icon={<PreviewIcon />} label="预览" />
          </Tabs>
          
          <TabPanel value={tabValue} index={0}>
            <TextField
              fullWidth
              multiline
              rows={15}
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="在这里写下你的博客内容，支持 Markdown 语法..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
              }}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 2, minHeight: 400, maxHeight: 400, overflow: 'auto' }}>
              {formData.content ? (
                <MarkdownRenderer content={formData.content} />
              ) : (
                <Typography color="text.secondary">
                  在编辑模式下输入内容后，可以在这里预览效果
                </Typography>
              )}
            </Box>
          </TabPanel>
        </Box>

        {/* Markdown 语法提示 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            支持 Markdown 语法：**粗体**、*斜体*、`代码`、[链接](url)、![图片](url)、
            ```代码块```、表格、任务列表等
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || !formData.title || !formData.title.trim() || !formData.content || !formData.content.trim()}
        >
          {loading ? '保存中...' : (blog ? '更新' : '创建')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlogModal;