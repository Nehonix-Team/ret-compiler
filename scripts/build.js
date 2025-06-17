#!/usr/bin/env node

import { execSync } from 'child_process';
import { rmSync, existsSync } from 'fs';

console.log('🧹 Cleaning dist directory...');
if (existsSync('dist')) {
  rmSync('dist', { recursive: true, force: true });
}

console.log('🔨 Building CommonJS version...');
try {
  execSync('tsc -p tsconfig.build.json', { stdio: 'inherit' });
  console.log('✅ CommonJS build completed');
} catch (error) {
  console.error('❌ CommonJS build failed:', error.message);
  process.exit(1);
}

console.log('📦 Build completed successfully!');
console.log('📁 Output: dist/');
