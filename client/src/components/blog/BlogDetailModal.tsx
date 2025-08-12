import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  IconButton,
  Divider,
  Avatar,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ThumbUp as LikeIcon,
  ThumbUpOutlined as LikeOutlinedIcon,
  Visibility as ViewIcon,
  Schedule as ScheduleIcon,
  Category as CategoryIcon,
  LocalOffer as TagIcon,
  Person as PersonIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Blog } from '../../services/blogService';

interface BlogDetailModalProps {
  open: boolean;
  onClose: () => void;
  blog: Blog | null;
  onEdit: (blog: Blog) => void;
  onDelete: (blog: Blog) => void;
  onLike: (blog: Blog) => void;
}

const BlogDetailModal: React.FC<BlogDetailModalProps> = ({
  open,
  onClose,
  blog,
  onEdit,
  onDelete,
  onLike,
}) => {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // 这里可以检查用户是否已经点赞过这篇博客
    // 暂时设为 false
    setLiked(false);
  }, [blog]);

  if (!blog) return null;

  const handleLike = () => {
    onLike(blog);
    setLiked(!liked);
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
            <code
              className={className}
              style={{
                backgroundColor: '#f5f5f5',
                padding: '2px 4px',
                borderRadius: '3px',
                fontSize: '0.9em',
              }}
            >
              {children}
            </code>
          );
        },
        h1: ({ children }) => (
          <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 3, mb: 2 }}>
            {children}
          </Typography>
        ),
        h2: ({ children }) => (
          <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 3, mb: 2 }}>
            {children}
          </Typography>
        ),
        h3: ({ children }) => (
          <Typography variant="h6" component="h3" gutterBottom sx={{ mt: 2, mb: 1 }}>
            {children}
          </Typography>
        ),
        p: ({ children }) => (
          <Typography variant="body1" paragraph>
            {children}
          </Typography>
        ),
        blockquote: ({ children }) => (
          <Box
            sx={{
              borderLeft: 4,
              borderColor: 'primary.main',
              pl: 2,
              py: 1,
              my: 2,
              backgroundColor: 'grey.50',
              fontStyle: 'italic',
            }}
          >
            {children}
          </Box>
        ),
        table: ({ children }) => (
          <Box sx={{ overflowX: 'auto', my: 2 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              {children}
            </table>
          </Box>
        ),
        th: ({ children }) => (
          <th
            style={
              {
                border: '1px solid #ddd',
                padding: '8px 12px',
                backgroundColor: '#f5f5f5',
                textAlign: 'left',
              }
            }
          >
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td
            style={{
              border: '1px solid #ddd',
              padding: '8px 12px',
            }}
          >
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1, pr: 2 }}>
            {blog.title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* 博客元信息 */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {/* 作者信息 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                  <PersonIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">{blog.author}</Typography>
              </Box>

              {/* 分类 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">{blog.category}</Typography>
              </Box>

              {/* 状态 */}
              <Chip
                label={blog.status}
                size="small"
                color={blog.status === '已发布' ? 'success' : 'default'}
              />

              {/* 发布时间 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  {new Date(blog.createdAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>

              {/* 阅读时间 */}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  约 {blog.readingTime} 分钟
                </Typography>
              </Box>
            </Box>

            {/* 统计信息 */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ViewIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  {blog.views} 次浏览
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LikeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                <Typography variant="body2">
                  {blog.likes} 个赞
                </Typography>
              </Box>
            </Box>

            {/* 标签 */}
            {blog.tags.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TagIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2">标签：</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {blog.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* 摘要 */}
            {blog.excerpt && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {blog.excerpt}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        {/* 博客内容 */}
        <Box sx={{ '& > *:first-of-type': { mt: 0 } }}>
          <MarkdownRenderer content={blog.content} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          {/* 左侧：点赞按钮 */}
          <Box>
            <Tooltip title={liked ? '取消点赞' : '点赞'}>
              <IconButton
                onClick={handleLike}
                color={liked ? 'primary' : 'default'}
                size="large"
              >
                {liked ? <LikeIcon /> : <LikeOutlinedIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* 右侧：操作按钮 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => onEdit(blog)}
              startIcon={<EditIcon />}
              variant="outlined"
            >
              编辑
            </Button>
            <Button
              onClick={() => onDelete(blog)}
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
            >
              删除
            </Button>
            <Button onClick={onClose} variant="contained">
              关闭
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default BlogDetailModal;