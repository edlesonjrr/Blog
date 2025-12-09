
 # 📰 BlogSimples – Full Stack Blog

Um blog completo criado do zero, com **frontend moderno**, **backend em Node.js + Express**, e suporte a:

- ✔ Criação de conta  
- ✔ Login  
- ✔ Criação de posts  
- ✔ Comentários  
- ✔ Salvamento em `data.json`  
- ✔ Estilo profissional e responsivo  

## Screenshots

![App Screenshot](image/tela1.png)


---

## 🚀 Tecnologias Usadas

### **Frontend**
- HTML5  
- CSS3  
- JavaScript (vanilla)  
- Fetch API  

### **Backend**
- Node.js
- Express
- CORS
- PostgreSQL (banco de dados relacional)
- pg (PostgreSQL client)

---

## 📁 Estrutura do Projeto

Uma breve descrição sobre o que esse projeto faz e para quem ele é


```bash
/backend
├── server.js
├── init-db.sql
├── Dockerfile
└── package.json

/frontend
├── index.html
├── style.css
├── app.js
└── Dockerfile

/.github
└── workflows
    └── ci-cd.yml

docker-compose.yaml
AWS_DEPLOYMENT_PLAN.md
```
## ▶️ Como Rodar

### Opção 1: Com Docker (Recomendado)

```bash
# Inicie todos os serviços (frontend, backend e PostgreSQL)
docker compose up -d

# Veja os logs
docker compose logs -f

# Pare os serviços
docker compose down
```

**Acesse a aplicação:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/health

### Opção 2: Desenvolvimento Local

#### 1. Inicie o PostgreSQL
```bash
docker compose up -d postgres
```

#### 2. Instale as dependências do backend
```bash
cd backend
npm install
```

#### 3. Inicie o servidor
```bash
cd backend
node server.js
```

#### 4. Abra o frontend
Abra `frontend/index.html` no navegador ou use um servidor local:
```bash
cd frontend
python3 -m http.server 8080
```

---

## 🚀 DevOps Features

### ✅ Banco de Dados PostgreSQL
- Migramos de `data.json` para PostgreSQL relacional
- Tabelas: `users`, `posts`, `comments`
- Script de inicialização automática: `backend/init-db.sql`

### ✅ Docker & Docker Compose
- **3 serviços**: PostgreSQL, Backend (Node.js), Frontend (Nginx)
- Health checks configurados
- Volumes persistentes para dados do PostgreSQL
- Network isolado para comunicação entre containers

### ✅ CI/CD com GitHub Actions
- **Build e Test**: Validação automática em cada push
- **Deploy Staging**: Automático ao fazer push na branch `staging`
- **Deploy Production**: Automático ao fazer push na branch `main`
- Workflow completo em `.github/workflows/ci-cd.yml`

### ✅ GIT Workflow
- **3 branches**: `dev`, `staging`, `main`
- `dev` → desenvolvimento
- `staging` → testes e homologação
- `main` → produção

### ✅ AWS Deployment
- Instruções detalhadas em `AWS_DEPLOYMENT_PLAN.md`
- Deploy automático via GitHub Actions
- Suporte para ambientes staging e production

---

## 📊 API Endpoints

### Usuários
- `GET /users` - Lista todos os usuários
- `POST /create-account` - Cria nova conta
- `POST /login` - Realiza login

### Posts
- `GET /posts` - Lista todos os posts com comentários
- `POST /posts` - Cria novo post

### Comentários
- `POST /comments` - Adiciona comentário a um post

### Health Check
- `GET /health` - Verifica saúde da aplicação e conexão com o banco
