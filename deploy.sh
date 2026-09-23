git pull
npm ci
npm run build
# Cache keys are named by page, not by query, so an entry cached before this
# deploy may lack fields the new build asks Strapi for. Start clean.
redis-cli --scan --pattern 'myhome:strapi:*' | xargs -r redis-cli unlink > /dev/null
pm2 stop frontend-myhomegroup
pm2 start frontend-myhomegroup
