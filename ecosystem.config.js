require('dotenv').config()

module.exports = {
  apps : [{
    script: 'index.js',
    watch: '.'
  },],

  deploy : {
    production : {
      user : process.env.USER_SERVER,
      host : process.env.SERVER_ADDRESS,
      ref  : 'origin/master',
      repo : 'git@github.com:Oumardev/apoloan.backend.api.git',
      path : process.env.PATH_DEPLOY,
      'post-deploy' : 'npm install'
    }
  }
};
