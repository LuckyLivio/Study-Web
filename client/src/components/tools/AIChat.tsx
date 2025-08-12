import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  UserIcon,
  CpuChipIcon,
  TrashIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import deepseekApi, { ChatMessage } from '../../services/deepseekApi';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'error' | 'system';
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 预设的快捷问题
  const quickQuestions = [
    {
      icon: <AcademicCapIcon className="h-5 w-5" />,
      title: '学习规划',
      question: '请帮我制定一个前端开发的学习计划'
    },
    {
      icon: <DocumentTextIcon className="h-5 w-5" />,
      title: '代码解释',
      question: '请解释一下React Hooks的工作原理'
    },
    {
      icon: <QuestionMarkCircleIcon className="h-5 w-5" />,
      title: '技术问答',
      question: '什么是TypeScript，它有什么优势？'
    },
    {
      icon: <SparklesIcon className="h-5 w-5" />,
      title: '项目建议',
      question: '推荐一些适合初学者的前端项目'
    }
  ];

  // 初始化API配置检查和欢迎消息
  useEffect(() => {
    const configured = deepseekApi.isConfigured();
    setApiConfigured(configured);
    
    const welcomeMessage: Message = {
      id: 'welcome',
      content: configured 
        ? '你好！我是你的AI学习助手，基于DeepSeek API构建。我可以帮助你：\n\n📚 制定学习计划和课程规划\n💻 解答编程和技术问题\n📝 分析学习资料和代码\n🎯 提供个性化的学习建议\n\n有什么我可以帮助你的吗？'
        : '⚠️ DeepSeek API未配置\n\n请先配置API密钥才能使用AI助手功能。点击右上角的设置按钮进行配置。\n\n配置完成后刷新页面即可开始使用。',
      role: 'assistant',
      timestamp: new Date(),
      type: configured ? 'system' : 'error'
    };
    setMessages([welcomeMessage]);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 调用DeepSeek API
  const callDeepSeekAPI = async (userMessage: string, conversationHistory: Message[]): Promise<string> => {
    if (!apiConfigured) {
      throw new Error('API未配置，请先设置DeepSeek API密钥');
    }

    // 构建对话历史
    const chatMessages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的AI学习助手，专门帮助用户解决学习和技术问题。请用中文回答，保持友好和专业的语气。'
      },
      // 只包含最近的对话历史（避免token过多）
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    try {
      const response = await deepseekApi.chat(chatMessages, {
        temperature: 0.7,
        max_tokens: 2048
      });
      return response;
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !apiConfigured) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 调用AI API
      const response = await callDeepSeekAPI(userMessage.content, messages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，AI服务暂时不可用，请稍后重试。',
        role: 'assistant',
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    // 重新添加欢迎消息
    const welcomeMessage: Message = {
      id: 'welcome-' + Date.now(),
      content: '聊天记录已清空。有什么新的问题我可以帮助你吗？',
      role: 'assistant',
      timestamp: new Date(),
      type: 'system'
    };
    setMessages([welcomeMessage]);
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    const isError = message.type === 'error';
    const isSystem = message.type === 'system';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* 头像 */}
          <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600' : isError ? 'bg-red-500' : 'bg-gray-600'
            }`}>
              {isUser ? (
                <UserIcon className="h-5 w-5 text-white" />
              ) : (
                <CpuChipIcon className="h-5 w-5 text-white" />
              )}
            </div>
          </div>

          {/* 消息内容 */}
          <div className={`px-4 py-2 rounded-lg ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : isError 
                ? 'bg-red-50 text-red-800 border border-red-200'
                : isSystem
                  ? 'bg-gray-50 text-gray-800 border border-gray-200'
                  : 'bg-gray-100 text-gray-800'
          }`}>
            <div className="text-sm">
              {isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                <div className="prose prose-sm max-w-none prose-gray">
                  <ReactMarkdown 
                     components={{
                    // 自定义样式以适应聊天气泡
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                    h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                    h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                    li: ({children}) => <li className="">{children}</li>,
                    code: ({children}) => (
                      <code className={`px-1 py-0.5 rounded text-xs font-mono ${
                        isError ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {children}
                      </code>
                    ),
                    pre: ({children}) => (
                      <pre className={`p-2 rounded text-xs font-mono overflow-x-auto mb-2 ${
                        isError ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {children}
                      </pre>
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="border-l-2 border-gray-300 pl-2 italic mb-2">
                        {children}
                      </blockquote>
                    ),
                    strong: ({children}) => <strong className="font-bold">{children}</strong>,
                    em: ({children}) => <em className="italic">{children}</em>,
                    a: ({href, children}) => (
                      <a 
                        href={href} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline"
                      >
                        {children}
                      </a>
                    )
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                </div>
              )}
            </div>
            <div className={`text-xs mt-1 opacity-70 ${
              isUser ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col bg-white">
      {/* 头部 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <CpuChipIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI学习助手</h1>
              <p className="text-sm text-gray-500">基于DeepSeek API · 智能对话</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiConfig(!showApiConfig)}
              className={`p-2 rounded-lg transition-colors ${
                apiConfigured 
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
                  : 'text-red-600 hover:text-red-700 hover:bg-red-50'
              }`}
              title={apiConfigured ? 'API已配置' : 'API未配置 - 点击查看配置说明'}
            >
              <Cog6ToothIcon className="h-5 w-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="清空聊天"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* API配置面板 */}
      {showApiConfig && (
        <div className="px-6 py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Cog6ToothIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">DeepSeek API 配置说明</h3>
              <div className="text-sm text-yellow-700 space-y-2">
                <p><strong>当前状态:</strong> {apiConfigured ? '✅ 已配置' : '❌ 未配置'}</p>
                <div>
                  <p><strong>配置步骤:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>访问 <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DeepSeek 官网</a> 注册账号</li>
                    <li>在控制台创建API密钥</li>
                    <li>在项目根目录的 <code className="bg-yellow-100 px-1 rounded">.env</code> 文件中设置:</li>
                  </ol>
                  <div className="mt-2 p-3 bg-gray-800 text-green-400 rounded text-xs font-mono">
                    REACT_APP_DEEPSEEK_API_KEY=your_api_key_here
                  </div>
                  <p className="mt-2">4. 重启开发服务器使配置生效</p>
                </div>
                <div className="mt-3 p-2 bg-yellow-100 rounded">
                  <p className="text-xs">💡 <strong>提示:</strong> API密钥请妥善保管，不要泄露给他人</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 快捷问题 */}
      {messages.length <= 1 && apiConfigured && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-3">快速开始</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickQuestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(item.question)}
                className="flex items-center space-x-2 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="text-blue-600">{item.icon}</div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  <div className="text-xs text-gray-500 truncate">{item.question}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {/* 加载指示器 */}
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <CpuChipIcon className="h-5 w-5 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 px-6 py-4 bg-white">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={apiConfigured ? "输入你的问题...（按Enter发送，Shift+Enter换行）" : "请先配置API密钥"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px' }}
              disabled={isLoading || !apiConfigured}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading || !apiConfigured}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          AI回复仅供参考，请结合实际情况判断
        </div>
      </div>
    </div>
  );
};

export default AIChat;