// frontend/app.js (refatorado, integrado com o novo design)
// Compatível com o backend em http://localhost:3000
// Endpoints usados:
//  GET  /posts
//  POST /posts            { title, content, author }
//  POST /comments         { postId, comment, author }
//  POST /create-account   { user, password }
//  POST /login            { user, password }

const API = 'http://localhost:3000';

// ====== DOM ======
const btnLogin = document.getElementById('btn-login');
const btnLogout = document.getElementById('logout-btn');
const userIcon = document.getElementById('user-icon');

const loginModal = document.getElementById('login-modal');
const accountModal = document.getElementById('account-modal');
const postModal = document.getElementById('post-modal');

const loginForm = document.getElementById('login-form');
const createAccountForm = document.getElementById('create-account-form');
const postForm = document.getElementById('post-form');

const openCreateAccount = document.getElementById('open-create-account');
const btnOpenCreatePost = document.getElementById('btn-open-create-post');
const scrollPostsBtn = document.getElementById('scroll-posts');

const postList = document.getElementById('post-list');

// Inputs
const loginUser = document.getElementById('login-user');
const loginPassword = document.getElementById('login-password');
const newUser = document.getElementById('new-user');
const newPassword = document.getElementById('new-password');
const postTitle = document.getElementById('post-title');
const postContent = document.getElementById('post-content');

// ====== State ======
let currentUser = JSON.parse(localStorage.getItem('blog_user') || 'null');

// ====== Utils ======
function qs(sel, parent = document) { return parent.querySelector(sel); }
function qsa(sel, parent = document) { return Array.from(parent.querySelectorAll(sel)); }

function escapeHtml(text){
  if(text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

function showModal(modalEl){
  modalEl.style.display = 'flex';
  // focus first input if exists
  const firstInput = modalEl.querySelector('input, textarea, button');
  if(firstInput) firstInput.focus();
}
function closeModal(modalEl){
  modalEl.style.display = 'none';
}
function closeAllModals(){
  [loginModal, accountModal, postModal].forEach(m => closeModal(m));
}

// simple inline message (temporary)
function flash(msg, type = 'info', timeout = 2200){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position = 'fixed';
  el.style.right = '18px';
  el.style.bottom = '18px';
  el.style.padding = '10px 14px';
  el.style.borderRadius = '10px';
  el.style.zIndex = 9999;
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
  if(type === 'error'){ el.style.background = '#ffeded'; el.style.color = '#b22'; }
  else if(type === 'success'){ el.style.background = '#e6ffef'; el.style.color = '#117a3a'; }
  else { el.style.background = '#fff'; el.style.color = '#222'; }
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), timeout);
}

