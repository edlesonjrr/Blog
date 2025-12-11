
 # 📰 BlogSimples – Full Stack Blog + DevOps

Um blog completo criado do zero, com **frontend moderno**, **backend em Node.js + Express**, **PostgreSQL**, e **stack completa de monitoramento**.

## ✨ Features

- ✔ Criação de conta e autenticação
- ✔ Login seguro
- ✔ Criação e edição de posts
- ✔ Sistema de comentários
- ✔ Banco de dados PostgreSQL
- ✔ API RESTful documentada
- ✔ Interface responsiva e moderna
- ✔ Monitoramento completo com Prometheus + Grafana
- ✔ CI/CD automatizado com GitHub Actions
- ✔ Deploy automático na AWS EC2  

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
- Node.js 18
- Express 5.x
- CORS
- PostgreSQL 15 (banco de dados relacional)
- pg (PostgreSQL client)

### **DevOps & Monitoring**
- Docker & Docker Compose
- GitHub Actions (CI/CD)
- Prometheus (coleta de métricas)
- Grafana (visualização e dashboards)
- Node Exporter (métricas do sistema)
- Postgres Exporter (métricas do banco)
- cAdvisor (métricas dos containers)

### **Cloud**
- AWS EC2 (Ubuntu 24.04 LTS)
- Deploy automático via GitHub Actions

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
# Inicie todos os serviços (aplicação + monitoramento)
docker-compose up -d

# Veja os logs
docker-compose logs -f

# Veja status de todos os containers
docker-compose ps

# Pare os serviços
docker-compose down
```

### 🌐 Acesse a Aplicação (Local):

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:8080 | Interface do blog |
| **Backend API** | http://localhost:3000 | API REST |
| **Health Check** | http://localhost:3000/health | Status da aplicação |
| **Prometheus** | http://localhost:9090 | Coleta de métricas |
| **Grafana** | http://localhost:3001 | Dashboards e visualização |
| **cAdvisor** | http://localhost:8081 | Métricas dos containers |
| **Node Exporter** | http://localhost:9100/metrics | Métricas do sistema |
| **Postgres Exporter** | http://localhost:9187/metrics | Métricas do PostgreSQL |

**Credenciais Grafana (local):**
- Usuário: `admin`
- Senha: `admin`

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
- **8 containers** orquestrados:
  - **Aplicação**: Frontend (Nginx), Backend (Node.js), PostgreSQL
  - **Monitoramento**: Prometheus, Grafana, Node Exporter, Postgres Exporter, cAdvisor
- Health checks configurados
- Volumes persistentes para dados do PostgreSQL, Prometheus e Grafana
- Network isolado para comunicação entre containers
- Restart policies configuradas

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
- Hospedado em AWS EC2 (Ubuntu 24.04 LTS)
- Deploy automático via GitHub Actions em push para `staging` ou `main`
- Documentação completa em `AWS_DEPLOYMENT_GUIDE.md`
- Suporte para múltiplos ambientes (staging/production)

### ✅ Monitoramento & Observabilidade

#### **Prometheus** (Coleta de Métricas)
- Coleta métricas de todos os serviços a cada 15 segundos
- Armazena histórico de métricas
- Query language (PromQL) para consultas avançadas
- Configuração em `prometheus.yml`

#### **Grafana** (Visualização)
- Dashboards interativos e customizáveis
- Alertas configuráveis
- Visualização em tempo real
- Suporte a múltiplas fontes de dados

#### **Exporters** (Coletores de Métricas)
- **Node Exporter**: CPU, RAM, Disco, Rede do servidor
- **Postgres Exporter**: Conexões, queries, transações do banco
- **cAdvisor**: CPU, memória, I/O dos containers Docker

---

## 🌐 Acesso à Aplicação em Produção (AWS)

### URLs Públicas:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend (Produção)** | http://13.58.227.69:8080 | Interface do blog |
| **Backend API** | http://13.58.227.69:3000 | API REST |
| **Health Check** | http://13.58.227.69:3000/health | Status da aplicação |
| **Prometheus** | http://13.58.227.69:9090 | Métricas do sistema |
| **Grafana** | http://13.58.227.69:3001 | Dashboards de monitoramento |
| **cAdvisor** | http://13.58.227.69:8081 | Métricas dos containers |

**⚠️ Nota**: As portas de monitoramento (Prometheus, Grafana, cAdvisor) devem estar abertas no Security Group da AWS.

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

---

## 📮 Testando a API com Postman

### Configuração Inicial

1. **Baixe e instale o Postman**: https://www.postman.com/downloads/
2. **URL Base da API**:
   - **Local**: `http://localhost:3000`
   - **Produção (AWS)**: `http://13.58.227.69:3000`

### Headers Padrão

