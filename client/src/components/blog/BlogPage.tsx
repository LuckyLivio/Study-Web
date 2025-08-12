import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Pagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Tooltip,
} from '@mui/material';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  ThumbUp as LikeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';
import { blogService, Blog, BlogListParams, TagCloudItem } from '../../services/blogService';
import BlogModal from '../blog/BlogModal';
import BlogDetailModal from '../blog/BlogDetailModal';

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [tagCloud, setTagCloud] = useState<TagCloudItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  const limit = 9; // 每页显示9篇博客

  // 加载博客列表
  const loadBlogs = async () => {
    try {
      setLoading(true);
      const params: BlogListParams = {
        page,
        limit,
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        tags: selectedTag || undefined,
        sortBy,
        sortOrder,
      };
      
      const response = await blogService.getBlogs(params);
      setBlogs(response.blogs);
      setTotalPages(Math.ceil(response.pagination.total / limit));
    } catch (err) {
      setError('加载博客失败');
      console.error('Error loading blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  // 加载元数据
  const loadMetadata = async () => {
    try {
      const [categoriesData, tagCloudData] = await Promise.all([
        blogService.getCategories(),
        blogService.getTagCloud(),
      ]);
      setCategories(categoriesData);
      setTagCloud(tagCloudData);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, [page, searchTerm, selectedCategory, selectedTag, sortBy, sortOrder]);

  useEffect(() => {
    loadMetadata();
  }, []);

  // 处理搜索
  const handleSearch = () => {
    setPage(1);
    loadBlogs();
  };

  // 处理博客创建/编辑成功
  const handleBlogSaved = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
    loadBlogs();
    loadMetadata();
  };

  // 处理博客删除
  const handleDeleteBlog = async () => {
    if (!blogToDelete) return;
    
    try {
      await blogService.deleteBlog(blogToDelete._id);
      setDeleteDialogOpen(false);
      setBlogToDelete(null);
      loadBlogs();
    } catch (err) {
      setError('删除博客失败');
      console.error('Error deleting blog:', err);
    }
  };

  // 处理点赞
  const handleLikeBlog = async (blog: Blog) => {
    try {
      const result = await blogService.likeBlog(blog._id);
      setBlogs(blogs.map(b => 
        b._id === blog._id ? { ...b, likes: result.likes } : b
      ));
    } catch (err) {
      console.error('Error liking blog:', err);
    }
  };

  // 查看博客详情
  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsDetailModalOpen(true);
  };

  // 编辑博客
  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  // 确认删除博客
  const confirmDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog);
    setDeleteDialogOpen(true);
  };

  // 重置筛选
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  if (loading && blogs.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>加载中...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 页面标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <BookOpenIcon style={{ width: 32, height: 32, marginRight: 12, color: '#1976d2' }} />
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
          博客日记
        </Typography>
      </Box>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 搜索和筛选区域 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box sx={{ minWidth: 200, flex: '1 1 auto' }}>
            <TextField
              fullWidth
              label="搜索博客"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>分类</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="分类"
              >
                <MenuItem value="">全部分类</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>标签</InputLabel>
              <Select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                label="标签"
              >
                <MenuItem value="">全部标签</MenuItem>
                {tagCloud.map((tag) => (
                  <MenuItem key={tag.tag} value={tag.tag}>
                    {tag.tag} ({tag.count})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ minWidth: 150 }}>
            <FormControl fullWidth>
              <InputLabel>排序</InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order as 'asc' | 'desc');
                }}
                label="排序"
              >
                <MenuItem value="createdAt-desc">最新发布</MenuItem>
                <MenuItem value="createdAt-asc">最早发布</MenuItem>
                <MenuItem value="views-desc">浏览最多</MenuItem>
                <MenuItem value="likes-desc">点赞最多</MenuItem>
                <MenuItem value="title-asc">标题A-Z</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <Button onClick={resetFilters} variant="outlined">
              重置
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 博客列表 */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 3 }}>
        {blogs.map((blog) => (
            <Card key={blog._id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {blog.excerpt || blog.content.substring(0, 100) + '...'}
                </Typography>
                
                {/* 标签 */}
                <Box sx={{ mb: 2 }}>
                  {blog.tags.slice(0, 3).map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      icon={<TagIcon />}
                    />
                  ))}
                  {blog.tags.length > 3 && (
                    <Chip
                      label={`+${blog.tags.length - 3}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>
                
                {/* 分类和状态 */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CategoryIcon sx={{ mr: 0.5, fontSize: 16 }} />
                  <Typography variant="caption" sx={{ mr: 2 }}>
                    {blog.category}
                  </Typography>
                  <Chip
                    label={blog.status}
                    size="small"
                    color={blog.status === '已发布' ? 'success' : 'default'}
                  />
                </Box>
                
                {/* 统计信息 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      {blog.views}
                    </Typography>
                    <LikeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">
                      {blog.likes}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
              
              <CardActions>
                <Button
                  size="small"
                  onClick={() => handleViewBlog(blog)}
                  startIcon={<ViewIcon />}
                >
                  查看
                </Button>
                <Button
                  size="small"
                  onClick={() => handleEditBlog(blog)}
                  startIcon={<EditIcon />}
                >
                  编辑
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => confirmDeleteBlog(blog)}
                  startIcon={<DeleteIcon />}
                >
                  删除
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleLikeBlog(blog)}
                  color={blog.likes > 0 ? 'primary' : 'default'}
                >
                  <LikeIcon />
                </IconButton>
              </CardActions>
            </Card>
        ))}
      </Box>

      {/* 分页 */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* 添加博客按钮 */}
      <Tooltip title="写新博客">
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setIsModalOpen(true)}
        >
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* 博客编辑模态框 */}
      <BlogModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBlog(null);
        }}
        onSave={handleBlogSaved}
        blog={selectedBlog}
        categories={categories}
        existingTags={tagCloud.map(t => t.tag)}
      />

      {/* 博客详情模态框 */}
      <BlogDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedBlog(null);
        }}
        blog={selectedBlog}
        onEdit={handleEditBlog}
        onDelete={confirmDeleteBlog}
        onLike={handleLikeBlog}
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除博客 "{blogToDelete?.title}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
          <Button onClick={handleDeleteBlog} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BlogPage;