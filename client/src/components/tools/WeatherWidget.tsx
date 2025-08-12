import React, { useState, useEffect } from 'react';
import { 
  SunIcon, 
  CloudIcon, 
  CloudArrowDownIcon,
  MapPinIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  feelsLike: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showCitySelector, setShowCitySelector] = useState(false);

  // 模拟天气数据（实际项目中应该调用真实的天气API）
  const mockWeatherData: { [key: string]: WeatherData } = {
    '上海': {
      city: '上海',
      temperature: 22,
      description: '多云',
      humidity: 65,
      windSpeed: 12,
      icon: 'cloudy',
      feelsLike: 24
    },
    '北京': {
      city: '北京',
      temperature: 18,
      description: '晴朗',
      humidity: 45,
      windSpeed: 8,
      icon: 'sunny',
      feelsLike: 20
    },
    '广州': {
      city: '广州',
      temperature: 28,
      description: '小雨',
      humidity: 80,
      windSpeed: 15,
      icon: 'rainy',
      feelsLike: 30
    },
    '深圳': {
      city: '深圳',
      temperature: 26,
      description: '阴天',
      humidity: 70,
      windSpeed: 10,
      icon: 'cloudy',
      feelsLike: 28
    }
  };

  const getWeatherIcon = (iconType: string) => {
    switch (iconType) {
      case 'sunny':
        return <SunIcon className="h-4 w-4 text-yellow-200" />;
      case 'cloudy':
        return <CloudIcon className="h-4 w-4 text-white" />;
      case 'rainy':
        return <CloudArrowDownIcon className="h-4 w-4 text-blue-200" />;
      default:
        return <CloudIcon className="h-4 w-4 text-white" />;
    }
  };

  const getLocationFromCoords = async (latitude: number, longitude: number): Promise<string> => {
    // 根据坐标范围判断城市（简化版地理编码）
    // 实际项目中应该调用真实的地理编码API如高德地图API
    
    // 北京范围：39.4-40.4, 115.7-117.4
    if (latitude >= 39.4 && latitude <= 40.4 && longitude >= 115.7 && longitude <= 117.4) {
      return '北京';
    }
    // 上海范围：30.7-31.9, 120.9-122.2
    if (latitude >= 30.7 && latitude <= 31.9 && longitude >= 120.9 && longitude <= 122.2) {
      return '上海';
    }
    // 广州范围：22.8-23.8, 112.9-114.0
    if (latitude >= 22.8 && latitude <= 23.8 && longitude >= 112.9 && longitude <= 114.0) {
      return '广州';
    }
    // 深圳范围：22.4-22.8, 113.7-114.6
    if (latitude >= 22.4 && latitude <= 22.8 && longitude >= 113.7 && longitude <= 114.6) {
      return '深圳';
    }
    
    // 如果不在已知范围内，根据纬度大致判断
    if (latitude > 35) {
      return '北京'; // 北方城市
    } else if (latitude > 28) {
      return '上海'; // 中部城市
    } else {
      return '广州'; // 南方城市
    }
  };

  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const city = await getLocationFromCoords(latitude, longitude);
            resolve({ latitude, longitude, city });
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error('无法获取位置信息'));
        },
        {
          timeout: 10000,
          enableHighAccuracy: true
        }
      );
    });
  };

  const fetchWeatherData = async (city: string): Promise<WeatherData> => {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 返回模拟数据
    return mockWeatherData[city] || mockWeatherData['上海'];
  };

  const loadWeather = async () => {
    try {
      setLoading(true);
      setError(null);

      let targetCity = '上海'; // 默认城市

      try {
        // 尝试获取用户位置
        const locationData = await getCurrentLocation();
        setLocation(locationData);
        targetCity = locationData.city;
      } catch (locationError) {
        console.warn('无法获取位置，使用默认城市:', locationError);
        setLocation({ latitude: 31.2304, longitude: 121.4737, city: '上海' });
      }

      // 获取天气数据
      const weatherData = await fetchWeatherData(targetCity);
      setWeather(weatherData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setError('获取天气信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadWeather();
  };

  const handleCitySelect = async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      setShowCitySelector(false);
      
      const weatherData = await fetchWeatherData(city);
      setWeather(weatherData);
      setLocation({ latitude: 0, longitude: 0, city });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('获取天气数据失败:', error);
      setError('获取天气信息失败');
    } finally {
      setLoading(false);
    }
  };

  const availableCities = ['北京', '上海', '广州', '深圳'];

  useEffect(() => {
    loadWeather();
  }, []);

  // 点击外部区域关闭城市选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCitySelector) {
        setShowCitySelector(false);
      }
    };

    if (showCitySelector) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showCitySelector]);

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-sm p-2 h-12">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 text-xs">获取天气中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-2 h-12">
        <div className="flex items-center justify-center h-full">
          <span className="text-red-600 text-xs mr-2">{error}</span>
          <button
            onClick={handleRefresh}
            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-md shadow-sm p-2 text-white h-12">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className="flex items-center space-x-1 hover:bg-white hover:bg-opacity-20 rounded px-1 transition-colors"
                title="点击选择城市"
              >
                <MapPinIcon className="h-3 w-3" />
                <span className="text-xs font-medium">{weather?.city}</span>
              </button>
            </div>
            {weather && (
                <div className="flex items-center space-x-1">
                  {getWeatherIcon(weather.icon)}
                  <span className="text-sm font-bold">{weather?.temperature}°C</span>
                </div>
              )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs opacity-90">{weather?.description}</span>
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              title="刷新天气"
            >
              <ArrowPathIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 城市选择器 */}
      {showCitySelector && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border z-50 min-w-full">
          <div className="py-1">
            {availableCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  weather?.city === city ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
     </div>
   );
};

export default WeatherWidget;