// ====== UI updates ======
function updateUserUI(){
  if(currentUser && currentUser.user){
    btnLogin.classList.add('hidden');
    btnLogout.classList.remove('hidden');
    userIcon.title = currentUser.user;
    userIcon.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.user)}&background=4B7BF5&color=fff&rounded=true`;
  } else {
    btnLogin.classList.remove('hidden');
    btnLogout.classList.add('hidden');
    userIcon.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    userIcon.title = 'Convidado';
  }
}

function setCurrentUser(userObj){
  currentUser = userObj;
  if(userObj) localStorage.setItem('blog_user', JSON.stringify(userObj));
  else localStorage.removeItem('blog_user');
  updateUserUI();
}

// ====== Modal open/close handlers ======
btnLogin.addEventListener('click', () => showModal(loginModal));
openCreateAccount.addEventListener('click', () => { closeModal(loginModal); showModal(accountModal); });
qsa('.close-modal').forEach(btn => btn.addEventListener('click', (e) => {
  const id = e.target.dataset.modal;
  if(id){
    const el = document.getElementById(id);
    if(el) closeModal(el);
  } else {
    // fallback: close parent modal
    let parent = e.target.closest('.modal');
    if(parent) closeModal(parent);
  }
}));

// click outside modal content closes it
[loginModal, accountModal, postModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal(modal);
  });
});

// open post modal
btnOpenCreatePost.addEventListener('click', () => {
  if(!currentUser){ showModal(loginModal); flash('Faça login para criar um post', 'info'); return; }
  showModal(postModal);
});

// scroll to posts
if(scrollPostsBtn) scrollPostsBtn.addEventListener('click', () => {
  const el = document.getElementById('posts-section') || postList;
  if(el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// logout
btnLogout.addEventListener('click', () => {
  setCurrentUser(null);
  flash('Desconectado', 'success');
});

// ====== API helpers ======
async function apiGet(path){
  const res = await fetch(`${API}${path}`);
  const json = await res.json();
  return json;
}
async function apiPost(path, body){
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  const json = await res.json();
  return json;
}

// ====== Forms handling ======
// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = loginUser.value.trim();
  const password = loginPassword.value.trim();
  if(!user || !password){ flash('Preencha usuário e senha', 'error'); return; }

  try{
    const res = await apiPost('/login', { user, password });
    if(res && res.error){ flash(res.error, 'error'); return; }
    if(res && res.success){
      setCurrentUser({ user });
      closeModal(loginModal);
      loginForm.reset();
      flash('Login realizado com sucesso', 'success');
      loadPosts(); // optional refresh
    } else {
      flash('Resposta inesperada do servidor', 'error');
    }
  } catch(err){
    console.error(err);
    flash('Erro ao conectar com o servidor', 'error');
  }
});

// Create account
createAccountForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = newUser.value.trim();
  const password = newPassword.value.trim();
  if(!user || !password){ flash('Preencha os campos', 'error'); return; }

  try{
    const res = await apiPost('/create-account', { user, password });
    if(res && res.error){ flash(res.error, 'error'); return; }
    if(res && res.success){
      setCurrentUser({ user });
      closeModal(accountModal);
      createAccountForm.reset();
      flash('Conta criada e logado!', 'success');
      loadPosts();
    } else {
      flash('Resposta inesperada do servidor', 'error');
    }
  } catch(err){
    console.error(err);
    flash('Erro ao conectar com o servidor', 'error');
  }
});

// Create post
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!currentUser){ flash('Faça login para publicar', 'error'); return; }
  const title = postTitle.value.trim();
  const content = postContent.value.trim();
  if(!title || !content){ flash('Título e conteúdo são obrigatórios', 'error'); return; }

  try{
    const res = await apiPost('/posts', { title, content, author: currentUser.user });
    if(res && res.error){ flash(res.error, 'error'); return; }
    if(res && res.success){
      postForm.reset();
      closeModal(postModal);
      flash('Post publicado!', 'success');
      loadPosts();
    } else if(res && res.post){
      // older server variant returned post directly
      postForm.reset();
      closeModal(postModal);
      flash('Post publicado!', 'success');
      loadPosts();
    } else {
      flash('Resposta inesperada do servidor', 'error');
    }
  } catch(err){
    console.error(err);
    flash('Erro ao conectar com o servidor', 'error');
  }
});

// ====== Comments ======
async function submitComment(postId, inputEl){
  if(!currentUser){ showModal(loginModal); flash('Faça login para comentar', 'info'); return; }
  const commentText = inputEl.value.trim();
  if(!commentText) return;
  try{
    const res = await apiPost('/comments', { postId, comment: commentText, author: currentUser.user });
    if(res && res.error){ flash(res.error, 'error'); return; }
    if(res && res.success){
      inputEl.value = '';
      loadPosts();
      flash('Comentário enviado', 'success');
    } else {
      // some server variants return success in other shapes
      inputEl.value = '';
      loadPosts();
      flash('Comentário enviado', 'success');
    }
  } catch(err){
    console.error(err);
    flash('Erro ao enviar comentário', 'error');
  }
}

// ====== Rendering posts ======
function renderPosts(posts){
  postList.innerHTML = '';
  if(!Array.isArray(posts) || posts.length === 0){
    postList.innerHTML = `<p style="text-align:center;color:#666">Sem postagens ainda — seja o primeiro a publicar!</p>`;
    return;
  }

  posts.slice().reverse().forEach(post => {
    // structure: post.id, post.title, post.content, post.author, post.comments (array)
    const card = document.createElement('article');
    card.className = 'post-card';

    const title = document.createElement('h3');
    title.innerHTML = escapeHtml(post.title);
    card.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'author';
    const dateText = post.createdAt || post.createdAtISO || post.createdAt || '';
    meta.innerHTML = `por <strong>${escapeHtml(post.author || post.author || 'Anon')}</strong> ${dateText ? ' • ' + escapeHtml(dateText) : ''}`;
    card.appendChild(meta);

    const content = document.createElement('p');
    content.innerHTML = escapeHtml(post.content || post.conteudo || '');
    card.appendChild(content);

    // comments
    const commentBox = document.createElement('div');
    commentBox.className = 'comment-box';

    const commentsArr = post.comments || post.comments || [];
    if(Array.isArray(commentsArr) && commentsArr.length){
      commentsArr.forEach(c => {
        const item = document.createElement('div');
        item.className = 'comment-item';
        item.innerHTML = `<strong>${escapeHtml(c.author || c.usuario || 'Anon')}:</strong> ${escapeHtml(c.comment || c.conteudo || '')}`;
        commentBox.appendChild(item);
      });
    } else {
      // no comments placeholder (optional)
      // commentBox.innerHTML += `<div style="color:#888;font-size:14px">Seja o primeiro a comentar</div>`;
    }

    // comment input
    const commentInputWrap = document.createElement('div');
    commentInputWrap.className = 'comment-input';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Escreva um comentário...';
    input.addEventListener('keydown', (e) => {
      if(e.key === 'Enter'){ submitComment(post.id, input); }
    });

    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = 'Comentar';
    btn.addEventListener('click', () => submitComment(post.id, input));

    commentInputWrap.appendChild(input);
    commentInputWrap.appendChild(btn);

    card.appendChild(commentBox);
    card.appendChild(commentInputWrap);

    postList.appendChild(card);
  });
}

// ====== Load posts from server ======
let loadingPosts = false;
async function loadPosts(){
  if(loadingPosts) return;
  loadingPosts = true;
  try{
    const res = await apiGet('/posts');
    // backend returns array or object: handle both
    let posts = [];
    if(Array.isArray(res)) posts = res;
    else if(res && Array.isArray(res.posts)) posts = res.posts;
    else if(res && res.post) posts = [res.post]; // unlikely
    else posts = [];

    // normalize posts: ensure id, title, content, author, comments
    posts = posts.map(p => ({
      id: p.id ?? p.postId ?? p._id ?? (p.title ? (p.title + Math.random()).slice(0,12) : Date.now()),
      title: p.title ?? p.titulo ?? '',
      content: p.content ?? p.conteudo ?? '',
      author: p.author ?? p.autor ?? p.author ?? p.usuario ?? 'Anon',
      comments: Array.isArray(p.comments) ? p.comments.map(c => ({
        author: c.author ?? c.usuario ?? c.author ?? 'Anon',
        comment: c.comment ?? c.conteudo ?? c.comment ?? ''
      })) : []
    }));

    renderPosts(posts);
  } catch(err){
    console.error(err);
    postList.innerHTML = `<p style="color:#b22;text-align:center">Erro ao carregar posts.</p>`;
  } finally {
    loadingPosts = false;
  }
}

// ====== Init ======
(function init(){
  updateUserUI();
  loadPosts();
})();
