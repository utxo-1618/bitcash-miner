module.exports = {
  apps: [
    {
      // Core semantic signal broadcaster
      name: 'semantic-daemon',
      script: './semantic-daemon.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        BASE_RPC: process.env.BASE_RPC || 'https://mainnet.base.org',
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        SEMANTIC_SEED: 'causal-finance-2024'
      },
      error_file: './logs/semantic-daemon-error.log',
      out_file: './logs/semantic-daemon-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      // ETH extraction engine - monitors and liquidates
      name: 'eth-extractor',
      script: './eth-extractor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PRIVATE_KEY: process.env.PRIVATE_KEY,
        ETH_RPC: process.env.ETH_RPC || 'https://eth-mainnet.g.alchemy.com/v2/demo',
        SEMANTIC_BROADCASTER: '0x' + '1'.repeat(40)
      },
      error_file: './logs/eth-extractor-error.log',
      out_file: './logs/eth-extractor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      // L2 liquidator for cheaper gas execution
      name: 'l2-liquidator',
      script: './l2-liquidator.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PRIVATE_KEY: process.env.PRIVATE_KEY
      },
      error_file: './logs/l2-liquidator-error.log',
      out_file: './logs/l2-liquidator-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      // Recursive loop engine - eternal compounding
      name: 'recursive-loop',
      script: './recursive-loop.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/recursive-loop-error.log',
      out_file: './logs/recursive-loop-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      // Yield extractor - monitors governance and extracts
      name: 'yield-extractor',
      script: './yield-extractor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/yield-extractor-error.log',
      out_file: './logs/yield-extractor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      // Balance monitor - shows karmic reflections
      name: 'balance-monitor',
      script: './balance-monitor.js',
      instances: 1,
      autorestart: true,
      watch: false,
      exec_mode: 'fork',
      cron_restart: '*/5 * * * *', // Check balance every 5 minutes
      env: {
        NODE_ENV: 'production',
        PRIVATE_KEY: process.env.PRIVATE_KEY
      },
      error_file: './logs/balance-monitor-error.log',
      out_file: './logs/balance-monitor-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ],

  // Deploy configuration
  deploy: {
    production: {
      user: 'node',
      host: 'localhost',
      ref: 'origin/master',
      repo: 'git@github.com:utxo-one/causal-finance.git',
      path: '/var/www/causal-finance',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
