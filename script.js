/* JS из предыдущего примера */
const catalogEl = document.getElementById('catalog');
const cartBtn = document.getElementById('cart-button');
const cartCountEl = document.getElementById('cart-count');
const modalBack = document.getElementById('modal-back');
const modalContent = document.getElementById('modal-content');
const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');

let cart = [];

const catalog = [
  {id:1,name:"Черная куртка",price:12000},
  {id:2,name:"Белая рубашка",price:4500},
  {id:3,name:"Джинсы скинни",price:7800},
];

function renderCatalog(){
  catalogEl.innerHTML="";
  catalog.forEach(item=>{
    const card=document.createElement('div'); card.className='card';
    const img=document.createElement('div'); img.className='imgplace'; img.textContent=item.name;
    const title=document.createElement('div'); title.className='title'; title.textContent=item.name;
    const price=document.createElement('div'); price.className='price'; price.textContent=item.price+' ₽';
    const actions=document.createElement('div'); actions.className='actions';
    const buyBtn=document.createElement('button'); buyBtn.className='btn-primary'; buyBtn.textContent='Купить';
    buyBtn.onclick=()=>openModal(item);
    const addBtn=document.createElement('button'); addBtn.className='btn-ghost'; addBtn.textContent='В корзину';
    addBtn.onclick=()=>addToCart(item);
    actions.appendChild(buyBtn); actions.appendChild(addBtn);
    card.appendChild(img); card.appendChild(title); card.appendChild(price); card.appendChild(actions);
    catalogEl.appendChild(card);
  });
}

function addToCart(item){ cart.push({...item,count:1}); updateCart(); }

function updateCart(){ cartCountEl.textContent=cart.length; }

function openModal(item){
  modalContent.innerHTML=`<h2>${item.name}</h2>
  <div class="row"><label>Количество</label><input type="number" id="modal-qty" value="1" min="1"/></div>
  <div class="row"><button id="modal-size-toggle" class="btn-ghost">Размерная сетка</button></div>
  <div class="size-list" id="size-list" style="display:none;">
    <div class="size-item">S</div>
    <div class="size-item">M</div>
    <div class="size-item">L</div>
    <div class="size-item">XL</div>
  </div>
  <div class="row" style="margin-top:12px"><button class="btn-primary" id="modal-addcart">Добавить в корзину</button></div>`;
  modalBack.style.display='flex';

  const toggleBtn=document.getElementById('modal-size-toggle');
  const sizeList=document.getElementById('size-list');
  toggleBtn.onclick=()=>{ sizeList.style.display=sizeList.style.display==='none'?'flex':'none'; }

  const sizeItems=document.querySelectorAll('.size-item');
  sizeItems.forEach(si=>si.onclick=()=>{ sizeItems.forEach(s=>s.classList.remove('active')); si.classList.add('active'); });

  document.getElementById('modal-addcart').onclick=()=>{
    const qty=parseInt(document.getElementById('modal-qty').value)||1;
    const size=document.querySelector('.size-item.active')?.textContent||'M';
    cart.push({...item,count:qty,size:size});
    updateCart();
    modalBack.style.display='none';
  }
}

modalBack.onclick=e=>{ if(e.target===modalBack) modalBack.style.display='none'; }

themeToggle.onclick=()=>{
  document.body.dataset.theme=document.body.dataset.theme==='dark'?'light':'dark';
}

langSelect.onchange=()=>{
  const lang=langSelect.value;
  document.querySelector('.hero h1').textContent=lang==='ru'?'Добро пожаловать':'Welcome';
  document.querySelector('.hero p').textContent=lang==='ru'?'Предзаказ дизайнерских вещей':'Preorder designer items';
}

renderCatalog();
