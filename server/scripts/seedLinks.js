const mongoose = require('mongoose');
const ExternalLink = require('../models/ExternalLink');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_website')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 示例链接数据
const sampleLinks = [
  // 代码仓库
  {
    title: 'GitHub 主页',
    url: 'https://github.com',
    description: '我的代码仓库和开源项目',
    category: '代码仓库',
    platform: 'GitHub',
    icon: '🐙',
    order: 1,
    isActive: true,
    openInNewTab: true,
    color: '#333'
  },
  {
    title: 'GitLab 项目',
    url: 'https://gitlab.com',
    description: '私有项目和团队协作',
    category: '代码仓库',
    platform: '其他',
    icon: '🦊',
    order: 2,
    isActive: true,
    openInNewTab: true,
    color: '#FC6D26'
  },

  // 社交媒体
  {
    title: 'B站个人空间',
    url: 'https://space.bilibili.com',
    description: '技术分享和学习视频',
    category: '社交媒体',
    platform: 'B站',
    icon: '📺',
    order: 1,
    isActive: true,
    openInNewTab: true,
    color: '#FB7299'
  },
  {
    title: '小红书主页',
    url: 'https://www.xiaohongshu.com',
    description: '生活分享和学习笔记',
    category: '社交媒体',
    platform: '小红书',
    icon: '📖',
    order: 2,
    isActive: true,
    openInNewTab: true,
    color: '#FF2442'
  },
  {
    title: '知乎主页',
    url: 'https://www.zhihu.com',
    description: '问答和专业讨论',
    category: '社交媒体',
    platform: '知乎',
    icon: '🤔',
    order: 3,
    isActive: true,
    openInNewTab: true,
    color: '#0084FF'
  },

  // 学习平台
  {
    title: 'Notion 笔记',
    url: 'https://notion.so',
    description: '个人知识库和学习笔记',
    category: '学习平台',
    platform: 'Notion',
    icon: '📝',
    order: 1,
    isActive: true,
    openInNewTab: true,
    color: '#000'
  },
  {
    title: 'CSDN 博客',
    url: 'https://blog.csdn.net',
    description: '技术博客和学习心得',
    category: '学习平台',
    platform: 'CSDN',
    icon: '💻',
    order: 2,
    isActive: true,
    openInNewTab: true,
    color: '#FC5531'
  },
  {
    title: '掘金主页',
    url: 'https://juejin.cn',
    description: '前端技术分享',
    category: '学习平台',
    platform: '其他',
    icon: '💎',
    order: 3,
    isActive: true,
    openInNewTab: true,
    color: '#1E80FF'
  },

  // 工具网站
  {
    title: 'Figma 设计',
    url: 'https://figma.com',
    description: '设计原型和UI设计',
    category: '工具网站',
    platform: '其他',
    icon: '🎨',
    order: 1,
    isActive: true,
    openInNewTab: true,
    color: '#F24E1E'
  },
  {
    title: 'Canva 设计',
    url: 'https://canva.com',
    description: '快速设计和素材制作',
    category: '工具网站',
    platform: '其他',
    icon: '🖼️',
    order: 2,
    isActive: true,
    openInNewTab: true,
    color: '#00C4CC'
  },

  // 个人主页
  {
    title: '个人博客',
    url: 'https://myblog.com',
    description: '个人技术博客和生活记录',
    category: '个人主页',
    platform: '其他',
    icon: '🏠',
    order: 1,
    isActive: true,
    openInNewTab: false,
    color: '#6366F1'
  },
  {
    title: '在线简历',
    url: 'https://myresume.com',
    description: '个人简历和作品展示',
    category: '个人主页',
    platform: '其他',
    icon: '📄',
    order: 2,
    isActive: true,
    openInNewTab: true,
    color: '#10B981'
  }
];

// 插入数据
async function seedLinks() {
  try {
    // 清空现有数据
    await ExternalLink.deleteMany({});
    console.log('已清空现有链接数据');

    // 插入示例数据
    const links = await ExternalLink.insertMany(sampleLinks);
    console.log(`成功插入 ${links.length} 条链接数据`);

    // 显示插入的数据
    console.log('\n插入的链接数据:');
    links.forEach(link => {
      console.log(`- ${link.title} (${link.category} - ${link.platform})`);
    });

  } catch (error) {
    console.error('插入数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedLinks();