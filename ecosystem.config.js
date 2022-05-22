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
      repo : 'git@github.com:Oumardev/apoloan.backend.api.git',
      path : '/root/dev/apoloan.backend.api',
      'post-deploy' : 'npm install'
    }
  }
};
