document.addEventListener('DOMContentLoaded', () => {
  const PRODUCTS = [
    { id: 1, title: 'Футболка Noir Basic', price: 99 },
    { id: 2, title: 'Худи Noir Classic', price: 199 },
    { id: 3, title: 'Кепка Noir Street', price: 79 },
  ];

  const getCurrentUser = () => JSON.parse(localStorage.getItem('user'));
  const saveUser = (user) => localStorage.setItem('user', JSON.stringify(user));
  const logoutUser = () => localStorage.removeItem('user');
  const getOrders = () => JSON.parse(localStorage.getItem('orders') || '[]');
  const saveOrders = (orders) => localStorage.setItem('orders', JSON.stringify(orders));

  const path = window.location.pathname.split('/').pop();

  // Главная страница
  if (path === 'index.html' || path === '') {
    const user = getCurrentUser();
    const profileLink = document.getElementById('profile-link');
    const authButtons = document.getElementById('auth-buttons');
    const productsEl = document.getElementById('products');

    if (user) {
      authButtons.style.display = 'none';
      profileLink.style.display = 'inline';
    } else {
      profileLink.style.display = 'none';
      authButtons.style.display = 'block';
    }

    PRODUCTS.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';
      div.innerHTML = `<h3>${p.title}</h3><p>${p.price} zł</p>`;
      productsEl.appendChild(div);
    });

    document.getElementById('btn-register').addEventListener('click', () => {
      window.location.href = 'register.html';
    });
    document.getElementById('btn-login').addEventListener('click', () => {
      window.location.href = 'login.html';
    });
  }

  // Регистрация
  if (path === 'register.html') {
    document.getElementById('register-form').addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-pass').value;
      const user = { name, email, pass };
      saveUser(user);
      window.location.href = 'profile.html';
    });
  }

  // Вход
  if (path === 'login.html') {
    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;
      const user = getCurrentUser();
      if (user && user.email === email && user.pass === pass) {
        window.location.href = 'profile.html';
      } else {
        alert('Неверный email или пароль');
      }
    });
  }

  // Личный кабинет
  if (path === 'profile.html') {
    const user = getCurrentUser();
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    document.getElementById('user-name').textContent = user.name;
    const ordersList = document.getElementById('orders-list');
    const orders = getOrders();
    if (orders.length === 0) {
      ordersList.innerHTML = '<p>У вас пока нет заказов.</p>';
    } else {
      orders.forEach(o => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `<h4>${o.title}</h4><p>${o.price} zł</p>`;
        ordersList.appendChild(div);
      });
    }
    document.getElementById('logout-btn').addEventListener('click', () => {
      logoutUser();
      window.location.href = 'index.html';
    });
  }
});
