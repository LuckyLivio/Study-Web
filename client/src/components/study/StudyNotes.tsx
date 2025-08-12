import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  EyeIcon,
  HeartIcon,
  TagIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { studyNotesApi, StudyNote } from '../../services/studyService';
import StudyNoteModal from './StudyNoteModal';

interface StudyNotesProps {
  searchTerm: string;
}

const StudyNotes: React.FC<StudyNotesProps> = ({ searchTerm }) => {
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<StudyNote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    subject: '',
    category: '',
  });

  const categories = ['课堂笔记', '复习总结', '知识点整理', '错题集', '其他'];
  const difficulties = ['简单', '中等', '困难'];

  const fetchNotes = async () => {
    try {
      setLoading(true);
      
      // 检查是否有token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('用户未登录，无法获取学习笔记');
        setNotes([]);
        return;
      }
      
      const response = await studyNotesApi.getNotes({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...filters,
      });
      setNotes(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.pages);
      }
    } catch (error: any) {
      console.error('获取学习笔记失败:', error);
      
      // 如果是认证错误，清空数据
      if (error?.data?.error === 'NETWORK_ERROR' || error?.response?.status === 401) {
        console.log('认证失败，用户可能需要重新登录');
        setNotes([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [currentPage, searchTerm, filters]);

  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: StudyNote) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm('确定要删除这个笔记吗？')) {
      try {
        await studyNotesApi.deleteNote(id);
        fetchNotes();
      } catch (error) {
        console.error('删除笔记失败:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedNote(null);
    fetchNotes();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case '简单':
        return 'bg-green-100 text-green-800';
      case '中等':
        return 'bg-yellow-100 text-yellow-800';
      case '困难':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      '课堂笔记': 'bg-blue-100 text-blue-800',
      '复习总结': 'bg-purple-100 text-purple-800',
      '知识点整理': 'bg-indigo-100 text-indigo-800',
      '错题集': 'bg-red-100 text-red-800',
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
        </div>
        
        <button
          onClick={handleCreateNote}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>新建笔记</span>
        </button>
      </div>

      {/* 笔记网格 */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无笔记</h3>
          <p className="mt-1 text-sm text-gray-500">开始创建你的第一个学习笔记吧！</p>
          <div className="mt-6">
            <button onClick={handleCreateNote} className="btn-primary">
              <PlusIcon className="h-5 w-5 mr-2" />
              新建笔记
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note._id}
              className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleEditNote(note)}
            >
              {/* 笔记头部 */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {note.title}
                </h3>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote(note);
                    }}
                    className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id!);
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* 笔记内容预览 */}
              <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                {note.content.replace(/[#*`]/g, '').substring(0, 150)}...
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(note.category)}`}>
                  {note.category}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(note.difficulty)}`}>
                  {note.difficulty}
                </span>
                {note.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>

              {/* 笔记底部信息 */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="h-4 w-4" />
                    <span>{note.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="h-4 w-4" />
                    <span>{note.likeCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(note.createdAt!).toLocaleDateString()}</span>
                </div>
              </div>

              {/* 科目标签 */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {note.subject}
                </span>
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

      {/* 笔记编辑模态框 */}
      <StudyNoteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        note={selectedNote}
      />
    </div>
  );
};

export default StudyNotes;