Para todas as requisições que enviam dados (POST), adicione o header:
```
Content-Type: application/json
```

---

### 🔐 Endpoints de Usuários

#### 1. Listar Todos os Usuários

**Método**: `GET`
**URL**: `http://localhost:3000/users`
**Headers**: Nenhum header adicional necessário
**Body**: Nenhum

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "username": "joao",
    "created_at": "2025-12-10T14:30:00.000Z"
  },
  {
    "id": 2,
    "username": "maria",
    "created_at": "2025-12-10T15:00:00.000Z"
  }
]
```

---

#### 2. Criar Nova Conta

**Método**: `POST`
**URL**: `http://localhost:3000/create-account`
**Headers**:
```
Content-Type: application/json
```
**Body (JSON)**:
```json
{
  "user": "joao",
  "password": "senha123"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true
}
```

**Resposta de Erro (usuário já existe)**:
```json
{
  "error": "Usuário já existe!"
}
```

**Resposta de Erro (campos obrigatórios)**:
```json
{
  "error": "Usuário e senha são obrigatórios."
}
```

---

#### 3. Fazer Login

**Método**: `POST`
**URL**: `http://localhost:3000/login`
**Headers**:
```
Content-Type: application/json
```
**Body (JSON)**:
```json
{
  "user": "joao",
  "password": "senha123"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true
}
```

**Resposta de Erro**:
```json
{
  "error": "Credenciais inválidas."
}
```

---

### 📝 Endpoints de Posts

#### 4. Listar Todos os Posts (com comentários)

**Método**: `GET`
**URL**: `http://localhost:3000/posts`
**Headers**: Nenhum header adicional necessário
**Body**: Nenhum

**Resposta de Sucesso (200)**:
```json
[
  {
    "id": 1,
    "title": "Meu Primeiro Post",
    "content": "Este é o conteúdo do meu primeiro post!",
    "author": "joao",
    "created_at": "2025-12-10T16:00:00.000Z",
    "comments": [
      {
        "id": 1,
        "post_id": 1,
        "author": "maria",
        "comment": "Ótimo post!",
        "created_at": "2025-12-10T16:30:00.000Z"
      }
    ]
  }
]
```

---

#### 5. Criar Novo Post

**Método**: `POST`
**URL**: `http://localhost:3000/posts`
**Headers**:
```
Content-Type: application/json
```
**Body (JSON)**:
```json
{
  "title": "Meu Primeiro Post",
  "content": "Este é o conteúdo do meu primeiro post!",
  "author": "joao"
}
```

**Resposta de Sucesso**:
```json
{
  "success": true,
  "post": {
    "id": 1,
    "title": "Meu Primeiro Post",
    "content": "Este é o conteúdo do meu primeiro post!",
    "author": "joao",
    "created_at": "2025-12-10T16:00:00.000Z",
    "comments": []
  }
}
```

**Resposta de Erro**:
```json
{
  "error": "Todos os campos são obrigatórios."
}
```

---

### 💬 Endpoints de Comentários

#### 6. Adicionar Comentário a um Post

**Método**: `POST`
**URL**: `http://localhost:3000/comments`
**Headers**:
```
Content-Type: application/json
```
**Body (JSON)**:
```json
{
  "postId": 1,
  "author": "maria",
  "comment": "Ótimo post! Muito interessante."
}
```

**Resposta de Sucesso**:
```json
{
  "success": true
}
```

**Resposta de Erro (post não encontrado)**:
```json
{
  "error": "Post não encontrado."
}
```

**Resposta de Erro (campos obrigatórios)**:
```json
{
  "error": "Comentário e autor são obrigatórios."
}
```

---

### 🏥 Health Check

#### 7. Verificar Saúde da Aplicação

**Método**: `GET`
**URL**: `http://localhost:3000/health`
**Headers**: Nenhum header adicional necessário
**Body**: Nenhum

