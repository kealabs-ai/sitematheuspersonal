# Deploy na Hostinger

## Instruções:

1. Execute `npm run build` para gerar os arquivos de produção
2. Faça upload de TODOS os arquivos da pasta `dist/` para o diretório `public_html` da Hostinger
3. Certifique-se de incluir o arquivo `.htaccess` para roteamento correto

## Estrutura de upload:
```
public_html/
├── index.html
├── .htaccess
└── assets/
    ├── index-[hash].css
    └── index-[hash].js
```

## Alternativa: Use FTP ou File Manager da Hostinger
- Acesse o painel da Hostinger
- Vá em "File Manager" ou use FTP
- Navegue até `public_html`
- Faça upload de todos os arquivos da pasta `dist/`
