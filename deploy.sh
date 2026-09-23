git pull
npm ci
npm run build
pm2 stop frontend-myhomegroup
pm2 start frontend-myhomegroup
