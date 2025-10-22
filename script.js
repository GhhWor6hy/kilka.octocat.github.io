(() => {
  // --- Data
  const PRODUCTS = [
    { id: 'p1', title: 'Футболка NOIR Basic', price: 29, desc: 'Стандартная футболка из хлопка. Мягкая и удобная.', sizes: ['S','M','L','XL'] },
    { id: 'p2', title: 'Худи NOIR Heavy', price: 69, desc: 'Тёплое худи с плотным ворсом, лимитированная партия.', sizes: ['M','L','XL'] },
    { id: 'p3', title: 'Штаны NOIR Track', price: 49, desc: 'Удобные штаны для повседневной носки.', sizes: ['S','M','L','XL'] },
    { id: 'p4', title: 'Кепка NOIR Cap', price: 19, desc: 'Кепка с вышитым логотипом.', sizes: ['One Size'] },
  ];

  // --- localStorage keys
  const LS_USERS = 'noir_users_v2';
  const LS_USER = 'noir_user_v2';
  const LS_ORDERS = 'noir_orders_v2';
  const LS_THEME = 'noir_theme_v2';
  const LS_CART = 'noir_cart_v2';

  // --- helpers
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const getUsers = () => JSON.parse(localStorage.getItem(LS_USERS) || '[]');
  const saveUsers = u => localStorage.setItem(LS_USERS, JSON.stringify(u));
  const getCurrentUser = () => JSON.parse(localStorage.getItem(LS_USER) || 'null');
  const setCurrentUser = u => localStorage.setItem(LS_USER, JSON.stringify(u));
  const logoutUser = () => localStorage.removeItem(LS_USER);
  const getOrders = () => JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  const saveOrders = o => localStorage.setItem(LS_ORDERS, JSON.stringify(o));
  const getCart = () => JSON.parse(localStorage.getItem(LS_CART) || '[]');
  const saveCart = c => localStorage.setItem(LS_CART, JSON.stringify(c));

  // --- theme
  function applyTheme(theme){
    if(theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem(LS_THEME, theme);
    qsa('#theme-toggle').forEach(b => b.textContent = theme === 'light' ? '☀️' : '🌙');
  }
  applyTheme(localStorage.getItem(LS_THEME) || 'dark');
  qsa('#theme-toggle').forEach(btn => btn.addEventListener('click', () => {
    const cur = localStorage.getItem(LS_THEME) || 'dark';
    applyTheme(cur === 'light' ? 'dark' : 'light');
  }));

  // --- Render catalog
  const catalogEl = qs('#catalog');
  function renderCatalog() {
    if(!catalogEl) return;
    catalogEl.innerHTML = '';
    PRODUCTS.forEach(p => {
      const el = document.createElement('div');
      el.className = 'product card';
      el.innerHTML = `
        <div class="product-thumb">${p.title}</div>
        <h4>${p.title}</h4>
        <div class="muted small">${p.desc}</div>
        <div style="display:flex;justify-content:space-between;align-items:center; margin-top:8px">
          <div class="price">${p.price} $</div>
          <div class="actions">
            <button class="btn small view-btn" data-id="${p.id}">Подробнее</button>
          </div>
        </div>
      `;
      catalogEl.appendChild(el);
    });
  }

  // --- Modal handling
  const modal = qs('#product-modal');
  const modalClose = qs('#modal-close');
  const modalTitle = qs('#modal-title');
  const modalDesc = qs('#modal-desc');
  const modalPrice = qs('#modal-price');
  const modalImage = qs('#modal-image');
  const modalSize = qs('#modal-size');
  const modalQty = qs('#modal-qty');
  const sizeChart = qs('#size-chart');
  const sizeChartToggle = qs('#size-chart-toggle');

  let currentProduct = null;

  function openProductModal(productId){
    const p = PRODUCTS.find(x => x.id === productId);
    if(!p) return;
    currentProduct = p;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalPrice.textContent = p.price + ' $';
    modalImage.textContent = p.title;
    modalSize.innerHTML = '';
    p.sizes.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s; opt.textContent = s;
      modalSize.appendChild(opt);
    });
    modalQty.value = 1;
    sizeChart.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  }

  function closeProductModal(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    currentProduct = null;
  }

  modalClose && modalClose.addEventListener('click', closeProductModal);
  sizeChartToggle && sizeChartToggle.addEventListener('click', (e)=>{
    e.preventDefault();
    sizeChart.classList.toggle('hidden');
  });

  // Buy/Add actions
  qs('body').addEventListener('click', (e)=>{
    const view = e.target.closest('.view-btn');
    if(view){
      const id = view.dataset.id;
      openProductModal(id);
    }
  });

  // Add to cart
  const addToCartBtn = qs('#add-to-cart');
  if(addToCartBtn) addToCartBtn.addEventListener('click', ()=>{
    if(!currentProduct) return;
    const size = modalSize.value;
    const qty = parseInt(modalQty.value,10) || 1;
    const cart = getCart();
    cart.push({ id: currentProduct.id, title: currentProduct.title, size, qty, price: currentProduct.price });
    saveCart(cart);
    alert('Добавлено в корзину');
  });

  // Buy now -> open checkout modal
  const buyNowBtn = qs('#buy-now');
  const checkoutModal = qs('#checkout-modal');
  const checkoutClose = qs('#checkout-close');
  if(buyNowBtn) buyNowBtn.addEventListener('click', ()=>{
    if(!currentProduct) return;
    qs('#checkout-product-id').value = currentProduct.id;
    qs('#checkout-product-title').value = currentProduct.title;
    qs('#checkout-product-size').value = modalSize.value;
    qs('#checkout-product-qty').value = modalQty.value;
    // prefill user if logged
    const user = getCurrentUser();
    if(user){
      qs('#checkout-name').value = user.name || '';
      qs('#checkout-email').value = user.email || '';
    } else {
      qs('#checkout-name').value = '';
      qs('#checkout-email').value = '';
    }
    checkoutModal.classList.remove('hidden');
    checkoutModal.setAttribute('aria-hidden','false');
  });
  checkoutClose && checkoutClose.addEventListener('click', ()=>{
    checkoutModal.classList.add('hidden');
    checkoutModal.setAttribute('aria-hidden','true');
  });

  // Checkout submit
  const checkoutForm = qs('#checkout-form');
  checkoutForm && checkoutForm.addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const pid = qs('#checkout-product-id').value;
    const title = qs('#checkout-product-title').value;
    const size = qs('#checkout-product-size').value;
    const qty = parseInt(qs('#checkout-product-qty').value,10) || 1;
    const name = qs('#checkout-name').value.trim();
    const email = qs('#checkout-email').value.trim();
    const address = qs('#checkout-address').value.trim();
    const card = qs('#checkout-card').value.trim();
    if(card.length < 12){ qs('#checkout-msg').textContent = 'Неверные данные карты'; return; }
    // create order
    const id = 'NOIR-' + Date.now().toString(36).toUpperCase().slice(-8);
    const orders = getOrders();
    orders.unshift({
      id, productId: pid, title, size, qty, name, email, address, status: 'В обработке',
      price: PRODUCTS.find(p => p.id === pid).price, createdAt: new Date().toLocaleString()
    });
    saveOrders(orders);
    // set current user if not
    if(!getCurrentUser()) setCurrentUser({ name, email });
    qs('#checkout-msg').innerHTML = 'Оплата успешна ✅<br>Номер заказа: <b>' + id + '</b>';
    // close modals after short delay
    setTimeout(()=>{
      checkoutModal.classList.add('hidden');
      checkoutModal.setAttribute('aria-hidden','true');
      closeProductModal();
    }, 900);
  });

  // Cancel checkout
  qs('#checkout-cancel') && qs('#checkout-cancel').addEventListener('click', ()=>{
    qs('#checkout-msg').textContent = '';
    checkoutModal.classList.add('hidden');
    checkoutModal.setAttribute('aria-hidden','true');
  });

  // --- Auth flows (register/login/profile) ---
  // register page
  const registerForm = qs('#register-form');
  if(registerForm){
    registerForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const fd = new FormData(registerForm);
      const name = fd.get('name').trim();
      const email = fd.get('email').trim();
      const password = fd.get('password').trim();
      const users = getUsers();
      if(users.some(u => u.email === email)){
        qs('#register-msg').textContent = 'E-mail уже зарегистрирован';
        return;
      }
      users.push({ name, email, password });
      saveUsers(users);
      qs('#register-msg').textContent = 'Регистрация успешна ✅ Перейдите на вход';
      setTimeout(()=> window.location.href = 'login.html', 900);
    });
  }

  // login page
  const loginForm = qs('#login-form');
  if(loginForm){
    loginForm.addEventListener('submit', (ev)=>{
      ev.preventDefault();
      const fd = new FormData(loginForm);
      const email = fd.get('email').trim();
      const password = fd.get('password').trim();
      const user = getUsers().find(u => u.email === email && u.password === password);
      if(!user){ qs('#login-msg').textContent = 'Неверный e-mail или пароль'; return; }
      setCurrentUser({ name: user.name, email: user.email });
      window.location.href = 'profile.html';
    });
  }

  // profile page
  const profileSection = qs('#profile-section');
  if(profileSection){
    const user = getCurrentUser();
    if(!user){ window.location.href = 'login.html'; return; }
    qs('#user-name').textContent = user.name;
    // render orders
    const orders = getOrders().filter(o => o.email === user.email);
    const list = qs('#orders-list');
    list.innerHTML = '';
    if(orders.length === 0){
      list.innerHTML = '<div class="muted">У вас пока нет заказов.</div>';
    } else {
      orders.forEach(o => {
        const el = document.createElement('div');
        el.className = 'order-card';
        el.innerHTML = `
          <div class="meta">
            <strong>${o.title}</strong>
            <div class="muted">Заказ: ${o.id} • ${o.createdAt}</div>
            <div class="muted">Размер: ${o.size} • Кол-во: ${o.qty}</div>
          </div>
          <div class="status">
            <div class="muted">${o.status}</div>
            <div class="price">${o.price} $</div>
          </div>
        `;
        list.appendChild(el);
      });
    }

    // logout
    qs('#logout-btn').addEventListener('click', ()=>{
      logoutUser();
      window.location.href = 'index.html';
    });
  }

  // --- Main init ---
  function init(){
    renderCatalog();

    // show/hide auth on main
    const user = getCurrentUser();
    const authButtons = qs('#auth-buttons');
    const profileLink = qs('#profile-link');
    if(authButtons){
      if(user){ authButtons.style.display = 'none'; profileLink.style.display = 'inline-block'; }
      else { authButtons.style.display = 'flex'; profileLink.style.display = 'none'; }
      qs('#btn-register') && qs('#btn-register').addEventListener('click', ()=> window.location.href = 'register.html');
      qs('#btn-login') && qs('#btn-login').addEventListener('click', ()=> window.location.href = 'login.html');
    }

    // Close modal on ESC
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape'){ closeProductModal(); checkoutModal.classList.add('hidden'); }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

})();