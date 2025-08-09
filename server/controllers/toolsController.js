// 表情包数据
const emojiCategories = {
  '开心': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲'],
  '难过': ['😢', '😭', '😿', '😾', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😤', '😠', '😡', '🤬'],
  '惊讶': ['😮', '😯', '😲', '😳', '🤯', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤐', '😬', '🙄', '😑', '😐'],
  '爱心': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  '手势': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'],
  '动物': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥'],
  '食物': ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕'],
  '活动': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊']
};

// 学习贴士数据
const studyTips = [
  {
    category: '时间管理',
    tips: [
      '使用番茄工作法，25分钟专注学习，5分钟休息',
      '制定每日学习计划，设定明确的学习目标',
      '利用碎片时间复习重点知识',
      '避免多任务处理，一次只专注一件事',
      '设定学习截止时间，避免拖延症'
    ]
  },
  {
    category: '记忆技巧',
    tips: [
      '使用记忆宫殿法记忆复杂信息',
      '制作思维导图整理知识结构',
      '采用间隔重复法巩固记忆',
      '将抽象概念与具体事物联系',
      '睡前复习，利用睡眠巩固记忆'
    ]
  },
  {
    category: '学习环境',
    tips: [
      '保持学习环境整洁有序',
      '选择安静、光线充足的学习场所',
      '远离手机等干扰源',
      '准备充足的学习用品',
      '营造专属的学习氛围'
    ]
  },
  {
    category: '健康习惯',
    tips: [
      '保证充足的睡眠时间',
      '定期进行体育锻炼',
      '保持均衡的饮食',
      '学习间隙做眼保健操',
      '保持良好的坐姿'
    ]
  },
  {
    category: '学习方法',
    tips: [
      '主动学习比被动接受更有效',
      '定期总结和反思学习内容',
      '与他人讨论交流学习心得',
      '理论联系实际，多做练习',
      '建立错题本，反复练习薄弱环节'
    ]
  }
];

// 励志名言数据
const motivationalQuotes = [
  '成功不是终点，失败不是末日，继续前进的勇气才最可贵。',
  '学而时习之，不亦说乎？',
  '千里之行，始于足下。',
  '不积跬步，无以至千里；不积小流，无以成江海。',
  '天行健，君子以自强不息。',
  '书山有路勤为径，学海无涯苦作舟。',
  '宝剑锋从磨砺出，梅花香自苦寒来。',
  '业精于勤，荒于嬉；行成于思，毁于随。',
  '读书破万卷，下笔如有神。',
  '知识就是力量。',
  '学习是一生的事业。',
  '今天的努力，是明天的实力。'
];

// 获取表情包
exports.getEmojis = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (category && emojiCategories[category]) {
      res.json({
        success: true,
        data: {
          category,
          emojis: emojiCategories[category]
        }
      });
    } else {
      res.json({
        success: true,
        data: {
          categories: Object.keys(emojiCategories),
          allEmojis: emojiCategories
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取表情包失败',
      error: error.message
    });
  }
};

// 随机获取表情
exports.getRandomEmoji = async (req, res) => {
  try {
    const { category } = req.query;
    let emojis = [];
    
    if (category && emojiCategories[category]) {
      emojis = emojiCategories[category];
    } else {
      // 获取所有表情
      emojis = Object.values(emojiCategories).flat();
    }
    
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    
    res.json({
      success: true,
      data: {
        emoji: randomEmoji,
        category: category || '随机'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取随机表情失败',
      error: error.message
    });
  }
};

// 获取学习贴士
exports.getStudyTips = async (req, res) => {
  try {
    const { category } = req.query;
    
    if (category) {
      const categoryTips = studyTips.find(item => item.category === category);
      if (categoryTips) {
        res.json({
          success: true,
          data: categoryTips
        });
      } else {
        res.status(404).json({
          success: false,
          message: '未找到该分类的学习贴士'
        });
      }
    } else {
      res.json({
        success: true,
        data: {
          categories: studyTips.map(item => item.category),
          allTips: studyTips
        }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取学习贴士失败',
      error: error.message
    });
  }
};

// 随机获取学习贴士
exports.getRandomStudyTip = async (req, res) => {
  try {
    const { category } = req.query;
    let tips = [];
    
    if (category) {
      const categoryTips = studyTips.find(item => item.category === category);
      if (categoryTips) {
        tips = categoryTips.tips;
      }
    } else {
      // 获取所有贴士
      tips = studyTips.flatMap(item => item.tips);
    }
    
    if (tips.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到学习贴士'
      });
    }
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    res.json({
      success: true,
      data: {
        tip: randomTip,
        category: category || '随机'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取随机学习贴士失败',
      error: error.message
    });
  }
};

// 获取励志名言
exports.getMotivationalQuote = async (req, res) => {
  try {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    
    res.json({
      success: true,
      data: {
        quote: randomQuote,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取励志名言失败',
      error: error.message
    });
  }
};

// 生成随机颜色
exports.getRandomColor = async (req, res) => {
  try {
    const { format = 'hex' } = req.query;
    
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    
    let color;
    switch (format) {
      case 'rgb':
        color = `rgb(${r}, ${g}, ${b})`;
        break;
      case 'hsl':
        const h = Math.floor(Math.random() * 360);
        const s = Math.floor(Math.random() * 100);
        const l = Math.floor(Math.random() * 100);
        color = `hsl(${h}, ${s}%, ${l}%)`;
        break;
      default:
        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    res.json({
      success: true,
      data: {
        color,
        format,
        rgb: { r, g, b },
        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '生成随机颜色失败',
      error: error.message
    });
  }
};

// 获取当前时间信息
exports.getTimeInfo = async (req, res) => {
  try {
    const now = new Date();
    const timezone = req.query.timezone || 'Asia/Shanghai';
    
    const timeInfo = {
      timestamp: now.getTime(),
      iso: now.toISOString(),
      local: now.toLocaleString('zh-CN', { timeZone: timezone }),
      date: now.toLocaleDateString('zh-CN', { timeZone: timezone }),
      time: now.toLocaleTimeString('zh-CN', { timeZone: timezone }),
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
      weekday: now.toLocaleDateString('zh-CN', { weekday: 'long', timeZone: timezone }),
      timezone
    };
    
    res.json({
      success: true,
      data: timeInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取时间信息失败',
      error: error.message
    });
  }
};