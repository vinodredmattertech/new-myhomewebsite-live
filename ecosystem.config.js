module.exports = {
  apps: [
    {
	name: 'frontend-myhomegroup',
      script: 'npm',
      args: 'run start',
      env: {
        NODE_ENV: 'production'
      },
    },    
  ],
};
