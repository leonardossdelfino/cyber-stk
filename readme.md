# 💼 Cyber Finance — Sistema Financeiro

Sistema web para controle financeiro interno, começando pelo gerenciamento de Ordens de Compra (OCs).

---

## 🛠️ Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | PHP 8+ |
| Banco de dados | MySQL 8+ |
| Hospedagem | Hostinger (compartilhada) |
| Versionamento | Git + GitHub |

---

## 💻 Pré-requisitos — o que instalar antes de tudo

### 1. Node.js (obrigatório para o frontend)
- Acesse: https://nodejs.org
- Baixe a versão **LTS** (ex: 22.x)
- Instale normalmente seguindo o instalador
- Verifique a instalação:
  ```bash
  node --version
  npm --version
  ```

### 2. Git (obrigatório para versionamento)
- Acesse: https://git-scm.com
- Baixe e instale normalmente
- Verifique a instalação:
  ```bash
  git --version
  ```

### 3. VS Code (recomendado como editor)
- Acesse: https://code.visualstudio.com
- Extensões recomendadas:
  - **Tailwind CSS IntelliSense** (autocomplete do Tailwind)
  - **PHP Intelephense** (suporte ao PHP)
  - **ES7+ React/Redux/React-Native snippets** (atalhos React)

### 4. PHP + MySQL local (para desenvolvimento)
- **Mac:** Instale o [MAMP](https://www.mamp.info) — inclui PHP e MySQL
- **Windows:** Instale o [XAMPP](https://www.apachefriends.org) — inclui PHP e MySQL
- Esses programas simulam o servidor da Hostinger no seu computador

---

## 🚀 Instalação do projeto em uma nova máquina

### Passo 1 — Clonar o repositório
```bash
git clone https://github.com/leonardossdelfino/cyber-stk.git
cd cyber-stk
```

### Passo 2 — Instalar dependências do frontend
```bash
cd frontend
npm install
```
> Isso baixa automaticamente todas as bibliotecas (React, Tailwind, Axios, etc.)
> A pasta `node_modules` é gerada localmente e não vai para o GitHub.

### Passo 3 — Configurar o banco de dados
1. Abra o phpMyAdmin (via MAMP/XAMPP localmente, ou via Hostinger em produção)
2. Crie um banco chamado `cyber_stk` com charset `utf8mb4_unicode_ci`
3. Com o banco selecionado, clique na aba **SQL**
4. Cole e execute o script localizado em:
   ```
   Utils/#Banco_de_dados_scripts/ordens_de_compra.sql
   ```

### Passo 4 — Configurar as credenciais do banco
Abra o arquivo `backend/config/database.php` e atualize com os dados do seu ambiente:

```php
private $host     = "localhost";
private $db_name  = "cyber_stk";        // ou "u239500132_cyber_stk" na Hostinger
private $username = "SEU_USUARIO";      // usuário do MySQL
private $password = "SUA_SENHA";        // senha do MySQL
```

> ⚠️ **Nunca commite senhas reais no GitHub.**
> Em ambiente local use credenciais simples (ex: root / root).
> Em produção use as credenciais geradas pela Hostinger.

### Passo 5 — Iniciar o projeto
```bash
# Dentro da pasta frontend
npm run dev
```

Acesse no navegador: **http://localhost:5173**

---

## 📁 Estrutura do projeto

```
cyber-stk/
  backend/
    api/
      oc.php              ← Endpoints da API (GET, POST, PUT, DELETE)
    config/
      database.php        ← Configuração da conexão com o banco
    models/
      OC.php              ← Model das Ordens de Compra
  frontend/
    src/
      components/         ← Componentes reutilizáveis (menu, tabela, modais)
      hooks/              ← Lógica reutilizável entre páginas
      pages/              ← Páginas da aplicação (Dashboard, Listagem, Formulário)
      services/
        api.js            ← Centraliza todas as chamadas à API PHP
    tailwind.config.js    ← Configuração do Tailwind CSS
    vite.config.js        ← Configuração do Vite
  Utils/
    #Banco_de_dados_scripts/
      ordens_de_compra.sql ← Script de criação das tabelas
  .gitignore
  .htaccess
  README.md
```

---

## 🔄 Fluxo de trabalho diário (Git)

```bash
# 1. Antes de começar — garante que está com a versão mais recente
git pull

# 2. Durante o desenvolvimento — salva as mudanças
git add .
git commit -m "feat: descrição do que foi feito"
git push
```

### Prefixos de commit recomendados
| Prefixo | Uso |
|---|---|
| `feat:` | Nova funcionalidade |
| `fix:` | Correção de bug |
| `style:` | Mudança visual/CSS |
| `refactor:` | Melhoria de código sem mudar funcionalidade |
| `docs:` | Atualização de documentação |

---

## 🌐 Deploy na Hostinger

> Instruções detalhadas serão adicionadas quando o projeto estiver pronto para produção.

Resumo do processo:
1. Rodar `npm run build` dentro de `frontend/` — gera a pasta `dist/`
2. Enviar a pasta `dist/` para a raiz do domínio via FTP ou painel da Hostinger
3. Enviar a pasta `backend/` para o servidor
4. Configurar as credenciais do banco em `database.php` com os dados da Hostinger

---

## 📋 Status do projeto

- [x] Banco de dados — tabela `ordens_de_compra`
- [x] Backend PHP — API REST (CRUD completo)
- [x] Frontend — estrutura base com React + Vite + Tailwind
- [x] Navegação entre páginas (React Router)
- [ ] Formulário de cadastro de OC
- [ ] Listagem de OCs com filtros e busca
- [ ] Dashboard com indicadores e gráficos
- [ ] Deploy na Hostinger

---

*Projeto em desenvolvimento — README será atualizado conforme o sistema evolui.*