module.exports = {
  apps: [{
    name: 'shakti',
    script: 'npm run serve',
    instances: 'max', // Use maximum instances based on available CPU cores
    exec_mode: 'cluster', // Enable cluster mode for load balancing
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging configuration
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Restart configuration
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',

    // Monitoring
    monitoring: true,

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Health check
    health_check: {
      enabled: true,
      url: '/health',
      interval: '30s',
      timeout: '5000ms'
    }
  }]
};