require('dotenv').config()

module.exports = {
  apps : [{
    script: 'apoloanapi.js',
    watch: true,
      env: {
        "PORT": 1000,
        "NODE_ENV": "development",
        "SECRET_TOKEN" : "7LJ3H4@3NBVVEYHDBDGG63JHDU3]J76CVUHDJ3@@@#293@3DHHDHHDDD",
        "ADDRESS" : "192.168.1.102",
        "USERNAME_DB" : "apoloandba",
        "PASSWD_DB" : "apoloan_283@2000",
        "DB_NAME" : "apoloandb",
        "DB_HOST" : "127.0.0.1",
      },
      
      env_production: {
        "PORT": 1000,
        "NODE_ENV": "production",
        "SECRET_TOKEN" : "7LJ3H4@3NBVVEYHDBDGG63JHDU3]J76CVUHDJ3@@@#293@3DHHDHHDDD",
        "ADDRESS" : "127.0.0.1",
        "USERNAME_DB" : "apoloandba",
        "PASSWD_DB" : "apoloan_283@2000",
        "DB_NAME" : "apoloandb",
        "DB_HOST" : "127.0.0.1",
    }
  },],

  deploy : {
    production : {
      user : process.env.USER_SERVER,
      host : "86.107.197.161",
      ref  : 'origin/master',
      repo : 'git@github.com:Oumardev/apoloan.backend.api.git',
      path : process.env.PATH_DEPLOY,
      'post-deploy' : 'npm install'
    }
  }
};
