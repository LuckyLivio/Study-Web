const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const StudyNote = require('../models/StudyNote');
const StudyMaterial = require('../models/StudyMaterial');
const User = require('../models/User');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_website')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 示例作品集数据
const samplePortfolios = [
  {
    title: '个人博客网站',
    description: '使用React和Node.js开发的全栈个人博客系统，支持文章发布、评论、标签分类等功能。',
    category: '编程项目',
    tags: ['React', 'Node.js', 'MongoDB', 'Express'],
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JWT'],
    projectUrl: 'https://myblog.example.com',
    githubUrl: 'https://github.com/example/blog',
    status: '已完成',
    featured: true,
    isPublished: true,
    images: []
  },
  {
    title: '在线学习平台',
    description: '基于Vue.js的在线学习平台，包含课程管理、视频播放、进度跟踪等功能。',
    category: '编程项目',
    tags: ['Vue.js', 'Python', 'Django', 'PostgreSQL'],
    technologies: ['Vue.js', 'Python', 'Django', 'PostgreSQL', 'Redis'],
    projectUrl: 'https://learning.example.com',
    githubUrl: 'https://github.com/example/learning-platform',
    status: '进行中',
    featured: true,
    isPublished: true,
    images: []
  },
  {
    title: '移动端天气应用',
    description: '使用React Native开发的跨平台天气应用，提供实时天气、预报、生活指数等信息。',
    category: '编程项目',
    tags: ['React Native', 'TypeScript', 'API集成'],
    technologies: ['React Native', 'TypeScript', 'Redux', 'AsyncStorage'],
    projectUrl: 'https://weather.example.com',
    githubUrl: 'https://github.com/example/weather-app',
    status: '已完成',
    featured: false,
    isPublished: true,
    images: []
  },
  {
    title: '数据可视化仪表板',
    description: '基于D3.js和Chart.js的数据可视化平台，支持多种图表类型和实时数据更新。',
    category: '编程项目',
    tags: ['D3.js', 'Chart.js', 'Python', 'Flask'],
    technologies: ['D3.js', 'Chart.js', 'Python', 'Flask', 'WebSocket'],
    projectUrl: 'https://dashboard.example.com',
    githubUrl: 'https://github.com/example/data-dashboard',
    status: '已完成',
    featured: true,
    isPublished: true,
    images: []
  },
  {
    title: 'UI设计作品集',
    description: '包含多个移动应用和网站的UI设计作品，展示不同风格和设计理念。',
    category: '设计作品',
    tags: ['UI设计', 'Figma', '用户体验'],
    technologies: ['Figma', 'Adobe XD', 'Sketch'],
    projectUrl: 'https://design.example.com',
    status: '已完成',
    featured: true,
    isPublished: true,
    images: []
  },
  {
    title: '品牌插画系列',
    description: '为不同品牌创作的插画作品，包含扁平化、手绘风格等多种表现形式。',
    category: '插画',
    tags: ['插画', '品牌设计', '创意'],
    technologies: ['Adobe Illustrator', 'Procreate'],
    projectUrl: 'https://illustration.example.com',
    status: '已完成',
    featured: false,
    isPublished: true,
    images: []
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

// 插入数据
async function seedData() {
  try {
    // 查找管理员用户
    let adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('未找到管理员用户，请先运行 seedLinks.js');
      return;
    }
    console.log('使用用户ID:', adminUser._id);

    // 清空现有数据
    await Portfolio.deleteMany({});
    await StudyNote.deleteMany({});
    await StudyMaterial.deleteMany({});
    console.log('已清空现有数据');

    // 插入作品集数据
    const portfoliosWithAuthor = samplePortfolios.map(portfolio => ({
      ...portfolio,
      author: adminUser._id
    }));
    const portfolios = await Portfolio.insertMany(portfoliosWithAuthor);
    console.log(`成功插入 ${portfolios.length} 条作品集数据`);

    // 插入学习笔记数据
    const notesWithAuthor = sampleNotes.map(note => ({
      ...note,
      author: adminUser._id
    }));
    const notes = await StudyNote.insertMany(notesWithAuthor);
    console.log(`成功插入 ${notes.length} 条学习笔记数据`);

    // 插入学习资料数据
    const materialsWithAuthor = sampleMaterials.map(material => ({
      ...material,
      author: adminUser._id
    }));
    const materials = await StudyMaterial.insertMany(materialsWithAuthor);
    console.log(`成功插入 ${materials.length} 条学习资料数据`);

    console.log('\n数据插入完成！');
    console.log('作品集:', portfolios.map(p => p.title));
    console.log('学习笔记:', notes.map(n => n.title));
    console.log('学习资料:', materials.map(m => m.title));

  } catch (error) {
    console.error('插入数据失败:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedData();