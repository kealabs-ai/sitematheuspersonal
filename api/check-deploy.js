#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuração para deploy...\n');

let errors = 0;
let warnings = 0;

// Verificar se o build foi feito
console.log('📦 Verificando build do frontend...');
if (fs.existsSync(path.join(__dirname, '..', 'dist'))) {
  console.log('✅ Pasta dist/ encontrada\n');
} else {
  console.log('❌ Pasta dist/ não encontrada. Execute: npm run build\n');
  errors++;
}

// Verificar .env.production
console.log('⚙️  Verificando .env.production...');
const envProdPath = path.join(__dirname, '.env.production');
if (fs.existsSync(envProdPath)) {
  const envContent = fs.readFileSync(envProdPath, 'utf8');
  
  if (envContent.includes('NODE_ENV=production')) {
    console.log('✅ NODE_ENV=production configurado');
  } else {
    console.log('❌ NODE_ENV não está como production');
    errors++;
  }
  
  if (envContent.includes('PORT=')) {
    console.log('⚠️  PORT definido no .env - será ignorado pela Hostinger');
    warnings++;
  } else {
    console.log('✅ PORT não definido (correto para Hostinger)');
  }
  
  console.log('');
} else {
  console.log('❌ Arquivo .env.production não encontrado\n');
  errors++;
}

// Verificar package.json
console.log('📄 Verificando package.json...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  if (pkg.scripts && pkg.scripts.start) {
    console.log('✅ Script "start" encontrado');
  } else {
    console.log('❌ Script "start" não encontrado');
    errors++;
  }
  
  if (pkg.main === 'server.js') {
    console.log('✅ Entry point correto (server.js)');
  } else {
    console.log('⚠️  Entry point não é server.js');
    warnings++;
  }
  
  console.log('');
} else {
  console.log('❌ package.json não encontrado\n');
  errors++;
}

// Verificar server.js
console.log('🖥️  Verificando server.js...');
const serverPath = path.join(__dirname, 'server.js');
if (fs.existsSync(serverPath)) {
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  if (serverContent.includes("'0.0.0.0'") || serverContent.includes('"0.0.0.0"')) {
    console.log('✅ Bind em 0.0.0.0 configurado');
  } else {
    console.log('⚠️  Bind em 0.0.0.0 não encontrado');
    warnings++;
  }
  
  if (serverContent.includes('process.env.PORT')) {
    console.log('✅ Porta dinâmica configurada');
  } else {
    console.log('❌ Porta dinâmica não configurada');
    errors++;
  }
  
  console.log('');
} else {
  console.log('❌ server.js não encontrado\n');
  errors++;
}

// Verificar ecosystem.config.js
console.log('🔄 Verificando ecosystem.config.js...');
if (fs.existsSync(path.join(__dirname, 'ecosystem.config.js'))) {
  console.log('✅ Arquivo PM2 encontrado\n');
} else {
  console.log('⚠️  ecosystem.config.js não encontrado (opcional)\n');
  warnings++;
}

// Verificar estrutura de pastas
console.log('📁 Verificando estrutura de pastas...');
const requiredDirs = ['config', 'controllers', 'routes'];
requiredDirs.forEach(dir => {
  if (fs.existsSync(path.join(__dirname, dir))) {
    console.log(`✅ Pasta ${dir}/ encontrada`);
  } else {
    console.log(`❌ Pasta ${dir}/ não encontrada`);
    errors++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Resultado: ${errors} erros, ${warnings} avisos\n`);

if (errors === 0 && warnings === 0) {
  console.log('✅ Tudo pronto para deploy!\n');
  process.exit(0);
} else if (errors === 0) {
  console.log('⚠️  Pronto para deploy, mas com avisos.\n');
  process.exit(0);
} else {
  console.log('❌ Corrija os erros antes de fazer deploy.\n');
  process.exit(1);
}
