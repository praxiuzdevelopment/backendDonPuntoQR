import fs from 'fs';
import path from 'path';

// 1. Fix Models
const modelsDir = 'src/models';
fs.readdirSync(modelsDir).forEach(file => {
  if (file === 'index.js') return;
  const filePath = path.join(modelsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/export default \(sequelize, DataTypes\) => {/, `export default function define${file.replace('.js','')} (sequelize, DataTypes) {`);
  fs.writeFileSync(filePath, content);
});

// 2. Fix Services
const servicesDir = 'src/services';
fs.readdirSync(servicesDir).forEach(file => {
  const filePath = path.join(servicesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('import AppError')) {
    content = `import AppError from '../utils/AppError.js';\n` + content;
  }
  content = content.replace(/throw { status: (\d+), message: (.+) };/g, 'throw new AppError($2, $1);');
  content = content.replace(/throw { status: (\d+), message: (.+) }/g, 'throw new AppError($2, $1);');
  // String replace to replaceAll
  content = content.replace(/\.replace\(/g, '.replaceAll(');
  fs.writeFileSync(filePath, content);
});

console.log('Models and Services refactored.');
