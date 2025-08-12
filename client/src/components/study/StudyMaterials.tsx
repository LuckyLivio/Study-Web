import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  EyeIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import { studyMaterialsApi, StudyMaterial } from '../../services/studyService';
import StudyMaterialModal from './StudyMaterialModal';

interface StudyMaterialsProps {
  searchTerm: string;
}

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ searchTerm }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    subject: '',
    category: '',
    difficulty: '',
  });

  const categories = ['课件', '教材', '习题集', '参考资料', '视频教程', '其他'];
  const difficulties = ['入门', '基础', '中级', '高级'];

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      
      // 检查是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('用户未登录，无法获取学习资料');
        setMaterials([]);
        return;
      }
      
      const response = await studyMaterialsApi.getMaterials({
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...filters,
      });
      setMaterials(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error: any) {
      console.error('获取资料失败:', error);
      
      // 如果是认证错误，清空数据
      if (error?.data?.error === 'NETWORK_ERROR' || error?.response?.status === 401) {
        console.log('认证失败，用户可能需要重新登录');
        setMaterials([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [currentPage, searchTerm, filters]);

  const handleUpload = () => {
    setIsModalOpen(true);
  };

  const handleDownload = async (material: StudyMaterial) => {
    try {
      const blob = await studyMaterialsApi.downloadMaterial(material._id!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = material.fileInfo.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('下载失败:', error);
      alert('下载失败，请重试');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个资料吗？')) {
      try {
        await studyMaterialsApi.deleteMaterial(id);
        fetchMaterials();
      } catch (error) {
        console.error('删除资料失败:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    fetchMaterials();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('word') || mimetype.includes('document')) return '📝';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return '📊';
    if (mimetype.includes('powerpoint') || mimetype.includes('presentation')) return '📽️';
    if (mimetype.includes('text')) return '📃';
    return '📁';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '入门':
        return 'bg-green-100 text-green-800';
      case '基础':
        return 'bg-blue-100 text-blue-800';
      case '中级':
        return 'bg-yellow-100 text-yellow-800';
      case '高级':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '课件': 'bg-blue-100 text-blue-800',
      '教材': 'bg-purple-100 text-purple-800',
      '习题集': 'bg-orange-100 text-orange-800',
      '参考资料': 'bg-indigo-100 text-indigo-800',
      '视频教程': 'bg-pink-100 text-pink-800',
      '其他': 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 操作栏 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-4">
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有科目</option>
            <option value="数学">数学</option>
            <option value="英语">英语</option>
            <option value="计算机">计算机</option>
            <option value="物理">物理</option>
            <option value="化学">化学</option>
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
            className="input-field w-auto min-w-[120px]"
          >
            <option value="">所有难度</option>
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleUpload}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>上传资料</span>
        </button>
      </div>

      {/* 资料网格 */}
      {materials.length === 0 ? (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无学习资料</h3>
          <p className="mt-1 text-sm text-gray-500">上传你的第一个学习资料吧！</p>
          <div className="mt-6">
            <button onClick={handleUpload} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              上传资料
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material._id}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              {/* 文件图标和基本信息 */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="text-3xl">
                  {getFileIcon(material.fileInfo.mimetype)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {material.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {material.fileInfo.originalName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(material.fileInfo.size)}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleDownload(material)}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    title="下载"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(material._id!)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="删除"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 描述 */}
              {material.description && (
                <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                  {material.description}
                </p>
              )}

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                  {material.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(material.difficulty)}`}>
                  {material.difficulty}
                </span>
                {material.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {material.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    +{material.tags.length - 2}
                  </span>
                )}
              </div>

              {/* 统计信息 */}
              <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>{material.downloadCount || 0}</span>
                  </div>
                  {material.rating && material.rating.count > 0 && (
                    <div className="flex items-center space-x-1">
                      <span>⭐</span>
                      <span>{material.rating.average.toFixed(1)}</span>
                      <span>({material.rating.count})</span>
                    </div>
                  )}
                </div>
                <span>{new Date(material.createdAt!).toLocaleDateString()}</span>
              </div>

              {/* 科目和下载按钮 */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {material.subject}
                </span>
                <button
                  onClick={() => handleDownload(material)}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  下载
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          
          <span className="px-3 py-2 text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}

      {/* 上传模态框 */}
      <StudyMaterialModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </div>
  );
};

export default StudyMaterials;