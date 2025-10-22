(() => {
const PRODUCTS=[
{id:'p1',title:'Футболка NOIR Basic',price:29,desc:'Стандартная футболка из хлопка. Мягкая и удобная.',sizes:['S','M','L','XL']},
{id:'p2',title:'Худи NOIR Heavy',price:69,desc:'Тёплое худи с плотным ворсом.',sizes:['M','L','XL']},
{id:'p3',title:'Штаны NOIR Track',price:49,desc:'Удобные штаны для повседневной носки.',sizes:['S','M','L','XL']},
{id:'p4',title:'Кепка NOIR Cap',price:19,desc:'Кепка с вышитым логотипом.',sizes:['One Size']},
];

const catalogEl=document.getElementById('catalog');
if(catalogEl){PRODUCTS.forEach(p=>{const el=document.createElement('div');el.className='product card';el.innerHTML=`<div class="product-thumb">${p.title}</div><h4>${p.title}</h4><div class="muted small">${p.desc}</div><div class="price">${p.price} $</div>`;el.addEventListener('click',()=>{window.location.href='product.html?id='+p.id});catalogEl.appendChild(el);});}

const prodCard=document.getElementById('product-card');
if(prodCard){
const params=new URLSearchParams(window.location.search);
const pid=params.get('id');
const prod=PRODUCTS.find(p=>p.id===pid);
if(!prod){prodCard.innerHTML='<div class="muted">Товар не найден</div>'}
else{
document.getElementById('prod-title').textContent=prod.title;
document.getElementById('prod-desc').textContent=prod.desc;
document.getElementById('prod-price').textContent=prod.price+' $';
const sizeSel=document.getElementById('prod-size');
prod.sizes.forEach(s=>{const opt=document.createElement('option');opt.value=s;opt.textContent=s;sizeSel.appendChild(opt);});
const sizeChart=document.getElementById('size-chart');
document.getElementById('size-chart-toggle').addEventListener('click',e=>{e.preventDefault();sizeChart.classList.toggle('hidden');});
document.getElementById('add-to-cart').addEventListener('click',()=>{alert('Добавлено в корзину: '+prod.title+' ('+sizeSel.value+') x'+document.getElementById('prod-qty').value);});
}
}
})();