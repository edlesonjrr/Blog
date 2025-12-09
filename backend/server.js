// -----------------------------
// CONFIGURAÇÕES BÁSICAS
// -----------------------------
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || "postgres",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "devops",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
});

// Teste de conexão e inicialização do banco com retry
async function initializeDatabase(retries = 5) {
    for (let i = 1; i <= retries; i++) {
        try {
            console.log(`Tentativa ${i}/${retries} de conectar ao PostgreSQL...`);
            const client = await pool.connect();
            console.log("✅ Conectado ao PostgreSQL com sucesso!");

            // Executar script de inicialização
            const fs = require("fs");
            const initSQL = fs.readFileSync(__dirname + "/init-db.sql", "utf-8");
            await client.query(initSQL);
            console.log("✅ Banco de dados inicializado!");

            client.release();
            return; // Sucesso! Sair da função
        } catch (err) {
            console.error(`❌ Tentativa ${i} falhou:`, err.message);

            if (i === retries) {
                console.error("💥 Não foi possível conectar ao banco após todas as tentativas");
                process.exit(1);
            }

            // Aguardar antes de tentar novamente
            console.log(`⏳ Aguardando 3 segundos antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
}

// -----------------------------
// ROTAS DE USUÁRIOS
// -----------------------------

// Obter lista de usuários
app.get("/users", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, created_at FROM users ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar usuários", details: err.message });
    }
});

// Criar conta
app.post("/create-account", async (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.json({ error: "Usuário e senha são obrigatórios." });
    }

    try {
        // Verifica se já existe
        const checkUser = await pool.query("SELECT * FROM users WHERE username = $1", [user]);

        if (checkUser.rows.length > 0) {
            return res.json({ error: "Usuário já existe!" });
        }

        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [user, password]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar conta", details: err.message });
    }
});

// Login
app.post("/login", async (req, res) => {
    const { user, password } = req.body;

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1 AND password = $2",
            [user, password]
        );

        if (result.rows.length === 0) {
            return res.json({ error: "Credenciais inválidas." });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erro ao fazer login", details: err.message });
    }
});

// -----------------------------
// ROTAS DE POSTS
// -----------------------------

// Obter posts com comentários
app.get("/posts", async (req, res) => {
    try {
        const postsResult = await pool.query("SELECT * FROM posts ORDER BY created_at DESC");
        const posts = postsResult.rows;

        // Buscar comentários para cada post
        for (let post of posts) {
            const commentsResult = await pool.query(
                "SELECT * FROM comments WHERE post_id = $1 ORDER BY created_at ASC",
                [post.id]
            );
            post.comments = commentsResult.rows;
        }

        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Erro ao buscar posts", details: err.message });
    }
});

// Criar post
app.post("/posts", async (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const result = await pool.query(
            "INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING *",
            [title, content, author]
        );

        const newPost = result.rows[0];
        newPost.comments = [];

        res.json({ success: true, post: newPost });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar post", details: err.message });
    }
});

// -----------------------------
// ROTAS DE COMENTÁRIOS
// -----------------------------

// Enviar comentário
app.post("/comments", async (req, res) => {
    const { postId, comment, author } = req.body;

    if (!comment || !author) {
        return res.json({ error: "Comentário e autor são obrigatórios." });
    }

    try {
        // Verifica se o post existe
        const postCheck = await pool.query("SELECT * FROM posts WHERE id = $1", [postId]);

        if (postCheck.rows.length === 0) {
            return res.json({ error: "Post não encontrado." });
        }

        await pool.query(
            "INSERT INTO comments (post_id, author, comment) VALUES ($1, $2, $3)",
            [postId, author, comment]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Erro ao criar comentário", details: err.message });
    }
});

// -----------------------------
// HEALTH CHECK
// -----------------------------
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "healthy", database: "connected" });
    } catch (err) {
        res.status(500).json({ status: "unhealthy", database: "disconnected", error: err.message });
    }
});

// -----------------------------
// INICIAR SERVIDOR
// -----------------------------
initializeDatabase().then(() => {
    app.listen(3000, () => {
        console.log("Servidor rodando em http://localhost:3000");
    });
});
