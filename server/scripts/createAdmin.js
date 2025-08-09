const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_website')
  .then(() => console.log('MongoDB连接成功'))
  .catch(err => console.error('MongoDB连接失败:', err));

// 创建默认管理员账户
async function createAdmin() {
  try {
    // 检查是否已存在管理员账户
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('管理员账户已存在');
      console.log('邮箱: admin@example.com');
      console.log('密码: admin123');
      return;
    }

    // 创建管理员用户
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123', // 密码会被自动加密
      role: 'admin',
      isActive: true,
      profile: {
        firstName: '系统',
        lastName: '管理员',
        bio: '系统默认管理员账户',
        location: '系统'
      }
    });

    await adminUser.save();
    
    console.log('✅ 管理员账户创建成功!');
    console.log('==========================================');
    console.log('邮箱: admin@example.com');
    console.log('密码: admin123');
    console.log('角色: 管理员');
    console.log('==========================================');
    console.log('请使用以上信息登录管理员账户');
    
  } catch (error) {
    console.error('❌ 创建管理员账户失败:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();