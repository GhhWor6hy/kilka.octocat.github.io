(() => {
  // Data
  const PRODUCTS = [
    { id: 'p1', title: 'Футболка NOIR Basic', price: 29, desc: 'Классическая футболка из хлопка. Мягкая и удобная.', sizes: ['S','M','L','XL'] },
    { id: 'p2', title: 'Худи NOIR Heavy', price: 69, desc: 'Тёплое худи с плотным ворсом, лимитированная партия.', sizes: ['M','L','XL'] },
    { id: 'p3', title: 'Штаны NOIR Track', price: 49, desc: 'Удобные штаны для повседневной носки.', sizes: ['S','M','L','XL'] },
    { id: 'p4', title: 'Кепка NOIR Cap', price: 19, desc: 'Кепка с вышитым логотипом.', sizes: ['One Size'] },
  ];

  // Keys & helpers
  const LS_CART = 'noir_cart_v7';
  const LS_USER = 'noir_user_v7';
  const LS_ORDERS = 'noir_orders_v7';
  const RATES = { USD:1, EUR:0.92, PLN:4.2, GBP:0.79, RUB:95 };
  const SHIPPING_METHODS = {
    'Poland': [ { id:'inpost', name:'InPost', cost:3 }, { id:'dpd', name:'DPD', cost:5 }, { id:'dhl', name:'DHL Express', cost:8 } ],
    'Germany': [ { id:'dpd', name:'DPD', cost:7 }, { id:'dhl', name:'DHL', cost:9 } ],
    'default': [ { id:'intl', name:'International Post', cost:15 }, { id:'express', name:'Express Intl', cost:25 } ]
  };

  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const getCart = () => JSON.parse(localStorage.getItem(LS_CART) || '[]');
  const saveCart = c => localStorage.setItem(LS_CART, JSON.stringify(c));
  const getOrders = () => JSON.parse(localStorage.getItem(LS_ORDERS) || '[]');
  const saveOrders = o => localStorage.setItem(LS_ORDERS, JSON.stringify(o));
  const getCurrentUser = () => JSON.parse(localStorage.getItem(LS_USER) || 'null');
  const setCurrentUser = u => localStorage.setItem(LS_USER, JSON.stringify(u));
  const logoutUser = () => localStorage.removeItem(LS_USER);

  // Theme small
  qsa('#theme-toggle').forEach(b=>b.addEventListener('click', ()=>{ document.documentElement.classList.toggle('light'); b.textContent = document.documentElement.classList.contains('light') ? '☀️' : '🌙'; }));

  // Render catalog stable grid
  function renderCatalog(){
    const el = qs('#catalog'); if(!el) return;
    el.innerHTML = '';
    PRODUCTS.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'product card';
      // reserve image area to avoid shift; buttons inside card will stop propagation
      card.innerHTML = `
        <div class="product-thumb" aria-hidden="true">${p.title}</div>
        <div class="product-info">
          <h4>${p.title}</h4>
          <div class="muted small">${p.desc}</div>
          <div class="card-foot">
            <div class="price">${p.price} $</div>
            <div class="actions">
              <button class="btn small buy-now" data-id="${p.id}">Купить</button>
              <button class="btn small add-cart" data-id="${p.id}">Добавить</button>
            </div>
          </div>
        </div>
      `;
      // clicking on card opens modal (but not when clicking buttons)
      card.addEventListener('click', (e)=>{
        if(e.target.closest('button')) return; // ignore if clicked a button inside
        openProductModal(p.id);
      });
      // buttons handlers (stopPropagation so click doesn't open modal)
      card.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          const id = btn.dataset.id;
          if(btn.classList.contains('add-cart')) addToCartById(id);
          if(btn.classList.contains('buy-now')) { addToCartById(id); qs('#checkout-btn').click(); }
        });
      });
      el.appendChild(card);
    });
  }

  // Product modal controls
  const productModal = qs('#product-modal');
  const productClose = qs('#product-close');
  const modalTitle = qs('#modal-title');
  const modalDesc = qs('#modal-desc');
  const modalPrice = qs('#modal-price');
  const modalImage = qs('#modal-image');
  const modalSize = qs('#modal-size');
  const modalQty = qs('#modal-qty');
  const modalSizeChart = qs('#modal-size-chart');
  const modalSizeChartToggle = qs('#modal-size-chart-toggle');
  const modalAdd = qs('#modal-add');
  const modalBuy = qs('#modal-buy');
  let currentModalProduct = null;

  function openProductModal(id){
    const p = PRODUCTS.find(x=>x.id===id);
    if(!p) return;
    currentModalProduct = p;
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.desc;
    modalPrice.textContent = p.price + ' $';
    modalImage.textContent = p.title;
    modalSize.innerHTML = '';
    p.sizes.forEach(s => { const o = document.createElement('option'); o.value=s; o.textContent=s; modalSize.appendChild(o); });
    modalQty.value = 1;
    modalSizeChart.classList.add('hidden');
    productModal.classList.remove('hidden');
    productModal.setAttribute('aria-hidden','false');
    // focus for keyboard
    modalAdd.focus();
  }
  function closeProductModal(){ productModal.classList.add('hidden'); productModal.setAttribute('aria-hidden','true'); currentModalProduct = null; }
  productClose && productClose.addEventListener('click', closeProductModal);
  modalSizeChartToggle && modalSizeChartToggle.addEventListener('click', (e)=>{ e.preventDefault(); modalSizeChart.classList.toggle('hidden'); });

  // Cart overlay controls (slide in)
  const cartOverlay = qs('#cart-overlay');
  const cartClose = qs('#cart-close');
  const cartItemsEl = qs('#cart-items');
  const cartSubtotal = qs('#cart-subtotal');
  const cartShipping = qs('#cart-shipping');
  const cartTotal = qs('#cart-total');
  const cartCountEls = qsa('.cart-count');
  const currencyEls = qsa('#currency-symbol, #currency-symbol-2, #currency-symbol-3');

  function updateCartUI(shippingUSD=0, cur='USD'){
    const cart = getCart();
    if(cartItemsEl) cartItemsEl.innerHTML='';
    cart.forEach((it, idx)=>{
      const div = document.createElement('div'); div.className='cart-item';
      div.innerHTML = `<div><strong>${it.title}</strong><div class="muted">Размер: ${it.size} • ${it.qty}шт</div></div><div><div>${(it.price*it.qty).toFixed(2)} $</div><button class="btn small remove-item" data-idx="${idx}">✕</button></div>`;
      cartItemsEl && cartItemsEl.appendChild(div);
    });
    const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
    cartSubtotal && (cartSubtotal.textContent = subtotal.toFixed(2));
    cartShipping && (cartShipping.textContent = shippingUSD.toFixed(2));
    cartTotal && (cartTotal.textContent = (subtotal + shippingUSD).toFixed(2));
    cartCountEls.forEach(e=>e.textContent = cart.length);
    currencyEls.forEach(e => e.textContent = '$');
    saveCart(cart);
  }

  qsa('#cart-open').forEach(b=>b.addEventListener('click', ()=>{ updateCartUI(); cartOverlay.classList.remove('hidden'); }));
  cartClose && cartClose.addEventListener('click', ()=> cartOverlay.classList.add('hidden'));

  // add to cart helpers
  function addToCartById(id, size='M', qty=1){
    const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
    const cart = getCart();
    cart.push({ id:p.id, title:p.title, price:p.price, size, qty });
    saveCart(cart); updateCartUI();
  }
  modalAdd && modalAdd.addEventListener('click', ()=>{ if(!currentModalProduct) return; addToCartById(currentModalProduct.id, modalSize.value, parseInt(modalQty.value,10)||1); closeProductModal(); });
  modalBuy && modalBuy.addEventListener('click', ()=>{ if(!currentModalProduct) return; addToCartById(currentModalProduct.id, modalSize.value, parseInt(modalQty.value,10)||1); closeProductModal(); qs('#checkout-btn').click(); });

  // remove item from cart
  document.body.addEventListener('click', (e)=>{
    const rem = e.target.closest('.remove-item');
    if(rem){ const idx = Number(rem.dataset.idx); const c = getCart(); c.splice(idx,1); saveCart(c); updateCartUI(); }
  });

  // Checkout (simple: open checkout modal from cart)
  qs('#checkout-btn') && qs('#checkout-btn').addEventListener('click', ()=>{ if(getCart().length===0){ alert('Корзина пуста'); return; } qs('#checkout-modal').classList.remove('hidden'); });

  // Checkout form handling (basic, similar to v6)
  qs('#checkout-form') && qs('#checkout-form').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const name = qs('#co-name').value.trim();
    const email = qs('#co-email').value.trim();
    const address = qs('#co-address').value.trim();
    const card = qs('#co-card').value.trim();
    if(card.length < 12){ qs('#checkout-msg').textContent = 'Неверные данные карты'; return; }
    const cart = getCart(); if(cart.length===0){ qs('#checkout-msg').textContent = 'Корзина пуста'; return; }
    const orderId = 'NOIR-' + Date.now().toString(36).toUpperCase().slice(-8);
    const orders = getOrders(); const subtotalUSD = cart.reduce((s,i)=>s + i.price*i.qty,0);
    orders.unshift({ id: orderId, name, email, address, items: cart, subtotalUSD, status: 'В обработке', createdAt: new Date().toLocaleString() });
    saveOrders(orders);
    localStorage.removeItem(LS_CART); updateCartUI();
    qs('#checkout-msg').innerHTML = 'Оплата успешна ✅<br>Номер заказа: <b>' + orderId + '</b>';
    setTimeout(()=>{ qs('#checkout-modal').classList.add('hidden'); qs('#cart-overlay').classList.add('hidden'); }, 900);
  });

  // Product page support (direct link)
  function initProductPage(){
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id'); if(!id) return;
    openProductModal(id);
  }

  // init index
  if(qs('#catalog')){ renderCatalog(); }

  // open product modal on load if on product.html with id
  if(window.location.pathname.includes('product.html')) initProductPage();

  // close modal on ESC
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ productModal.classList.add('hidden'); cartOverlay.classList.add('hidden'); qs('#checkout-modal') && qs('#checkout-modal').classList.add('hidden'); } });

  // initial cart state
  updateCartUI();

})();