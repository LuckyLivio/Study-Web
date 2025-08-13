require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const ExternalLink = require('../models/ExternalLink');
const Portfolio = require('../models/Portfolio');
const StudyNote = require('../models/StudyNote');
const StudyMaterial = require('../models/StudyMaterial');

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-website')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 示例链接数据（不包含 author 字段，将在插入时添加）
const sampleLinks = [
  {
    title: 'GitHub 主页',
    url: 'https://github.com/username',
    description: '我的 GitHub 个人主页，查看我的开源项目和代码贡献',
    category: '代码仓库',
    platform: 'GitHub',
    icon: 'fab fa-github',
    isActive: true,
    clickCount: 0,
    order: 1
  },
  {
    title: 'B站个人空间',
    url: 'https://space.bilibili.com/123456',
    description: '我的B站个人空间，分享技术教程和生活日常',
    category: '社交媒体',
    platform: 'B站',
    icon: 'fab fa-bilibili',
    isActive: true,
    clickCount: 0,
    order: 2
  },
  {
    title: 'Notion 笔记',
    url: 'https://notion.so/username',
    description: '我的 Notion 工作空间，记录学习笔记和项目规划',
    category: '工具网站',
    platform: 'Notion',
    icon: 'fas fa-sticky-note',
    isActive: true,
    clickCount: 0,
    order: 3
  },
  {
    title: 'CSDN 博客',
    url: 'https://blog.csdn.net/username',
    description: '我的 CSDN 技术博客，分享编程心得和技术文章',
    category: '学习平台',
    platform: 'CSDN',
    icon: 'fas fa-blog',
    isActive: true,
    clickCount: 0,
    order: 4
  },
  {
    title: '知乎主页',
    url: 'https://zhihu.com/people/username',
    description: '我的知乎账号，分享技术见解和学习心得',
    category: '社交媒体',
    platform: '知乎',
    icon: 'fas fa-question-circle',
    isActive: true,
    clickCount: 0,
    order: 5
  },
  {
    title: '微博账号',
    url: 'https://weibo.com/username',
    description: '我的微博账号，分享日常动态和技术思考',
    category: '社交媒体',
    platform: '微博',
    icon: 'fab fa-weibo',
    isActive: true,
    clickCount: 0,
    order: 6
  },
  {
    title: '个人主页',
    url: 'https://example.com',
    description: '我的个人网站，展示作品集和个人信息',
    category: '个人主页',
    platform: '其他',
    icon: 'fas fa-home',
    isActive: true,
    clickCount: 0,
    order: 7
  },
  {
    title: 'QQ联系',
    url: 'https://qm.qq.com/cgi-bin/qm/qr?k=example',
    description: '通过QQ与我联系，讨论技术问题',
    category: '社交媒体',
    platform: 'QQ',
    icon: 'fab fa-qq',
    isActive: true,
    clickCount: 0,
    order: 8
  },
  {
    title: '微信联系',
    url: 'https://u.wechat.com/example',
    description: '通过微信与我联系，交流学习心得',
    category: '社交媒体',
    platform: '微信',
    icon: 'fab fa-weixin',
    isActive: true,
    clickCount: 0,
    order: 9
  },
  {
    title: '抖音账号',
    url: 'https://douyin.com/user/example',
    description: '我的抖音账号，分享编程技巧短视频',
    category: '社交媒体',
    platform: '抖音',
    icon: 'fas fa-video',
    isActive: true,
    clickCount: 0,
    order: 10
  },
  {
    title: '学习工具',
    url: 'https://tools.example.com',
    description: '我常用的在线学习工具和资源',
    category: '工具网站',
    platform: '其他',
    icon: 'fas fa-tools',
    isActive: true,
    clickCount: 0,
    order: 11
  },
  {
    title: '邮箱联系',
    url: 'https://mail.google.com/mail/?view=cm&to=your.email@example.com',
    description: '通过邮箱与我联系，讨论合作或技术交流',
    category: '其他',
    platform: '其他',
    icon: 'fas fa-envelope',
    isActive: true,
    clickCount: 0,
    order: 12
  }
];

