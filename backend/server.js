// -----------------------------
// CONFIGURAÇÕES BÁSICAS
// -----------------------------
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

// Caminho do nosso "banco de dados"
const DB_PATH = __dirname + "/data.json";

// Carregar dados do arquivo
function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ users: [], posts: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH));
}

// Salvar dados no arquivo
function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// -----------------------------
// ROTAS DE USUÁRIOS
// -----------------------------

// Obter lista de usuários
app.get("/users", (req, res) => {
    const db = loadDB();
    res.json(db.users);
});

// Criar conta
app.post("/create-account", (req, res) => {
    const { user, password } = req.body;

    if (!user || !password) {
        return res.json({ error: "Usuário e senha são obrigatórios." });
    }

    const db = loadDB();

    // Verifica se já existe
    if (db.users.find(u => u.user === user)) {
        return res.json({ error: "Usuário já existe!" });
    }

    db.users.push({ user, password });
    saveDB(db);

    res.json({ success: true });
});

// Login
app.post("/login", (req, res) => {
    const { user, password } = req.body;

    const db = loadDB();
    const found = db.users.find(u => u.user === user && u.password === password);

    if (!found) {
        return res.json({ error: "Credenciais inválidas." });
    }

    res.json({ success: true });
});

// -----------------------------
// ROTAS DE POSTS
// -----------------------------

// Obter posts
app.get("/posts", (req, res) => {
    const db = loadDB();
    res.json(db.posts);
});

// Criar post
app.post("/posts", (req, res) => {
    const { title, content, author } = req.body;

    if (!title || !content || !author) {
        return res.json({ error: "Todos os campos são obrigatórios." });
    }

    const db = loadDB();

    const newPost = {
        id: Date.now(),
        title,
        content,
        author,
        comments: []
    };

    db.posts.push(newPost);
    saveDB(db);

    res.json({ success: true, post: newPost });
});

// -----------------------------
// ROTAS DE COMENTÁRIOS
// -----------------------------

// Enviar comentário
app.post("/comments", (req, res) => {
    const { postId, comment, author } = req.body;

    if (!comment || !author) {
        return res.json({ error: "Comentário e autor são obrigatórios." });
    }

    const db = loadDB();
    const post = db.posts.find(p => p.id === postId);

    if (!post) {
        return res.json({ error: "Post não encontrado." });
    }

    post.comments.push({
        id: Date.now(),
        author,
        comment
    });

    saveDB(db);

    res.json({ success: true });
});

// -----------------------------
// INICIAR SERVIDOR
// -----------------------------
app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});
