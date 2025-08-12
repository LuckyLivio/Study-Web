module.exports = {
  apps: [{
    name: 'student-website',
    script: './server/index.js',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      CLIENT_URL: 'https://study-web-r3ee.onrender.com',
      REACT_APP_API_URL: 'https://study-web-r3ee.onrender.com/api'
    },
    error_file: '/var/log/pm2/student-website-error.log',
    out_file: '/var/log/pm2/student-website-out.log',
    log_file: '/var/log/pm2/student-website.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};