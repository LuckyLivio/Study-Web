import React, { useState, useEffect } from 'react';
import { SparklesIcon, ArrowPathIcon, ClipboardIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import toolsService, { EmojiData, StudyTip, MotivationalQuote, RandomColor, TimeInfo } from '../../services/toolsService';

interface EmojiGeneratorProps {
  className?: string;
}

const EmojiGenerator: React.FC<EmojiGeneratorProps> = ({ className = '' }) => {
  const [currentEmoji, setCurrentEmoji] = useState<EmojiData | null>(null);
  const [currentTip, setCurrentTip] = useState<StudyTip | null>(null);
  const [currentQuote, setCurrentQuote] = useState<MotivationalQuote | null>(null);
  const [currentColor, setCurrentColor] = useState<RandomColor | null>(null);
  const [currentTime, setCurrentTime] = useState<TimeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'emoji' | 'tips' | 'quotes' | 'colors' | 'time'>('emoji');
  const [emojiCategory, setEmojiCategory] = useState<string>('');
  const [tipCategory, setTipCategory] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string>('');

  // 获取随机表情
  const fetchRandomEmoji = async () => {
    try {
      setLoading(true);
      const response = await toolsService.getRandomEmoji(emojiCategory || undefined);
      setCurrentEmoji(response.data);
    } catch (error) {
      console.error('获取随机表情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取随机学习贴士
  const fetchRandomTip = async () => {
    try {
      setLoading(true);
      const response = await toolsService.getRandomStudyTip(tipCategory || undefined);
      setCurrentTip(response.data);
    } catch (error) {
      console.error('获取随机学习贴士失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取随机励志语录
  const fetchRandomQuote = async () => {
    try {
      setLoading(true);
      const response = await toolsService.getMotivationalQuote();
      setCurrentQuote(response.data);
    } catch (error) {
      console.error('获取励志语录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取随机颜色
  const fetchRandomColor = async () => {
    try {
      setLoading(true);
      const response = await toolsService.getRandomColor();
      setCurrentColor(response.data);
    } catch (error) {
      console.error('获取随机颜色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取时间信息
  const fetchTimeInfo = async () => {
    try {
      setLoading(true);
      const response = await toolsService.getTimeInfo();
      setCurrentTime(response.data);
    } catch (error) {
      console.error('获取时间信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 复制到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 初始化数据
  useEffect(() => {
    switch (activeTab) {
      case 'emoji':
        fetchRandomEmoji();
        break;
      case 'tips':
        fetchRandomTip();
        break;
      case 'quotes':
        fetchRandomQuote();
        break;
      case 'colors':
        fetchRandomColor();
        break;
      case 'time':
        fetchTimeInfo();
        break;
    }
  }, [activeTab]);

  const renderEmojiTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <select
          value={emojiCategory}
          onChange={(e) => setEmojiCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有分类</option>
          <option value="smileys">笑脸</option>
          <option value="animals">动物</option>
          <option value="food">食物</option>
          <option value="activities">活动</option>
          <option value="travel">旅行</option>
          <option value="objects">物品</option>
          <option value="symbols">符号</option>
          <option value="flags">旗帜</option>
        </select>
        <button
          onClick={fetchRandomEmoji}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          换一个
        </button>
      </div>

      {currentEmoji && (
        <div className="text-center space-y-4">
          <div className="text-8xl">{currentEmoji.emoji}</div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800">随机表情</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {currentEmoji.category}
              </span>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(currentEmoji.emoji)}
            className="flex items-center justify-center mx-auto px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ClipboardIcon className="h-4 w-4 mr-2" />
            复制表情
          </button>
        </div>
      )}
    </div>
  );

  const renderTipsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <select
          value={tipCategory}
          onChange={(e) => setTipCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">所有分类</option>
          <option value="study">学习方法</option>
          <option value="productivity">提高效率</option>
          <option value="memory">记忆技巧</option>
          <option value="focus">专注力</option>
          <option value="motivation">动机激励</option>
        </select>
        <button
          onClick={fetchRandomTip}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <LightBulbIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
          换一个
        </button>
      </div>

      {currentTip && (
        <div className="bg-blue-50 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-800">学习贴士</h3>
          </div>
          <p className="text-blue-700 leading-relaxed">{currentTip.tip}</p>
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
              {currentTip.category}
            </span>
            <button
              onClick={() => copyToClipboard(currentTip.tip)}
              className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              <ClipboardIcon className="h-3 w-3 mr-1" />
              复制
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderQuotesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={fetchRandomQuote}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <SparklesIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
          换一个
        </button>
      </div>

      {currentQuote && (
        <div className="bg-green-50 rounded-lg p-6 space-y-4">
          <blockquote className="text-lg text-green-800 italic leading-relaxed">
            "{currentQuote.quote}"
          </blockquote>
          <div className="flex items-center justify-between">
            <cite className="text-green-700 font-medium text-sm">{currentQuote.timestamp}</cite>
            <button
              onClick={() => copyToClipboard(currentQuote.quote)}
              className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
            >
              <ClipboardIcon className="h-3 w-3 mr-1" />
              复制
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderColorsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={fetchRandomColor}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          换一个
        </button>
      </div>

      {currentColor && (
        <div className="space-y-4">
          <div
            className="w-full h-32 rounded-lg border-2 border-gray-200"
            style={{ backgroundColor: currentColor.hex }}
          ></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">HEX</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={currentColor.hex}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(currentColor.hex)}
                  className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">RGB</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(`rgb(${currentColor.rgb.r}, ${currentColor.rgb.g}, ${currentColor.rgb.b})`)}
                  className="p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <ClipboardIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="px-4 py-2 bg-pink-100 text-pink-800 rounded-full">
              {currentColor.format} 格式
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderTimeTab = () => (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={fetchTimeInfo}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </button>
      </div>

      {currentTime && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-indigo-800">当前时间</h4>
            <p className="text-2xl font-bold text-indigo-900">{currentTime.local}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-indigo-800">时区</h4>
            <p className="text-lg text-indigo-900">{currentTime.timezone}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-indigo-800">UTC时间</h4>
            <p className="text-lg text-indigo-900">{currentTime.iso}</p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-indigo-800">时间戳</h4>
            <div className="flex items-center space-x-2">
              <span className="text-lg text-indigo-900">{currentTime.timestamp}</span>
              <button
                onClick={() => copyToClipboard(currentTime.timestamp.toString())}
                className="p-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                <ClipboardIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">小工具集合</h2>
        {copiedText && (
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm">
            已复制！
          </div>
        )}
      </div>

      {/* 标签页导航 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { key: 'emoji', label: '表情生成器', icon: '😊' },
          { key: 'tips', label: '学习贴士', icon: '💡' },
          { key: 'quotes', label: '励志语录', icon: '✨' },
          { key: 'colors', label: '随机颜色', icon: '🎨' },
          { key: 'time', label: '时间信息', icon: '⏰' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md transition-colors text-sm ${
              activeTab === tab.key
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="min-h-[300px]">
        {loading && !currentEmoji && !currentTip && !currentQuote && !currentColor && !currentTime ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'emoji' && renderEmojiTab()}
            {activeTab === 'tips' && renderTipsTab()}
            {activeTab === 'quotes' && renderQuotesTab()}
            {activeTab === 'colors' && renderColorsTab()}
            {activeTab === 'time' && renderTimeTab()}
          </>
        )}
      </div>
    </div>
  );
};

export default EmojiGenerator;