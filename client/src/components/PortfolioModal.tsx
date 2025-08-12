import React, { useState, useEffect } from 'react';
import { Portfolio, portfolioApi } from '../services/portfolioService';
// 暂时移除react-icons导入，使用简单的文本替代

interface PortfolioModalProps {
  portfolio: Portfolio | null;
  onClose: () => void;
  onSave: () => void;
}

const PortfolioModal: React.FC<PortfolioModalProps> = ({ portfolio, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(!portfolio);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Portfolio>>({
    title: '',
    description: '',
    category: '插画',
    tags: [],
    images: [],
    projectUrl: '',
    githubUrl: '',
    technologies: [],
    status: '进行中',
    featured: false
  });
  const [newTag, setNewTag] = useState('');
  const [newTech, setNewTech] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    if (portfolio) {
      setFormData({
        title: portfolio.title || '',
        description: portfolio.description || '',
        category: portfolio.category || '插画',
        tags: portfolio.tags || [],
        images: portfolio.images || [],
        projectUrl: portfolio.projectUrl || '',
        githubUrl: portfolio.githubUrl || '',
        technologies: portfolio.technologies || [],
        status: portfolio.status || '进行中',
        featured: portfolio.featured || false
      });
    }
  }, [portfolio]);

  const handleInputChange = (field: keyof Portfolio, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const handleAddTech = () => {
    if (newTech.trim() && !formData.technologies?.includes(newTech.trim())) {
      handleInputChange('technologies', [...(formData.technologies || []), newTech.trim()]);
      setNewTech('');
    }
  };

  const handleRemoveTech = (techToRemove: string) => {
    handleInputChange('technologies', formData.technologies?.filter(tech => tech !== techToRemove) || []);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
    
    // 创建预览URL
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // 移除现有图片
      const updatedImages = formData.images?.filter((_, i) => i !== index) || [];
      handleInputChange('images', updatedImages);
    } else {
      // 移除新上传的图片
      const newFiles = imageFiles.filter((_, i) => i !== index);
      const newPreviews = imagePreviewUrls.filter((_, i) => i !== index);
      setImageFiles(newFiles);
      setImagePreviewUrls(newPreviews);
    }
  };

  const handleSetMainImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      const updatedImages = formData.images?.map((img, i) => ({
        ...img,
        isMain: i === index
      })) || [];
      handleInputChange('images', updatedImages);
    }
    // 新上传的图片暂时不能设为主图，需要保存后才能设置
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // 验证必填字段
      if (!formData.title?.trim()) {
        setError('请输入作品标题');
        return;
      }
      if (!formData.description?.trim()) {
        setError('请输入作品描述');
        return;
      }

      // 创建FormData
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category || '插画');
      submitData.append('status', formData.status || '进行中');
      submitData.append('featured', String(formData.featured || false));
      
      if (formData.projectUrl) {
        submitData.append('projectUrl', formData.projectUrl);
      }
      if (formData.githubUrl) {
        submitData.append('githubUrl', formData.githubUrl);
      }
      
      // 添加标签和技术栈
      (formData.tags || []).forEach(tag => {
        submitData.append('tags[]', tag);
      });
      (formData.technologies || []).forEach(tech => {
        submitData.append('technologies[]', tech);
      });
      
      // 添加现有图片信息
      if (formData.images && formData.images.length > 0) {
        submitData.append('existingImages', JSON.stringify(formData.images));
      }
      
      // 添加新上传的图片
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
        submitData.append(`imageCaption_${index}`, ''); // 可以添加图片说明
        submitData.append(`imageIsMain_${index}`, String(index === 0 && (!formData.images || formData.images.length === 0)));
      });

      let response;
      if (portfolio?._id) {
        // 更新现有作品
        response = await portfolioApi.updatePortfolio(portfolio._id, submitData);
      } else {
        // 创建新作品
        response = await portfolioApi.createPortfolio(submitData);
      }

      if (response.success) {
        onSave();
      } else {
        setError(response.message || '保存失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Error saving portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!portfolio?._id) return;
    
    if (window.confirm('确定要删除这个作品吗？此操作不可撤销。')) {
      try {
        setLoading(true);
        const response = await portfolioApi.deletePortfolio(portfolio._id);
        if (response.success) {
          onSave(); // 刷新列表
        } else {
          setError(response.message || '删除失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('Error deleting portfolio:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleLike = async () => {
    if (!portfolio?._id) return;
    
    try {
      const response = await portfolioApi.toggleLike(portfolio._id);
      if (response.success) {
        // 更新本地状态
        setFormData(prev => ({
          ...prev,
          likeCount: response.data.likeCount
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const renderImageGallery = () => {
    const existingImages = formData.images || [];
    const allImages = [...existingImages];
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* 现有图片 */}
        {existingImages.map((image, index) => (
          <div key={`existing-${index}`} className="relative group">
            <img
              src={image.url}
              alt={image.caption || formData.title}
              className="w-full h-32 object-cover rounded-lg"
            />
            {image.isMain && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                主图
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {!image.isMain && (
                    <button
                      onClick={() => handleSetMainImage(index, true)}
                      className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 transition-colors"
                      title="设为主图"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    onClick={() => handleRemoveImage(index, true)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    title="删除图片"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* 新上传的图片预览 */}
        {imagePreviewUrls.map((url, index) => (
          <div key={`new-${index}`} className="relative group">
            <img
              src={url}
              alt="新上传"
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
              新图片
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                onClick={() => handleRemoveImage(index, false)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                title="删除图片"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
        
        {/* 上传按钮 */}
        {isEditing && (
          <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <span className="text-2xl text-gray-400 mb-2">📁</span>
            <span className="text-sm text-gray-500">上传图片</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {portfolio ? (isEditing ? '编辑作品' : '作品详情') : '创建作品'}
            </h2>
            {portfolio && !isEditing && (
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  👁️
                  <span>{portfolio.viewCount || 0}</span>
                </div>
                <button
                  onClick={handleToggleLike}
                  className="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  ❤️
                  <span>{formData.likeCount || 0}</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {portfolio && (
              <>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    编辑
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {loading ? '保存中...' : '保存'}
                    </button>
                  </>
                )}
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  删除
                </button>
              </>
            )}
            
            {!portfolio && (
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? '创建中...' : '创建'}
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800">{error}</div>
          </div>
        )}

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作品标题 *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入作品标题"
                />
              ) : (
                <div className="text-lg font-semibold text-gray-900">{formData.title}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类
              </label>
              {isEditing ? (
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="插画">插画</option>
                  <option value="贴纸">贴纸</option>
                  <option value="编程项目">编程项目</option>
                  <option value="设计作品">设计作品</option>
                  <option value="其他">其他</option>
                </select>
              ) : (
                <div className="text-gray-900">{formData.category}</div>
              )}
            </div>
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品描述 *
            </label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="描述你的作品..."
              />
            ) : (
              <div className="text-gray-900 whitespace-pre-wrap">{formData.description}</div>
            )}
          </div>

          {/* 状态和精选 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态
              </label>
              {isEditing ? (
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="进行中">进行中</option>
                  <option value="已完成">已完成</option>
                  <option value="暂停">暂停</option>
                </select>
              ) : (
                <div className="text-gray-900">{formData.status}</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                精选作品
              </label>
              {isEditing ? (
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">设为精选作品</span>
                </label>
              ) : (
                <div className="text-gray-900">{formData.featured ? '是' : '否'}</div>
              )}
            </div>
          </div>

          {/* 链接 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目链接
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => handleInputChange('projectUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://..."
                />
              ) : formData.projectUrl ? (
                <a
                  href={formData.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  🔗
                  查看项目
                </a>
              ) : (
                <div className="text-gray-500">无</div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub 链接
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => handleInputChange('githubUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/..."
                />
              ) : formData.githubUrl ? (
                <a
                  href={formData.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  📁
                  查看代码
                </a>
              ) : (
                <div className="text-gray-500">无</div>
              )}
            </div>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="添加标签"
                />
                <button
                  onClick={handleAddTag}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  添加
                </button>
              </div>
            )}
          </div>

          {/* 技术栈 */}
          {(formData.category === '编程项目' || formData.technologies?.length) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                技术栈
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.technologies?.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                  >
                    {tech}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTech(tech)}
                        className="text-blue-500 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTech()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="添加技术"
                  />
                  <button
                    onClick={handleAddTech}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    添加
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 图片 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品图片
            </label>
            {renderImageGallery()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioModal;