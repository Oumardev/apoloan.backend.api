module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  },],

  deploy : {
    production : {
      user : 'root',
      host : '86.107.197.161',
      ref  : 'origin/master',
      repo : 'https://github.com/Oumardev/apoloan.backend.api.git',
      path : '/root/apoloan.backend.api',
      'post-deploy' : 'npm install'
    }
  }
};