module.exports = {
  apps: [{
    name: 'student-website',
    script: './server/index.js',
    cwd: '/var/www/student-website',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 10000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 10000
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