**Resposta de Sucesso (200)**:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Resposta de Erro (500)**:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "error": "mensagem de erro"
}
```

---

### 🎯 Fluxo de Teste Completo no Postman

Siga esta ordem para testar a aplicação completa:

1. **Health Check**: Verifique se a API está rodando
   - `GET /health`

2. **Criar Conta**: Crie um novo usuário
   - `POST /create-account` com `{"user": "joao", "password": "senha123"}`

3. **Login**: Faça login com o usuário criado
   - `POST /login` com `{"user": "joao", "password": "senha123"}`

4. **Listar Usuários**: Veja todos os usuários cadastrados
   - `GET /users`

5. **Criar Post**: Crie um novo post
   - `POST /posts` com `{"title": "Título", "content": "Conteúdo", "author": "joao"}`

6. **Listar Posts**: Veja todos os posts
   - `GET /posts`

7. **Adicionar Comentário**: Adicione um comentário ao post (use o `id` retornado no passo 5)
   - `POST /comments` com `{"postId": 1, "author": "maria", "comment": "Ótimo!"}`

8. **Listar Posts Novamente**: Veja o post com o comentário
   - `GET /posts`

---

### 📥 Importar Collection no Postman (Opcional)

Você pode criar uma **Collection** no Postman com todos esses endpoints:

1. Clique em **New** → **Collection**
2. Nomeie como "BlogSimples API"
3. Adicione cada endpoint como uma nova **Request** dentro da collection
4. Salve a collection e compartilhe com sua equipe

---

## 📈 Configurar Grafana (Dashboards)

### Primeiro Acesso:

1. Acesse Grafana: http://localhost:3001 (local) ou http://13.58.227.69:3001 (produção)
2. Login:
   - **Usuário**: `admin`
   - **Senha**: `admin`
3. (Opcional) Alterar senha no primeiro login

### Adicionar Prometheus como Data Source:

1. Vá em **Configuration** → **Data Sources** → **Add data source**
2. Selecione **Prometheus**
3. Configure:
   - **URL**: `http://prometheus:9090` (ou `http://localhost:9090` se estiver fora do Docker)
   - Deixe as outras opções padrão
4. Clique em **Save & Test**

### Importar Dashboards Prontos:

1. Vá em **Dashboards** → **Import**
2. Importe estes dashboards públicos pelo ID:

   | Dashboard | ID | Descrição |
   |-----------|----|-----------|
   | **Node Exporter Full** | `1860` | Métricas completas do servidor (CPU, RAM, Disco) |
   | **Docker Container & Host Metrics** | `179` | Métricas dos containers Docker |
   | **PostgreSQL Database** | `9628` | Métricas do banco de dados |
   | **cAdvisor** | `14282` | Análise detalhada dos containers |

3. Selecione **Prometheus** como data source
4. Clique em **Import**

### Criar Dashboard Customizado:

- Clique em **+** → **Dashboard** → **Add new panel**
- Use queries PromQL para métricas específicas
- Exemplo de queries úteis:
  ```promql
  # CPU do sistema
  100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

  # Memória usada
  node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes

  # Conexões ativas do PostgreSQL
  pg_stat_database_numbackends{datname="devops"}
  ```

---

## 🔗 Links Úteis

- **Repositório GitHub**: https://github.com/edlesonjrr/Blog
- **GitHub Actions (CI/CD)**: https://github.com/edlesonjrr/Blog/actions
- **Documentação AWS**: [AWS_DEPLOYMENT_GUIDE.md](./AWS_DEPLOYMENT_GUIDE.md)
- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **Docker Compose Docs**: https://docs.docker.com/compose/

---

## 🛠️ Comandos Úteis

### Docker:
```bash
# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f prometheus

# Restart de um serviço específico
docker-compose restart backend

# Ver uso de recursos dos containers
docker stats

# Remover volumes (⚠️ apaga dados!)
docker-compose down -v
```

### Git Workflow:
```bash
# Desenvolvimento
git checkout dev
git add .
git commit -m "feat: nova funcionalidade"
git push origin dev

# Deploy para Staging
git checkout staging
git merge dev
git push origin staging  # ← Aciona CI/CD

# Deploy para Production
git checkout main
git merge staging
git push origin main  # ← Aciona CI/CD
```

### PostgreSQL:
```bash
# Acessar o banco dentro do container
docker exec -it postgres psql -U postgres -d devops

# Backup do banco
docker exec postgres pg_dump -U postgres devops > backup.sql

# Restore do banco
docker exec -i postgres psql -U postgres devops < backup.sql
```

---

## 📋 Checklist DevOps

- [x] Aplicação com Frontend + Backend + Database
- [x] Docker & Docker Compose
- [x] PostgreSQL com migrations automáticas
- [x] CI/CD com GitHub Actions
- [x] Deploy automático na AWS EC2
- [x] Monitoramento com Prometheus
- [x] Visualização com Grafana
- [x] Métricas do sistema (Node Exporter)
- [x] Métricas do banco (Postgres Exporter)
- [x] Métricas dos containers (cAdvisor)
- [x] GIT com 3 branches (dev, staging, main)
- [x] Health checks configurados
- [x] API REST documentada
- [x] Documentação de testes com Postman
- [ ] Zabbix (opcional)

---

## 👨‍💻 Autor

**Leandro Manoel**
- GitHub: [@edlesonjrr](https://github.com/edlesonjrr)

---

## 📝 Licença

Este projeto foi criado para fins educacionais (Projeto DevOps).

---

**🎉 Projeto completo com aplicação full-stack + DevOps + Monitoramento!**
