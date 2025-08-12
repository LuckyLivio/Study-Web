import React, { useState, useEffect } from 'react';
import { MapPinIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Location {
  id: string;
  name: string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  category: 'campus' | 'library' | 'restaurant' | 'dormitory' | 'other';
}

const MapWidget: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);

  // 预设的重要地点
  const locations: Location[] = [
    {
      id: '1',
      name: '图书馆',
      description: '学校主图书馆，提供安静的学习环境',
      coordinates: [121.4737, 31.2304],
      category: 'library'
    },
    {
      id: '2',
      name: '教学楼A',
      description: '主要教学楼，大部分课程在此进行',
      coordinates: [121.4747, 31.2314],
      category: 'campus'
    },
    {
      id: '3',
      name: '学生食堂',
      description: '学校主要餐厅，提供各种美食',
      coordinates: [121.4727, 31.2294],
      category: 'restaurant'
    },
    {
      id: '4',
      name: '学生宿舍区',
      description: '学生住宿区域',
      coordinates: [121.4757, 31.2284],
      category: 'dormitory'
    },
    {
      id: '5',
      name: '体育馆',
      description: '室内体育活动场所',
      coordinates: [121.4717, 31.2324],
      category: 'other'
    }
  ];

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'campus': return 'text-blue-600 bg-blue-50';
      case 'library': return 'text-purple-600 bg-purple-50';
      case 'restaurant': return 'text-orange-600 bg-orange-50';
      case 'dormitory': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campus': return '🏫';
      case 'library': return '📚';
      case 'restaurant': return '🍽️';
      case 'dormitory': return '🏠';
      default: return '📍';
    }
  };

  useEffect(() => {
    // 模拟地图加载
    const timer = setTimeout(() => {
      setMapLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <MapPinIcon className="h-6 w-6 mr-2 text-blue-600" />
          校园地图
        </h2>
      </div>

      {/* 搜索框 */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索地点..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 地图区域 */}
        <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center relative overflow-hidden">
          {!mapLoaded ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">加载地图中...</p>
            </div>
          ) : (
            <div className="w-full h-full relative">
              {/* 简化的地图背景 */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" viewBox="0 0 400 300">
                    {/* 道路 */}
                    <path d="M0 150 L400 150" stroke="#666" strokeWidth="4" />
                    <path d="M200 0 L200 300" stroke="#666" strokeWidth="4" />
                    
                    {/* 建筑物 */}
                    {filteredLocations.map((location, index) => {
                      const x = 50 + (index % 3) * 120;
                      const y = 50 + Math.floor(index / 3) * 100;
                      return (
                        <g key={location.id}>
                          <rect
                            x={x}
                            y={y}
                            width="80"
                            height="60"
                            fill={selectedLocation?.id === location.id ? '#3B82F6' : '#E5E7EB'}
                            stroke="#6B7280"
                            strokeWidth="2"
                            rx="4"
                            className="cursor-pointer transition-colors"
                            onClick={() => setSelectedLocation(location)}
                          />
                          <text
                            x={x + 40}
                            y={y + 35}
                            textAnchor="middle"
                            className="text-xs fill-current text-gray-700 pointer-events-none"
                          >
                            {getCategoryIcon(location.category)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
              
              {/* 地图说明 */}
              <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 text-xs">
                <p className="text-gray-600">点击建筑物查看详情</p>
              </div>
            </div>
          )}
        </div>

        {/* 地点列表 */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">重要地点</h3>
          <div className="max-h-72 overflow-y-auto space-y-2">
            {filteredLocations.map((location) => (
              <div
                key={location.id}
                onClick={() => setSelectedLocation(location)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedLocation?.id === location.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{getCategoryIcon(location.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-800">{location.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(location.category)}`}>
                        {location.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{location.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 选中地点详情 */}
      {selectedLocation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">{getCategoryIcon(selectedLocation.category)}</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800">{selectedLocation.name}</h3>
              <p className="text-gray-600 mt-1">{selectedLocation.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>坐标: {selectedLocation.coordinates[1].toFixed(4)}, {selectedLocation.coordinates[0].toFixed(4)}</span>
                <span className={`px-2 py-1 rounded-full ${getCategoryColor(selectedLocation.category)}`}>
                  {selectedLocation.category}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapWidget;