// DeepSeek API 配置和服务

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface DeepSeekResponse {
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekAPI {
  private config: DeepSeekConfig;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || '',
      baseUrl: process.env.REACT_APP_DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: process.env.REACT_APP_DEEPSEEK_MODEL || 'deepseek-chat'
    };
  }

  // 检查API配置是否完整
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }

  // 获取配置状态
  getConfigStatus() {
    return {
      hasApiKey: !!this.config.apiKey,
      baseUrl: this.config.baseUrl,
      model: this.config.model
    };
  }

  // 发送聊天请求
  async chat(messages: ChatMessage[], options?: {
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API未配置，请检查环境变量REACT_APP_DEEPSEEK_API_KEY');
    }

    const requestBody = {
      model: this.config.model,
      messages: messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2048,
      stream: options?.stream || false
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API请求失败: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
      }

      const data: DeepSeekResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('API返回数据格式错误');
      }

      return data.choices[0].message.content;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('网络请求失败，请检查网络连接');
    }
  }

  // 流式聊天（如果需要实时响应）
  async chatStream(messages: ChatMessage[], onChunk: (chunk: string) => void, options?: {
    temperature?: number;
    max_tokens?: number;
  }): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('DeepSeek API未配置，请检查环境变量REACT_APP_DEEPSEEK_API_KEY');
    }

    const requestBody = {
      model: this.config.model,
      messages: messages,
      temperature: options?.temperature || 0.7,
      max_tokens: options?.max_tokens || 2048,
      stream: true
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('流式请求失败');
    }
  }
}

// 导出单例实例
export const deepseekApi = new DeepSeekAPI();
export default deepseekApi;

// 导出类型
export type { ChatMessage, DeepSeekConfig };