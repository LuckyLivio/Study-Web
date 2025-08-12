import React, { useState, useEffect, useCallback } from 'react';
import { FolderIcon } from '@heroicons/react/24/outline';
import { Portfolio, portfolioApi, PaginationParams } from '../services/portfolioService';
import PortfolioCard from '../components/PortfolioCard';
import PortfolioModal from '../components/PortfolioModal';
// 暂时移除react-icons导入，使用简单的文本替代

const PortfolioPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<PaginationParams>({
    page: 1,
    limit: 12,
    category: '',
    search: '',
    featured: undefined,
    status: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
    pages: 0
  });

  const categories = ['全部', '插画', '贴纸', '编程项目', '设计作品', '其他'];
  const statusOptions = ['全部', '已完成', '进行中', '暂停'];

  const fetchPortfolios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        ...filters,
        category: filters.category === '全部' ? '' : filters.category,
        status: filters.status === '全部' ? '' : filters.status
      };
      const response = await portfolioApi.getPortfolios(params);
      if (response.success) {
        setPortfolios(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || '获取作品列表失败');
      }
    } catch (err) {
      setError('网络错误，请稍后重试');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPortfolios();
  }, [fetchPortfolios]);

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  const handleStatusChange = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handleFeaturedToggle = () => {
    setFilters(prev => ({ 
      ...prev, 
      featured: prev.featured === undefined ? true : prev.featured ? false : undefined,
      page: 1 
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePortfolioClick = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio);
    setShowModal(true);
    // 增加浏览量
    if (portfolio._id) {
      portfolioApi.incrementView(portfolio._id).catch(console.error);
    }
  };

  const handleCreateNew = () => {
    setSelectedPortfolio(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedPortfolio(null);
  };

  const handlePortfolioSaved = () => {
    fetchPortfolios();
    handleModalClose();
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === pagination.current
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex justify-center items-center mt-8">
        <button
          onClick={() => handlePageChange(pagination.current - 1)}
          disabled={pagination.current === 1}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(pagination.current + 1)}
          disabled={pagination.current === pagination.pages}
          className="px-3 py-1 mx-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FolderIcon className="h-8 w-8 mr-3 text-primary-600" />
                  作品集
                </h1>
                <p className="text-gray-600 mt-1">展示我的创作作品和项目</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <span>+</span>
                添加作品
              </button>
            </div>

            {/* 搜索和筛选 */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* 搜索框 */}
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="搜索作品标题、描述或标签..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 筛选器 */}
              <div className="flex gap-2 flex-wrap">
                {/* 分类筛选 */}
                <select
                  value={filters.category || '全部'}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* 状态筛选 */}
                <select
                  value={filters.status || '全部'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>

                {/* 精选筛选 */}
                <button
                  onClick={handleFeaturedToggle}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    filters.featured === true
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : filters.featured === false
                      ? 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="inline mr-1">🔽</span>
                  {filters.featured === true ? '仅精选' : filters.featured === false ? '非精选' : '全部'}
                </button>

                {/* 视图模式切换 */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-2 ${
                      viewMode === 'grid'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 ${
                      viewMode === 'list'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ☰
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <button
              onClick={fetchPortfolios}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              重试
            </button>
          </div>
        ) : portfolios.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">暂无作品</div>
            <button
              onClick={handleCreateNew}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              创建第一个作品
            </button>
          </div>
        ) : (
          <>
            {/* 作品网格/列表 */}
            <div className={`${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }`}>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio._id}
                  portfolio={portfolio}
                  viewMode={viewMode}
                  onClick={() => handlePortfolioClick(portfolio)}
                />
              ))}
            </div>

            {/* 分页 */}
            {renderPagination()}
          </>
        )}
      </div>

      {/* 作品详情/编辑模态框 */}
      {showModal && (
        <PortfolioModal
          portfolio={selectedPortfolio}
          onClose={handleModalClose}
          onSave={handlePortfolioSaved}
        />
      )}
    </div>
  );
};

export default PortfolioPage;