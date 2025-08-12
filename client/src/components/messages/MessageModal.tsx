import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { messageService } from '../../services/messageService';

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    content: '',
    type: '建议',
    isAnonymous: true,
    contactInfo: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const messageTypes = ['建议', '反馈', '问题', '其他'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      setError('请输入留言内容');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const submitData = {
        content: formData.content.trim(),
        type: formData.type as '建议' | '反馈' | '问题' | '其他',
        isAnonymous: formData.isAnonymous,
        contactInfo: formData.contactInfo.trim() || undefined,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        isPublic: true
      };

      const response = await messageService.createMessage(submitData);
      
      if (response.success) {
        // 重置表单
        setFormData({
          content: '',
          type: '建议',
          isAnonymous: true,
          contactInfo: '',
          tags: ''
        });
        onClose();
      } else {
        setError(response.message || '提交失败，请重试');
      }
    } catch (error) {
      console.error('提交留言失败:', error);
      setError('提交失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        content: '',
        type: '建议',
        isAnonymous: true,
        contactInfo: '',
        tags: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">写留言</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 留言类型 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              留言类型
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
              required
            >
              {messageTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* 留言内容 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              留言内容 *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="请详细描述你的想法、建议或问题..."
              rows={6}
              className="input-field resize-none"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.content.length}/1000 字符
            </p>
          </div>

          {/* 标签 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（可选）
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="用逗号分隔多个标签，如：界面优化,功能建议"
              className="input-field"
            />
          </div>

          {/* 匿名选项 */}
          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="anonymous"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                匿名留言
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              匿名留言将不显示你的身份信息
            </p>
          </div>

          {/* 联系方式 */}
          {!formData.isAnonymous && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                联系方式（可选）
              </label>
              <input
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                placeholder="邮箱、微信号等，方便我们联系你"
                className="input-field"
              />
              <p className="text-xs text-gray-500 mt-1">
                仅管理员可见，用于必要时的沟通
              </p>
            </div>
          )}

          {/* 提交按钮 */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !formData.content.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  提交中...
                </div>
              ) : (
                '提交留言'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageModal;