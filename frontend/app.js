// app.js — Refatorado para o seu index.html
// Compatível com:
// IDs usados no seu HTML: search-input, search-btn, nav-avatar, btn-open-login, btn-logout,
// hero-create-post, hero-see-posts, quick-login, quick-create-account, open-create-from-login,
// nav-new-post, modal-login, modal-create, modal-post, modal-confirm,
// form-login, form-create, form-post, post-title, post-body, post-category,
// posts-list, posts-count, filter-category, sort-posts, category-list, top-authors, latest-comments,
// template-post, confirm-yes, confirm-no, post-cancel, toggle-theme

// Detecta automaticamente se está em localhost ou no servidor
const API = window.location.hostname === 'localhost'
  ? "http://localhost:3000"
  : `http://${window.location.hostname}:3000`;

// helpers
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const escapeHtml = (t = "") =>
  String(t).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])
  );

function flash(msg, type = "info", timeout = 2200) {
  const el = document.createElement("div");
  el.className = `flash flash-${type}`;
  el.textContent = msg;
  Object.assign(el.style, {
    position: "fixed",
    right: "18px",
    bottom: "18px",
    padding: "10px 14px",
    borderRadius: "8px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    zIndex: 9999,
    background: type === "error" ? "#ffd6d6" : type === "success" ? "#e6ffef" : "#fff",
    color: type === "error" ? "#900" : type === "success" ? "#064" : "#222",
    transition: 'opacity 0.3s, transform 0.3s',
    transform: 'translateY(100%)',
    opacity: 0,
  });

  // Adiciona e mostra com um pequeno atraso
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transform = 'translateY(0)';
    el.style.opacity = 1;
  }, 10);

  setTimeout(() => {
    el.style.transform = 'translateY(100%)';
    el.style.opacity = 0;
    setTimeout(() => el.remove(), 300); // Remove depois da transição
  }, timeout);
}

// API helper
async function api(path, method = "GET", body = null) {
  try {
    console.log(API + path)
    const res = await fetch(API + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null
    });
    // Verifica se a resposta não é OK (status 4xx ou 5xx)
    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        errorData = { error: `Erro no servidor (Status: ${res.status})` };
      }
      return errorData;
    }
    return await res.json();
  } catch (err) {
    console.error("API error:", err);
    flash("Erro de conexão com o servidor API.", "error");
    throw err;
  }
}

// state
let currentUser = JSON.parse(localStorage.getItem("blog_user") || "null");
let posts = [];
let editingPostId = null;

// cached elements (matching your HTML)
const navAvatar = qs("#nav-avatar");
const btnOpenLogin = qs("#btn-open-login");
const btnLogout = qs("#btn-logout");
const searchInput = qs("#search-input");
const searchBtn = qs("#search-btn"); // Busca o botão
const heroCreate = qs("#hero-create-post");
const heroSee = qs("#hero-see-posts");

const quickLogin = qs("#quick-login");
const quickCreate = qs("#quick-create-account");
const openCreateFromLogin = qs("#open-create-from-login");
const navNewPost = qs("#nav-new-post");
const toggleThemeBtn = qs("#toggle-theme");

const loginForm = qs("#form-login");
const createForm = qs("#form-create");
const postForm = qs("#form-post");
const postCancelBtn = qs("#post-cancel");

const postsList = qs("#posts-list");
const postsCount = qs("#posts-count");

const filterCategory = qs("#filter-category");
const sortPosts = qs("#sort-posts");

const categoriesBox = qs("#category-list");
const topAuthorsBox = qs("#top-authors");
const latestCommentsBox = qs("#latest-comments");

const templatePost = qs("#template-post");

const modalLogin = qs("#modal-login");
const modalCreate = qs("#modal-create");
const modalPost = qs("#modal-post");
const modalConfirm = qs("#modal-confirm");
const confirmYes = qs("#confirm-yes");
const confirmNo = qs("#confirm-no");
const postModalTitle = qs("#post-modal-title");

// UI update
function updateUserUI() {
  const userLoggedIn = currentUser && currentUser.user;

  // Toggle visibility of login/logout buttons
  btnOpenLogin?.classList.toggle("hidden", !!userLoggedIn);
  btnLogout?.classList.toggle("hidden", !userLoggedIn);

  // Avatar setup
  const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  let avatarUrl = defaultAvatar;
  let profileDisplayName = "Convidado";

  if (userLoggedIn) {
    profileDisplayName = currentUser.user;
    avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user)}&background=4B7BF5&color=fff&rounded=true`;
  }

  if (navAvatar) navAvatar.src = avatarUrl;

  const profileName = qs("#profile-name");
  const profileQuickAvatar = qs("#profile-quick-avatar");

  if (profileName) profileName.textContent = profileDisplayName;
  if (profileQuickAvatar) profileQuickAvatar.src = avatarUrl;
}

function setCurrentUser(obj) {
  currentUser = obj;
  if (obj) localStorage.setItem("blog_user", JSON.stringify(obj));
  else localStorage.removeItem("blog_user");
  updateUserUI();
}

// modal helpers (use aria-hidden per seu HTML)
function showModal(id) {
  const el = qs(`#${id}`);
  if (el) el.setAttribute("aria-hidden", "false");
}
function hideModal(id) {
  const el = qs(`#${id}`);
  if (el) el.setAttribute("aria-hidden", "true");
}
document.addEventListener("click", (e) => {
  const modal = e.target.closest(".modal");
  // Se clicou no modal e o target é o próprio modal (clique fora do modal-card)
  if (modal && e.target === modal) {
    modal.setAttribute("aria-hidden", "true");
  }
});

// ---------- ACTIONS (Forms) ----------

// login
if (loginForm) {
  loginForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    try {
      const user = qs("#login-user")?.value.trim();
      const password = qs("#login-password")?.value.trim();
      if (!user || !password) return flash("Preencha todos os campos!", "error");
      const res = await api("/login", "POST", { user, password });
      if (res?.error) return flash(res.error, "error");
      setCurrentUser(res);
      flash("Login realizado!", "success");
      hideModal("modal-login");
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  });
}

// create account
if (createForm) {
  createForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    try {
      const user = qs("#create-user")?.value.trim();
      const password = qs("#create-password")?.value.trim();
      const avatar = qs("#create-avatar")?.value.trim() || "";
      if (!user || !password) return flash("Preencha os campos!", "error");
      const res = await api("/create-account", "POST", { user, password, avatar });
      if (res?.error) return flash(res.error, "error");
      setCurrentUser(res);
      flash("Conta criada com sucesso!", "success");
      hideModal("modal-create");
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  });
}

// create / edit post
if (postForm) {
  postForm.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    try {
      if (!currentUser) return flash("Você precisa estar logado!", "error");
      const title = qs("#post-title")?.value.trim() || "";
      const body = qs("#post-body")?.value.trim() || "";
      const category = qs("#post-category")?.value.trim() || "Geral";
      if (!title || !body) return flash("Título e conteúdo são obrigatórios!", "error");

      const payload = { title, body, category, author: currentUser.user };
      const method = editingPostId ? "PUT" : "POST";
      const path = editingPostId ? `/posts/${editingPostId}` : "/posts";

      const res = await api(path, method, payload);
      if (res?.error) return flash(res.error, "error");

      flash(editingPostId ? "Post atualizado!" : "Post criado!", "success");
      editingPostId = null;
      postForm.reset();
      hideModal("modal-post");
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  });

  postCancelBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    editingPostId = null;
    postForm.reset();
    hideModal("modal-post");
  });
}

// render posts from data
function renderPosts(list = []) {
  postsList.innerHTML = "";
  postsCount.textContent = `${list.length} posts`;

  if (!list.length) {
    postsList.innerHTML = `<p class="empty">Nenhum post encontrado.</p>`;
    return;
  }

  list.forEach((post) => {
    // clone template
    const tpl = templatePost?.content.cloneNode(true);
    if (!tpl) return;

    const titleEl = tpl.querySelector(".post-title");
    const avatarEl = tpl.querySelector(".post-avatar");
    const authorEl = tpl.querySelector(".post-author");
    const dateEl = tpl.querySelector(".post-date");
    const bodyEl = tpl.querySelector(".post-body");
    const likeCountEl = tpl.querySelector(".like-count");
    const likeBtn = tpl.querySelector(".like-btn"); // Elemento do botão
    const commentToggle = tpl.querySelector(".comment-toggle");
    const commentSend = tpl.querySelector(".comment-send");
    const commentField = tpl.querySelector(".comment-field");
    const commentsListEl = tpl.querySelector(".comments-list");
    const editBtn = tpl.querySelector(".edit-btn");
    const delBtn = tpl.querySelector(".delete-btn");
    const commentsArea = tpl.querySelector(".comments-area");

    titleEl && (titleEl.textContent = escapeHtml(post.title));
    avatarEl && (avatarEl.src = post.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author)}&background=999&color=fff&rounded=true`);
    authorEl && (authorEl.textContent = escapeHtml(post.author));
    dateEl && (dateEl.textContent = new Date(Number(post.id) || Date.now()).toLocaleString());
    bodyEl && (bodyEl.textContent = escapeHtml(post.body || post.content || ""));
    likeCountEl && (likeCountEl.textContent = post.likes || 0);

    // like button - ATENÇÃO: Verifique se post.id existe e se a API está respondendo a /like
    if (likeBtn) {
      likeBtn.onclick = () => likePost(post.id);
    }


    // comments toggle
    if (commentToggle && commentsArea) commentToggle.onclick = () => commentsArea.classList.toggle("hidden");

    // render comments
    if (commentsListEl) {
      commentsListEl.innerHTML = (post.comments || []).map(c => `<div class="comment-item"><b>${escapeHtml(c.author)}:</b> ${escapeHtml(c.text || c.comment || '')}</div>`).join("");
    }

    // send comment
    if (commentSend && commentField) commentSend.onclick = () => submitComment(post.id, commentField);

    // edit/delete only if author
    const canEdit = currentUser && currentUser.user === post.author;
    if (!canEdit) {
      editBtn?.remove();
      delBtn?.remove();
    } else {
      editBtn && (editBtn.onclick = () => openEditPost(post));
      delBtn && (delBtn.onclick = () => confirmDelete(post.id));
    }

    postsList.appendChild(tpl);
  });
}

// open edit
function openEditPost(post) {
  editingPostId = post.id;
  qs("#post-title").value = post.title || "";
  qs("#post-body").value = post.body || post.content || "";
  qs("#post-category").value = post.category || "Geral";
  if (postModalTitle) postModalTitle.textContent = "Editar Post";
  showModal("modal-post");
}

// confirm delete
function confirmDelete(id) {
  qs("#confirm-text").textContent = "Deseja realmente excluir este post?";
  showModal("modal-confirm");

  // Removendo listeners existentes para evitar múltiplos disparos
  confirmYes?.removeEventListener("click", confirmYes.currentListener, { once: true });
  confirmNo?.removeEventListener("click", confirmNo.currentListener, { once: true });

  const yes = async () => {
    try {
      await api(`/posts/${id}`, "DELETE");
      flash("Post excluído!", "success");
      hideModal("modal-confirm");
      await loadPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const no = () => hideModal("modal-confirm");

  // Adiciona e salva a referência do listener para poder remover
  confirmYes.currentListener = yes;
  confirmNo.currentListener = no;

  confirmYes?.addEventListener("click", yes, { once: true });
  confirmNo?.addEventListener("click", no, { once: true });
}

// like
async function likePost(id) {
  if (!currentUser) return flash("Faça login para curtir!", "error");

  // Log de Debug: Verifique o console do navegador
  console.log(`[LIKE] Tentando curtir post ID: ${id} pelo usuário: ${currentUser.user}`);

  try {
    // CHAVE: POST para /like
    const res = await api("/like", "POST", { postId: id, user: currentUser.user });
    if (res?.error) {
      console.error("[LIKE ERROR]", res.error);
      return flash(res.error, "error");
    }

    flash("Curtida registrada!", "success", 1500);
    await loadPosts(); // Recarrega os posts para atualizar a contagem
  } catch (err) {
    console.error(err);
    flash("Erro ao conectar com a API de like.", "error");
  }
}

// submit comment
async function submitComment(id, inputEl) {
  if (!currentUser) return flash("Faça login!", "error");
  const text = (inputEl?.value || "").trim();
  if (!text) return;
  try {
    const res = await api("/comments", "POST", { postId: id, text, author: currentUser.user });
    if (res?.error) return flash(res.error, "error");
    inputEl.value = "";
    await loadPosts();
  } catch (err) {
    console.error(err);
  }
}

// sidebars
function updateSidebars() {
  const cats = Array.from(new Set(posts.map(p => p.category || "Geral")));

  // Categorias
  if (categoriesBox) {
    categoriesBox.innerHTML = cats.map(c => `<button class="chip" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("");
    // Adiciona listener nos chips da lateral
    categoriesBox.querySelectorAll(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        filterCategory.value = chip.dataset.category;
        applyFilters();
      });
    });
  }

  if (filterCategory) {
    const currentFilter = filterCategory.value;
    filterCategory.innerHTML = `<option value="">Todas as categorias</option>` + cats.map(c => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
    // Mantém o filtro selecionado após a atualização
    filterCategory.value = currentFilter;
  }

  // top authors
  const ranking = posts.reduce((acc, p) => { acc[p.author] = (acc[p.author] || 0) + 1; return acc; }, {});
  if (topAuthorsBox) topAuthorsBox.innerHTML = Object.entries(ranking).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([a, c]) => `<li>${escapeHtml(a)} — <span class="muted">${c} posts</span></li>`).join("");

  // latest comments
  let allComments = [];
  posts.forEach(p => (p.comments || []).forEach(c => allComments.push({ post: p.title, ...c })));
  if (latestCommentsBox) {
    // Reverter a ordem de posts/comentários para pegar os mais recentes
    const latest = posts.slice().reverse().flatMap(p =>
      (p.comments || []).slice().reverse().map(c => ({ postTitle: p.title, ...c }))
    ).slice(0, 6);

    latestCommentsBox.innerHTML = latest.map(c =>
      `<div class="comment-item small"><b>${escapeHtml(c.author)}:</b> ${escapeHtml(c.text || c.comment || '')} <span class="muted">— ${escapeHtml(c.postTitle)}</span></div>`
    ).join("");
  }
}

// filters/search/sort
function applyFilters() {
  let list = [...posts];
  const s = (searchInput?.value || "").toLowerCase();
  const cat = filterCategory?.value || "";
  const sort = sortPosts?.value || "newest";

  if (cat) list = list.filter(p => (p.category || "").toLowerCase() === cat.toLowerCase());
  if (s) list = list.filter(p => [p.title, p.body || p.content, p.author].some(f => (f || "").toLowerCase().includes(s)));

  // Sorting logic
  if (sort === "newest") list.sort((a, b) => (b.id || 0) - (a.id || 0));
  if (sort === "oldest") list.sort((a, b) => (a.id || 0) - (b.id || 0));
  if (sort === "popular") list.sort((a, b) => (b.likes || 0) - (a.likes || 0));

  renderPosts(list);
}

// load posts
async function loadPosts() {
  try {
    const res = await api("/posts");
    posts = Array.isArray(res) ? res.map(p => ({
      ...p,
      id: Number(p.id) || Date.now(),
      category: p.category || "Geral",
      comments: p.comments || [],
      likes: p.likes || 0
    })) : [];

    // Garantir que todos os IDs sejam únicos para ordenação correta
    posts.forEach(p => {
      if (!p.id) p.id = Date.now() + Math.random();
    });

    applyFilters();
    updateSidebars();
  } catch (err) {
    console.error(err);
  }
}

// buttons / nav wiring
btnOpenLogin?.addEventListener("click", () => showModal("modal-login"));
quickLogin?.addEventListener("click", () => showModal("modal-login"));
quickCreate?.addEventListener("click", () => showModal("modal-create"));
openCreateFromLogin?.addEventListener("click", (e) => {
  e.preventDefault(); // Evita o submit do form de login
  hideModal("modal-login");
  showModal("modal-create");
});

navNewPost?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!currentUser) return flash("Faça login primeiro!", "error");
  editingPostId = null;
  if (postModalTitle) postModalTitle.textContent = "Novo Post";
  postForm.reset();
  showModal("modal-post");
});
heroCreate?.addEventListener("click", () => {
  if (!currentUser) return flash("Faça login!", "error");
  editingPostId = null;
  if (postModalTitle) postModalTitle.textContent = "Novo Post";
  postForm.reset();
  showModal("modal-post");
});
heroSee?.addEventListener("click", () => {
  document.getElementById("posts-section")?.scrollIntoView({ behavior: "smooth" });
});

btnLogout?.addEventListener("click", () => { setCurrentUser(null); flash("Você saiu!", "info"); });

// search button fix
searchBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  applyFilters();
});
searchInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") applyFilters(); });

// close modal buttons
qsa(".close").forEach(b => b.addEventListener("click", (ev) => {
  const id = ev.currentTarget.dataset.modal;
  if (id) hideModal(id);
}));

// theme toggle (simple)
toggleThemeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("blog_theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// initialize theme from localStorage
if (localStorage.getItem("blog_theme") === "dark") document.body.classList.add("dark-mode");

// search/filter listeners
filterCategory?.addEventListener("change", applyFilters);
sortPosts?.addEventListener("change", applyFilters);

// init
updateUserUI();
loadPosts();
flash("BlogPro carregado!", "success");