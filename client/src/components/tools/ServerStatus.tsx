import React, { useState, useEffect, useCallback } from 'react';
import { 
  ServerIcon, 
  SignalIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ServiceStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'warning' | 'checking';
  responseTime: number | null;
  lastChecked: Date | null;
  uptime: number; // 百分比
  description: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

const ServerStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 初始化服务列表
  const initializeServices = (): ServiceStatus[] => [
    {
      name: '主网站',
      url: 'http://localhost:3000',
      status: 'checking',
      responseTime: null,
      lastChecked: null,
      uptime: 99.9,
      description: '前端应用服务'
    },
    {
      name: 'API服务器',
      url: 'http://localhost:5001',
      status: 'checking',
      responseTime: null,
      lastChecked: null,
      uptime: 99.5,
      description: '后端API服务'
    },
    {
      name: '数据库',
      url: 'mongodb://localhost:27017',
      status: 'checking',
      responseTime: null,
      lastChecked: null,
      uptime: 99.8,
      description: 'MongoDB数据库'
    }
  ];

  // 检查单个服务状态
  const checkServiceStatus = async (service: ServiceStatus): Promise<ServiceStatus> => {
    const startTime = Date.now();
    
    try {
      // 对于前端和API服务，尝试实际请求
      if (service.url.startsWith('http')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
        
        const response = await fetch(service.url, {
          method: 'GET',
          signal: controller.signal,
          mode: 'no-cors' // 避免CORS问题
        });
        
        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;
        
        return {
          ...service,
          status: 'online',
          responseTime,
          lastChecked: new Date()
        };
      } else {
        // 对于数据库等其他服务，模拟检查
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
        const responseTime = Date.now() - startTime;
        
        return {
          ...service,
          status: Math.random() > 0.1 ? 'online' : 'warning',
          responseTime,
          lastChecked: new Date()
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        ...service,
        status: responseTime > 5000 ? 'offline' : 'warning',
        responseTime: responseTime > 5000 ? null : responseTime,
        lastChecked: new Date()
      };
    }
  };

  // 生成模拟系统指标
  const generateSystemMetrics = (): SystemMetrics => ({
    cpuUsage: Math.random() * 30 + 20, // 20-50%
    memoryUsage: Math.random() * 40 + 30, // 30-70%
    diskUsage: Math.random() * 20 + 40, // 40-60%
    networkLatency: Math.random() * 50 + 10 // 10-60ms
  });

  // 检查所有服务状态
  const checkAllServices = useCallback(async () => {
    setLoading(true);
    
    try {
      const initialServices = initializeServices();
      setServices(initialServices);
      
      // 并行检查所有服务
      const checkedServices = await Promise.all(
        initialServices.map(service => checkServiceStatus(service))
      );
      
      setServices(checkedServices);
      setSystemMetrics(generateSystemMetrics());
      setLastUpdate(new Date());
    } catch (error) {
      console.error('检查服务状态失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 手动刷新
  const handleRefresh = () => {
    checkAllServices();
  };

  // 自动刷新
  useEffect(() => {
    checkAllServices();
    
    if (autoRefresh) {
      const interval = setInterval(checkAllServices, 30000); // 30秒刷新一次
      return () => clearInterval(interval);
    }
  }, [autoRefresh, checkAllServices]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'offline':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-50 border-green-200';
      case 'offline': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'checking': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getResponseTimeColor = (responseTime: number | null) => {
    if (!responseTime) return 'text-gray-500';
    if (responseTime < 200) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricColor = (value: number, thresholds: { warning: number; danger: number }) => {
    if (value >= thresholds.danger) return 'text-red-600 bg-red-50';
    if (value >= thresholds.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const overallStatus = services.length > 0 ? (
    services.every(s => s.status === 'online') ? 'online' :
    services.some(s => s.status === 'offline') ? 'offline' : 'warning'
  ) : 'checking';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <ServerIcon className="h-6 w-6 mr-2 text-blue-600" />
          服务器状态监控
        </h2>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>自动刷新</span>
          </label>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </button>
        </div>
      </div>

      {/* 总体状态 */}
      <div className={`p-4 rounded-lg border-2 mb-6 ${getStatusColor(overallStatus)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="text-lg font-semibold">
                系统状态: {overallStatus === 'online' ? '正常运行' : 
                          overallStatus === 'offline' ? '服务异常' : 
                          overallStatus === 'warning' ? '部分异常' : '检查中'}
              </h3>
              {lastUpdate && (
                <p className="text-sm opacity-75">
                  最后更新: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {services.filter(s => s.status === 'online').length}/{services.length}
            </div>
            <div className="text-sm opacity-75">服务在线</div>
          </div>
        </div>
      </div>

      {/* 系统指标 */}
      {systemMetrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`p-3 rounded-lg ${getMetricColor(systemMetrics.cpuUsage, { warning: 70, danger: 90 })}`}>
            <div className="text-sm font-medium">CPU使用率</div>
            <div className="text-xl font-bold">{systemMetrics.cpuUsage.toFixed(1)}%</div>
          </div>
          <div className={`p-3 rounded-lg ${getMetricColor(systemMetrics.memoryUsage, { warning: 80, danger: 95 })}`}>
            <div className="text-sm font-medium">内存使用率</div>
            <div className="text-xl font-bold">{systemMetrics.memoryUsage.toFixed(1)}%</div>
          </div>
          <div className={`p-3 rounded-lg ${getMetricColor(systemMetrics.diskUsage, { warning: 85, danger: 95 })}`}>
            <div className="text-sm font-medium">磁盘使用率</div>
            <div className="text-xl font-bold">{systemMetrics.diskUsage.toFixed(1)}%</div>
          </div>
          <div className={`p-3 rounded-lg ${getMetricColor(systemMetrics.networkLatency, { warning: 100, danger: 200 })}`}>
            <div className="text-sm font-medium">网络延迟</div>
            <div className="text-xl font-bold">{systemMetrics.networkLatency.toFixed(0)}ms</div>
          </div>
        </div>
      )}

      {/* 服务列表 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">服务详情</h3>
        {services.map((service, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(service.status)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <h4 className="font-semibold">{service.name}</h4>
                  <p className="text-sm opacity-75">{service.description}</p>
                  <p className="text-xs opacity-60">{service.url}</p>
                </div>
              </div>
              
              <div className="text-right space-y-1">
                <div className="flex items-center space-x-4">
                  {service.responseTime !== null && (
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-4 w-4" />
                      <span className={`text-sm font-medium ${getResponseTimeColor(service.responseTime)}`}>
                        {service.responseTime}ms
                      </span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <SignalIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {service.uptime.toFixed(1)}%
                    </span>
                  </div>
                </div>
                {service.lastChecked && (
                  <div className="text-xs opacity-60">
                    {service.lastChecked.toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServerStatus;