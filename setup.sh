rm -rf node_modules
npm cache clean --force
npm install
echo "node_modules/" >> .gitignore