// 示例作品集数据
const samplePortfolios = [
  {
    title: '个人博客网站',
    description: '使用 React + Node.js 构建的全栈个人博客系统，支持文章发布、评论、标签分类等功能。',
    category: '编程项目',
    tags: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    technologies: ['React', 'Node.js', 'Express', 'MongoDB', 'TypeScript'],
    images: [{
      url: '/uploads/portfolio/blog-preview.jpg',
      caption: '博客网站首页预览',
      isMain: true,
      filename: 'blog-preview.jpg',
      originalName: 'blog-preview.jpg',
      size: 1024000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: 'https://blog-demo.example.com',
    githubUrl: 'https://github.com/username/blog',
    status: '已完成',
    isPublished: true,
    featured: true,
    viewCount: 0,
    likeCount: 0
  },
  {
    title: '在线学习平台',
    description: '一个功能完整的在线学习平台，包含课程管理、视频播放、进度跟踪、考试系统等模块。',
    category: '编程项目',
    tags: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
    technologies: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    images: [{
      url: '/uploads/portfolio/learning-platform.jpg',
      caption: '学习平台界面展示',
      isMain: true,
      filename: 'learning-platform.jpg',
      originalName: 'learning-platform.jpg',
      size: 1536000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: 'https://learning-demo.example.com',
    githubUrl: 'https://github.com/username/learning-platform',
    status: '已完成',
    isPublished: true,
    featured: true,
    viewCount: 0,
    likeCount: 0
  },
  {
    title: '移动端天气应用',
    description: '使用 React Native 开发的跨平台天气应用，提供实时天气、天气预报、城市搜索等功能。',
    category: '编程项目',
    tags: ['React Native', 'JavaScript', 'API'],
    technologies: ['React Native', 'JavaScript', 'Weather API'],
    images: [{
      url: '/uploads/portfolio/weather-app.jpg',
      caption: '天气应用界面截图',
      isMain: true,
      filename: 'weather-app.jpg',
      originalName: 'weather-app.jpg',
      size: 768000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: '',
    githubUrl: 'https://github.com/username/weather-app',
    status: '已完成',
    isPublished: true,
    featured: false,
    viewCount: 0,
    likeCount: 0
  },
  {
    title: '数据可视化仪表板',
    description: '基于 D3.js 和 Chart.js 构建的数据可视化仪表板，支持多种图表类型和实时数据更新。',
    category: '编程项目',
    tags: ['D3.js', 'Chart.js', 'JavaScript', '数据可视化'],
    technologies: ['D3.js', 'Chart.js', 'JavaScript', 'WebSocket'],
    images: [{
      url: '/uploads/portfolio/dashboard.jpg',
      caption: '数据仪表板界面',
      isMain: true,
      filename: 'dashboard.jpg',
      originalName: 'dashboard.jpg',
      size: 2048000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: 'https://dashboard-demo.example.com',
    githubUrl: 'https://github.com/username/dashboard',
    status: '已完成',
    isPublished: true,
    featured: false,
    viewCount: 0,
    likeCount: 0
  },
  {
    title: 'UI设计作品集',
    description: '移动应用和网页的UI设计作品集，包含多个项目的界面设计和用户体验优化。',
    category: '设计作品',
    tags: ['UI设计', 'UX设计', 'Figma', 'Sketch'],
    technologies: ['Figma', 'Sketch', 'Adobe XD', 'Principle'],
    images: [{
      url: '/uploads/portfolio/ui-design.jpg',
      caption: 'UI设计作品展示',
      isMain: true,
      filename: 'ui-design.jpg',
      originalName: 'ui-design.jpg',
      size: 1280000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: '',
    githubUrl: '',
    status: '已完成',
    isPublished: true,
    featured: true,
    viewCount: 0,
    likeCount: 0
  },
  {
    title: '品牌插画系列',
    description: '为不同品牌创作的插画作品系列，包含扁平化插画、等距插画和手绘风格插画。',
    category: '插画',
    tags: ['插画', '品牌设计', 'Adobe Illustrator'],
    technologies: ['Adobe Illustrator', 'Procreate', 'Photoshop'],
    images: [{
      url: '/uploads/portfolio/illustrations.jpg',
      caption: '品牌插画作品集',
      isMain: true,
      filename: 'illustrations.jpg',
      originalName: 'illustrations.jpg',
      size: 1792000,
      mimeType: 'image/jpeg'
    }],
    projectUrl: '',
    githubUrl: '',
    status: '已完成',
    isPublished: true,
    featured: false,
    viewCount: 0,
    likeCount: 0
  }
];

// 示例学习笔记数据
const sampleNotes = [
  {
    title: 'React Hooks 深入理解',
    content: '# React Hooks 深入理解\n\n## useState\nuseState是最基础的Hook，用于在函数组件中添加状态...\n\n## useEffect\nuseEffect用于处理副作用，相当于componentDidMount、componentDidUpdate和componentWillUnmount的组合...',
    subject: '前端开发',
    category: '知识点整理',
    difficulty: '中等',
    tags: ['React', 'Hooks', 'JavaScript'],
    isPublic: true,
    viewCount: 0,
    attachments: []
  },
  {
    title: 'Node.js 异步编程最佳实践',
    content: '# Node.js 异步编程最佳实践\n\n## Promise\nPromise是处理异步操作的重要工具...\n\n## async/await\nasync/await让异步代码看起来像同步代码...',
    subject: '后端开发',
    category: '知识点整理',
    difficulty: '困难',
    tags: ['Node.js', 'JavaScript', '异步编程'],
    isPublic: true,
    viewCount: 0,
    attachments: []
  },
  {
    title: 'MongoDB 数据库设计原则',
    content: '# MongoDB 数据库设计原则\n\n## 文档结构设计\n在MongoDB中，文档结构的设计直接影响查询性能...\n\n## 索引优化\n合理的索引设计是提升查询性能的关键...',
    subject: '数据库',
    category: '复习总结',
    difficulty: '中等',
    tags: ['MongoDB', '数据库设计', 'NoSQL'],
    isPublic: true,
    viewCount: 0,
    attachments: []
  },
  {
    title: 'CSS Grid 布局完全指南',
    content: '# CSS Grid 布局完全指南\n\n## 基础概念\nCSS Grid是一个二维布局系统...\n\n## 实际应用\n通过实例学习Grid的各种用法...',
    subject: '前端开发',
    category: '课堂笔记',
    difficulty: '简单',
    tags: ['CSS', 'Grid', '布局'],
    isPublic: true,
    viewCount: 0,
    attachments: []
  }
];

// 示例学习资料数据
const sampleMaterials = [
  {
    title: 'JavaScript 高级编程指南',
    description: '深入讲解JavaScript高级特性，包括闭包、原型链、异步编程等核心概念。',
    subject: '前端开发',
    category: '教材',
    difficulty: '高级',
    tags: ['JavaScript', '编程', '高级'],
    isPublic: true,
    downloadCount: 0,
    fileInfo: {
      originalName: 'javascript-advanced-guide.pdf',
      filename: 'sample-file.pdf',
      path: '/uploads/study/sample-file.pdf',
      size: 2048000,
      mimetype: 'application/pdf'
    }
  },
  {
    title: 'React 项目实战视频教程',
    description: '通过实际项目学习React开发，从基础到高级的完整学习路径。',
    subject: '前端开发',
    category: '视频教程',
    difficulty: '中级',
    tags: ['React', '项目实战', '视频教程'],
    isPublic: true,
    downloadCount: 0,
    fileInfo: {
      originalName: 'react-tutorial.mp4',
      filename: 'sample-video.mp4',
      path: '/uploads/study/sample-video.mp4',
      size: 104857600,
      mimetype: 'video/mp4'
    }
  },
  {
    title: 'Python 数据分析习题集',
    description: '包含pandas、numpy、matplotlib等常用数据分析库的练习题和解答。',
    subject: '数据科学',
    category: '习题集',
    difficulty: '中级',
    tags: ['Python', '数据分析', 'pandas'],
    isPublic: true,
    downloadCount: 0,
    fileInfo: {
      originalName: 'python-data-analysis.pdf',
      filename: 'sample-exercises.pdf',
      path: '/uploads/study/sample-exercises.pdf',
      size: 5242880,
      mimetype: 'application/pdf'
    }
  },
  {
    title: '数据库设计课件',
    description: '数据库设计基础知识，包含ER图设计、范式理论、SQL优化等内容。',
    subject: '数据库',
    category: '课件',
    difficulty: '基础',
    tags: ['数据库', '设计', 'SQL'],
    isPublic: true,
    downloadCount: 0,
    fileInfo: {
      originalName: 'database-design.pptx',
      filename: 'sample-slides.pptx',
      path: '/uploads/study/sample-slides.pptx',
      size: 3145728,
      mimetype: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    }
  }
];

async function initializeData() {
  try {
    console.log('开始初始化数据...');
    
    // 查找管理员用户
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('未找到管理员用户，跳过需要用户ID的数据插入');
      return;
    }
    
    console.log('使用用户ID:', adminUser._id);
    
    // 清空现有数据
    await ExternalLink.deleteMany({});
    await Portfolio.deleteMany({});
    await StudyNote.deleteMany({});
    await StudyMaterial.deleteMany({});
    console.log('已清空现有数据');
    
    // 为链接数据添加作者ID
    const linksWithAuthor = sampleLinks.map(link => ({
      ...link,
      author: adminUser._id
    }));
    
    // 插入链接数据
    const insertedLinks = await ExternalLink.insertMany(linksWithAuthor);
    console.log(`成功插入 ${insertedLinks.length} 条链接数据`);
    
    // 为作品集数据添加作者ID
    const portfoliosWithAuthor = samplePortfolios.map(portfolio => ({
      ...portfolio,
      author: adminUser._id
    }));
    
    // 插入作品集数据
    const insertedPortfolios = await Portfolio.insertMany(portfoliosWithAuthor);
    console.log(`成功插入 ${insertedPortfolios.length} 条作品集数据`);
    
    // 为学习笔记数据添加作者ID
    const notesWithAuthor = sampleNotes.map(note => ({
      ...note,
      author: adminUser._id
    }));
    
    // 插入学习笔记数据
    const insertedNotes = await StudyNote.insertMany(notesWithAuthor);
    console.log(`成功插入 ${insertedNotes.length} 条学习笔记数据`);
    
    // 为学习资料数据添加作者ID
    const materialsWithAuthor = sampleMaterials.map(material => ({
      ...material,
      author: adminUser._id
    }));
    
    // 插入学习资料数据
    const insertedMaterials = await StudyMaterial.insertMany(materialsWithAuthor);
    console.log(`成功插入 ${insertedMaterials.length} 条学习资料数据`);
    
    console.log('\n数据初始化完成！');
    console.log('链接:', insertedLinks.map(link => link.title));
    console.log('作品集:', insertedPortfolios.map(portfolio => portfolio.title));
    console.log('学习笔记:', insertedNotes.map(note => note.title));
    console.log('学习资料:', insertedMaterials.map(material => material.title));
    
  } catch (error) {
    console.error('数据初始化失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

initializeData();