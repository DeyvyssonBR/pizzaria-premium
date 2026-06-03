let WHATSAPP_NUMBER = localStorage.getItem('premium_pizzaria_whatsapp') || '5586981423367';
const PIX_KEY = localStorage.getItem('premium_pizzaria_pix_key') || '5586994854771';
const PIX_NAME = localStorage.getItem('premium_pizzaria_pix_name') || 'Pizzaria Premium';
const PIX_CITY = localStorage.getItem('premium_pizzaria_pix_city') || 'TERESINA';
const MP_LINK = localStorage.getItem('premium_pizzaria_mp_link') || '';
const MP_INTEGRATION_TYPE = localStorage.getItem('premium_pizzaria_mp_integration_type') || 'api';
const DELIVERY_FEE = parseFloat(localStorage.getItem('premium_pizzaria_delivery_fee') || '0');
const ESTIMATED_TIME = localStorage.getItem('premium_pizzaria_estimated_time') || '40-60 min';

const PROMOS_KEY = 'premium_pizzaria_promos';

function renderPromoBar() {
  const bar = document.getElementById('promo-bar-content');
  if (!bar) return;
  const promos = loadPromos().filter(p => p.active !== false && p.destaque);
  if (!promos.length) {
    bar.innerHTML = `🔥 <a href="#promocoes">Ver promoções</a>`;
    return;
  }
  const texts = promos.slice(0, 2).map(p => `<strong>${p.title.toUpperCase()}:</strong> ${p.description.replace(/\.$/, '')}`).join(' · ');
  bar.innerHTML = `🔥 ${texts} · <a href="#promocoes">Ver promoções</a>`;
}

function loadPromos() {
  try {
    const raw = localStorage.getItem(PROMOS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults = [
    { id: 'promo-segundou', title: 'Segundou em Dobro', description: 'Compre uma media, leve outra media gratis. So nas segundas, 18h-22h.', priceLabel: 'a partir de R$ 45', message: 'Ola! Quero a promo Segundou em Dobro (media + media gratis).', validade: 'Ativa toda segunda-feira', destaque: true, active: true },
    { id: 'promo-combo-familia', title: 'Combo Familia', description: '1 pizza grande + 1 refri 2L + borda recheada gratis.', priceLabel: 'R$ 89,90', message: 'Ola! Quero o Combo Familia (grande + refri 2L + borda gratis).', validade: 'Ativa esta semana', destaque: true, active: true },
    { id: 'promo-quarta-doce', title: 'Quarta do Doce', description: 'Toda pizza doce media com 20% off. Quartas, o dia todo.', priceLabel: 'a partir de R$ 35', message: 'Ola! Quero a promo Quarta do Doce (pizza doce media com 20% off).', validade: 'Ativa toda quarta-feira', destaque: false, active: true },
    { id: 'promo-primeira-fatia', title: 'Primeira Fatia', description: '15% off no primeiro pedido pelo site. Cupom PRIMEIRA15.', priceLabel: 'desconto no carrinho', message: 'Ola! Quero usar o cupom PRIMEIRA15 (15% off na primeira compra).', validade: 'Ativa esta semana', destaque: false, active: true }
  ];
  localStorage.setItem(PROMOS_KEY, JSON.stringify(defaults));
  return defaults;
}

const defaultMenu = [
  {
    id: 'cla-margherita',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericao fresco e azeite extravirgem.',
    price: 32,
    precos: { p: 32, m: 45, g: 58 },
    image: 'assets/img/cardapio/photo-1604068549290-dea0e4a305ca.webp',
    isVegetarian: true
  },
  {
    id: 'cla-calabresa',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Calabresa',
    description: 'Calabresa fatiada, cebola roxa e azeitonas sobre mussarela.',
    price: 34,
    precos: { p: 34, m: 48, g: 62 },
    image: 'assets/img/cardapio/photo-1565299624946-b28f40a0ae38.webp'
  },
  {
    id: 'cla-portuguesa',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Portuguesa',
    description: 'Presunto, ovo, cebola, ervilha, azeitona e mussarela.',
    price: 36,
    precos: { p: 36, m: 50, g: 64 },
    image: 'assets/img/cardapio/photo-1513104890138-7c749659a591.webp'
  },
  {
    id: 'cla-frango-catupiry',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Frango c/ Catupiry',
    description: 'Frango desfiado temperado com requeijao cremoso Catupiry.',
    price: 36,
    precos: { p: 36, m: 50, g: 66 },
    image: 'assets/img/cardapio/photo-1571407970349-bc81e7e96d47.webp'
  },
  {
    id: 'cla-quatro-queijos',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Quatro Queijos',
    description: 'Mussarela, provolone, parmesao e gorgonzola gratinados.',
    price: 38,
    precos: { p: 38, m: 52, g: 68 },
    image: 'assets/img/cardapio/photo-1593504049359-74330189a345.webp',
    isVegetarian: true
  },
  {
    id: 'cla-pepperoni',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Pepperoni',
    description: 'Fatias generosas de pepperoni picante sobre mussarela.',
    price: 38,
    precos: { p: 38, m: 53, g: 69 },
    image: 'assets/img/cardapio/photo-1628840042765-356cda07504e.webp'
  },
  {
    id: 'cla-napolitana',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Napolitana',
    description: 'Tomate em rodelas, mussarela, parmesao e oregano.',
    price: 34,
    precos: { p: 34, m: 47, g: 60 },
    image: 'assets/img/cardapio/photo-1574071318508-1cdbab80d002.webp',
    isVegetarian: true
  },
  {
    id: 'cla-mussarela',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Mussarela',
    description: 'Mussarela em camada generosa com molho da casa e oregano.',
    price: 30,
    precos: { p: 30, m: 42, g: 55 },
    image: 'assets/img/cardapio/photo-1595854341625-f33ee10dbf94.webp',
    isVegetarian: true
  },
  {
    id: 'reg-carne-sol-coalho',
    category: 'piauienses',
    type: 'pizza',
    name: 'Carne de Sol c/ Queijo Coalho',
    description: 'Carne de sol desfiada, queijo coalho grelhado e cebola.',
    price: 42,
    precos: { p: 42, m: 58, g: 74 },
    image: 'assets/img/cardapio/photo-1565958011703-44f9829ba187.webp'
  },
  {
    id: 'reg-frango-cajuina',
    category: 'piauienses',
    type: 'pizza',
    name: 'Frango c/ Cajuina-glaze',
    description: 'Frango ao glaze de cajuina, toque agridoce piauiense.',
    price: 42,
    precos: { p: 42, m: 58, g: 74 },
    image: 'assets/img/cardapio/photo-1601924582970-9238bcb495d9.webp'
  },
  {
    id: 'reg-calabresa-coalho',
    category: 'piauienses',
    type: 'pizza',
    name: 'Calabresa c/ Queijo Coalho',
    description: 'Calabresa artesanal com queijo coalho e melaco de cana.',
    price: 40,
    precos: { p: 40, m: 55, g: 70 },
    image: 'assets/img/cardapio/photo-1565299624946-b28f40a0ae38.webp'
  },
  {
    id: 'reg-sertaneja',
    category: 'piauienses',
    type: 'pizza',
    name: 'Sertaneja',
    description: 'Carne de sol, queijo coalho, banana-da-terra e pimenta.',
    price: 44,
    precos: { p: 44, m: 60, g: 76 },
    image: 'assets/img/cardapio/photo-1590534247854-e97d5e3feef6.webp'
  },
  {
    id: 'reg-vaqueiro',
    category: 'piauienses',
    type: 'pizza',
    name: 'Pizza do Vaqueiro',
    description: 'Carne de sol, coalho, requeijao do sertao e cebola roxa.',
    price: 46,
    precos: { p: 46, m: 62, g: 78 },
    image: 'assets/img/cardapio/photo-1548365328-9f547fb09530.webp'
  },
  {
    id: 'reg-doce-cajuina',
    category: 'piauienses',
    type: 'pizza',
    name: 'Doce de Cajuina',
    description: 'Calda de cajuina, queijo coalho e raspas de limao.',
    price: 40,
    precos: { p: 40, m: 54, g: 68 },
    image: 'assets/img/cardapio/photo-1571877227200-a0d98ea607e9.webp',
    isVegetarian: true
  },
  {
    id: 'pre-camarao-catupiry',
    category: 'especiais',
    type: 'pizza',
    name: 'Camarao ao Catupiry',
    description: 'Camarao salteado no alho com requeijao Catupiry cremoso.',
    price: 56,
    precos: { p: 56, m: 74, g: 92 },
    image: 'assets/img/cardapio/photo-1565299507177-b0ac66763828.webp'
  },
  {
    id: 'pre-file-cream',
    category: 'especiais',
    type: 'pizza',
    name: 'File c/ Cream Cheese',
    description: 'File mignon em iscas com cream cheese e cebola caramelizada.',
    price: 58,
    precos: { p: 58, m: 76, g: 94 },
    image: 'assets/img/cardapio/photo-1513104890138-7c749659a591.webp'
  },
  {
    id: 'pre-salmao',
    category: 'especiais',
    type: 'pizza',
    name: 'Salmao',
    description: 'Salmao defumado, cream cheese, alcaparras e dill fresco.',
    price: 60,
    precos: { p: 60, m: 80, g: 98 },
    image: 'assets/img/cardapio/photo-1559056199-641a0ac8b55e.webp'
  },
  {
    id: 'pre-brie-damasco',
    category: 'especiais',
    type: 'pizza',
    name: 'Brie c/ Damasco',
    description: 'Queijo brie cremoso com geleia de damasco e nozes.',
    price: 56,
    precos: { p: 56, m: 74, g: 90 },
    image: 'assets/img/cardapio/photo-1571066811602-716837d681de.webp',
    isVegetarian: true
  },
  {
    id: 'pre-trufada',
    category: 'especiais',
    type: 'pizza',
    name: 'Trufada',
    description: 'Mussarela de bufala, cogumelos e azeite trufado.',
    price: 62,
    precos: { p: 62, m: 82, g: 100 },
    image: 'assets/img/cardapio/photo-1598021680133-eb3a7c7a4d77.webp',
    isVegetarian: true
  },
  {
    id: 'pre-burrata-confit',
    category: 'especiais',
    type: 'pizza',
    name: 'Burrata c/ Tomate Confit',
    description: 'Burrata cremosa, tomate confitado e manjericao fresco.',
    price: 60,
    precos: { p: 60, m: 80, g: 98 },
    image: 'assets/img/cardapio/photo-1604382354936-07c5d9983bd3.webp',
    isVegetarian: true
  },
  {
    id: 'pre-lombo-cheddar',
    category: 'especiais',
    type: 'pizza',
    name: 'Lombo c/ Cheddar',
    description: 'Lombo canadense, cheddar gratinado e cebola roxa.',
    price: 54,
    precos: { p: 54, m: 72, g: 88 },
    image: 'assets/img/cardapio/photo-1534308983496-4fefedf6c124.webp'
  },
  {
    id: 'pre-parma-rucula',
    category: 'especiais',
    type: 'pizza',
    name: 'Parma c/ Rucula',
    description: 'Presunto parma, rucula fresca, parmesao e tomate seco.',
    price: 58,
    precos: { p: 58, m: 76, g: 94 },
    image: 'assets/img/cardapio/photo-1571997478779-2adcbbe9ab2f.webp'
  },
  {
    id: 'doc-brigadeiro',
    category: 'doces',
    type: 'pizza',
    name: 'Brigadeiro',
    description: 'Brigadeiro cremoso com granulado belga e raspas de chocolate.',
    price: 34,
    precos: { p: 34, m: 46, g: 58 },
    image: 'assets/img/cardapio/photo-1606313564200-e75d5e30476c.webp',
    isVegetarian: true
  },
  {
    id: 'doc-romeu-julieta',
    category: 'doces',
    type: 'pizza',
    name: 'Romeu e Julieta',
    description: 'Goiabada cremosa com queijo coalho derretido.',
    price: 34,
    precos: { p: 34, m: 46, g: 58 },
    image: 'assets/img/cardapio/photo-1565958011703-44f9829ba187.webp',
    isVegetarian: true
  },
  {
    id: 'doc-banana-canela',
    category: 'doces',
    type: 'pizza',
    name: 'Banana c/ Canela',
    description: 'Banana caramelizada, canela e acucar mascavo.',
    price: 32,
    precos: { p: 32, m: 44, g: 56 },
    image: 'assets/img/cardapio/photo-1551024601-bec78aea704b.webp',
    isVegetarian: true
  },
  {
    id: 'doc-prestigio',
    category: 'doces',
    type: 'pizza',
    name: 'Prestigio',
    description: 'Chocolate ao leite com coco ralado cremoso.',
    price: 34,
    precos: { p: 34, m: 46, g: 58 },
    image: 'assets/img/cardapio/photo-1511381939415-e44015466834.webp',
    isVegetarian: true
  },
  {
    id: 'doc-nutella-morango',
    category: 'doces',
    type: 'pizza',
    name: 'Nutella c/ Morango',
    description: 'Nutella derretida com morangos frescos fatiados.',
    price: 38,
    precos: { p: 38, m: 52, g: 66 },
    image: 'assets/img/cardapio/photo-1505253716362-afaea1d3d1af.webp',
    isVegetarian: true
  },
  {
    id: 'doc-sensacao',
    category: 'doces',
    type: 'pizza',
    name: 'Sensacao',
    description: 'Chocolate ao leite com morango, sabor classico nacional.',
    price: 36,
    precos: { p: 36, m: 48, g: 62 },
    image: 'assets/img/cardapio/photo-1481391319762-47dff72954d9.webp',
    isVegetarian: true
  },
  {
    id: 'doc-ouro-branco',
    category: 'doces',
    type: 'pizza',
    name: 'Ouro Branco',
    description: 'Chocolate branco cremoso com cobertura sedosa.',
    price: 36,
    precos: { p: 36, m: 48, g: 62 },
    image: 'assets/img/cardapio/photo-1488477181946-6428a0291777.webp',
    isVegetarian: true
  },
  {
    id: 'doc-cookies-cream',
    category: 'doces',
    type: 'pizza',
    name: 'Cookies & Cream',
    description: 'Creme branco com pedacos de biscoito de chocolate.',
    price: 38,
    precos: { p: 38, m: 50, g: 64 },
    image: 'assets/img/cardapio/photo-1563805042-7684c019e1cb.webp',
    isVegetarian: true
  },
  {
    id: 'bombom-chocolate',
    category: 'doces',
    type: 'sobremesa',
    name: 'Bombom de Chocolate',
    description: 'Bombom de chocolate caseiro com recheio cremoso para fechar com chave de ouro.',
    price: 5,
    image: 'assets/img/cardapio/placeholder.webp',
    isVegetarian: true
  },
  {
    id: 'combo-premium',
    category: 'combos',
    type: 'combo',
    name: 'Combo Premium',
    description: '2 pizzas grandes + borda recheada + refrigerante 2L.',
    price: 89,
    image: 'assets/img/cardapio/photo-1513104890138-7c749659a591.webp'
  },
  {
    id: 'combo-casal',
    category: 'combos',
    type: 'combo',
    name: 'Combo Casal',
    description: '1 pizza grande + 1 refrigerante lata + 1 pizza doce média.',
    price: 69,
    image: 'assets/img/cardapio/photo-1594007654729-407eedc4be65.webp'
  },
  {
    id: 'combo-galera',
    category: 'combos',
    type: 'combo',
    name: 'Combo Galera',
    description: '3 pizzas grandes + borda recheada + refrigerante 2L.',
    price: 119,
    image: 'assets/img/cardapio/photo-1590947132387-155cc02f3212.webp'
  },
  {
    id: 'combo-familia',
    category: 'combos',
    type: 'combo',
    name: 'Combo Família',
    description: '2 pizzas família + borda recheada + 2 guaraná 2L.',
    price: 139,
    image: 'assets/img/cardapio/photo-1565299624946-b28f40a0ae38.webp'
  },
  {
    id: 'refrigerante-2l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Refrigerante 2L',
    description: 'Acompanhamento ideal para combos e família.',
    price: 12,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'carne-chapa-150',
    category: 'porcoes',
    type: 'porcao',
    name: 'Carne na Chapa (150g)',
    description: 'Carne acebolada na chapa quente, servida no ponto certo.',
    price: 15,
    image: 'assets/img/cardapio/photo-1544025162-d76694265947.webp'
  },
  {
    id: 'file-fritas-500',
    category: 'tira-gosto',
    type: 'tira-gosto',
    name: 'Filé com Fritas (500g)',
    description: 'Tiras de filé mignon aceboladas com porção generosa de batatas fritas crocantes.',
    price: 45,
    image: 'assets/img/cardapio/photo-1576107232684-1279f390859f.webp'
  },
  {
    id: 'frango-500',
    category: 'tira-gosto',
    type: 'tira-gosto',
    name: 'Frango Frito (500g)',
    description: 'Pedaços de frango crocantes e suculentos, bem temperados.',
    price: 35,
    image: 'assets/img/cardapio/photo-1562967914-608f82629710.webp'
  },
  {
    id: 'farofa',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Farofa da Casa',
    description: 'Farofa crocante e temperada, acompanhamento perfeito para carnes.',
    price: 5,
    image: 'assets/img/cardapio/photo-1589301760014-d929f3979dbc.webp'
  },
  {
    id: 'maria-isabel',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Maria Isabel',
    description: 'Arroz tradicional piauiense com carne de sol picadinha e temperos regionais.',
    price: 15,
    image: 'assets/img/cardapio/photo-1608039829572-78524f79c4c7.webp'
  },
  {
    id: 'batata-300',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Porção de Batata Frita (300g)',
    description: 'Batatas fritas douradas e crocantes, sequinhas e salgadas na medida.',
    price: 16,
    image: 'assets/img/cardapio/photo-1573080496219-bb080dd4f877.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'batata-400',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Porção de Batata Frita (400g)',
    description: 'Porção grande de batatas fritas crocantes, perfeita para compartilhar.',
    price: 20,
    image: 'assets/img/cardapio/photo-1573080496219-bb080dd4f877.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'vinagrete',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Vinagrete Especial',
    description: 'Molho vinagrete fresco com tomate, cebola e pimentão picadinhos.',
    price: 5,
    image: 'assets/img/cardapio/photo-1546069901-ba9599a7e63c.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'cerveja-stella',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Stella Artois Long Neck',
    description: 'Cerveja premium Stella Artois, gelada e refrescante.',
    price: 9,
    image: 'assets/img/cardapio/photo-1608270586620-248524c67de9.webp'
  },
  {
    id: 'cerveja-skol',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Skol Lata',
    description: 'Cerveja Skol gelada, a preferida para os momentos de descontração.',
    price: 7,
    image: 'assets/img/cardapio/photo-1566633806327-68e152aaf26d.webp'
  },
  {
    id: 'cerveja-budweiser',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Budweiser Long Neck',
    description: 'Cerveja americana Budweiser long neck bem gelada.',
    price: 9,
    image: 'assets/img/cardapio/placeholder.webp'
  },
  {
    id: 'agua-com-gas',
    category: 'bebidas',
    type: 'bebida',
    name: 'Água Mineral com Gás 500ml',
    description: 'Água mineral gaseificada fresca.',
    price: 4.5,
    image: 'assets/img/cardapio/placeholder.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'agua-sem-gas',
    category: 'bebidas',
    type: 'bebida',
    name: 'Água Mineral sem Gás 500ml',
    description: 'Água mineral natural fresca.',
    price: 4,
    image: 'assets/img/cardapio/placeholder.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'guarana-1l-item',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica 1L',
    description: 'Refrigerante Guaraná Antarctica 1 litro bem gelado.',
    price: 8,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'guarana-2l-item',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica 2L',
    description: 'Refrigerante Guaraná Antarctica tamanho família 2 litros.',
    price: 12,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'coca-1l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola 1L',
    description: 'Refrigerante Coca-Cola garrafa de 1 litro bem gelada.',
    price: 9,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'guarana-350ml',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica Lata 350ml',
    description: 'Refrigerante Guaraná Antarctica lata de 350ml gelada.',
    price: 5,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'coca-350ml',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante Coca-Cola lata de 350ml gelada.',
    price: 5.5,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'coca-1-5l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola 1.5L',
    description: 'Refrigerante Coca-Cola garrafa de 1.5 litros.',
    price: 11,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'fanta-laranja-retornavel',
    category: 'bebidas',
    type: 'bebida',
    name: 'Fanta Laranja Retornável 2L',
    description: 'Refrigerante Fanta Laranja garrafa retornável de 2 litros.',
    price: 8.5,
    image: 'assets/img/cardapio/photo-1624552184280-9e9631bbeee9.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  },
  {
    id: 'suco-maracuja-300',
    category: 'bebidas',
    type: 'bebida',
    name: 'Suco Natural de Maracujá 300ml',
    description: 'Suco natural e refrescante de maracujá da fruta.',
    price: 8,
    image: 'assets/img/cardapio/placeholder.webp',
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    isLactoseFree: true
  }
];

// Versao do seed do cardapio: ao subir, menus antigos em cache sao refrescados.
const MENU_SEED_VERSION = '2026-demo-30';
let menu;
const storedMenuVersion = localStorage.getItem('premium_pizzaria_menu_version');
const storedMenuRaw = localStorage.getItem('premium_pizzaria_menu');
if (storedMenuRaw && storedMenuVersion === MENU_SEED_VERSION) {
  try {
    menu = JSON.parse(storedMenuRaw);
  } catch (e) {
    menu = defaultMenu;
  }
} else {
  menu = defaultMenu;
}
if (!Array.isArray(menu) || !menu.length) {
  menu = defaultMenu;
}
localStorage.setItem('premium_pizzaria_menu', JSON.stringify(menu));
localStorage.setItem('premium_pizzaria_menu_version', MENU_SEED_VERSION);

const categories = [
  { id: 'todos', label: 'Todos', icon: '🍽️' },
  { id: 'piauienses', label: 'Especiais Piauienses', icon: '🌵' },
  { id: 'tradicionais', label: 'Tradicionais', icon: '🍕' },
  { id: 'especiais', label: 'Especiais', icon: '✨' },
  { id: 'doces', label: 'Doces', icon: '🍫' },
  { id: 'combos', label: 'Combos', icon: '🎁' },
  { id: 'porcoes', label: 'Porções', icon: '🥩' },
  { id: 'tira-gosto', label: 'Tira Gosto', icon: '🍟' },
  { id: 'acompanhamentos', label: 'Acompanhamentos', icon: '🍚' },
  { id: 'cervejas', label: 'Cervejas', icon: '🍺' },
  { id: 'bebidas', label: 'Bebidas', icon: '🥤' }
];

const pizzaFlavors = menu.filter((item) => item.type === 'pizza');

const pizzaSizes = [
  { id: 'pequena', label: 'Pequena', detail: '4 pedaços', extra: 0 },
  { id: 'media', label: 'Média', detail: '6 pedaços', extra: 10 },
  { id: 'grande', label: 'Grande', detail: '8 pedaços', extra: 20 },
  { id: 'familia', label: 'Família', detail: '12 pedaços', extra: 32 }
];

const borderOptions = [
  { id: 'sem-borda', label: 'Sem borda', detail: 'Pizza tradicional', price: 0 },
  { id: 'catupiry', label: 'Borda de Catupiry', detail: 'Cremosa e salgada', price: 8 },
  { id: 'carne-sol', label: 'Borda de carne de sol', detail: 'Sabor regional premium', price: 12 },
  { id: 'chocolate', label: 'Borda de chocolate', detail: 'Ideal para sabores doces', price: 10 },
  { id: 'doce-leite', label: 'Borda de doce de leite', detail: 'Doce e cremosa', price: 10 }
];

const extraOptions = [
  { id: 'salsinha', label: 'Salsinha', detail: 'Finalização verde', price: 0 },
  { id: 'queijo-extra', label: 'Queijo extra', detail: 'Mais mussarela', price: 6 },
  { id: 'bacon-extra', label: 'Bacon extra', detail: 'Mais crocância', price: 8 }
];

const drinkOptions = [
  {
    id: 'guarana-1l',
    label: '02x Guaraná 01L',
    detail: 'Duas unidades para acompanhar sua pizza.',
    price: 14,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp'
  },
  {
    id: 'guarana-zero-1l',
    label: '02x Guaraná Zero 01L',
    detail: 'Opção zero açúcar para o combo.',
    price: 14,
    image: 'assets/img/cardapio/photo-1622483767028-3f66f32aef97.webp'
  },
  {
    id: 'sem-bebida',
    label: 'Não quero bebida',
    detail: 'Continuar apenas com a pizza.',
    price: 0,
    image: 'assets/img/cardapio/placeholder.webp'
  }
];

const sachetOptions = [
  {
    id: 'sem-sache',
    label: 'Não quero sachê',
    detail: 'Enviar sem ketchup ou maionese.',
    price: 0,
    image: 'assets/img/cardapio/photo-1513104890138-7c749659a591.webp'
  },
  {
    id: 'ketchup-maionese',
    label: 'Enviar ketchup e maionese',
    detail: 'Sachês variados para acompanhar.',
    price: 0,
    image: 'assets/img/cardapio/placeholder.webp'
  },
  {
    id: 'somente-ketchup',
    label: 'Enviar somente ketchup',
    detail: 'Apenas sachês de ketchup.',
    price: 0,
    image: 'assets/img/cardapio/photo-1565299624946-b28f40a0ae38.webp'
  }
];

const pizzaSteps = [
  { id: 'tamanho', title: 'Qual o tamanho da pizza?', helper: 'Escolha o tamanho antes de selecionar os sabores.' },
  { id: 'primeira-pizza', title: 'Primeira pizza', helper: 'Escolha 1 Sabor para pizza' },
  { id: 'segunda-pizza', title: 'Segunda pizza', helper: 'Escolha o segundo sabor ou avance para manter sabor único.' },
  { id: 'borda', title: 'Você quer borda?', helper: 'Selecione sem borda ou uma das bordas disponíveis.' },
  { id: 'bebida', title: 'Sua bebida', helper: 'Escolha 1 item para acompanhar o pedido.' },
  { id: 'sache', title: 'Deseja sachê?', helper: 'Escolha como deseja receber os sachês.' },
  { id: 'adicionais', title: 'Deseja adicionar alguma coisa?', helper: 'Extras opcionais para deixar a pizza ainda melhor.' },
  { id: 'observacoes', title: 'Observações', helper: 'Escreva algum recado para a cozinha, se precisar.' },
  { id: 'revisao', title: 'Confirmar este item?', helper: 'Confira o resumo antes de enviar o pedido.' }
];

let activeCategory = 'todos';
let pizzaSelection = {
  itemId: null,
  step: 0,
  sizeId: 'grande',
  mode: 'inteira',
  firstFlavorId: null,
  secondFlavorId: null,
  borderId: 'sem-borda',
  drinkId: 'sem-bebida',
  sachetId: 'sem-sache',
  extraIds: [],
  notes: '',
  searchQuery: ''
};

const promoGrid = document.getElementById('promo-grid');
const menuTabs = document.getElementById('menu-tabs');
const menuGrid = document.getElementById('menu-grid');
const pizzaModal = document.getElementById('pizza-modal');
const pizzaChoiceMode = document.getElementById('pizza-choice-mode');
const pizzaChoiceFlavors = document.getElementById('pizza-choice-flavors');
const pizzaModalSummary = document.getElementById('pizza-modal-summary');

function formatBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function showToast(message) {
  const existing = document.getElementById('quick-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.id = 'quick-toast';
  toast.className = 'quick-toast';
  toast.innerHTML = `
    <span class="quick-toast__icon winking-emoji-container">
      <span class="winking-emoji winking-emoji--smile">😊</span>
      <span class="winking-emoji winking-emoji--wink">😉</span>
    </span>
    <span class="quick-toast__message">${message}</span>
  `;
  document.body.appendChild(toast);

  // Trigger reflow
  toast.offsetHeight;

  toast.classList.add('is-active');

  setTimeout(() => {
    toast.classList.remove('is-active');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2200);
}

function buildWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function hydrateStaticWhatsAppLinks() {
  document.querySelectorAll('[data-whatsapp-link]').forEach((link) => {
    const message = link.dataset.message || 'Olá! Quero fazer um pedido na Pizzaria Premium Teresina.';
    link.setAttribute('href', buildWhatsAppUrl(message));
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noreferrer');
  });
}

function renderPromotions() {
  if (!promoGrid) return;
  const promos = loadPromos().filter(p => p.active !== false);
  promoGrid.innerHTML = promos
    .map(
      (promo) => `
        <article class="promo-card ${promo.destaque ? 'promo-card--featured' : ''}">
          ${promo.validade ? `<span class="promo-card__status">${promo.validade}</span>` : ''}
          <span class="tag tag--gold">${promo.priceLabel}</span>
          <h3>${promo.title}</h3>
          <p>${promo.description}</p>
          <a class="button button--gold" target="_blank" rel="noreferrer" href="${buildWhatsAppUrl(promo.message)}">
            Quero essa promoção
          </a>
        </article>
      `
    )
    .join('');
}

function renderTabs() {
  if (!menuTabs) return;

  const activeCat = categories.find((c) => c.id === activeCategory) || categories[0];

  menuTabs.innerHTML = `
    <!-- Versão Desktop -->
    <div class="menu-tabs-desktop">
      ${categories
        .map(
          (category) => `
            <button class="menu-tab ${category.id === activeCategory ? 'is-active' : ''}" type="button" data-category="${category.id}">
              <span class="menu-tab__icon">${category.icon}</span>
              <span class="menu-tab__label">${category.label}</span>
            </button>
          `
        )
        .join('')}
    </div>

    <!-- Versão Mobile (Dropdown) -->
    <div class="menu-tabs-mobile">
      <button class="category-dropdown-btn" type="button" id="category-dropdown-toggle">
        <span class="category-dropdown-btn__selected">
          <span class="selected-icon">${activeCat.icon}</span>
          <span class="selected-label">${activeCat.label}</span>
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <div class="category-dropdown-options" id="category-dropdown-options">
        ${categories
          .map(
            (category) => `
              <button class="category-dropdown-option ${category.id === activeCategory ? 'is-active' : ''}" type="button" data-category="${category.id}">
                <span class="option-icon">${category.icon}</span>
                <span class="option-label">${category.label}</span>
              </button>
            `
          )
          .join('')}
      </div>
    </div>
  `;

  // Event Listeners Desktop
  menuTabs.querySelectorAll('.menu-tabs-desktop [data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderTabs();
      renderMenu();
    });
  });

  // Event Listeners Mobile (Dropdown)
  const toggleBtn = document.getElementById('category-dropdown-toggle');
  const optionsDiv = document.getElementById('category-dropdown-options');
  
  if (toggleBtn && optionsDiv) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      optionsDiv.classList.toggle('is-open');
      toggleBtn.classList.toggle('is-active');
    });

    // Fechar ao clicar fora
    document.addEventListener('click', () => {
      optionsDiv.classList.remove('is-open');
      toggleBtn.classList.remove('is-active');
    });
  }

  menuTabs.querySelectorAll('.category-dropdown-option').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category;
      renderTabs();
      renderMenu();
    });
  });
}

function hydrateCategoryTriggers() {
  document.querySelectorAll('[data-category-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      activeCategory = trigger.dataset.categoryTrigger || 'todos';
      renderTabs();
      renderMenu();
    });
  });
}

function getVisibleMenuItems() {
  return activeCategory === 'todos'
    ? menu.slice()
    : menu.filter((item) => item.category === activeCategory);
}

function renderMenu() {
  menuGrid.innerHTML = getVisibleMenuItems()
    .map((item) => {
      const isPizza = item.type === 'pizza';
      const requestMessage = isPizza
        ? `Olá! Quero pedir a pizza ${item.name}.`
        : `Olá! Quero pedir ${item.name}.`;

      return `
        <article class="menu-card ${isPizza ? 'menu-card--pizza' : ''}" ${isPizza ? `data-add-item-card="${item.id}" role="button" tabindex="0"` : ''}>
          <div class="menu-card__image"><img src="${item.image}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/cardapio/placeholder.webp'"></div>
          <div class="menu-card__body">
            ${isPizza ? '<span class="menu-card__badge">Personalizável</span>' : ''}
            <div class="menu-card__meta">
              <h3>${item.name}</h3>
              <strong class="menu-card__price">${isPizza ? `A partir de ${formatBRL(item.price)}` : formatBRL(item.price)}</strong>
            </div>
            <p>${item.description}</p>
            ${isPizza
              ? '<span class="menu-card__hint">Toque para montar seu pedido</span>'
              : `<div class="menu-card__actions"><button class="button button--add-to-cart" type="button" data-add-item="${item.id}"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin: 0;"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg><span class="button-text">Pedir</span></button></div>`}
          </div>
        </article>
      `;
    })
    .join('');

  menuGrid.querySelectorAll('[data-add-item]').forEach((button) => {
    button.addEventListener('click', () => handleAddItem(button.dataset.addItem));
  });

  menuGrid.querySelectorAll('[data-add-item-card]').forEach((card) => {
    card.addEventListener('click', () => handleAddItem(card.dataset.addItemCard));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleAddItem(card.dataset.addItemCard);
      }
    });
  });
}

function getFlavorById(flavorId) {
  return pizzaFlavors.find((item) => item.id === flavorId);
}

function handleAddItem(itemId) {
  const item = menu.find((entry) => entry.id === itemId);
  if (!item) return;

  if (item.type === 'pizza') {
    openPizzaModal(itemId);
    return;
  }

  addSimpleItemToCart(item);
}

function addSimpleItemToCart(item) {
  const message = [
    'Olá! Gostaria de fazer o seguinte pedido:',
    '',
    `*1x ${item.name}* (${formatBRL(item.price)})`,
    '',
    `Total: ${formatBRL(item.price)}`
  ].join('\n');

  window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}

function openPizzaModal(itemId) {
  pizzaSelection = {
    itemId,
    step: 0,
    sizeId: 'grande',
    mode: 'inteira',
    firstFlavorId: itemId,
    secondFlavorId: null,
    borderId: 'sem-borda',
    drinkId: 'sem-bebida',
    sachetId: 'sem-sache',
    extraIds: [],
    notes: '',
    searchQuery: ''
  };

  renderPizzaModal();
  pizzaModal.classList.add('is-open');
  pizzaModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closePizzaModal() {
  pizzaModal.classList.remove('is-open');
  pizzaModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderPizzaModal() {
  const selectedPizza = menu.find((item) => item.id === pizzaSelection.itemId);
  if (!selectedPizza) return;
  const currentStep = pizzaSteps[pizzaSelection.step];
  const title = document.getElementById('pizza-modal-title');
  const firstFlavor = getFlavorById(pizzaSelection.firstFlavorId);
  const secondFlavor = getFlavorById(pizzaSelection.secondFlavorId);
  const selectedSize = pizzaSizes.find((size) => size.id === pizzaSelection.sizeId) || pizzaSizes[0];
  const selectedBorder = borderOptions.find((border) => border.id === pizzaSelection.borderId) || borderOptions[0];
  const selectedExtras = extraOptions.filter((extra) => pizzaSelection.extraIds.includes(extra.id));
  const selectedDrink = drinkOptions.find((drink) => drink.id === pizzaSelection.drinkId) || drinkOptions[0];
  const selectedSachet = sachetOptions.find((sachet) => sachet.id === pizzaSelection.sachetId) || sachetOptions[0];
  const currentPrice = calculatePizzaPrice();

  let stepTitle = currentStep.title;
  let stepHelper = currentStep.helper;

  if (currentStep.id === 'primeira-pizza' && pizzaSelection.mode === 'inteira') {
    stepTitle = 'Selecione o sabor';
    stepHelper = 'Escolha o sabor para a sua pizza';
  }

  title.textContent = stepTitle;
  document.querySelector('.pizza-modal__text').textContent = stepHelper;

  pizzaChoiceMode.innerHTML = renderStepProgress(selectedPizza);
  pizzaChoiceFlavors.innerHTML = renderCurrentPizzaStep();

  pizzaModalSummary.innerHTML = `
    <div>
      <strong>Total do item</strong>
      <span>${buildPizzaSummaryText(firstFlavor, secondFlavor, selectedSize, selectedBorder, selectedExtras, selectedDrink, selectedSachet)}</span>
    </div>
    <strong class="pizza-modal__price">${formatBRL(currentPrice)}</strong>
  `;

  document.querySelector('.pizza-modal__actions').innerHTML = `
    <button class="button button--ghost" type="button" data-pizza-back>
      ${pizzaSelection.step === 0 ? 'Cancelar' : 'Voltar'}
    </button>
    <button class="button" type="button" id="pizza-modal-confirm">
      ${pizzaSelection.step === pizzaSteps.length - 1 ? 'Pedir no WhatsApp' : 'Continuar'}
    </button>
  `;

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-size]').forEach((button) => {
    button.addEventListener('click', () => {
      pizzaSelection.sizeId = button.dataset.pizzaSize;
      renderPizzaModal();
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      pizzaSelection.mode = button.dataset.pizzaMode;
      if (pizzaSelection.mode === 'inteira') {
        pizzaSelection.secondFlavorId = null;
      }
      renderPizzaModal();

      // Smooth scroll to the flavor list to guide the user visually
      const searchBox = document.querySelector('.flavor-search-container');
      if (searchBox) {
        searchBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-flavor-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const flavorId = button.dataset.flavorId;
      const role = button.dataset.flavorRole;

      if (role === 'first') {
        pizzaSelection.firstFlavorId = flavorId;
        if (pizzaSelection.mode === 'metade') {
          showToast("Sua Metade da 1° Sua Pizza foi Salva");
        } else {
          showToast("Seu Pedido foi Salvo");
        }
      } else {
        pizzaSelection.secondFlavorId = flavorId;
        showToast("Sua Metade da 2° Sua Pizza foi Salva");
      }

      pizzaSelection.searchQuery = ''; // Reset query on selection
      renderPizzaModal();
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-drink]').forEach((button) => {
    button.addEventListener('click', () => {
      pizzaSelection.drinkId = button.dataset.pizzaDrink;
      renderPizzaModal();
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-sachet]').forEach((button) => {
    button.addEventListener('click', () => {
      pizzaSelection.sachetId = button.dataset.pizzaSachet;
      renderPizzaModal();
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-border]').forEach((button) => {
    button.addEventListener('click', () => {
      pizzaSelection.borderId = button.dataset.pizzaBorder;
      renderPizzaModal();
    });
  });

  pizzaChoiceFlavors.querySelectorAll('[data-pizza-extra]').forEach((button) => {
    button.addEventListener('click', () => {
      const extraId = button.dataset.pizzaExtra;
      pizzaSelection.extraIds = pizzaSelection.extraIds.includes(extraId)
        ? pizzaSelection.extraIds.filter((id) => id !== extraId)
        : [...pizzaSelection.extraIds, extraId];
      renderPizzaModal();
    });
  });

  const notesField = pizzaChoiceFlavors.querySelector('[data-pizza-notes]');
  if (notesField) {
    notesField.addEventListener('input', () => {
      pizzaSelection.notes = notesField.value;
    });
  }

  const searchInput = pizzaChoiceFlavors.querySelector('#flavor-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      pizzaSelection.searchQuery = e.target.value;
      
      const choiceList = pizzaChoiceFlavors.querySelector('.choice-list');
      const popularContainer = pizzaChoiceFlavors.querySelector('.popular-flavors-container');
      const popularHeader = pizzaChoiceFlavors.querySelector('.popular-flavors-header');
      
      if (choiceList) {
        const options = choiceList.querySelectorAll('.product-option');
        options.forEach(option => {
          const title = option.querySelector('.product-option__body strong').textContent.toLowerCase();
          const desc = option.querySelector('.product-option__body span').textContent.toLowerCase();
          if (title.includes(query) || desc.includes(query)) {
            option.style.display = 'flex';
          } else {
            option.style.display = 'none';
          }
        });
      }
      
      if (popularContainer) popularContainer.style.display = query ? 'none' : 'block';
      if (popularHeader) popularHeader.style.display = query ? 'none' : 'block';
    });
  }

  document.querySelector('[data-pizza-back]').addEventListener('click', () => {
    pizzaSelection.searchQuery = ''; // Reset query on back
    if (pizzaSelection.step === 0) {
      closePizzaModal();
      return;
    }

    pizzaSelection.step -= 1;
    if (pizzaSelection.step === 2 && pizzaSelection.mode === 'inteira') {
      pizzaSelection.step = 1;
    }
    renderPizzaModal();
  });

  document.getElementById('pizza-modal-confirm').addEventListener('click', handlePizzaStepContinue);
}

function getStepShortLabel(id) {
  switch (id) {
    case 'tamanho': return 'Tamanho';
    case 'primeira-pizza': return pizzaSelection.mode === 'inteira' ? 'Sabor' : '1º Sabor';
    case 'segunda-pizza': return '2º Sabor';
    case 'borda': return 'Borda';
    case 'bebida': return 'Bebida';
    case 'sache': return 'Sachê';
    case 'adicionais': return 'Extras';
    case 'observacoes': return 'Obs';
    case 'revisao': return 'Revisão';
    default: return '';
  }
}

function renderStepProgress(selectedPizza) {
  return `
    <div class="product-detail-head">
      <div class="product-detail-head__image"><img src="${selectedPizza.image}" alt="${selectedPizza.name}" loading="eager" decoding="async" onerror="this.onerror=null;this.src='assets/img/cardapio/placeholder.webp'"></div>
      <div>
        <strong>${selectedPizza.name}</strong>
        <span>${formatBRL(calculatePizzaPrice())}</span>
        <p>${selectedPizza.description}</p>
      </div>
    </div>
    <div class="product-search">
      <span>⌕</span>
      <input type="search" placeholder="Pesquise pelo nome" aria-label="Pesquisar no produto" />
    </div>
    <div class="pizza-progress">
      ${pizzaSteps
        .map((step, origIndex) => ({ step, origIndex }))
        .filter(({ step }) => !(step.id === 'segunda-pizza' && pizzaSelection.mode === 'inteira'))
        .map(
          ({ step, origIndex }) => {
            const isActive = origIndex === pizzaSelection.step;
            const isDone = origIndex < pizzaSelection.step;
            const label = getStepShortLabel(step.id);
            return `
              <div class="pizza-progress__step ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}" title="${step.title}">
                <span class="step-indicator">
                  ${isDone ? `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ` : ''}
                </span>
                ${isActive ? `<span class="step-label">${label}</span>` : ''}
              </div>
            `;
          }
        )
        .join('')}
    </div>
  `;
}

function renderCurrentPizzaStep() {
  const stepId = pizzaSteps[pizzaSelection.step].id;

  if (stepId === 'tamanho') {
    return `
      ${renderChoiceSectionHeader('TAMANHO DA PIZZA', 'Escolha 1 item', true)}
      <div class="choice-grid">
        ${pizzaSizes.map((size) => renderOptionCard({
          active: pizzaSelection.sizeId === size.id,
          attribute: `data-pizza-size="${size.id}"`,
          title: size.label,
          detail: size.detail,
          price: size.extra ? `+ ${formatBRL(size.extra)}` : 'Base'
        })).join('')}
      </div>
    `;
  }

  if (stepId === 'primeira-pizza') {
    const popularIds = ['calabresa-premium', 'frango-catupiry', 'quatro-queijos', 'portuguesa'];
    const popularFlavors = pizzaFlavors.filter(flavor => popularIds.includes(flavor.id));
    const query = (pizzaSelection.searchQuery || '').toLowerCase().trim();

    return `
      ${renderChoiceSectionHeader('FORMATO DA PIZZA', 'Escolha 1 item', true)}
      <div class="choice-grid choice-grid--compact" style="margin-bottom: 20px;">
        ${renderOptionCard({
          active: pizzaSelection.mode === 'inteira',
          attribute: 'data-pizza-mode="inteira"',
          title: 'Pizza inteira',
          detail: 'Sabor único por toda a pizza'
        })}
        ${renderOptionCard({
          active: pizzaSelection.mode === 'metade',
          attribute: 'data-pizza-mode="metade"',
          title: 'Meia a meia',
          detail: 'Dividida em 2 sabores diferentes'
        })}
      </div>

      <div class="flavor-search-container" style="margin-bottom: 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Pesquise pelo sabor..." class="flavor-search-input" id="flavor-search" value="${pizzaSelection.searchQuery || ''}">
      </div>

      <div class="popular-flavors-header" style="display: ${query ? 'none' : 'block'};">
        ${renderChoiceSectionHeader('SABORES MAIS PEDIDOS', 'Os queridinhos do público', false)}
      </div>
      <div class="popular-flavors-container" style="display: ${query ? 'none' : 'block'}; margin-bottom: 20px;">
        <div class="popular-flavors-carousel">
          ${popularFlavors.map(flavor => renderPopularFlavorCard(flavor, 'first')).join('')}
        </div>
      </div>

      ${renderChoiceSectionHeader('TODOS OS SABORES', pizzaSelection.mode === 'metade' ? 'Escolha 1 Sabor para pizza' : 'Escolha o sabor da pizza inteira', true, 'Selecionado')}
      <div class="choice-list">
        ${pizzaFlavors.map((flavor) => {
          const isSelectedFirst = pizzaSelection.firstFlavorId === flavor.id;
          const isSelectedSecond = pizzaSelection.secondFlavorId === flavor.id;
          let badgeText = '';
          if (isSelectedFirst && isSelectedSecond) {
            badgeText = '1º e 2º Sabor';
          } else if (isSelectedFirst) {
            badgeText = pizzaSelection.mode === 'metade' ? '1º Sabor' : 'Confirmado';
          }
          const isMatch = !query || flavor.name.toLowerCase().includes(query) || flavor.description.toLowerCase().includes(query);
          return renderProductRow({
            active: isSelectedFirst,
            attribute: `data-flavor-role="first" data-flavor-id="${flavor.id}"`,
            image: flavor.image,
            title: flavor.name.toUpperCase(),
            detail: flavor.description,
            meta: `A partir de ${formatBRL(flavor.price)}`,
            badge: badgeText,
            style: isMatch ? '' : 'display: none;'
          });
        }).join('')}
      </div>
    `;
  }

  if (stepId === 'segunda-pizza') {
    const popularIds = ['calabresa-premium', 'frango-catupiry', 'quatro-queijos', 'portuguesa'];
    const popularFlavors = pizzaFlavors.filter(flavor => popularIds.includes(flavor.id));
    const query = (pizzaSelection.searchQuery || '').toLowerCase().trim();

    return `
      <div class="flavor-search-container" style="margin-bottom: 20px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <input type="text" placeholder="Pesquise pelo sabor..." class="flavor-search-input" id="flavor-search" value="${pizzaSelection.searchQuery || ''}">
      </div>

      <div class="popular-flavors-header" style="display: ${query ? 'none' : 'block'};">
        ${renderChoiceSectionHeader('SABORES MAIS PEDIDOS', 'Os queridinhos do público', false)}
      </div>
      <div class="popular-flavors-container" style="display: ${query ? 'none' : 'block'}; margin-bottom: 20px;">
        <div class="popular-flavors-carousel">
          ${popularFlavors.map(flavor => renderPopularFlavorCard(flavor, 'second')).join('')}
        </div>
      </div>

      ${renderChoiceSectionHeader('TODOS OS SABORES', pizzaSelection.mode === 'metade' ? 'Escolha 1 Sabor para pizza' : 'Opcional para pizza inteira', pizzaSelection.mode === 'metade', pizzaSelection.secondFlavorId ? 'Selecionado' : '')}
      <div class="choice-list">
        ${pizzaFlavors.map((flavor) => {
          const isSelectedFirst = pizzaSelection.firstFlavorId === flavor.id;
          const isSelectedSecond = pizzaSelection.secondFlavorId === flavor.id;
          let badgeText = '';
          if (isSelectedFirst && isSelectedSecond) {
            badgeText = '1º e 2º Sabor';
          } else if (isSelectedSecond) {
            badgeText = '2º Sabor';
          } else if (isSelectedFirst) {
            badgeText = '1º Sabor';
          }
          const isMatch = !query || flavor.name.toLowerCase().includes(query) || flavor.description.toLowerCase().includes(query);
          return renderProductRow({
            active: isSelectedSecond,
            attribute: `data-flavor-role="second" data-flavor-id="${flavor.id}"`,
            image: flavor.image,
            title: flavor.name.toUpperCase(),
            detail: flavor.description,
            meta: `A partir de ${formatBRL(flavor.price)}`,
            badge: badgeText,
            style: isMatch ? '' : 'display: none;'
          });
        }).join('')}
      </div>
    `;
  }

  if (stepId === 'borda') {
    return `
      ${renderChoiceSectionHeader('BORDA DA PIZZA', 'Escolha 1 item', true)}
      <div class="choice-grid">
        ${borderOptions.map((border) => renderOptionCard({
          active: pizzaSelection.borderId === border.id,
          attribute: `data-pizza-border="${border.id}"`,
          title: border.label,
          detail: border.detail,
          price: border.price ? `+ ${formatBRL(border.price)}` : 'Sem custo'
        })).join('')}
      </div>
    `;
  }

  if (stepId === 'bebida') {
    return `
      ${renderChoiceSectionHeader('SUA BEBIDA', 'Escolha 1 item', true)}
      <div class="choice-list">
        ${drinkOptions.map((drink) => renderProductRow({
          active: pizzaSelection.drinkId === drink.id,
          attribute: `data-pizza-drink="${drink.id}"`,
          image: drink.image,
          title: drink.label,
          detail: drink.detail,
          meta: drink.price ? `+ ${formatBRL(drink.price)}` : 'Sem custo'
        })).join('')}
      </div>
    `;
  }

  if (stepId === 'sache') {
    return `
      ${renderChoiceSectionHeader('DESEJA SACHÊ?', 'Escolha 1 item', true)}
      <div class="choice-list">
        ${sachetOptions.map((sachet) => renderProductRow({
          active: pizzaSelection.sachetId === sachet.id,
          attribute: `data-pizza-sachet="${sachet.id}"`,
          image: sachet.image,
          title: sachet.label.toUpperCase(),
          detail: sachet.detail,
          meta: sachet.price ? `+ ${formatBRL(sachet.price)}` : 'Sem custo'
        })).join('')}
      </div>
    `;
  }

  if (stepId === 'adicionais') {
    return `
      ${renderChoiceSectionHeader('ADICIONAIS', 'Escolha se quiser', false)}
      <div class="choice-grid">
        ${extraOptions.map((extra) => renderOptionCard({
          active: pizzaSelection.extraIds.includes(extra.id),
          attribute: `data-pizza-extra="${extra.id}"`,
          title: extra.label,
          detail: extra.detail,
          price: extra.price ? `+ ${formatBRL(extra.price)}` : 'Sem custo'
        })).join('')}
      </div>
    `;
  }

  if (stepId === 'observacoes') {
    return `
      ${renderChoiceSectionHeader('OBSERVAÇÕES', 'Opcional', false)}
      <label class="pizza-notes">
        <span>Algum comentário?</span>
        <textarea data-pizza-notes maxlength="140" rows="5" placeholder="Ex: tirar cebola, caprichar no queijo, cortar em mais fatias...">${pizzaSelection.notes}</textarea>
      </label>
    `;
  }

  return `
    <div class="pizza-review">
      <strong>Resumo antes do carrinho</strong>
      <p>${buildPizzaSummaryText(
        getFlavorById(pizzaSelection.firstFlavorId),
        getFlavorById(pizzaSelection.secondFlavorId),
        pizzaSizes.find((size) => size.id === pizzaSelection.sizeId),
        borderOptions.find((border) => border.id === pizzaSelection.borderId),
        extraOptions.filter((extra) => pizzaSelection.extraIds.includes(extra.id)),
        drinkOptions.find((drink) => drink.id === pizzaSelection.drinkId),
        sachetOptions.find((sachet) => sachet.id === pizzaSelection.sachetId)
      )}</p>
      <span>Se quiser trocar algo, toque em Voltar. Se estiver tudo certo, adicione ao carrinho.</span>
    </div>
  `;
}

function renderChoiceSectionHeader(title, helper, required, badge = '') {
  return `
    <div class="choice-section-head">
      <div>
        <strong>${title}</strong>
        <span>${helper}</span>
      </div>
      ${badge ? `<em>${badge}</em>` : required ? '<em class="is-required">Obrigatório</em>' : ''}
    </div>
  `;
}

function renderOptionCard({ active, attribute, title, detail, price = '' }) {
  return `
    <button class="choice-card ${active ? 'is-active' : ''}" type="button" ${attribute}>
      <strong>${title}</strong>
      <span>${detail}</span>
      ${price ? `<em>${price}</em>` : ''}
    </button>
  `;
}

function renderProductRow({ active, attribute, image, title, detail, meta = '', badge = '', style = '' }) {
  return `
    <button class="product-option ${active ? 'is-active' : ''}" type="button" ${attribute} style="${style}">
      <span class="product-option__image"><img src="${image}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/cardapio/placeholder.webp'"></span>
      <span class="product-option__body">
        <strong>${title}</strong>
        <span>${detail}</span>
        ${meta ? `<em>${meta}</em>` : ''}
        ${badge ? `<span class="product-option__badge">${badge}</span>` : ''}
      </span>
      <span class="product-option__radio" aria-hidden="true"></span>
    </button>
  `;
}

function renderPopularFlavorCard(flavor, role) {
  const isSelected = (role === 'first' && pizzaSelection.firstFlavorId === flavor.id) ||
                     (role === 'second' && pizzaSelection.secondFlavorId === flavor.id);
  
  return `
    <button class="popular-flavor-card ${isSelected ? 'is-selected' : ''}" type="button" data-flavor-role="${role}" data-flavor-id="${flavor.id}">
      <span class="popular-flavor-card__image-container">
        <span class="popular-flavor-card__image"><img src="${flavor.image}" alt="${flavor.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/cardapio/placeholder.webp'"></span>
        <span class="popular-flavor-card__add-btn ${isSelected ? 'is-active' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            ${isSelected 
              ? '<polyline points="20 6 9 17 4 12"></polyline>' 
              : '<line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>'}
          </svg>
        </span>
      </span>
      <span class="popular-flavor-card__info">
        <strong>${flavor.name}</strong>
        <span>${formatBRL(flavor.price)}</span>
      </span>
    </button>
  `;
}

function calculatePizzaPrice() {
  const firstFlavor = getFlavorById(pizzaSelection.firstFlavorId);
  const secondFlavor = getFlavorById(pizzaSelection.secondFlavorId);
  const basePrice = pizzaSelection.mode === 'metade' && secondFlavor
    ? Math.max(firstFlavor ? firstFlavor.price : 0, secondFlavor.price)
    : firstFlavor ? firstFlavor.price : 0;
  const size = pizzaSizes.find((item) => item.id === pizzaSelection.sizeId);
  const border = borderOptions.find((item) => item.id === pizzaSelection.borderId);
  const drink = drinkOptions.find((item) => item.id === pizzaSelection.drinkId);
  const extrasTotal = extraOptions
    .filter((extra) => pizzaSelection.extraIds.includes(extra.id))
    .reduce((total, extra) => total + extra.price, 0);

  return basePrice + (size ? size.extra : 0) + (border ? border.price : 0) + (drink ? drink.price : 0) + extrasTotal;
}

function buildPizzaSummaryText(firstFlavor, secondFlavor, size, border, extras, drink, sachet) {
  const lines = [];

  // Tamanho e sabores
  const sizeLabel = size ? size.label : 'Tamanho';
  if (pizzaSelection.mode === 'inteira') {
    lines.push(`<strong>Sabor:</strong> ${firstFlavor ? firstFlavor.name : 'não escolhido'} 1x (${sizeLabel})`);
  } else {
    lines.push(`<strong>1° Sabor Metade:</strong> ${firstFlavor ? firstFlavor.name : '---'} 1x  |  <strong>2° Sabor Metade:</strong> ${secondFlavor ? secondFlavor.name : '---'} 1x (${sizeLabel})`);
  }

  // Borda
  if (border && border.id !== 'sem-borda') {
    lines.push(`<strong>Borda:</strong> ${border.label} 1x`);
  }

  // Bebida
  if (drink && drink.id !== 'sem-bebida') {
    lines.push(`<strong>Bebida:</strong> ${drink.label} Qtd: 1x`);
  }

  // Sachê
  if (sachet && sachet.id !== 'sem-sache') {
    lines.push(`<strong>Sachê:</strong> ${sachet.label} Qtd: 1x`);
  }

  // Adicionais
  if (extras && extras.length > 0) {
    lines.push(`<strong>Adicionais:</strong> ${extras.map((extra) => extra.label).join(', ')} 1x`);
  }

  return lines.join('<br>');
}

function handlePizzaStepContinue() {
  const stepId = pizzaSteps[pizzaSelection.step].id;

  if (stepId === 'segunda-pizza' && pizzaSelection.mode === 'metade' && !pizzaSelection.secondFlavorId) {
    window.alert('Escolha o segundo sabor para a pizza meia a meia.');
    return;
  }

  pizzaSelection.searchQuery = '';

  if (pizzaSelection.step < pizzaSteps.length - 1) {
    pizzaSelection.step += 1;
    if (pizzaSelection.step === 2 && pizzaSelection.mode === 'inteira') {
      pizzaSelection.step = 3;
    }
    renderPizzaModal();
    return;
  }

  confirmPizzaSelection();
}

let cart = [];
try {
  const savedCart = localStorage.getItem('premium_pizzaria_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
} catch (e) {
  console.error('Erro ao ler o carrinho do localStorage:', e);
}

// Demo seed: na primeira visita popula o carrinho com itens variados pra
// o site abrir parecendo uma pizzaria ja operando. Roda so uma vez (flag).
function buildDemoCartItem(menuId, sizeId) {
  const base = menu.find((m) => m.id === menuId);
  const size = pizzaSizes.find((s) => s.id === sizeId) || pizzaSizes[0];
  if (!base) return null;
  const noBorder = borderOptions.find((b) => b.id === 'sem-borda') || { id: 'sem-borda', label: 'Sem borda', price: 0 };
  const noDrink = drinkOptions.find((d) => d.id === 'sem-bebida') || { id: 'sem-bebida', label: 'Não quero bebida', price: 0 };
  const noSachet = sachetOptions.find((s) => s.id === 'sem-sache') || { id: 'sem-sache', label: 'Não quero sachê', price: 0 };
  const price = base.price + (size ? size.extra : 0);
  return {
    id: 'pizza_demo_' + menuId + '_' + sizeId,
    itemId: menuId,
    type: 'pizza',
    name: `${size.label} ${base.name}`,
    price,
    quantity: 1,
    image: base.image,
    details: {
      size,
      mode: 'inteira',
      firstFlavor: base,
      secondFlavor: null,
      border: noBorder,
      extras: [],
      drink: noDrink,
      sachet: noSachet,
      notes: '',
      optionsSummary: [`Tamanho: ${size.label}`, 'Formato: Inteira', `Borda: ${noBorder.label}`]
    }
  };
}

function seedDemoCart() {
  if (localStorage.getItem('premium_pizzaria_demo_seeded') === '1') return;
  // 3 classicas + 1 doce + 1 regional, tamanhos misturados
  const seeds = [
    ['cla-margherita', 'media'],
    ['cla-calabresa', 'grande'],
    ['cla-pepperoni', 'pequena'],
    ['doc-romeu-julieta', 'media'],
    ['reg-carne-sol-coalho', 'grande']
  ];
  const items = seeds.map(([id, sz]) => buildDemoCartItem(id, sz)).filter(Boolean);
  if (items.length && cart.length === 0) {
    cart = items;
    localStorage.setItem('premium_pizzaria_cart', JSON.stringify(cart));
  }
  localStorage.setItem('premium_pizzaria_demo_seeded', '1');
}
seedDemoCart();

function confirmPizzaSelection() {
  if (!pizzaSelection.firstFlavorId) {
    window.alert('Selecione pelo menos um sabor.');
    return;
  }

  const basePizza = menu.find((item) => item.id === pizzaSelection.itemId);
  const firstFlavor = getFlavorById(pizzaSelection.firstFlavorId);
  const secondFlavor = getFlavorById(pizzaSelection.secondFlavorId);
  const selectedSize = pizzaSizes.find((size) => size.id === pizzaSelection.sizeId);
  const selectedBorder = borderOptions.find((border) => border.id === pizzaSelection.borderId);
  const selectedExtras = extraOptions.filter((extra) => pizzaSelection.extraIds.includes(extra.id));
  const selectedDrink = drinkOptions.find((drink) => drink.id === pizzaSelection.drinkId);
  const selectedSachet = sachetOptions.find((sachet) => sachet.id === pizzaSelection.sachetId);

  if (!basePizza || !firstFlavor) {
    window.alert('Não foi possível montar a pizza. Tente novamente.');
    return;
  }

  if (pizzaSelection.mode === 'metade' && !secondFlavor) {
    window.alert('Selecione o segundo sabor para a pizza metade/metade.');
    return;
  }

  const customLabel = pizzaSelection.mode === 'inteira'
    ? `${selectedSize.label} ${firstFlavor.name}`
    : `${selectedSize.label} ${firstFlavor.name} / ${secondFlavor.name}`;

  const pizzaPrice = calculatePizzaPrice();

  const options = [
    `Tamanho: ${selectedSize.label}`,
    `Formato: ${pizzaSelection.mode === 'inteira' ? 'Inteira' : 'Meio a Meio'}`,
    `Borda: ${selectedBorder.label}`,
    selectedDrink && selectedDrink.id !== 'none' ? `Bebida: ${selectedDrink.label}` : null,
    selectedSachet && selectedSachet.id !== 'none' ? `Sachê: ${selectedSachet.label}` : null,
    selectedExtras.length ? `Adicionais: ${selectedExtras.map((extra) => extra.label).join(', ')}` : null,
    pizzaSelection.notes ? `Observações: ${pizzaSelection.notes}` : null
  ].filter(Boolean);

  // Add customized pizza to cart
  cart.push({
    id: 'pizza_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    itemId: pizzaSelection.itemId,
    type: 'pizza',
    name: customLabel,
    price: pizzaPrice,
    quantity: 1,
    image: basePizza.image,
    details: {
      size: selectedSize,
      mode: pizzaSelection.mode,
      firstFlavor,
      secondFlavor,
      border: selectedBorder,
      extras: selectedExtras,
      drink: selectedDrink,
      sachet: selectedSachet,
      notes: pizzaSelection.notes,
      optionsSummary: options
    }
  });

  showToast(`Pizza adicionada ao pedido! 😉`);
  closePizzaModal();
  updateFloatingCartBar();
  renderCart();
  openCartDrawer();
}

document.querySelectorAll('[data-close-pizza-modal]').forEach((button) => {
  button.addEventListener('click', closePizzaModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && pizzaModal.classList.contains('is-open')) {
    closePizzaModal();
  }
});

function renderCombosCarousel() {
  const track = document.getElementById('combos-carousel-track');
  const dotsContainer = document.getElementById('combos-carousel-dots');
  if (!track) return;

  const combos = menu.filter((item) => item.type === 'combo');
  
  track.innerHTML = combos
    .map((combo) => {
      return `
        <div class="carousel-slide" data-combo-id="${combo.id}">
          <div class="combo-slide-card">
            <div class="combo-slide-card__image-container">
              <div class="combo-slide-card__image"><img src="${combo.image}" alt="${combo.name}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/img/cardapio/placeholder.webp'"></div>
              <span class="combo-slide-card__tag">🔥 MAIS PEDIDO</span>
            </div>
            <div class="combo-slide-card__content">
              <h3>${combo.name}</h3>
              <p>${combo.description}</p>
              <div class="combo-slide-card__footer">
                <span class="combo-slide-card__price">${formatBRL(combo.price)}</span>
                <div class="combo-slide-card__buttons">
                  <button class="button button--whatsapp-quick" type="button" data-whatsapp-combo="${combo.id}" title="Pedir agora no WhatsApp">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="13" height="13" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
                    <span>Pedir</span>
                  </button>
                  <button class="button button--add-combo" type="button" data-add-combo="${combo.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    <span>Carrinho</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  // Render dots
  if (dotsContainer) {
    dotsContainer.innerHTML = combos
      .map((_, index) => `<span class="carousel-dot ${index === 0 ? 'is-active' : ''}" data-slide-index="${index}"></span>`)
      .join('');
  }

  // Setup carousel scrolling logic
  const prevBtn = document.querySelector('.carousel-nav--prev');
  const nextBtn = document.querySelector('.carousel-nav--next');
  
  if (prevBtn && nextBtn) {
    const getScrollParameters = () => {
      const slide = track.firstElementChild;
      const cardWidth = slide ? slide.offsetWidth : 0;
      const gap = parseFloat(window.getComputedStyle(track).gap) || 16;
      return { cardWidth, gap };
    };

    const updateNavigation = () => {
      const { cardWidth, gap } = getScrollParameters();
      if (cardWidth === 0) return;
      const scrollLeft = track.scrollLeft;
      const activeIndex = Math.round(scrollLeft / (cardWidth + gap));
      
      // Update dots
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
          if (idx === activeIndex) {
            dot.classList.add('is-active');
          } else {
            dot.classList.remove('is-active');
          }
        });
      }
    };

    track.addEventListener('scroll', updateNavigation);

    prevBtn.addEventListener('click', () => {
      const { cardWidth, gap } = getScrollParameters();
      track.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const { cardWidth, gap } = getScrollParameters();
      track.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
    });

    // Clicking dots to scroll
    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          const index = parseInt(dot.dataset.slideIndex, 10);
          const { cardWidth, gap } = getScrollParameters();
          track.scrollTo({ left: (cardWidth + gap) * index, behavior: 'smooth' });
        });
      });
    }

    // Auto scroll every 6 seconds
    let autoPlayInterval = setInterval(() => {
      const { cardWidth, gap } = getScrollParameters();
      if (cardWidth === 0) return;
      const scrollLeft = track.scrollLeft;
      const maxScroll = track.scrollWidth - track.clientWidth;
      
      if (scrollLeft >= maxScroll - 5) {
        // Go back to start
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }
    }, 6000);

    // Pause autoplay on mouse/touch interaction
    const pauseAutoplay = () => {
      clearInterval(autoPlayInterval);
    };
    track.addEventListener('touchstart', pauseAutoplay, { passive: true });
    track.addEventListener('mousedown', pauseAutoplay);
  }

  // Setup click listeners inside carousel
  track.querySelectorAll('[data-add-combo]').forEach((button) => {
    button.addEventListener('click', () => {
      const comboId = button.dataset.addCombo;
      const combo = menu.find((item) => item.id === comboId);
      if (combo) {
        addSimpleItemToCart(combo);
      }
    });
  });

  track.querySelectorAll('[data-whatsapp-combo]').forEach((button) => {
    button.addEventListener('click', () => {
      const comboId = button.dataset.whatsappCombo;
      const combo = menu.find((item) => item.id === comboId);
      if (combo) {
        addSimpleItemToCart(combo);
        openCartDrawer();
      }
    });
  });
}

/* ==========================================
   CARRINHO & CHECKOUT SCRIPT LOGIC
   ========================================== */

// DOM Cart elements
const cartDrawer = document.getElementById('cart-drawer');
const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
const cartDrawerClose = document.getElementById('cart-drawer-close');
const cartClearBtn = document.getElementById('cart-clear-btn');
const cartItemsList = document.getElementById('cart-items-list');
const crossSellCarousel = document.getElementById('cross-sell-carousel');
const cartAddMoreProducts = document.getElementById('cart-add-more-products');
const cartNextBtn1 = document.getElementById('cart-next-btn-1');
const cartTotalPrice = document.getElementById('cart-total-price');

const cartBackToItems = document.getElementById('cart-back-to-items');
const checkoutPhone = document.getElementById('checkout-phone');
const checkoutName = document.getElementById('checkout-name');
const cartNextBtn2 = document.getElementById('cart-next-btn-2');

const cartBackToAuth = document.getElementById('cart-back-to-auth');
const deliveryTypeDelivery = document.getElementById('delivery-type-delivery');
const deliveryTypePickup = document.getElementById('delivery-type-pickup');
const addressFields = document.getElementById('address-fields');
const checkoutStreet = document.getElementById('checkout-street');
const checkoutNeighborhood = document.getElementById('checkout-neighborhood');
const checkoutRef = document.getElementById('checkout-ref');
const checkoutPayment = document.getElementById('checkout-payment');
const changeField = document.getElementById('change-field');
const checkoutChange = document.getElementById('checkout-change');
const checkoutObs = document.getElementById('checkout-obs');
const cartNextBtn3 = document.getElementById('cart-next-btn-3');

// Summary elements
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryDeliveryFee = document.getElementById('summary-delivery-fee');
const summaryDeliveryRow = document.getElementById('summary-delivery-row');
const summaryTotal = document.getElementById('summary-total');

const cartBackToDelivery = document.getElementById('cart-back-to-delivery');
const btnConfirmPaymentWhatsapp = document.getElementById('btn-confirm-payment-whatsapp');
const btnCopyPix = document.getElementById('btn-copy-pix');
const btnPayMp = document.getElementById('btn-pay-mp');

const successWhatsappRetry = document.getElementById('success-whatsapp-retry');
const successCloseBtn = document.getElementById('success-close-btn');

const floatingCartBar = document.getElementById('floating-cart-bar');
const floatingCartCount = document.getElementById('floating-cart-count');
const floatingCartTotal = document.getElementById('floating-cart-total');

let deliveryType = 'delivery';
let lastOrderMessage = '';

// Toast notification function with happy emoji
function showToast(message) {
  // Remove existing toasts first to prevent stacking visually
  document.querySelectorAll('.toast-alert').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'toast-alert';
  toast.innerHTML = `
    <span class="toast-alert__emoji">😉</span>
    <span class="toast-alert__text">${message}</span>
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('is-visible');
  }, 50);

  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2800);
}

function addSimpleItemToCart(item) {
  const existing = cart.find(c => c.itemId === item.id && c.type === 'simple');
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: 'simple_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      type: 'simple',
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image
    });
  }
  
  showToast(`Adicionado ao pedido! 😉`);
  updateFloatingCartBar();
  renderCart();
}

function updateCartItemQty(cartItemId, amount) {
  const item = cart.find(c => c.id === cartItemId);
  if (!item) return;
  item.quantity += amount;
  if (item.quantity <= 0) {
    cart = cart.filter(c => c.id !== cartItemId);
  }
  renderCart();
  updateFloatingCartBar();
}

function removeFromCart(cartItemId) {
  cart = cart.filter(c => c.id !== cartItemId);
  renderCart();
  updateFloatingCartBar();
  showToast("Item removido! 😉");
}

function clearCart() {
  if (window.confirm("Deseja realmente limpar seu carrinho?")) {
    cart = [];
    renderCart();
    updateFloatingCartBar();
    closeCartDrawer();
    showToast("Carrinho limpo! 😉");
  }
}

function updateFloatingCartBar() {
  if (!floatingCartBar) return;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (totalItems > 0) {
    floatingCartBar.style.display = 'flex';
    floatingCartCount.textContent = `Ver Carrinho (${totalItems} ${totalItems === 1 ? 'item' : 'itens'})`;
    floatingCartTotal.textContent = formatBRL(totalPrice);
    document.body.classList.add('has-cart-items');
  } else {
    floatingCartBar.style.display = 'none';
    document.body.classList.remove('has-cart-items');
  }
}

function openCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  if (typeof rotateNudgePhrase === 'function') rotateNudgePhrase();
  navigateCartStep('cart-step-items');
  renderCart();
}

function closeCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function navigateCartStep(stepId) {
  // Atalho para contas logadas: pré-preenche o "Identifique-se" e avança direto
  if (stepId === 'cart-step-auth' && typeof getCurrentAccount === 'function') {
    const acc = getCurrentAccount();
    if (acc && acc.name && acc.phone) {
      if (checkoutName) checkoutName.value = acc.name;
      if (checkoutPhone) checkoutPhone.value = formatPhoneInput(acc.phone);
      if (typeof handleAuthFormInputs === 'function') handleAuthFormInputs();
      stepId = 'cart-step-delivery';
    } else {
      trackEvent('guest_checkout_started');
    }
  }
  document.querySelectorAll('.cart-step').forEach(step => {
    step.classList.remove('is-active');
  });
  const target = document.getElementById(stepId);
  if (target) target.classList.add('is-active');
  if (stepId === 'cart-step-delivery' && typeof refreshCheckoutCoupons === 'function') {
    refreshCheckoutCoupons();
    if (typeof renderSavedAddressesSelector === 'function') renderSavedAddressesSelector();
  }
}

function renderCart() {
  try {
    localStorage.setItem('premium_pizzaria_cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Erro ao salvar o carrinho no localStorage:', e);
  }

  if (typeof updateAppbarCartBadge === 'function') updateAppbarCartBadge();

  if (!cartItemsList) return;
  
  if (cart.length === 0) {
    cartItemsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: rgba(36, 19, 15, 0.5);">
        <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🛒</span>
        <strong style="display: block; font-weight: 800; font-size: 1.05rem; margin-bottom: 4px;">Seu carrinho está vazio</strong>
        <p style="font-size: 0.82rem; margin: 0; line-height: 1.4;">Escolha pizzas ou bebidas no cardápio acima para adicionar aqui.</p>
      </div>
    `;
    cartNextBtn1.disabled = true;
    cartTotalPrice.textContent = formatBRL(0);
    return;
  }
  
  cartNextBtn1.disabled = false;
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cartTotalPrice.textContent = formatBRL(total);
  
  cartItemsList.innerHTML = cart.map(item => {
    let desc = '';
    if (item.type === 'pizza' && item.details) {
      desc = item.details.optionsSummary.map(opt => `<span style="display:block; margin-top:2px;">• ${opt}</span>`).join('');
    } else {
      const menuItem = menu.find(m => m.id === item.itemId);
      desc = menuItem ? menuItem.description : '';
    }
    
    return `
      <div class="cart-item-card" data-id="${item.id}">
        <img class="cart-item-card__img" src="${item.image || 'assets/img/default-pizza.jpg'}" alt="${item.name}">
        <div class="cart-item-card__info">
          <h4 class="cart-item-card__title">${item.quantity}x ${item.name}</h4>
          <strong class="cart-item-card__price">${formatBRL(item.price * item.quantity)}</strong>
          <p class="cart-item-card__desc">${desc}</p>
          
          <div class="cart-item-card__qty-control">
            <button class="cart-item-card__qty-btn" type="button" onclick="updateCartItemQty('${item.id}', -1)">-</button>
            <span class="cart-item-card__qty-val">${item.quantity}</span>
            <button class="cart-item-card__qty-btn" type="button" onclick="updateCartItemQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-card__remove" type="button" onclick="removeFromCart('${item.id}')" aria-label="Remover">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  }).join('');
  
  renderCrossSell();
  if (typeof renderSweetRecommendation === 'function') renderSweetRecommendation();
}

function renderCrossSell() {
  if (!crossSellCarousel) return;
  const drinks = menu.filter(item => item.category === 'bebidas');
  
  crossSellCarousel.innerHTML = drinks.map(drink => {
    return `
      <div class="cross-sell-item">
        <div class="cross-sell-item__img-wrapper">
          <img class="cross-sell-item__img" src="${drink.image}" alt="${drink.name}">
          <button class="cross-sell-item__add" type="button" onclick="addDrinkFromCrossSell('${drink.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        </div>
        <span class="cross-sell-item__name">${drink.name}</span>
        <strong class="cross-sell-item__price">${formatBRL(drink.price)}</strong>
      </div>
    `;
  }).join('');
}

function addDrinkFromCrossSell(drinkId) {
  const drink = menu.find(m => m.id === drinkId);
  if (drink) {
    addSimpleItemToCart(drink);
  }
}

function checkSweetInCart() {
  return cart.some(item => {
    if (item.category === 'doces') return true;
    const nameLower = item.name.toLowerCase();
    return nameLower.includes('doce') || nameLower.includes('chocolate') || nameLower.includes('bombom');
  });
}

const sweetNudgePhrases = [
  "Hummm... Uma pizza salgada é maravilhosa, mas que tal uma pizzazinha doce de sobremesa para fechar? 🍕🍫",
  "Ei, vai querer uma pizzazinha doce para fechar com chave de ouro? Ou quem sabe um bombom de chocolate para adoçar? 🍬😋",
  "Comprou a pizza, mas bateu aquela vontade de um doce? Adicione um bombom ou uma pizza doce ao seu pedido! 🍫👨‍🍳",
  "Não saia sem a sobremesa! Que tal um bombom de chocolate cremoso para acompanhar essa pizza? 😍"
];

let selectedNudgePhrase = sweetNudgePhrases[0];

function rotateNudgePhrase() {
  const randIndex = Math.floor(Math.random() * sweetNudgePhrases.length);
  selectedNudgePhrase = sweetNudgePhrases[randIndex];
}

function renderSweetRecommendation() {
  const containerCart = document.getElementById('sweet-recommendation-cart');
  const containerCheckout = document.getElementById('sweet-recommendation-checkout');
  
  const hasSweet = checkSweetInCart();
  
  if (hasSweet || cart.length === 0) {
    if (containerCart) containerCart.style.display = 'none';
    if (containerCheckout) containerCheckout.style.display = 'none';
    return;
  }
  
  const htmlContent = `
    <div class="sweet-recommendation-card">
      <div class="sweet-recommendation-card__header">
        <div class="sweet-recommendation-card__avatar">👨‍🍳</div>
        <div class="sweet-recommendation-card__bubble">
          <p class="sweet-recommendation-card__text">${selectedNudgePhrase}</p>
        </div>
      </div>
      <div class="sweet-recommendation-card__actions">
        <button class="button--sweet-add" type="button" onclick="addSweetFromNudge('chocolate-morango')">
          <span>🍕 Pizza Doce</span>
          <strong>R$ 36</strong>
        </button>
        <button class="button--sweet-add" type="button" onclick="addSweetFromNudge('bombom-chocolate')">
          <span>🍬 Bombom</span>
          <strong>R$ 5</strong>
        </button>
      </div>
    </div>
  `;
  
  if (containerCart) {
    containerCart.innerHTML = htmlContent;
    containerCart.style.display = 'block';
  }
  if (containerCheckout) {
    containerCheckout.innerHTML = htmlContent;
    containerCheckout.style.display = 'block';
  }
}

function addSweetFromNudge(itemId) {
  const item = menu.find(m => m.id === itemId);
  if (!item) return;

  const existing = cart.find(c => c.itemId === item.id && c.type === 'simple');
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: 'simple_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      itemId: item.id,
      type: 'simple',
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      category: item.category
    });
  }

  showToast(`${item.name} adicionado! 🍫😋`);
  
  updateFloatingCartBar();
  renderCart();
  
  const paymentDetailsStep = document.getElementById('cart-step-payment-details');
  if (paymentDetailsStep && paymentDetailsStep.classList.contains('is-active')) {
    refreshPaymentDetailsScreen();
  }
}

function calcOrderDiscount(subtotal) {
  var sel = document.getElementById('cart-coupon-select');
  if (!sel || !sel.value) return 0;
  var code = sel.value;
  var promo = getActivePromoCoupons().find(function(c) { return c.code === code; });
  if (promo) return calcCouponDiscount(promo, subtotal);
  var acc = typeof getCurrentAccount === 'function' ? getCurrentAccount() : null;
  if (acc) {
    var loyalty = (acc.coupons || []).find(function(c) { return c.code === code && !c.used; });
    if (loyalty) return calcCouponDiscount(loyalty, subtotal);
  }
  return 0;
}

function refreshPaymentDetailsScreen() {
  const payment = checkoutPayment.value;
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = (deliveryType === 'delivery') ? DELIVERY_FEE : 0;
  const discount = calcOrderDiscount(subtotal);
  const cartTotal = subtotal + deliveryFee - discount;

  // Atualiza resumo no DOM
  if (summarySubtotal) summarySubtotal.textContent = formatBRL(subtotal);
  if (summaryDeliveryFee) summaryDeliveryFee.textContent = formatBRL(deliveryFee);
  if (summaryDeliveryRow) {
    summaryDeliveryRow.style.display = (deliveryType === 'delivery') ? 'flex' : 'none';
  }
  if (summaryTotal) summaryTotal.textContent = formatBRL(cartTotal);

  if (payment === 'pix') {
    document.getElementById('pix-payment-container').style.display = 'block';
    document.getElementById('mp-payment-container').style.display = 'none';

    // Gera txid único, monta payload Pix e renderiza QR local + timer de 15 min
    regeneratePixCode(cartTotal);
  } else if (payment === 'mercadopago') {
    document.getElementById('pix-payment-container').style.display = 'none';
    document.getElementById('mp-payment-container').style.display = 'block';

    // Configura o link do Mercado Pago com estado de carregamento
    const btnPayMp = document.getElementById('btn-pay-mp');
    if (btnPayMp) {
      btnPayMp.href = '#';
      btnPayMp.innerHTML = '<span>⏳ Gerando link de pagamento...</span>';
      btnPayMp.style.pointerEvents = 'none';
      btnPayMp.style.opacity = '0.7';

      getMPPreferenceUrl(cart, cartTotal).then(url => {
        btnPayMp.href = url;
        btnPayMp.innerHTML = '💳 Pagar com Mercado Pago';
        btnPayMp.style.pointerEvents = 'auto';
        btnPayMp.style.opacity = '1';
      });
    }
  }
}

// Input mask and validation
function formatPhoneInput(value) {
  if (!value) return value;
  const phone = value.replace(/\D/g, '');
  if (phone.length <= 2) return `(${phone}`;
  if (phone.length <= 7) return `(${phone.substring(0, 2)}) ${phone.substring(2)}`;
  return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`;
}

function handleAuthFormInputs() {
  const phoneVal = checkoutPhone.value.trim();
  const nameVal = checkoutName.value.trim();
  const rawPhone = phoneVal.replace(/\D/g, '');
  
  const isPhoneValid = rawPhone.length >= 10 && rawPhone.length <= 11;
  const isNameValid = nameVal.length >= 3;
  
  cartNextBtn2.disabled = !(isPhoneValid && isNameValid);
}

// Global functions mappings for template strings triggers
window.updateCartItemQty = updateCartItemQty;
window.removeFromCart = removeFromCart;
window.addDrinkFromCrossSell = addDrinkFromCrossSell;

// Setup cart listeners
if (cartDrawerClose) {
  cartDrawerClose.addEventListener('click', closeCartDrawer);
}
if (cartDrawerBackdrop) {
  cartDrawerBackdrop.addEventListener('click', closeCartDrawer);
}
if (cartClearBtn) {
  cartClearBtn.addEventListener('click', clearCart);
}
if (cartAddMoreProducts) {
  cartAddMoreProducts.addEventListener('click', closeCartDrawer);
}
if (floatingCartBar) {
  floatingCartBar.addEventListener('click', openCartDrawer);
}

// Next steps buttons
if (cartNextBtn1) {
  cartNextBtn1.addEventListener('click', () => {
    navigateCartStep('cart-step-auth');
  });
}
if (cartBackToItems) {
  cartBackToItems.addEventListener('click', () => {
    navigateCartStep('cart-step-items');
  });
}
if (cartNextBtn2) {
  cartNextBtn2.addEventListener('click', () => {
    navigateCartStep('cart-step-delivery');
  });
}
if (cartBackToAuth) {
  cartBackToAuth.addEventListener('click', () => {
    // Logado pula a tela "Identifique-se" — volta direto pros itens
    const acc = (typeof getCurrentAccount === 'function') ? getCurrentAccount() : null;
    if (acc && acc.name && acc.phone) {
      navigateCartStep('cart-step-items');
    } else {
      navigateCartStep('cart-step-auth');
    }
  });
}

if (checkoutPhone) {
  checkoutPhone.addEventListener('input', (e) => {
    e.target.value = formatPhoneInput(e.target.value);
    handleAuthFormInputs();
  });
}
if (checkoutName) {
  checkoutName.addEventListener('input', handleAuthFormInputs);
}

// Delivery Form actions
if (deliveryTypeDelivery) {
  deliveryTypeDelivery.addEventListener('click', () => {
    deliveryType = 'delivery';
    deliveryTypeDelivery.classList.add('is-active');
    deliveryTypePickup.classList.remove('is-active');
    if (addressFields) addressFields.style.display = 'block';
  });
}
if (deliveryTypePickup) {
  deliveryTypePickup.addEventListener('click', () => {
    deliveryType = 'pickup';
    deliveryTypePickup.classList.add('is-active');
    deliveryTypeDelivery.classList.remove('is-active');
    if (addressFields) addressFields.style.display = 'none';
  });
}
if (checkoutPayment) {
  checkoutPayment.addEventListener('change', () => {
    if (changeField) {
      if (checkoutPayment.value === 'dinheiro') {
        changeField.style.display = 'block';
      } else {
        changeField.style.display = 'none';
      }
    }
  });
}

// Payment method cards (radio visual) — atualiza o <select> escondido
document.querySelectorAll('.payment-card').forEach(card => {
  card.addEventListener('click', () => {
    const value = card.dataset.payment;
    if (!value || !checkoutPayment) return;
    document.querySelectorAll('.payment-card').forEach(c => {
      c.classList.remove('is-active');
      c.setAttribute('aria-checked', 'false');
    });
    card.classList.add('is-active');
    card.setAttribute('aria-checked', 'true');
    checkoutPayment.value = value;
    checkoutPayment.dispatchEvent(new Event('change', { bubbles: true }));
  });
});

// === Helpers de pedido / perfil / timeline ===
const ORDERS_STORAGE_KEY = 'premium_pizzaria_orders';
const CUSTOMER_PROFILE_KEY = 'premium_pizzaria_customer';
let pixTxId = null;
let pixExpiresAt = 0;
let pixTimerHandle = null;
let timelineTimerHandle = null;
let currentOrderId = null;
let orderPollingHandle = null;
let lastPolledStageIdx = -1;

function parseEstimatedMinutes(str) {
  if (!str) return 45;
  const s = String(str).toLowerCase();
  const range = s.match(/(\d+)\s*(?:a|-|até|to)\s*(\d+)/);
  if (range) {
    const a = parseInt(range[1], 10), b = parseInt(range[2], 10);
    if (!isNaN(a) && !isNaN(b)) return Math.round((a + b) / 2);
  }
  const horaMatch = s.match(/(\d+)\s*h/);
  if (horaMatch) return parseInt(horaMatch[1], 10) * 60;
  const single = s.match(/(\d+)/);
  if (single) return parseInt(single[1], 10);
  return 45;
}

function loadOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]'); }
  catch (e) { return []; }
}

function saveOrders(list) {
  try { localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list)); }
  catch (e) { console.error('Erro ao salvar pedidos:', e); }
}

function persistOrder(order) {
  const orders = loadOrders();
  // mantém últimos 50 pedidos
  orders.unshift(order);
  while (orders.length > 50) orders.pop();
  saveOrders(orders);
}

function getOrderById(id) {
  return loadOrders().find(o => o.id === id) || null;
}

function generateOrderId() {
  const n = (Date.now() % 100000).toString().padStart(5, '0');
  return `#${n}`;
}

function saveCustomerProfile(snapshot) {
  try {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify({
      ...snapshot,
      lastUsedAt: Date.now()
    }));
  } catch (e) { console.error('Erro ao salvar perfil:', e); }
}

function loadCustomerProfile() {
  try {
    const raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}

function clearCustomerProfile() {
  try { localStorage.removeItem(CUSTOMER_PROFILE_KEY); }
  catch (e) { /* ignore */ }
}

function restoreCustomerProfile() {
  const profile = loadCustomerProfile();
  const toggleLabel = document.getElementById('profile-clear-toggle');
  if (!profile) { if (toggleLabel) toggleLabel.style.display = 'none'; return; }
  if (toggleLabel) toggleLabel.style.display = 'flex';
  if (checkoutName && !checkoutName.value && profile.name) checkoutName.value = profile.name;
  if (checkoutPhone && !checkoutPhone.value && profile.phone) checkoutPhone.value = formatPhoneInput(profile.phone);
  if (profile.lastAddress) {
    if (checkoutStreet && !checkoutStreet.value && profile.lastAddress.street) checkoutStreet.value = profile.lastAddress.street;
    if (checkoutNeighborhood && !checkoutNeighborhood.value && profile.lastAddress.neighborhood) checkoutNeighborhood.value = profile.lastAddress.neighborhood;
    if (checkoutRef && !checkoutRef.value && profile.lastAddress.ref) checkoutRef.value = profile.lastAddress.ref;
  }
  if (checkoutPayment && profile.lastPayment) {
    const opt = Array.from(checkoutPayment.options).find(o => o.value === profile.lastPayment);
    if (opt) checkoutPayment.value = profile.lastPayment;
  }
  if (typeof handleAuthFormInputs === 'function') handleAuthFormInputs();
}

function formatPaymentLabel(payment, changeVal) {
  if (payment === 'pix') return 'Pix';
  if (payment === 'mercadopago') return 'Mercado Pago (Online)';
  if (payment === 'cartao') return 'Cartão (Máquina)';
  if (payment === 'dinheiro') return changeVal ? `Dinheiro (troco p/ ${changeVal})` : 'Dinheiro (sem troco)';
  return payment || '—';
}

function paymentIconFor(payment) {
  if (payment === 'pix') return '🔑';
  if (payment === 'mercadopago') return '💳';
  if (payment === 'cartao') return '💳';
  if (payment === 'dinheiro') return '💵';
  return '💳';
}

function renderReceipt(order) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('receipt-order-id', order.id);
  const d = new Date(order.createdAt);
  set('receipt-time', `Recebido às ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`);
  set('receipt-total', formatBRL(order.total));
  set('receipt-customer-name', order.customerName || '—');
  set('receipt-customer-phone', order.customerPhone || '—');
  set('receipt-payment-method', formatPaymentLabel(order.paymentMethod, order.changeFor));
  set('receipt-payment-icon', paymentIconFor(order.paymentMethod));
  if (order.deliveryType === 'delivery') {
    set('receipt-delivery-icon', '🛵');
    const addr = order.address ? `${order.address.street} · ${order.address.neighborhood}` : 'Entrega';
    set('receipt-delivery-info', `Entrega · ${addr} · ~${order.estimatedMinutes}min`);
  } else {
    set('receipt-delivery-icon', '🛍️');
    set('receipt-delivery-info', `Retirada no balcão · pronto em ~${order.estimatedMinutes}min`);
  }
  currentOrderId = order.id;
  renderOrderTimeline(order);
  if (timelineTimerHandle) clearInterval(timelineTimerHandle);
  timelineTimerHandle = setInterval(() => {
    const fresh = getOrderById(order.id) || order;
    renderOrderTimeline(fresh);
  }, 30000);
}

function buildTimelineStages(order) {
  const isDelivery = order.deliveryType === 'delivery';
  return [
    { key: 'received',  icon: '📥', label: 'Pedido recebido',                    pct: 0 },
    { key: 'preparing', icon: '🍕', label: 'Em preparo',                         pct: 30 },
    { key: 'ready',     icon: isDelivery ? '🛵' : '🛍️', label: isDelivery ? 'Saiu pra entrega' : 'Pronto para retirar', pct: 80 },
    { key: 'ontheway',  icon: isDelivery ? '📍' : '⏳', label: isDelivery ? 'A caminho' : 'Aguardando você retirar', pct: 100 },
    { key: 'delivered', icon: '🎉', label: isDelivery ? 'Entregue' : 'Retirado', pct: 100 }
  ];
}

function computeAutoStageIndex(order) {
  const elapsed = (Date.now() - order.createdAt) / 60000; // min
  const eta = order.estimatedMinutes || 45;
  const pct = (elapsed / eta) * 100;
  if (pct >= 100) return 4;
  if (pct >= 80)  return 3;
  if (pct >= 30)  return 2;
  if (pct >= 0)   return 1; // já entra Em preparo no instante 0
  return 0;
}

function renderOrderTimeline(order) {
  const el = document.getElementById('order-timeline');
  if (!el) return;
  const stages = buildTimelineStages(order);
  const autoIdx = computeAutoStageIndex(order);
  const start = order.createdAt;
  const eta = order.estimatedMinutes || 45;
  const html = stages.map((s, i) => {
    const stageTime = new Date(start + (eta * 60000 * (s.pct / 100)));
    const hh = stageTime.getHours().toString().padStart(2,'0');
    const mm = stageTime.getMinutes().toString().padStart(2,'0');
    let cls = 'timeline-stage';
    if (i < autoIdx) cls += ' is-done';
    else if (i === autoIdx) cls += ' is-current';
    else cls += ' is-pending';
    return `
      <div class="${cls}">
        <div class="timeline-stage__dot"><span>${s.icon}</span></div>
        <div class="timeline-stage__body">
          <strong>${s.label}</strong>
          <span>${i === 0 ? `às ${hh}:${mm}` : `~${hh}:${mm}`}</span>
        </div>
      </div>`;
  }).join('');
  el.innerHTML = html;
}

// ---------- Full‑screen "Pedido Recebido" page + order polling ----------
function showOrderReceivedPage(order) {
  const page = document.getElementById('pedido-recebido-page');
  if (!page) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('pr-order-id', order.id);
  const d = new Date(order.createdAt);
  set('pr-time', `Recebido às ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`);
  set('pr-total', formatBRL(order.total));
  set('pr-customer-name', order.customerName || '—');
  set('pr-customer-phone', order.customerPhone || '—');
  set('pr-payment-method', formatPaymentLabel(order.paymentMethod, order.changeFor));
  const iconEl = document.getElementById('pr-payment-icon');
  if (iconEl) iconEl.textContent = paymentIconFor(order.paymentMethod);
  if (order.deliveryType === 'delivery') {
    set('pr-delivery-icon', '🛵');
    const addr = order.address ? `${order.address.street} · ${order.address.neighborhood}` : 'Entrega';
    set('pr-delivery-info', `Entrega · ${addr} · ~${order.estimatedMinutes}min`);
  } else {
    set('pr-delivery-icon', '🛍️');
    set('pr-delivery-info', `Retirada no balcão · pronto em ~${order.estimatedMinutes}min`);
  }
  currentOrderId = order.id;
  renderTimelineOnPage(order);
  lastPolledStageIdx = orderStageIndex(order);
  page.setAttribute('aria-hidden', 'false');
  page.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  startOrderStatusPolling(order.id);
}

function renderTimelineOnPage(order) {
  const el = document.getElementById('pr-timeline');
  if (!el) return;
  const stages = buildTimelineStages(order);
  const stageIdx = orderStageIndex(order);
  const start = order.createdAt;
  const eta = order.estimatedMinutes || 45;
  el.innerHTML = stages.map((s, i) => {
    const stageTime = new Date(start + (eta * 60000 * (s.pct / 100)));
    const hh = stageTime.getHours().toString().padStart(2,'0');
    const mm = stageTime.getMinutes().toString().padStart(2,'0');
    let cls = 'timeline-stage';
    if (i < stageIdx) cls += ' is-done';
    else if (i === stageIdx) cls += ' is-current';
    else cls += ' is-pending';
    return `
      <div class="${cls}">
        <div class="timeline-stage__dot"><span>${s.icon}</span></div>
        <div class="timeline-stage__body">
          <strong>${s.label}</strong>
          <span>${i === 0 ? `às ${hh}:${mm}` : `~${hh}:${mm}`}</span>
        </div>
      </div>`;
  }).join('');
  updateStatusBadge(stageIdx);
}

function orderStageIndex(order) {
  const manual = order.statusManual || order.status || 'received';
  const stages = ['received','preparing','ready','ontheway','delivered'];
  const idx = stages.indexOf(manual);
  return idx >= 0 ? idx : 0;
}

function updateStatusBadge(stageIdx) {
  const badge = document.getElementById('pr-status-badge');
  const label = document.getElementById('pr-status-label');
  const icon = document.getElementById('pr-icon');
  if (!badge || !label) return;
  const icons = ['✅','🍕','🛵','📍','🎉'];
  const labels = ['Pedido recebido','Preparando seu pedido','Saiu para entrega','A caminho','Entregue! 🎉'];
  if (icon) icon.textContent = icons[stageIdx] || '✅';
  if (stageIdx >= 4) {
    badge.style.display = 'none';
    return;
  }
  badge.style.display = 'flex';
  label.textContent = labels[stageIdx] || 'Aguardando atualizações...';
}

function closeOrderReceivedPage() {
  stopOrderStatusPolling();
  const page = document.getElementById('pedido-recebido-page');
  if (page) {
    page.setAttribute('aria-hidden', 'true');
    page.style.display = 'none';
    document.body.style.overflow = '';
  }
  currentOrderId = null;
}

function startOrderStatusPolling(orderId) {
  stopOrderStatusPolling();
  orderPollingHandle = setInterval(() => {
    const fresh = getOrderById(orderId);
    if (!fresh) return;
    const newIdx = orderStageIndex(fresh);
    const newEl = document.getElementById('pr-timeline');
    if (!newEl) return;
    renderTimelineOnPage(fresh);
    if (lastPolledStageIdx >= 0 && newIdx > lastPolledStageIdx) {
      const statusLabels = ['','Preparando','Saiu para entrega','A caminho','Entregue'];
      showToast(`🔄 Pedido atualizado: ${statusLabels[newIdx] || 'status novo'}`, 4000);
    }
    lastPolledStageIdx = newIdx;
  }, 10000);
}

function stopOrderStatusPolling() {
  if (orderPollingHandle) {
    clearInterval(orderPollingHandle);
    orderPollingHandle = null;
  }
}

function finalizeOrder() {
  const name = checkoutName.value.trim();
  const phone = checkoutPhone.value.trim();
  const payment = checkoutPayment.value;
  const obs = checkoutObs ? checkoutObs.value.trim() : '';

  const changeVal = (payment === 'dinheiro' && checkoutChange) ? checkoutChange.value.trim() : '';
  const paymentStr = formatPaymentLabel(payment, changeVal);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = (deliveryType === 'delivery') ? DELIVERY_FEE : 0;
  const discount = calcOrderDiscount(subtotal);
  const cartTotal = subtotal + deliveryFee - discount;

  let deliveryStr = '';
  let addressSnap = null;
  if (deliveryType === 'delivery') {
    const street = checkoutStreet ? checkoutStreet.value.trim() : '';
    const neighborhood = checkoutNeighborhood ? checkoutNeighborhood.value.trim() : '';
    const ref = checkoutRef ? checkoutRef.value.trim() : '';
    if (!street || !neighborhood) {
      showToast('⚠️ Preencha rua e bairro para entrega', 3000);
      navigateCartStep('cart-step-delivery');
      return;
    }
    addressSnap = { street, neighborhood, ref };
    deliveryStr = `🛵 *Entrega para:*\n- Rua: ${street}\n- Bairro: ${neighborhood}${ref ? `\n- Referência: ${ref}` : ''}\n- Taxa de Entrega: ${formatBRL(deliveryFee)}`;
  } else {
    deliveryStr = `🛍️ *Retirada no Balcão*`;
  }

  const orderId = generateOrderId();
  const itemsSnap = cart.map(item => ({
    id: item.id, itemId: item.itemId, type: item.type,
    name: item.name, price: item.price, quantity: item.quantity,
    details: item.details || null
  }));
  const estimatedMinutes = parseEstimatedMinutes(ESTIMATED_TIME);

  const itemsLines = cart.map(item => {
    let detailsStr = '';
    if (item.type === 'pizza' && item.details) {
      detailsStr = item.details.optionsSummary.map(opt => `  • ${opt}`).join('\n');
    } else {
      const menuItem = menu.find(m => m.id === item.itemId);
      detailsStr = menuItem ? `  • ${menuItem.description}` : '';
    }
    return `*${item.quantity}x ${item.name}* (${formatBRL(item.price * item.quantity)})\n${detailsStr}`;
  }).join('\n\n');

  const messageLines = [
    `*🍕 NOVO PEDIDO ${orderId} - PIZZARIA PREMIUM 🍕*`,
    `---------------------------------------------`,
    `👤 *Cliente:* ${name}`,
    `📞 *WhatsApp:* ${phone}`,
    `---------------------------------------------`,
    `🛒 *Itens do Pedido:*`,
    itemsLines,
    `---------------------------------------------`,
    deliveryStr,
    `💳 *Forma de Pagamento:* ${paymentStr}`,
    `⏱ *Tempo estimado:* ${estimatedMinutes} min`,
    `---------------------------------------------`,
    obs ? `📝 *Observações:* ${obs}\n---------------------------------------------` : '',
    `💰 *Total Geral:* *${formatBRL(cartTotal)}*`,
    `---------------------------------------------`,
    `Gostaria de confirmar meu pedido, obrigado!`
  ];

  const fullMessage = messageLines.join('\n');
  lastOrderMessage = fullMessage;

  // Conta logada (para vincular pedido + pontos)
  const _acc = (typeof getCurrentAccount === 'function') ? getCurrentAccount() : null;

  // Cupom aplicado (se houver)
  const _couponEl = document.getElementById('cart-coupon-select');
  const _couponCode = _couponEl ? _couponEl.value : '';
  let _couponObj = null;
  if (_couponCode && _acc) {
    _couponObj = (_acc.coupons || []).find(c => c.code === _couponCode && !c.used) || null;
  }
  // Also check promotional coupons
  let _promoCouponObj = null;
  if (_couponCode && !_couponObj) {
    _promoCouponObj = getActivePromoCoupons().find(c => c.code === _couponCode) || null;
  }
  const _usedCoupon = _couponObj || _promoCouponObj;

  const order = {
    id: orderId,
    createdAt: Date.now(),
    customerName: name,
    customerPhone: phone,
    items: itemsSnap,
    subtotal,
    deliveryFee,
    discount,
    total: cartTotal,
    paymentMethod: payment,
    changeFor: changeVal || null,
    deliveryType,
    address: addressSnap,
    estimatedMinutes,
    obs: obs || null,
    status: 'received',
    statusManual: null,
    accountEmail: _acc ? _acc.email : null,
    couponCode: _usedCoupon ? _usedCoupon.code : null,
    couponName: _usedCoupon ? _usedCoupon.name : null,
    discount,
    paymentConfirmed: payment === 'mercadopago' ? checkMpPaymentConfirmed() : false
  };
  persistOrder(order);

  // Marca cupom como usado e adiciona linha na mensagem do WhatsApp
  if (_usedCoupon) {
    if (_couponObj) markCouponUsed(_couponObj.code);
    if (_promoCouponObj) markPromoCouponUsed(_promoCouponObj.code);
    if (discount > 0) {
      messageLines.push(`\n🎟️ *Cupom:* ${_usedCoupon.code} — -${formatBRL(discount)}`);
    }
    lastOrderMessage = messageLines.join('\n');
  }

  // Premia pontos pra conta logada
  if (_acc) {
    const awarded = awardPointsForOrder(order);
    if (awarded) {
      setTimeout(() => {
        showToast(`+${awarded.earned} pontos! Total: ${awarded.total} ⭐`, 3000);
      }, 1200);
    }
  }

  // Salva perfil do cliente para próximo pedido
  saveCustomerProfile({
    name, phone,
    lastAddress: addressSnap,
    lastPayment: payment
  });

  // Open WhatsApp
  window.open(buildWhatsAppUrl(fullMessage), '_blank', 'noopener,noreferrer');

  // Render receipt + show success step (inside cart drawer)
  renderReceipt(order);
  navigateCartStep('cart-step-success');

  // Fecha o drawer e mostra a tela cheia "Pedido Recebido"
  closeCartDrawer();
  showOrderReceivedPage(order);

  // Exibe upsell de criação de conta apenas para guest (no drawer)
  showAccountUpsell(order);

  // Track guest order
  if (!getCurrentAccount()) {
    trackEvent('guest_order_placed', { orderId: order.id, total: cartTotal });
  }

  // Clear cart state
  cart = [];
  try {
    localStorage.removeItem('premium_pizzaria_cart');
  } catch (e) {
    console.error('Erro ao limpar o carrinho do localStorage:', e);
  }
  updateFloatingCartBar();
}

// Pix EMV QR Code Payload Generation Utilities
function calculateCRC16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    let charCode = data.charCodeAt(i);
    crc ^= (charCode << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  let hex = (crc & 0xFFFF).toString(16).toUpperCase();
  return hex.padStart(4, '0');
}

function generatePixTxId(len = 25) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  if (window.crypto && crypto.getRandomValues) {
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function generatePixPayload(pixKey, merchantName, merchantCity, amount, txId = '***') {
  const cleanName = merchantName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 25);
  const cleanCity = merchantCity.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().substring(0, 15);
  const formattedAmount = Number(amount).toFixed(2);

  let payload = '000201';
  let accountInfo = '0014br.gov.bcb.pix';
  accountInfo += '01' + String(pixKey.length).padStart(2, '0') + pixKey;

  payload += '26' + String(accountInfo.length).padStart(2, '0') + accountInfo;
  payload += '52040000';
  payload += '5303986';
  payload += '54' + String(formattedAmount.length).padStart(2, '0') + formattedAmount;
  payload += '5802BR';
  payload += '59' + String(cleanName.length).padStart(2, '0') + cleanName;
  payload += '60' + String(cleanCity.length).padStart(2, '0') + cleanCity;

  let additionalInfo = '05' + String(txId.length).padStart(2, '0') + txId;
  payload += '62' + String(additionalInfo.length).padStart(2, '0') + additionalInfo;
  payload += '6304';

  const crc = calculateCRC16(payload);
  return payload + crc;
}

function renderPixQRCode(payload) {
  const img = document.getElementById('pix-qrcode-img');
  if (!img) return;
  if (typeof window.qrcode !== 'function') {
    console.warn('Lib QR n\u00e3o carregada \u2014 fallback p/ texto');
    img.alt = 'QR Pix (lib n\u00e3o dispon\u00edvel)';
    return;
  }
  try {
    const qr = window.qrcode(0, 'M');
    qr.addData(payload);
    qr.make();
    img.src = qr.createDataURL(5, 12);
  } catch (e) {
    console.error('Erro ao gerar QR Pix:', e);
  }
}

function startPixTimer() {
  if (pixTimerHandle) clearInterval(pixTimerHandle);
  const tick = () => {
    const remainMs = pixExpiresAt - Date.now();
    const badge = document.getElementById('pix-timer-badge');
    const txt = document.getElementById('pix-timer-text');
    const expired = document.getElementById('pix-expired-card');
    if (!badge || !txt) return;
    if (remainMs <= 0) {
      badge.style.display = 'none';
      if (expired) expired.style.display = 'block';
      if (pixTimerHandle) { clearInterval(pixTimerHandle); pixTimerHandle = null; }
      return;
    }
    if (expired) expired.style.display = 'none';
    badge.style.display = 'inline-flex';
    const totalSec = Math.floor(remainMs / 1000);
    const mm = Math.floor(totalSec / 60).toString().padStart(2, '0');
    const ss = (totalSec % 60).toString().padStart(2, '0');
    txt.textContent = `${mm}:${ss}`;
    badge.classList.toggle('pix-timer--urgent', totalSec <= 60);
  };
  tick();
  pixTimerHandle = setInterval(tick, 1000);
}

function regeneratePixCode(total) {
  pixTxId = generatePixTxId(25);
  pixExpiresAt = Date.now() + 15 * 60 * 1000;
  const code = generatePixPayload(PIX_KEY, PIX_NAME, PIX_CITY, total, pixTxId);
  const ta = document.getElementById('pix-copia-cola');
  if (ta) ta.value = code;
  renderPixQRCode(code);
  startPixTimer();
}

function checkMpPaymentConfirmed() {
  try {
    const paid = sessionStorage.getItem('premium_pizzaria_mp_paid') === 'true';
    if (paid) {
      sessionStorage.removeItem('premium_pizzaria_mp_paid');
      return true;
    }
  } catch (e) { /* ignora */ }
  return false;
}

function showPaymentToast(icon, text, kind = 'success', durationMs = 4000) {
  const el = document.getElementById('pay-toast');
  const ic = document.getElementById('pay-toast-icon');
  const tx = document.getElementById('pay-toast-text');
  if (!el || !ic || !tx) return;
  el.classList.remove('pay-toast--success', 'pay-toast--pending', 'pay-toast--error');
  el.classList.add(`pay-toast--${kind}`);
  ic.textContent = icon;
  tx.textContent = text;
  el.classList.add('is-visible');
  setTimeout(() => el.classList.remove('is-visible'), durationMs);
}

function hidePaymentResultModal() {
  const m = document.getElementById('pay-result-modal');
  if (!m) return;
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
}

function showPaymentResult(status, opts = {}) {
  if (status === 'success') {
    showPaymentToast('\ud83c\udf89', 'Pagamento aprovado pelo Mercado Pago!', 'success', 5000);
    setTimeout(() => {
      openCartDrawer();
      // Se j\u00e1 h\u00e1 comprovante (pedido finalizado), continua nele; sen\u00e3o, segue pro WhatsApp
      const success = document.getElementById('cart-step-success');
      if (success && success.classList.contains('is-active')) return;
      navigateCartStep('cart-step-payment-details');
    }, 200);
    return;
  }
  if (status === 'pending') {
    showPaymentToast('\u23f3', 'Pagamento em an\u00e1lise. Voc\u00ea pode confirmar pelo WhatsApp.', 'pending', 6000);
    setTimeout(() => {
      openCartDrawer();
      navigateCartStep('cart-step-payment-details');
    }, 200);
    return;
  }
  // failure \u2192 modal
  const modal = document.getElementById('pay-result-modal');
  const icon = document.getElementById('pay-result-icon');
  const title = document.getElementById('pay-result-title');
  const msg = document.getElementById('pay-result-message');
  const actions = document.getElementById('pay-result-actions');
  if (!modal || !actions) return;
  icon.textContent = '\u274c';
  title.textContent = 'Pagamento n\u00e3o conclu\u00eddo';
  msg.textContent = 'N\u00e3o conseguimos confirmar seu pagamento no Mercado Pago. Voc\u00ea pode tentar novamente ou escolher outro m\u00e9todo.';
  actions.innerHTML = `
    <button type="button" class="button button--primary" data-action="retry">\ud83d\udd04 Tentar de novo</button>
    <button type="button" class="button button--ghost" data-action="change">\u21a9 Mudar forma de pagamento</button>
  `;
  actions.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.getAttribute('data-action');
      hidePaymentResultModal();
      openCartDrawer();
      if (act === 'retry') navigateCartStep('cart-step-payment-details');
      else navigateCartStep('cart-step-delivery');
    }, { once: true });
  });
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
}

async function getMPPreferenceUrl(cartItems, total) {
  const items = cartItems.map(item => ({
    title: item.name,
    quantity: item.quantity,
    unit_price: parseFloat(item.price),
    currency_id: 'BRL'
  }));

  const fee = (deliveryType === 'delivery') ? DELIVERY_FEE : 0;
  if (fee > 0) {
    items.push({
      title: 'Taxa de Entrega',
      quantity: 1,
      unit_price: fee,
      currency_id: 'BRL'
    });
  }

  const requestBody = { items, total };

  // 1. Tenta API serverless local (/api/create-preference)
  try {
    const res = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.init_point) return data.init_point;
    }
  } catch (e) {
    console.log('API serverless local falhou/indisponível. Tentando CORS proxy...');
  }

  // 2. Fallback: link manual configurado no Admin (sem expor MP_TOKEN no client)
  //    Para usar a API direta de forma segura, configure uma função serverless
  //    em /api/create-preference (ver MERCADOPAGO_SKILL.md).
  return MP_LINK || 'https://www.mercadopago.com.br/';
}

if (cartNextBtn3) {
  cartNextBtn3.addEventListener('click', () => {
    // Valida endereço de entrega
    if (deliveryType === 'delivery') {
      const street = checkoutStreet ? checkoutStreet.value.trim() : '';
      const neighborhood = checkoutNeighborhood ? checkoutNeighborhood.value.trim() : '';
      
      if (!street || !neighborhood) {
        window.alert('Por favor, preencha a rua e o bairro para a entrega.');
        return;
      }
    }

    refreshPaymentDetailsScreen();

    const payment = checkoutPayment.value;
    if (payment === 'pix' || payment === 'mercadopago') {
      navigateCartStep('cart-step-payment-details');
    } else {
      finalizeOrder();
    }
  });
}

if (cartBackToDelivery) {
  cartBackToDelivery.addEventListener('click', () => {
    navigateCartStep('cart-step-delivery');
  });
}

const btnBackToPaymentMethod = document.getElementById('btn-back-to-payment-method');
if (btnBackToPaymentMethod) {
  btnBackToPaymentMethod.addEventListener('click', () => {
    navigateCartStep('cart-step-delivery');
  });
}

if (btnConfirmPaymentWhatsapp) {
  btnConfirmPaymentWhatsapp.addEventListener('click', finalizeOrder);
}

if (btnCopyPix) {
  btnCopyPix.addEventListener('click', () => {
    const textarea = document.getElementById('pix-copia-cola');
    if (textarea) {
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(textarea.value).then(() => {
        showToast('Código Pix copiado! 📋');
      }).catch(err => {
        try {
          document.execCommand('copy');
          showToast('Código Pix copiado! 📋');
        } catch (e) {
          alert('Erro ao copiar: ' + err);
        }
      });
    }
  });
}

if (successWhatsappRetry) {
  successWhatsappRetry.addEventListener('click', () => {
    if (lastOrderMessage) {
      window.open(buildWhatsAppUrl(lastOrderMessage), '_blank', 'noopener,noreferrer');
    }
  });
}

if (successCloseBtn) {
  successCloseBtn.addEventListener('click', () => {
    closeCartDrawer();
  });
}

// ---------- Full‑screen "Pedido Recebido" page buttons ----------
const prWhatsappBtn = document.getElementById('pr-whatsapp-btn');
const prCloseBtn = document.getElementById('pr-close-btn');
const prBackdrop = document.getElementById('pedido-recebido-close');

if (prWhatsappBtn) {
  prWhatsappBtn.addEventListener('click', () => {
    if (lastOrderMessage) {
      window.open(buildWhatsAppUrl(lastOrderMessage), '_blank', 'noopener,noreferrer');
    }
  });
}

if (prCloseBtn) {
  prCloseBtn.addEventListener('click', () => {
    closeOrderReceivedPage();
  });
}

if (prBackdrop) {
  prBackdrop.addEventListener('click', () => {
    closeOrderReceivedPage();
  });
}

// Escape fecha a tela de pedido recebido
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const page = document.getElementById('pedido-recebido-page');
    if (page && page.style.display === 'flex') {
      closeOrderReceivedPage();
    }
  }
});

// Limpa polling se navegar para outra seção via hash
window.addEventListener('hashchange', () => {
  const page = document.getElementById('pedido-recebido-page');
  if (page && page.style.display === 'flex') {
    closeOrderReceivedPage();
  }
});

// ---------- Analytics tracking (guest → registered conversion) ----------
const ANALYTICS_KEY = 'premium_pizzaria_analytics';

function trackEvent(name, props = {}) {
  try {
    const log = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]');
    log.push({ name, props, ts: Date.now() });
    if (log.length > 500) log.splice(0, log.length - 500);
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(log));
  } catch (e) { /* ignore */ }
  console.log(`[Analytics] ${name}`, props);
}
/* Eventos definidos:
 * - guest_checkout_started     – ao entrar no passo de identidade (guest)
 * - guest_order_placed         – pedido finalizado via WhatsApp sem login
 * - upsell_impression          – upsell exibido na tela de sucesso
 * - upsell_clicked_create      – clique em "Criar conta grátis"
 * - upsell_dismissed           – clique em "Agora não"
 * - guest_converted_to_registered – cadastro concluído após upsell
 */

// ---------- Guest → Account upsell ----------
const UPSEL_DISMISS_KEY = 'premium_pizzaria_upsell_dismissed';

function showAccountUpsell(order) {
  const el = document.getElementById('receipt-upsell');
  if (!el) return;
  // Não exibir se já está logado ou se já dispensou
  if (getCurrentAccount()) { el.style.display = 'none'; return; }
  if (localStorage.getItem(UPSEL_DISMISS_KEY)) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  trackEvent('upsell_impression', { orderId: order ? order.id : null });
}

function dismissAccountUpsell() {
  const el = document.getElementById('receipt-upsell');
  if (el) el.style.display = 'none';
  try { localStorage.setItem(UPSEL_DISMISS_KEY, '1'); } catch (e) { /* ignore */ }
  trackEvent('upsell_dismissed');
}

function openUpsellRegister() {
  const name = checkoutName ? checkoutName.value.trim() : '';
  const phone = checkoutPhone ? checkoutPhone.value.trim() : '';
  dismissAccountUpsell();
  trackEvent('upsell_clicked_create');
  if (typeof openAuthModal === 'function') {
    openAuthModal('register', { name, phone });
  }
}

const upsellCreateBtn = document.getElementById('upsell-create-account');
const upsellSkipBtn = document.getElementById('upsell-skip');
if (upsellCreateBtn) upsellCreateBtn.addEventListener('click', openUpsellRegister);
if (upsellSkipBtn) upsellSkipBtn.addEventListener('click', dismissAccountUpsell);

// Initial renders/hydrations
hydrateStaticWhatsAppLinks();
renderPromoBar();
renderPromotions();
renderTabs();
renderMenu();
renderCombosCarousel();
hydrateCategoryTriggers();

// Restaura o carrinho no floating bar caso haja itens salvos
updateFloatingCartBar();

// Verifica se retornou do Mercado Pago com status de pagamento
const urlParams = new URLSearchParams(window.location.search);
const paymentStatus = urlParams.get('payment_status');
if (paymentStatus) {
  // Limpa o parâmetro da URL sem recarregar a página
  const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.replaceState({ path: cleanUrl }, '', cleanUrl);

  // Se pagamento foi aprovado, guarda flag em sessionStorage para confirmar o pedido
  if (paymentStatus === 'success') {
    try {
      sessionStorage.setItem('premium_pizzaria_mp_paid', 'true');
    } catch (e) { /* ignora */ }
  }

  setTimeout(() => showPaymentResult(paymentStatus), 600);
}

// Pré-preenche checkout com perfil salvo, se houver
restoreCustomerProfile();

// Hooks adicionais: regenera Pix, fechar modal, imprimir comprovante, limpar perfil
const btnRegenPix = document.getElementById('btn-regen-pix');
if (btnRegenPix) {
  btnRegenPix.addEventListener('click', () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = (deliveryType === 'delivery') ? DELIVERY_FEE : 0;
    regeneratePixCode(subtotal + deliveryFee);
    showToast('Novo código Pix gerado ✅');
  });
}

const payResultModal = document.getElementById('pay-result-modal');
if (payResultModal) {
  payResultModal.addEventListener('click', (e) => {
    if (e.target && e.target.matches('[data-pay-result-close]')) hidePaymentResultModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && payResultModal.classList.contains('is-open')) hidePaymentResultModal();
  });
}

const receiptPrintBtn = document.getElementById('receipt-print-btn');
if (receiptPrintBtn) {
  receiptPrintBtn.addEventListener('click', () => {
    document.body.classList.add('is-printing-receipt');
    window.print();
    setTimeout(() => document.body.classList.remove('is-printing-receipt'), 500);
  });
}

const profileClearCheckbox = document.getElementById('profile-clear-checkbox');
if (profileClearCheckbox) {
  profileClearCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      clearCustomerProfile();
      if (checkoutName) checkoutName.value = '';
      if (checkoutPhone) checkoutPhone.value = '';
      if (checkoutStreet) checkoutStreet.value = '';
      if (checkoutNeighborhood) checkoutNeighborhood.value = '';
      if (checkoutRef) checkoutRef.value = '';
      const toggleLabel = document.getElementById('profile-clear-toggle');
      if (toggleLabel) toggleLabel.style.display = 'none';
      showToast('Dados limpos deste dispositivo 🔒');
      if (typeof handleAuthFormInputs === 'function') handleAuthFormInputs();
    }
  });
}

/* ============================================================
   Store Hours — pílula clicável com status dinâmico
   ============================================================ */
(function initStoreHours() {
  const root = document.getElementById('store-hours');
  if (!root) return;
  const toggle = document.getElementById('store-hours-toggle');
  const panel = document.getElementById('store-hours-panel');
  const label = document.getElementById('store-hours-label');
  const list = document.getElementById('store-hours-list');

  const SCHEDULE = {
    0: { open: '18:00', close: '23:30' },
    1: { open: '18:00', close: '22:00' },
    2: { open: '18:00', close: '23:30' },
    3: { open: '18:00', close: '23:30' },
    4: { open: '18:00', close: '23:30' },
    5: { open: '18:00', close: '23:30' },
    6: { open: '18:00', close: '23:30' }
  };

  const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  function updateStatus() {
    const now = new Date();
    const day = now.getDay();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const today = SCHEDULE[day];
    const isOpen = today && minutesNow >= toMinutes(today.open) && minutesNow < toMinutes(today.close);

    root.setAttribute('data-state', isOpen ? 'open' : 'closed');

    if (label) {
      if (isOpen) {
        label.textContent = `Aberto · Fecha às ${today.close}`;
      } else if (minutesNow < toMinutes(today.open)) {
        label.textContent = `Abre às ${today.open}`;
      } else {
        let next = day;
        for (let i = 1; i <= 7; i++) {
          next = (day + i) % 7;
          if (SCHEDULE[next]) break;
        }
        label.textContent = `Abre amanhã às ${SCHEDULE[next].open}`;
      }
    }

    if (list) {
      list.querySelectorAll('li').forEach(li => {
        li.classList.toggle('is-today', Number(li.dataset.day) === day);
      });
    }
  }

  function setOpen(open) {
    root.setAttribute('data-open', open ? 'true' : 'false');
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (panel) {
      if (open) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden', '');
    }
  }

  if (toggle) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = root.getAttribute('data-open') === 'true';
      setOpen(!isOpen);
    });
  }

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });

  updateStatus();
  setInterval(updateStatus, 60 * 1000);
})();

/* ========================================================================
   ACCOUNTS — contas locais, sessão, hash, pontos, cupons, endereços, ViaCEP
   Sem backend. Hash SHA-256 + salt aleatório. Limitação: troca de aparelho
   significa perda de conta (avisado no UI).
   ======================================================================== */

const ACCOUNTS_KEY = 'premium_pizzaria_accounts';
const SESSION_KEY = 'premium_pizzaria_session';
const PRIZES_KEY = 'premium_pizzaria_prizes';
const ZONES_KEY = 'premium_pizzaria_zones';
const LOYALTY_CONFIG_KEY = 'premium_pizzaria_loyalty_cfg';
let currentAccount = null;

// ---------- Hash SHA-256 ----------
function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}
function genSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bytesToHex(arr);
}
async function hashPassword(salt, pwd) {
  const enc = new TextEncoder().encode(salt + ':' + pwd);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  return bytesToHex(digest);
}

// ---------- Accounts CRUD ----------
function loadAccounts() {
  try { return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]'); }
  catch (e) { return []; }
}
function saveAccounts(list) {
  try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list)); }
  catch (e) { console.error('Erro ao salvar contas:', e); }
}
function getCurrentAccount() {
  if (currentAccount) return currentAccount;
  try {
    const email = localStorage.getItem(SESSION_KEY);
    if (!email) return null;
    const acc = loadAccounts().find(a => a.email === email);
    currentAccount = acc || null;
    return currentAccount;
  } catch (e) { return null; }
}
function setSession(email) {
  if (email) localStorage.setItem(SESSION_KEY, email);
  else localStorage.removeItem(SESSION_KEY);
  currentAccount = null;
}
async function registerAccount(data) {
  const accounts = loadAccounts();
  const email = (data.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('E-mail inválido.');
  if ((data.password || '').length < 6) throw new Error('Senha precisa ter pelo menos 6 caracteres.');
  if (!data.name || data.name.trim().length < 2) throw new Error('Nome muito curto.');
  if (accounts.find(a => a.email === email)) throw new Error('Este e-mail já está registrado neste dispositivo.');
  const salt = genSalt();
  const passwordHash = await hashPassword(salt, data.password);
  const account = {
    email,
    name: data.name.trim(),
    phone: data.phone || '',
    salt,
    passwordHash,
    points: 0,
    pointsHistory: [],
    coupons: [],
    addresses: [],
    createdAt: Date.now(),
    lastLoginAt: Date.now()
  };
  if (data.cep) {
    const cep = data.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      account.addresses.push({
        id: 'a' + Date.now(), label: 'Casa',
        cep, street: data.street || '', number: '',
        neighborhood: data.neighborhood || '', city: data.city || '', uf: data.uf || '',
        ref: '', isDefault: true
      });
    }
  }
  accounts.push(account);
  saveAccounts(accounts);
  setSession(email);
  return account;
}
async function login(email, pwd) {
  const accounts = loadAccounts();
  const acc = accounts.find(a => a.email === (email || '').trim().toLowerCase());
  if (!acc) throw new Error('Nenhuma conta encontrada com este e-mail neste dispositivo.');
  const hash = await hashPassword(acc.salt, pwd);
  if (hash !== acc.passwordHash) throw new Error('Senha incorreta.');
  acc.lastLoginAt = Date.now();
  saveAccounts(accounts);
  setSession(acc.email);
  return acc;
}
function logout() {
  setSession(null);
  refreshAppbarAccount();
  if (typeof showToast === 'function') showToast('Você saiu da conta', 2000);
}
async function resetPassword(email, newPwd) {
  const accounts = loadAccounts();
  const acc = accounts.find(a => a.email === (email || '').trim().toLowerCase());
  if (!acc) throw new Error('Nenhuma conta com esse e-mail.');
  if ((newPwd || '').length < 6) throw new Error('Senha precisa ter pelo menos 6 caracteres.');
  acc.salt = genSalt();
  acc.passwordHash = await hashPassword(acc.salt, newPwd);
  saveAccounts(accounts);
}
function updateCurrentAccount(patch) {
  const cur = getCurrentAccount();
  if (!cur) return null;
  const accounts = loadAccounts();
  const idx = accounts.findIndex(a => a.email === cur.email);
  if (idx === -1) return null;
  accounts[idx] = { ...accounts[idx], ...patch };
  saveAccounts(accounts);
  currentAccount = accounts[idx];
  return currentAccount;
}

// ---------- Appbar badge + avatar ----------
function updateAppbarCartBadge() {
  const badge = document.getElementById('appbar-cart-badge');
  if (!badge) return;
  const count = Array.isArray(cart) ? cart.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
  if (count > 0) {
    const prev = parseInt(badge.textContent || '0', 10);
    badge.textContent = count > 99 ? '99+' : String(count);
    badge.hidden = false;
    if (count > prev) {
      badge.classList.remove('is-bumping');
      void badge.offsetWidth;
      badge.classList.add('is-bumping');
    }
  } else {
    badge.hidden = true;
    badge.textContent = '0';
  }
}
function refreshAppbarAccount() {
  const avatar = document.getElementById('appbar-account-avatar');
  if (!avatar) return;
  const acc = getCurrentAccount();
  if (acc && acc.name) {
    avatar.setAttribute('data-initial', acc.name.trim().charAt(0).toUpperCase());
  } else {
    avatar.setAttribute('data-initial', '');
  }
}

// ---------- ViaCEP ----------
async function fetchCep(rawCep) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('CEP precisa ter 8 dígitos.');
  const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { mode: 'cors' });
  if (!resp.ok) throw new Error('Não consegui consultar o CEP.');
  const data = await resp.json();
  if (data.erro) throw new Error('CEP não encontrado.');
  return {
    cep,
    street: data.logradouro || '',
    neighborhood: data.bairro || '',
    city: data.localidade || '',
    uf: data.uf || ''
  };
}

// ---------- Geocoding (CEP -> lat/lng) ----------
const GEO_CACHE_KEY = 'premium_pizzaria_geo_cache';
const STORE_CONFIG_KEY = 'premium_pizzaria_store_cfg';

// Padrão da pizzaria — Av. Sen. Sigefredo Pacheco, 4727, Verde Lar, Teresina-PI, 64071-440
const STORE_DEFAULTS = {
  cep: '64071440',
  lat: -5.0617,
  lng: -42.7775,
  address: 'Av. Sen. Sigefredo Pacheco, 4727 - Verde Lar, Teresina-PI'
};

function loadStoreConfig() {
  try {
    const raw = localStorage.getItem(STORE_CONFIG_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      return Object.assign({}, STORE_DEFAULTS, c);
    }
  } catch (e) {}
  return Object.assign({}, STORE_DEFAULTS);
}
function saveStoreConfig(cfg) {
  try { localStorage.setItem(STORE_CONFIG_KEY, JSON.stringify(cfg)); } catch (e) {}
}

function loadGeoCache() {
  try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveGeoCache(map) {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(map)); } catch (e) {}
}

// CEP -> { lat, lng, address, neighborhood, city, uf }
async function geocodeCep(rawCep) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) throw new Error('CEP precisa ter 8 dígitos.');
  const cache = loadGeoCache();
  if (cache[cep]) return cache[cep];

  let lat = null, lng = null;
  let street = '', neighborhood = '', city = '', uf = '';

  // 1ª tentativa: AwesomeAPI (retorna lat/lng diretamente)
  try {
    const r = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`, { mode: 'cors' });
    if (r.ok) {
      const d = await r.json();
      if (d && !d.error) {
        if (d.lat) lat = parseFloat(d.lat);
        if (d.lng) lng = parseFloat(d.lng);
        street = d.address || '';
        neighborhood = d.district || '';
        city = d.city || '';
        uf = d.state || '';
      }
    }
  } catch (e) { /* segue pro fallback */ }

  // 2ª tentativa: ViaCEP (sem lat/lng, mas confiável pro endereço)
  if (!street || !city) {
    try {
      const r2 = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { mode: 'cors' });
      if (r2.ok) {
        const d2 = await r2.json();
        if (!d2.erro) {
          street = street || d2.logradouro || '';
          neighborhood = neighborhood || d2.bairro || '';
          city = city || d2.localidade || '';
          uf = uf || d2.uf || '';
        }
      }
    } catch (e) {}
  }

  if (!street && !city) throw new Error('CEP não encontrado.');

  // Fallback de coordenadas: aproxima pelo centro do município (apenas se a AwesomeAPI não devolveu)
  if (lat == null || lng == null) {
    if (city.toLowerCase().includes('teresina')) { lat = -5.0892; lng = -42.8019; }
    else if (city.toLowerCase().includes('timon')) { lat = -5.0939; lng = -42.8367; }
    else { lat = lng = null; /* sem coord, distância indefinida */ }
  }

  const result = { cep, lat, lng, street, neighborhood, city, uf };
  cache[cep] = result;
  saveGeoCache(cache);
  return result;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
  const R = 6371;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Calcula frete por distância com base na config do admin
function calcDeliveryByDistance(cepData) {
  const cfg = loadDeliveryConfig();
  const store = loadStoreConfig();
  const km = haversineKm(store.lat, store.lng, cepData.lat, cepData.lng);
  if (km == null) {
    return { outOfRange: true, reason: 'Não consegui calcular a distância.', km: null };
  }
  if (km > cfg.maxKm) {
    return { outOfRange: true, reason: 'Fora do raio de entrega', km };
  }
  let fee;
  if (cfg.mode === 'per_km') {
    fee = cfg.baseFee + km * cfg.perKm;
  } else { // 'bands'
    const band = (cfg.bands || []).find(b => km <= b.maxKm);
    fee = band ? band.fee : (cfg.bands?.slice(-1)[0]?.fee ?? cfg.baseFee);
  }
  fee = Math.round(fee * 100) / 100;
  // Tempo: 5min por km + offset base
  const baseMin = cfg.baseMin || 20;
  const minutesMin = Math.round(baseMin + km * 2.5);
  const minutesMax = Math.round(baseMin + km * 4);
  return { outOfRange: false, km, fee, minutesMin, minutesMax };
}

// Config global de delivery (taxa por distância)
const DELIVERY_CFG_KEY = 'premium_pizzaria_delivery_cfg';
function loadDeliveryConfig() {
  try {
    const raw = localStorage.getItem(DELIVERY_CFG_KEY);
    if (raw) {
      const c = JSON.parse(raw);
      return Object.assign({}, DELIVERY_DEFAULTS, c);
    }
  } catch (e) {}
  return Object.assign({}, DELIVERY_DEFAULTS);
}
const DELIVERY_DEFAULTS = {
  mode: 'per_km',       // 'per_km' ou 'bands'
  maxKm: 15,            // raio máximo
  baseFee: 5,           // taxa base R$
  perKm: 1.5,           // R$ por km (modo per_km)
  baseMin: 20,          // tempo base em min
  fuelPerKm: 0.55,      // R$/km de combustível (para o simulador no admin)
  bands: [              // modo 'bands' (faixas)
    { maxKm: 3, fee: 5 },
    { maxKm: 7, fee: 10 },
    { maxKm: 12, fee: 15 }
  ]
};
function saveDeliveryConfig(cfg) {
  try { localStorage.setItem(DELIVERY_CFG_KEY, JSON.stringify(cfg)); } catch (e) {}
}

// ---------- Zones (frete por CEP) [LEGACY — mantido como fallback] ----------
function loadZones() {
  try {
    const z = JSON.parse(localStorage.getItem(ZONES_KEY) || 'null');
    if (Array.isArray(z) && z.length) return z;
  } catch (e) {}
  // default: Teresina
  return [{
    id: 'z-default',
    label: 'Teresina-PI',
    cepFrom: '64000000',
    cepTo: '64099999',
    fee: DELIVERY_FEE || 5,
    minutesMin: 30,
    minutesMax: 60,
    active: true
  }];
}
function saveZones(list) {
  try { localStorage.setItem(ZONES_KEY, JSON.stringify(list)); }
  catch (e) { console.error('Erro ao salvar zonas:', e); }
}
function calcDeliveryByCep(rawCep) {
  const cep = (rawCep || '').replace(/\D/g, '');
  if (cep.length !== 8) return { outOfRange: true, reason: 'CEP inválido' };
  const cepNum = parseInt(cep, 10);
  const zones = loadZones().filter(z => z.active !== false);
  const z = zones.find(zone => {
    const from = parseInt(String(zone.cepFrom).replace(/\D/g, ''), 10);
    const to = parseInt(String(zone.cepTo).replace(/\D/g, ''), 10);
    return cepNum >= from && cepNum <= to;
  });
  if (!z) return { outOfRange: true, reason: 'Fora da área de entrega', cep };
  return {
    outOfRange: false,
    cep,
    label: z.label,
    fee: Number(z.fee) || 0,
    minutesMin: Number(z.minutesMin) || 30,
    minutesMax: Number(z.minutesMax) || 60
  };
}

// ---------- Prizes ----------
function loadPrizes() {
  try {
    const p = JSON.parse(localStorage.getItem(PRIZES_KEY) || 'null');
    if (Array.isArray(p) && p.length) return p;
  } catch (e) {}
  return [
    { id: 'p1', name: 'Pizza Pequena Grátis', description: 'Sabor à escolha (pequena)', icon: '🍕', points: 500, active: true },
    { id: 'p2', name: 'Refri 2L Grátis', description: 'Coca-Cola, Guaraná ou Sprite', icon: '🥤', points: 800, active: true },
    { id: 'p3', name: 'Sobremesa Grátis', description: 'Brownie, mousse ou pudim', icon: '🍰', points: 600, active: true }
  ];
}
function savePrizes(list) {
  try { localStorage.setItem(PRIZES_KEY, JSON.stringify(list)); }
  catch (e) { console.error('Erro ao salvar prêmios:', e); }
}

function loadLoyaltyConfig() {
  try {
    const c = JSON.parse(localStorage.getItem(LOYALTY_CONFIG_KEY) || 'null');
    if (c) return c;
  } catch (e) {}
  return { enabled: true, pointsPerReal: 1 };
}
function saveLoyaltyConfig(cfg) {
  try { localStorage.setItem(LOYALTY_CONFIG_KEY, JSON.stringify(cfg)); }
  catch (e) {}
}

// ---------- Cupons (gerados ao resgatar prêmios) ----------
function genCouponCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'PREMIO-';
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}
function redeemPrize(prizeId) {
  const acc = getCurrentAccount();
  if (!acc) throw new Error('Faça login para resgatar prêmios.');
  const prize = loadPrizes().find(p => p.id === prizeId && p.active !== false);
  if (!prize) throw new Error('Prêmio não encontrado.');
  if ((acc.points || 0) < prize.points) throw new Error('Pontos insuficientes.');
  const coupon = {
    code: genCouponCode(),
    prizeId: prize.id,
    name: prize.name,
    used: false,
    createdAt: Date.now()
  };
  const newAcc = updateCurrentAccount({
    points: (acc.points || 0) - prize.points,
    coupons: [...(acc.coupons || []), coupon],
    pointsHistory: [...(acc.pointsHistory || []), {
      type: 'redeem', amount: -prize.points, prizeId: prize.id, at: Date.now()
    }]
  });
  return { coupon, account: newAcc };
}
function getActiveCoupons() {
  const acc = getCurrentAccount();
  if (!acc) return [];
  return (acc.coupons || []).filter(c => !c.used);
}
function markCouponUsed(code) {
  const acc = getCurrentAccount();
  if (!acc) return;
  const coupons = (acc.coupons || []).map(c => c.code === code ? { ...c, used: true, usedAt: Date.now() } : c);
  updateCurrentAccount({ coupons });
}

// ---------- Award points after finalizeOrder ----------
function awardPointsForOrder(order) {
  const acc = getCurrentAccount();
  if (!acc) return null;
  const cfg = loadLoyaltyConfig();
  if (!cfg.enabled) return null;
  const earned = Math.floor((order.total || 0) * (cfg.pointsPerReal || 1));
  if (earned <= 0) return null;
  const newAcc = updateCurrentAccount({
    points: (acc.points || 0) + earned,
    pointsHistory: [...(acc.pointsHistory || []), {
      type: 'earn', amount: earned, orderId: order.id, at: Date.now()
    }]
  });
  return { earned, total: newAcc.points };
}

/* ========================================================================
   UI WIRING — Auth modal, account drawer, calculadora CEP
   ======================================================================== */

// ---------- Máscara CEP genérica ----------
function maskCepInput(el) {
  if (!el) return;
  el.addEventListener('input', () => {
    const digits = el.value.replace(/\D/g, '').slice(0, 8);
    el.value = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
  });
}

// ---------- Auth modal ----------
const authModalEl = document.getElementById('auth-modal');
function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  if (msg) { el.textContent = msg; el.classList.add('is-visible'); }
  else { el.classList.remove('is-visible'); }
}
function switchAuthTab(name) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('is-active', t.dataset.authTab === name);
  });
  document.querySelectorAll('.auth-form').forEach(f => {
    f.classList.toggle('is-active', f.dataset.authForm === name);
  });
  const forgotTab = document.getElementById('auth-tab-forgot');
  if (forgotTab) forgotTab.style.display = (name === 'forgot') ? '' : 'none';
  showAuthError('');
}
function openAuthModal(initialTab, prefill) {
  if (!authModalEl) return;
  switchAuthTab(initialTab || 'login');
  if (prefill) {
    const nameEl = document.getElementById('auth-reg-name');
    const phoneEl = document.getElementById('auth-reg-phone');
    if (nameEl && prefill.name) nameEl.value = prefill.name;
    if (phoneEl && prefill.phone) phoneEl.value = prefill.phone;
  }
  authModalEl.classList.add('is-open');
  authModalEl.setAttribute('aria-hidden', 'false');
}
function closeAuthModal() {
  if (!authModalEl) return;
  authModalEl.classList.remove('is-open');
  authModalEl.setAttribute('aria-hidden', 'true');
  showAuthError('');
}

if (authModalEl) {
  authModalEl.querySelectorAll('[data-auth-close]').forEach(el => {
    el.addEventListener('click', closeAuthModal);
  });
  authModalEl.querySelectorAll('.auth-tab').forEach(t => {
    t.addEventListener('click', () => switchAuthTab(t.dataset.authTab));
  });
  authModalEl.querySelectorAll('[data-auth-switch]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      switchAuthTab(a.dataset.authSwitch);
    });
  });
  // Máscaras
  maskCepInput(document.getElementById('auth-reg-cep'));

  // Submit Login
  const loginForm = authModalEl.querySelector('[data-auth-form="login"]');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAuthError('');
      const email = document.getElementById('auth-login-email').value;
      const pwd = document.getElementById('auth-login-password').value;
      try {
        const acc = await login(email, pwd);
        closeAuthModal();
        refreshAppbarAccount();
        showToast(`Bem-vindo de volta, ${acc.name.split(' ')[0]}!`, 2500);
        loginForm.reset();
      } catch (err) {
        showAuthError(err.message);
      }
    });
  }

  // Submit Register
  const regForm = authModalEl.querySelector('[data-auth-form="register"]');
  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAuthError('');
      const data = {
        name: document.getElementById('auth-reg-name').value,
        email: document.getElementById('auth-reg-email').value,
        password: document.getElementById('auth-reg-password').value,
        phone: document.getElementById('auth-reg-phone').value,
        cep: document.getElementById('auth-reg-cep').value
      };
      try {
        // Se tem CEP, tenta puxar dados via ViaCEP (não bloqueia em falha)
        if (data.cep) {
          try {
            const cepData = await fetchCep(data.cep);
            data.street = cepData.street;
            data.neighborhood = cepData.neighborhood;
            data.city = cepData.city;
            data.uf = cepData.uf;
          } catch (e) { /* ignora, salva sem detalhes */ }
        }
        const acc = await registerAccount(data);
        closeAuthModal();
        refreshAppbarAccount();
        showToast(`Conta criada! Bem-vindo, ${acc.name.split(' ')[0]}.`, 2800);
        // Se cadastro veio do upsell pós-pedido, registra conversão
        if (localStorage.getItem(UPSEL_DISMISS_KEY)) {
          trackEvent('guest_converted_to_registered', { email: acc.email });
        }
        regForm.reset();
      } catch (err) {
        showAuthError(err.message);
      }
    });
  }

  // Submit Forgot
  const forgotForm = authModalEl.querySelector('[data-auth-form="forgot"]');
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAuthError('');
      const email = document.getElementById('auth-forgot-email').value;
      const newPwd = document.getElementById('auth-forgot-newpw').value;
      try {
        await resetPassword(email, newPwd);
        showToast('Senha redefinida! Faça login com a nova senha.', 3000);
        switchAuthTab('login');
        document.getElementById('auth-login-email').value = email;
        forgotForm.reset();
      } catch (err) {
        showAuthError(err.message);
      }
    });
  }
}

// ---------- Appbar buttons ----------
const appbarAccountBtn = document.getElementById('appbar-account-btn');
const appbarCartBtn = document.getElementById('appbar-cart-btn');

if (appbarAccountBtn) {
  appbarAccountBtn.addEventListener('click', () => {
    if (getCurrentAccount()) {
      openAccountDrawer('menu');
    } else {
      openAuthModal('login');
    }
  });
}
if (appbarCartBtn) {
  appbarCartBtn.addEventListener('click', () => {
    if (typeof openCartDrawer === 'function') openCartDrawer();
  });
}

// ---------- Account drawer ----------
const accountDrawerEl = document.getElementById('account-drawer');
const accountDrawerBackdrop = document.getElementById('account-drawer-backdrop');
let accountStepHistory = ['menu'];

function setAccountStep(name) {
  document.querySelectorAll('.account-step').forEach(s => {
    s.classList.toggle('is-active', s.dataset.accountStep === name);
  });
  const back = document.getElementById('account-back-btn');
  if (back) back.style.display = (name === 'menu') ? 'none' : '';
  const title = document.getElementById('account-drawer-title');
  if (title) {
    const titles = {
      menu: 'Minha conta', orders: 'Meus pedidos', prizes: 'Resgatar pontos',
      addresses: 'Endereços', 'address-form': 'Endereço',
      profile: 'Dados pessoais', password: 'Mudar senha'
    };
    title.textContent = titles[name] || 'Minha conta';
  }
}
function openAccountDrawer(step) {
  if (!accountDrawerEl) return;
  refreshAccountHero();
  accountStepHistory = ['menu'];
  setAccountStep(step || 'menu');
  if (step && step !== 'menu') {
    accountStepHistory.push(step);
    renderAccountStep(step);
  }
  accountDrawerEl.classList.add('is-open');
  accountDrawerEl.setAttribute('aria-hidden', 'false');
  if (accountDrawerBackdrop) accountDrawerBackdrop.classList.add('is-open');
}
function closeAccountDrawer() {
  if (!accountDrawerEl) return;
  accountDrawerEl.classList.remove('is-open');
  accountDrawerEl.setAttribute('aria-hidden', 'true');
  if (accountDrawerBackdrop) accountDrawerBackdrop.classList.remove('is-open');
}
function goAccountStep(step) {
  accountStepHistory.push(step);
  setAccountStep(step);
  renderAccountStep(step);
}
function popAccountStep() {
  if (accountStepHistory.length > 1) accountStepHistory.pop();
  const prev = accountStepHistory[accountStepHistory.length - 1] || 'menu';
  setAccountStep(prev);
  renderAccountStep(prev);
}
function refreshAccountHero() {
  const acc = getCurrentAccount();
  if (!acc) return;
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setT('account-hero-avatar', (acc.name || '?').charAt(0).toUpperCase());
  setT('account-hero-name', acc.name);
  setT('account-hero-email', acc.email);
  setT('account-hero-points', String(acc.points || 0));
  const ordersForMe = loadOrders().filter(o => o.accountEmail === acc.email);
  setT('account-menu-orders-count', ordersForMe.length ? String(ordersForMe.length) : '');
  const couponsActive = (acc.coupons || []).filter(c => !c.used).length;
  setT('account-menu-coupons-count', couponsActive ? `${couponsActive} cupom` : '');
  setT('account-menu-addresses-count', (acc.addresses || []).length ? String((acc.addresses || []).length) : '');
}
function renderAccountStep(step) {
  if (step === 'orders') renderAccountOrders('all');
  else if (step === 'prizes') renderAccountPrizes();
  else if (step === 'addresses') renderAccountAddresses();
  else if (step === 'profile') renderAccountProfileForm();
  else if (step === 'menu') refreshAccountHero();
}

// Drawer wiring
if (accountDrawerEl) {
  document.getElementById('account-close-btn').addEventListener('click', closeAccountDrawer);
  document.getElementById('account-back-btn').addEventListener('click', popAccountStep);
  if (accountDrawerBackdrop) accountDrawerBackdrop.addEventListener('click', closeAccountDrawer);
  accountDrawerEl.querySelectorAll('[data-account-go]').forEach(b => {
    b.addEventListener('click', () => goAccountStep(b.dataset.accountGo));
  });
  document.getElementById('account-logout-btn').addEventListener('click', () => {
    if (confirm('Deseja sair da sua conta? Seus dados ficam guardados neste dispositivo.')) {
      logout();
      closeAccountDrawer();
    }
  });
  document.querySelectorAll('.history-filter-tab').forEach(t => {
    t.addEventListener('click', () => {
      document.querySelectorAll('.history-filter-tab').forEach(x => x.classList.toggle('is-active', x === t));
      renderAccountOrders(t.dataset.historyFilter);
    });
  });
}

// Init appbar state na carga
refreshAppbarAccount();
updateAppbarCartBadge();

// ---------- Render: Meus pedidos ----------
function statusLabel(status) {
  if (status === 'delivered') return ['Entregue', 'delivered'];
  if (status === 'ontheway' || status === 'ready') return ['Saiu/Pronto', 'ready'];
  if (status === 'preparing') return ['Em preparo', 'preparing'];
  return ['Recebido', 'received'];
}
function renderAccountOrders(filter) {
  const list = document.getElementById('account-orders-list');
  if (!list) return;
  const acc = getCurrentAccount();
  if (!acc) { list.innerHTML = ''; return; }
  let orders = loadOrders().filter(o => o.accountEmail === acc.email);
  if (filter === 'active') orders = orders.filter(o => (o.statusManual || o.status) !== 'delivered');
  else if (filter === 'done') orders = orders.filter(o => (o.statusManual || o.status) === 'delivered');
  if (!orders.length) {
    list.innerHTML = `
      <div class="account-section__empty">
        <div class="account-section__empty-icon">📭</div>
        <p>Nenhum pedido nesta categoria.</p>
      </div>`;
    return;
  }
  list.innerHTML = orders.map(o => {
    const d = new Date(o.createdAt);
    const dateStr = `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
    const [stLabel, stCls] = statusLabel(o.statusManual || o.status);
    const paidBadge = (o.paymentMethod === 'pix' || o.paymentMethod === 'mercadopago') && o.paymentConfirmed
      ? `<span class="order-history-card__status order-history-card__status--paid">Pago</span>` : '';
    return `
      <div class="order-history-card" data-order-id="${o.id}">
        <div class="order-history-card__head">
          <span class="order-history-card__id">${o.id}</span>
          <span class="order-history-card__status order-history-card__status--${stCls}">${stLabel}</span>
        </div>
        <div class="order-history-card__meta">${dateStr} · <strong class="order-history-card__total">${formatBRL(o.total)}</strong> ${paidBadge}</div>
        <div class="order-history-card__actions">
          <button class="order-history-card__btn" data-order-view="${o.id}">Ver detalhes</button>
          <button class="order-history-card__btn order-history-card__btn--primary" data-order-repeat="${o.id}">Repetir</button>
        </div>
      </div>`;
  }).join('');
  list.querySelectorAll('[data-order-view]').forEach(b => {
    b.addEventListener('click', () => {
      const o = getOrderById(b.dataset.orderView);
      if (!o) return;
      alert(`Pedido ${o.id}\n${new Date(o.createdAt).toLocaleString('pt-BR')}\nTotal: ${formatBRL(o.total)}\nItens: ${(o.items||[]).map(i => `${i.quantity}x ${i.name}`).join(', ')}`);
    });
  });
  list.querySelectorAll('[data-order-repeat]').forEach(b => {
    b.addEventListener('click', () => {
      const o = getOrderById(b.dataset.orderRepeat);
      if (!o || !o.items) return;
      o.items.forEach(it => {
        cart.push({
          id: 'r' + Date.now() + Math.random().toString(36).slice(2,6),
          itemId: it.itemId, type: it.type,
          name: it.name, price: it.price,
          quantity: it.quantity, details: it.details
        });
      });
      renderCart();
      closeAccountDrawer();
      if (typeof openCartDrawer === 'function') openCartDrawer();
      showToast('Itens adicionados ao carrinho!', 2000);
    });
  });
}

// ---------- Render: Prêmios ----------
function renderAccountPrizes() {
  const acc = getCurrentAccount();
  const list = document.getElementById('account-prizes-list');
  const coupons = document.getElementById('account-coupons-list');
  if (!list || !acc) return;
  const prizes = loadPrizes().filter(p => p.active !== false);
  list.innerHTML = prizes.map(p => {
    const canAfford = (acc.points || 0) >= p.points;
    return `
      <div class="prize-card">
        <div class="prize-card__head">
          <span class="prize-card__icon">${p.icon || '🎁'}</span>
          <div class="prize-card__body">
            <h4 class="prize-card__name">${p.name}</h4>
            <p class="prize-card__desc">${p.description || ''}</p>
          </div>
          <span class="prize-card__cost">⭐ ${p.points}</span>
        </div>
        <button class="prize-card__btn" data-prize-redeem="${p.id}" ${canAfford ? '' : 'disabled'}>
          ${canAfford ? 'Resgatar' : `Faltam ${p.points - (acc.points||0)} pts`}
        </button>
      </div>`;
  }).join('');
  list.querySelectorAll('[data-prize-redeem]').forEach(b => {
    b.addEventListener('click', () => {
      try {
        const { coupon } = redeemPrize(b.dataset.prizeRedeem);
        showToast(`Cupom ${coupon.code} gerado! Use no próximo pedido.`, 3500);
        refreshAccountHero();
        renderAccountPrizes();
      } catch (err) {
        showToast(err.message, 2800);
      }
    });
  });

  // Cupons ativos
  const active = (acc.coupons || []).filter(c => !c.used);
  if (!coupons) return;
  if (!active.length) {
    coupons.innerHTML = `
      <div class="account-section__empty">
        <div class="account-section__empty-icon">🎟️</div>
        <p>Resgate um prêmio para ganhar um cupom.</p>
      </div>`;
    return;
  }
  coupons.innerHTML = active.map(c => `
    <div class="coupon-chip">
      <span class="coupon-chip__code">${c.code}</span>
      <span class="coupon-chip__name">${c.name}</span>
    </div>`).join('');
}

// ---------- Render: Endereços ----------
let editingAddressId = null;
function renderAccountAddresses() {
  const acc = getCurrentAccount();
  const list = document.getElementById('account-addresses-list');
  if (!list || !acc) return;
  const addrs = acc.addresses || [];
  if (!addrs.length) {
    list.innerHTML = `
      <div class="account-section__empty">
        <div class="account-section__empty-icon">📍</div>
        <p>Sem endereços salvos ainda.</p>
      </div>`;
    return;
  }
  list.innerHTML = addrs.map(a => `
    <div class="address-card ${a.isDefault ? 'is-default' : ''}">
      <div class="address-card__head">
        <span class="address-card__label">📍 ${a.label} ${a.isDefault ? '<span class="address-card__default-badge">Padrão</span>' : ''}</span>
      </div>
      <p class="address-card__text">${a.street}${a.number ? ', ' + a.number : ''} · ${a.neighborhood}<br>${a.city}/${a.uf} · CEP ${a.cep}${a.ref ? '<br>Ref: ' + a.ref : ''}</p>
      <div class="address-card__actions">
        ${!a.isDefault ? `<button class="address-card__btn" data-addr-default="${a.id}">Tornar padrão</button>` : ''}
        <button class="address-card__btn" data-addr-edit="${a.id}">Editar</button>
        <button class="address-card__btn address-card__btn--danger" data-addr-delete="${a.id}">Excluir</button>
      </div>
    </div>`).join('');
  list.querySelectorAll('[data-addr-default]').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.addrDefault;
      const acc2 = getCurrentAccount();
      const newAddrs = (acc2.addresses || []).map(a => ({ ...a, isDefault: a.id === id }));
      updateCurrentAccount({ addresses: newAddrs });
      renderAccountAddresses();
      refreshAccountHero();
    });
  });
  list.querySelectorAll('[data-addr-edit]').forEach(b => {
    b.addEventListener('click', () => openAddressForm(b.dataset.addrEdit));
  });
  list.querySelectorAll('[data-addr-delete]').forEach(b => {
    b.addEventListener('click', () => {
      if (!confirm('Excluir este endereço?')) return;
      const acc2 = getCurrentAccount();
      const newAddrs = (acc2.addresses || []).filter(a => a.id !== b.dataset.addrDelete);
      updateCurrentAccount({ addresses: newAddrs });
      renderAccountAddresses();
      refreshAccountHero();
    });
  });
}
function openAddressForm(addressId) {
  editingAddressId = addressId || null;
  goAccountStep('address-form');
  const form = document.getElementById('address-form');
  if (form) form.reset();
  document.getElementById('addr-cep-feedback').textContent = '';
  document.getElementById('address-form-title').textContent = addressId ? 'Editar endereço' : 'Novo endereço';
  if (addressId) {
    const acc = getCurrentAccount();
    const a = (acc.addresses || []).find(x => x.id === addressId);
    if (a) {
      document.getElementById('addr-label').value = a.label || '';
      document.getElementById('addr-cep').value = a.cep || '';
      document.getElementById('addr-street').value = a.street || '';
      document.getElementById('addr-number').value = a.number || '';
      document.getElementById('addr-neighborhood').value = a.neighborhood || '';
      document.getElementById('addr-city').value = a.city || '';
      document.getElementById('addr-uf').value = a.uf || '';
      document.getElementById('addr-ref').value = a.ref || '';
      document.getElementById('addr-is-default').checked = !!a.isDefault;
    }
  }
}

// Address form wiring
const addrForm = document.getElementById('address-form');
const addrCepInput = document.getElementById('addr-cep');
const addrCepBtn = document.getElementById('addr-cep-btn');
const addrCepFb = document.getElementById('addr-cep-feedback');
maskCepInput(addrCepInput);
if (addrCepBtn && addrCepInput) {
  addrCepBtn.addEventListener('click', async () => {
    addrCepFb.textContent = 'Consultando CEP…';
    addrCepFb.className = 'cep-feedback';
    try {
      const data = await fetchCep(addrCepInput.value);
      document.getElementById('addr-street').value = data.street;
      document.getElementById('addr-neighborhood').value = data.neighborhood;
      document.getElementById('addr-city').value = data.city;
      document.getElementById('addr-uf').value = data.uf;
      const zone = calcDeliveryByCep(data.cep);
      if (zone.outOfRange) {
        addrCepFb.textContent = '⚠️ CEP fora da área de entrega da pizzaria.';
        addrCepFb.className = 'cep-feedback is-error';
      } else {
        addrCepFb.textContent = `✓ ${data.neighborhood}, ${data.city}/${data.uf} · Taxa ${formatBRL(zone.fee)} · ${zone.minutesMin}-${zone.minutesMax}min`;
        addrCepFb.className = 'cep-feedback is-ok';
      }
    } catch (err) {
      addrCepFb.textContent = '✗ ' + err.message;
      addrCepFb.className = 'cep-feedback is-error';
    }
  });
}
if (addrForm) {
  addrForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const acc = getCurrentAccount();
    if (!acc) return;
    const addrData = {
      id: editingAddressId || ('a' + Date.now()),
      label: document.getElementById('addr-label').value.trim() || 'Endereço',
      cep: document.getElementById('addr-cep').value.replace(/\D/g, ''),
      street: document.getElementById('addr-street').value.trim(),
      number: document.getElementById('addr-number').value.trim(),
      neighborhood: document.getElementById('addr-neighborhood').value.trim(),
      city: document.getElementById('addr-city').value.trim(),
      uf: document.getElementById('addr-uf').value.trim().toUpperCase(),
      ref: document.getElementById('addr-ref').value.trim(),
      isDefault: document.getElementById('addr-is-default').checked
    };
    let addrs = (acc.addresses || []).slice();
    if (editingAddressId) {
      addrs = addrs.map(a => a.id === editingAddressId ? addrData : a);
    } else {
      if (!addrs.length) addrData.isDefault = true;
      addrs.push(addrData);
    }
    if (addrData.isDefault) {
      addrs = addrs.map(a => ({ ...a, isDefault: a.id === addrData.id }));
    }
    updateCurrentAccount({ addresses: addrs });
    editingAddressId = null;
    showToast('Endereço salvo!', 2000);
    popAccountStep();
    renderAccountAddresses();
  });
}
const addAddrBtn = document.getElementById('account-add-address-btn');
if (addAddrBtn) addAddrBtn.addEventListener('click', () => openAddressForm(null));

// ---------- Render: Profile ----------
function renderAccountProfileForm() {
  const acc = getCurrentAccount();
  if (!acc) return;
  document.getElementById('profile-name').value = acc.name || '';
  document.getElementById('profile-phone').value = acc.phone || '';
  document.getElementById('profile-email').value = acc.email || '';
}
const profileForm = document.getElementById('profile-form');
if (profileForm) {
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    if (!name) return showToast('Nome obrigatório', 2000);
    updateCurrentAccount({ name, phone });
    refreshAppbarAccount();
    showToast('Dados atualizados!', 2000);
    popAccountStep();
  });
}

// ---------- Mudar senha ----------
const pwdForm = document.getElementById('password-form');
if (pwdForm) {
  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cur = document.getElementById('pwd-current').value;
    const nw = document.getElementById('pwd-new').value;
    const cf = document.getElementById('pwd-confirm').value;
    if (nw !== cf) return showToast('Nova senha e confirmação diferentes.', 2500);
    if (nw.length < 6) return showToast('Senha precisa ter pelo menos 6 caracteres.', 2500);
    const acc = getCurrentAccount();
    if (!acc) return;
    const curHash = await hashPassword(acc.salt, cur);
    if (curHash !== acc.passwordHash) return showToast('Senha atual incorreta.', 2500);
    const newSalt = genSalt();
    const newHash = await hashPassword(newSalt, nw);
    updateCurrentAccount({ salt: newSalt, passwordHash: newHash });
    showToast('Senha atualizada!', 2000);
    pwdForm.reset();
    popAccountStep();
  });
}

// ---------- Calculadora pública de frete ----------
const dCalcForm = document.getElementById('delivery-calc-form');
const dCalcInput = document.getElementById('delivery-calc-cep');
const dCalcResult = document.getElementById('delivery-calc-result');
maskCepInput(dCalcInput);
if (dCalcForm) {
  let _dCalcBusy = false;
  let _dCalcDebounce = null;
  let _dCalcLastCep = '';

  const renderCalcResult = (cepData, calc) => {
    if (calc.outOfRange) {
      dCalcResult.className = 'delivery-calc__result is-visible is-out';
      dCalcResult.innerHTML = `
        <div class="delivery-calc__result-row">📍 <span><strong>${cepData.neighborhood || '—'}</strong>, ${cepData.city}/${cepData.uf}</span></div>
        ${cepData.street ? `<div class="delivery-calc__result-row" style="font-size:0.85rem;color:#6b5a55;">${cepData.street}</div>` : ''}
        ${calc.km != null ? `<div class="delivery-calc__result-row">📏 Distância: <strong>${calc.km.toFixed(1)} km</strong></div>` : ''}
        <div class="delivery-calc__result-row">⚠️ <strong>${calc.reason || 'Fora da área de entrega'}</strong></div>
        <div class="delivery-calc__result-row" style="font-size:0.85rem;color:#6b5a55;">Você ainda pode retirar pessoalmente na pizzaria.</div>`;
      return;
    }
    dCalcResult.className = 'delivery-calc__result is-visible is-ok';
    dCalcResult.innerHTML = `
      <div class="delivery-calc__result-row">📍 <span><strong>${cepData.neighborhood || '—'}</strong>, ${cepData.city}/${cepData.uf}</span></div>
      ${cepData.street ? `<div class="delivery-calc__result-row" style="font-size:0.85rem;color:#6b5a55;">${cepData.street}</div>` : ''}
      <div class="delivery-calc__result-row">📏 Distância: <strong>${calc.km.toFixed(1)} km</strong></div>
      <div class="delivery-calc__result-row">💰 Taxa de entrega: <strong>${formatBRL(calc.fee)}</strong></div>
      <div class="delivery-calc__result-row">⏱ Tempo estimado: <strong>${calc.minutesMin}-${calc.minutesMax} min</strong></div>
      <div class="delivery-calc__result-actions">
        <a class="button button--ghost" href="#cardapio" onclick="document.getElementById('delivery-calc-result').classList.remove('is-visible')">Ver cardápio</a>
        ${getCurrentAccount() ? '<button type="button" class="button button--whatsapp-pulse" id="dcalc-save-addr">📍 Salvar este CEP</button>' : ''}
      </div>`;
    const saveBtn = document.getElementById('dcalc-save-addr');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        openAccountDrawer('addresses');
        setTimeout(() => {
          openAddressForm(null);
          document.getElementById('addr-cep').value = cepData.cep.length > 5 ? `${cepData.cep.slice(0,5)}-${cepData.cep.slice(5)}` : cepData.cep;
          document.getElementById('addr-street').value = cepData.street;
          document.getElementById('addr-neighborhood').value = cepData.neighborhood;
          document.getElementById('addr-city').value = cepData.city;
          document.getElementById('addr-uf').value = cepData.uf;
        }, 350);
      });
    }
  };

  const runDeliveryCalc = async (cepRaw) => {
    if (_dCalcBusy) return;
    if (!dCalcResult) return;
    const cep = (cepRaw || dCalcInput.value || '').replace(/\D/g, '');
    if (cep === _dCalcLastCep && dCalcResult.classList.contains('is-visible')) return;
    if (cep.length !== 8) {
      if (cep.length === 0) {
        dCalcResult.classList.remove('is-visible', 'is-ok', 'is-out');
      } else {
        dCalcResult.className = 'delivery-calc__result is-visible';
        dCalcResult.innerHTML = `<div class="delivery-calc__result-row" style="font-size:0.85rem;color:#6b5a55;">Digite ${8 - cep.length} dígito(s) restante(s)…</div>`;
      }
      return;
    }
    _dCalcBusy = true;
    _dCalcLastCep = cep;
    dCalcResult.className = 'delivery-calc__result is-visible';
    dCalcResult.innerHTML = '<div class="delivery-calc__result-row">📡 Consultando CEP…</div>';
    try {
      const cepData = await geocodeCep(cep);
      const calc = calcDeliveryByDistance(cepData);
      console.log('[delivery-calc]', { cep, cepData, calc });
      renderCalcResult(cepData, calc);
    } catch (err) {
      dCalcResult.className = 'delivery-calc__result is-visible is-out';
      dCalcResult.innerHTML = `<div class="delivery-calc__result-row">✗ ${err.message}</div>`;
    } finally {
      _dCalcBusy = false;
    }
  };

  dCalcForm.addEventListener('submit', (e) => { e.preventDefault(); _dCalcLastCep = ''; runDeliveryCalc(); });
  if (dCalcInput) {
    dCalcInput.addEventListener('input', () => {
      const cep = (dCalcInput.value || '').replace(/\D/g, '');
      clearTimeout(_dCalcDebounce);
      // autocomplete: dispara automaticamente quando completar 8 dígitos
      if (cep.length === 8) {
        _dCalcDebounce = setTimeout(() => runDeliveryCalc(cep), 250);
      } else if (cep.length === 0) {
        dCalcResult.classList.remove('is-visible', 'is-ok', 'is-out');
      } else {
        dCalcResult.className = 'delivery-calc__result is-visible';
        dCalcResult.innerHTML = `<div class="delivery-calc__result-row" style="font-size:0.85rem;color:#6b5a55;">✏️ Faltam ${8 - cep.length} dígito(s)…</div>`;
      }
    });
    dCalcInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); _dCalcLastCep = ''; runDeliveryCalc(); }
    });
  }
}

// ---------- Endereços salvos no checkout ----------
function renderSavedAddressesSelector() {
  const acc = getCurrentAccount();
  if (!acc || !(acc.addresses || []).length) return;
  let host = document.getElementById('saved-address-selector');
  const checkoutStreetEl = document.getElementById('checkout-street');
  if (!checkoutStreetEl) return;
  if (!host) {
    host = document.createElement('div');
    host.id = 'saved-address-selector';
    host.className = 'form-group';
    host.style.marginBottom = '12px';
    // Insere antes do form de rua
    const parent = checkoutStreetEl.closest('.form-group')?.parentElement;
    if (parent) parent.insertBefore(host, checkoutStreetEl.closest('.form-group'));
  }
  host.innerHTML = `
    <label for="saved-address-select" style="font-weight:600;color:#5a0a18;">📍 Usar endereço salvo</label>
    <select id="saved-address-select" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid rgba(36,19,15,0.15);background:#fafafa;font-size:0.95rem;">
      <option value="">— Preencher manualmente —</option>
      ${acc.addresses.map(a => `<option value="${a.id}" ${a.isDefault ? 'selected' : ''}>${a.label} · ${a.neighborhood}/${a.city}</option>`).join('')}
    </select>
  `;
  const sel = document.getElementById('saved-address-select');
  const fillFromAddr = (id) => {
    const a = acc.addresses.find(x => x.id === id);
    if (!a) return;
    if (checkoutStreetEl) checkoutStreetEl.value = `${a.street}${a.number ? ', ' + a.number : ''}`;
    const nb = document.getElementById('checkout-neighborhood');
    if (nb) nb.value = a.neighborhood;
    const rf = document.getElementById('checkout-ref');
    if (rf) rf.value = a.ref || '';
  };
  // Preenche padrão automaticamente
  const def = acc.addresses.find(a => a.isDefault) || acc.addresses[0];
  if (def && checkoutStreetEl && !checkoutStreetEl.value) fillFromAddr(def.id);
  sel.addEventListener('change', () => {
    if (sel.value) fillFromAddr(sel.value);
  });
}

/* ============================================================
   PWA - Add to Home Screen (A2HS)
   ============================================================ */
(function initPwaInstall() {
  const BANNER = document.getElementById('pwa-install-banner');
  const INSTALL_BTN = document.getElementById('pwa-install-btn');
  const CLOSE_BTN = document.getElementById('pwa-install-close');
  const MOBILE_INSTALL_BTN = document.getElementById('mobile-nav-install');
  const LS_KEY = 'premium_pizzaria_pwa_dismissed';
  const LS_INSTALLED_KEY = 'premium_pizzaria_pwa_installed';
  const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  let deferredPrompt = null;

  // Se já estiver rodando como standalone (instalado), não mostra o banner
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    if (BANNER) BANNER.remove();
    return;
  }

  // Se o usuário já instalou antes (mesmo que noutra sessão), não mostra
  if (localStorage.getItem(LS_INSTALLED_KEY) === 'true') {
    if (BANNER) BANNER.remove();
    return;
  }

  // Se o usuário dispensou recentemente (7 dias), não mostra
  const dismissedAt = localStorage.getItem(LS_KEY);
  if (dismissedAt) {
    const daysSinceDismiss = (Date.now() - parseInt(dismissedAt, 10)) / 86400000;
    if (daysSinceDismiss < 7) {
      if (BANNER) BANNER.remove();
      return;
    }
  }

  function showBanner() {
    if (!BANNER) return;
    // Pequeno atraso para não aparecer imediatamente ao carregar
    setTimeout(() => {
      BANNER.setAttribute('aria-hidden', 'false');
      BANNER.classList.add('is-visible');
    }, 3000);
  }

  function hideBanner() {
    if (!BANNER) return;
    BANNER.classList.remove('is-visible');
    BANNER.setAttribute('aria-hidden', 'true');
  }

  function dismissBanner() {
    hideBanner();
    localStorage.setItem(LS_KEY, String(Date.now()));
    // Remove o banner do DOM após a transição
    setTimeout(() => {
      if (BANNER) BANNER.remove();
    }, 400);
  }

  // Chrome / Android: beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showBanner();
    if (MOBILE_INSTALL_BTN) MOBILE_INSTALL_BTN.style.display = 'flex';
  });

  async function triggerInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (result.outcome === 'accepted') {
        localStorage.setItem(LS_INSTALLED_KEY, 'true');
        dismissBanner();
        if (MOBILE_INSTALL_BTN) MOBILE_INSTALL_BTN.style.display = 'none';
      }
    } else if (iOS) {
      dismissBanner();
    }
  }

  if (INSTALL_BTN) {
    INSTALL_BTN.addEventListener('click', triggerInstall);
  }

  if (MOBILE_INSTALL_BTN) {
    MOBILE_INSTALL_BTN.addEventListener('click', () => {
      // Fecha o drawer e dispara o install
      const nav = document.getElementById('mobile-nav');
      if (nav) nav.classList.remove('is-open');
      triggerInstall();
    });
  }

  if (CLOSE_BTN) {
    CLOSE_BTN.addEventListener('click', dismissBanner);
  }

  // App instalado com sucesso
  window.addEventListener('appinstalled', () => {
    localStorage.setItem(LS_INSTALLED_KEY, 'true');
    dismissBanner();
    if (MOBILE_INSTALL_BTN) MOBILE_INSTALL_BTN.style.display = 'none';
    deferredPrompt = null;
  });

  // iOS Safari: mostra hint educacional após 5s se nunca foi visto
  if (iOS && !localStorage.getItem(LS_KEY) && !localStorage.getItem(LS_INSTALLED_KEY)) {
    setTimeout(() => {
      if (!BANNER || BANNER.classList.contains('is-visible')) return;
      // Para iOS, muda o texto do banner para falar do Safari Share
      const title = BANNER.querySelector('.pwa-install-banner__title');
      const desc = BANNER.querySelector('.pwa-install-banner__desc');
      if (title) title.textContent = 'Adicione à Tela Inicial';
      if (desc) desc.textContent = 'No Safari, toque em Compartilhar › Adicionar à Tela de Início.';
      if (INSTALL_BTN) {
        INSTALL_BTN.textContent = 'Entendi';
        INSTALL_BTN.addEventListener('click', dismissBanner, { once: true });
      }
      showBanner();
    }, 5000);
  }

  // Re-mostrar após comprar/completar pedido (se ainda não instalou e não dispensou)
  // Isso é acionado via evento customizado ou podemos apenas deixar o timer original.
})();

/* ============================================================
   Mobile Navigation Drawer
   ============================================================ */
(function initMobileNav() {
  const HAMBURGER = document.querySelector('.store-appbar__button');
  const NAV = document.getElementById('mobile-nav');
  const CLOSE = document.getElementById('mobile-nav-close');
  const BACKDROP = document.getElementById('mobile-nav-backdrop');

  if (!HAMBURGER || !NAV) return;

  function openNav() {
    NAV.setAttribute('aria-hidden', 'false');
    NAV.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeNav() {
    NAV.classList.remove('is-open');
    NAV.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  HAMBURGER.addEventListener('click', openNav);

  if (CLOSE) CLOSE.addEventListener('click', closeNav);
  if (BACKDROP) BACKDROP.addEventListener('click', closeNav);

  // Fecha ao pressionar Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && NAV.classList.contains('is-open')) closeNav();
  });

  // Fecha ao clicar em links internos com data-nav-close
  NAV.querySelectorAll('[data-nav-close]').forEach((el) => {
    el.addEventListener('click', closeNav);
  });
})();

/* ============================================================
   Sistema de Notificações
   ============================================================ */
const NOTIFICATIONS_KEY = 'premium_pizzaria_notifications';
const NOTIFICATIONS_READ_KEY = 'premium_pizzaria_notifications_read';

function loadNotificacoes() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function getReadNotificationIds() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_READ_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveReadNotificationIds(ids) {
  try { localStorage.setItem(NOTIFICATIONS_READ_KEY, JSON.stringify(ids)); } catch (e) {}
}

function markNotificationRead(id) {
  const ids = getReadNotificationIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveReadNotificationIds(ids);
    updateNotificationBadge();
  }
}

function markAllNotificationsRead() {
  const all = loadNotificacoes().filter(function(n) { return n.active !== false; });
  const ids = all.map(function(n) { return n.id; });
  saveReadNotificationIds(ids);
  updateNotificationBadge();
}

function getActiveNotifications() {
  const all = loadNotificacoes();
  return all.filter(function(n) { return n.active !== false; });
}

function getUnreadCount() {
  const active = getActiveNotifications();
  const read = getReadNotificationIds();
  return active.filter(function(n) { return !read.includes(n.id); }).length;
}

function updateNotificationBadge() {
  var badge = document.getElementById('appbar-notification-badge');
  if (!badge) return;
  var count = getUnreadCount();
  if (count > 0) {
    badge.textContent = count > 9 ? '9+' : String(count);
    badge.hidden = false;
  } else {
    badge.hidden = true;
  }
}

function renderNotifications() {
  var list = document.getElementById('notification-list');
  var empty = document.getElementById('notification-empty');
  if (!list) return;
  var notifs = getActiveNotifications();
  var readIds = getReadNotificationIds();
  if (!notifs.length) {
    list.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }
  list.style.display = '';
  if (empty) empty.style.display = 'none';
  var typeIcons = { promocao: '🎉', aviso: '📢', novidade: '✨' };
  list.innerHTML =
    '<div style="padding:8px 0;text-align:right;">' +
    '<button onclick="markAllNotificationsRead()" style="background:none;border:none;color:var(--text-muted);font-size:0.78rem;cursor:pointer;font-weight:600;">Marcar todas como lidas</button>' +
    '</div>' +
    notifs.map(function(n) {
      var icon = n.icon || typeIcons[n.type] || '📌';
      var isRead = readIds.includes(n.id);
      var dateStr = new Date(n.createdAt).toLocaleDateString('pt-BR');
      return '<div class="notification-card' + (isRead ? '' : ' notification-card--unread') + '" data-id="' + n.id + '" onclick="markNotificationRead(\'' + n.id + '\')">' +
        '<div class="notification-card__icon">' + icon + '</div>' +
        '<div class="notification-card__body">' +
        '<div class="notification-card__title">' + (n.title || '') + '</div>' +
        '<div class="notification-card__msg">' + (n.message || '') + '</div>' +
        '<div class="notification-card__date">' + dateStr + '</div>' +
        '</div>' +
        (isRead ? '' : '<div class="notification-card__dot"></div>') +
        '</div>';
    }).join('');
}

function openNotificationDrawer() {
  var drawer = document.getElementById('notification-drawer');
  var backdrop = document.getElementById('notification-drawer-backdrop');
  if (!drawer) return;
  renderNotifications();
  drawer.setAttribute('aria-hidden', 'false');
  drawer.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  if (backdrop) backdrop.classList.add('is-open');
}

function closeNotificationDrawer() {
  var drawer = document.getElementById('notification-drawer');
  var backdrop = document.getElementById('notification-drawer-backdrop');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (backdrop) backdrop.classList.remove('is-open');
}

(function initNotificationUI() {
  var btn = document.getElementById('appbar-notification-btn');
  var closeBtn = document.getElementById('notification-close-btn');
  var backdrop = document.getElementById('notification-drawer-backdrop');
  var drawer = document.getElementById('notification-drawer');

  if (btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openNotificationDrawer();
    });
  }
  if (closeBtn) {
    closeBtn.addEventListener('click', closeNotificationDrawer);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeNotificationDrawer);
  }
  if (drawer) {
    drawer.addEventListener('click', function(e) {
      if (e.target === drawer || e.target.closest('.notification-card')) {
        renderNotifications();
        updateNotificationBadge();
      }
    });
  }
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('is-open')) {
      closeNotificationDrawer();
    }
  });

  updateNotificationBadge();
})();

/* ============================================================
   Welcome Coupon Popup
   ============================================================ */
function seedWelcomeCoupon() {
  var list = loadPromoCoupons();
  var exists = list.some(function(c) { return c.code === 'BEMVINDO10'; });
  if (!exists) {
    list.push({
      id: 'cp-welcome',
      code: 'BEMVINDO10',
      name: '10% OFF na primeira compra',
      discountType: 'percent',
      discountValue: 10,
      minOrder: 0,
      expires: '',
      maxUses: 0,
      usedCount: 0,
      active: true,
      createdAt: Date.now()
    });
    localStorage.setItem(PROMO_COUPONS_KEY, JSON.stringify(list));
  }
}

function initWelcomeCouponPopup() {
  var overlay = document.getElementById('welcome-coupon-overlay');
  var acceptBtn = document.getElementById('welcome-coupon-accept');
  var dismissBtn = document.getElementById('welcome-coupon-dismiss');
  var closeBtn = document.getElementById('welcome-coupon-close');
  var codeArea = document.getElementById('welcome-coupon-code-area');
  if (!overlay) return;

  var key = 'premium_pizzaria_welcome_coupon_shown';
  var shown = localStorage.getItem(key);
  if (shown) return;

  // Garante que o cupom BEMVINDO10 existe no sistema
  seedWelcomeCoupon();

  function showPopup() {
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    localStorage.setItem(key, Date.now().toString());
  }

  function copyCouponCode() {
    var code = 'BEMVINDO10';
    navigator.clipboard.writeText(code).then(function() {
      if (typeof showToast === 'function') showToast('Cupom ' + code + ' copiado! 🎉');
    }).catch(function() {
      // Fallback: seleciona o texto
      var el = document.querySelector('.coupon-code-display');
      if (el) {
        var range = document.createRange();
        range.selectNodeContents(el);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }

  function acceptCoupon() {
    var acc = typeof getCurrentAccount === 'function' ? getCurrentAccount() : null;
    if (acc && typeof updateCurrentAccount === 'function') {
      var existing = (acc.coupons || []).find(function(c) { return c.code === 'BEMVINDO10' && !c.used; });
      if (!existing) {
        var coupon = {
          code: 'BEMVINDO10',
          name: '10% OFF na primeira compra',
          discountType: 'percent',
          discountValue: 10,
          earnedAt: Date.now(),
          used: false
        };
        updateCurrentAccount({ coupons: [...(acc.coupons || []), coupon] });
      }
      closePopup();
      if (typeof showToast === 'function') showToast('Cupom BEMVINDO10 adicionado! 🎉');
    } else {
      if (acceptBtn) acceptBtn.style.display = 'none';
      if (codeArea) codeArea.style.display = 'block';
      copyCouponCode();
      if (dismissBtn) dismissBtn.textContent = 'Fechar';
    }
  }

  // Torna o código clicável para copiar
  var codeDisplay = document.querySelector('.coupon-code-display');
  if (codeDisplay) {
    codeDisplay.style.cursor = 'pointer';
    codeDisplay.title = 'Clique para copiar';
    codeDisplay.addEventListener('click', copyCouponCode);
  }

  if (acceptBtn) acceptBtn.addEventListener('click', acceptCoupon);
  if (dismissBtn) dismissBtn.addEventListener('click', closePopup);
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePopup();
  });

  // Delay de 3s para não atrapalhar a navegação inicial
  setTimeout(showPopup, 3000);
}

/* ============================================================
   Seasonal Notifications Auto-trigger
   ============================================================ */
function seedSeasonalNotifications() {
  var days = [
    { dow: 1, icon: '🔥', title: 'Segundou em Dobro', msg: 'Compre uma média, leve outra média grátis! Só nas segundas, 18h-22h.' },
    { dow: 2, icon: '🍕', title: 'Terça do Sabor', msg: 'Terça-feira é dia de experimentar um sabor novo!' },
    { dow: 3, icon: '🍫', title: 'Quarta do Doce', msg: 'Toda pizza doce média com 20% OFF. Quartas, o dia todo!' },
    { dow: 4, icon: '🍕', title: 'Quinta do Clássico', msg: 'Pizzas tradicionais com preço especial às quintas!' },
    { dow: 5, icon: '🎉', title: 'Sextou! 🎉', msg: 'Sextou! Que tal uma pizza + coquinha para celebrar? Promoções especiais de sexta!' },
    { dow: 6, icon: '🎊', title: 'Sábado Especial', msg: 'Sábado é dia de pizza! Aproveite nossas ofertas de fim de semana.' },
    { dow: 0, icon: '😌', title: 'Domingo em Família', msg: 'Domingo mais gostoso com pizza em casa. Peça já a sua!' }
  ];
  var today = new Date().getDay();
  var seasonal = days.find(function(d) { return d.dow === today; });
  if (!seasonal) return;
  var notifs = loadNotificacoes();
  var seasonalId = 'seasonal-' + today;
  var exists = notifs.some(function(n) { return n.id === seasonalId; });
  if (exists) return;
  notifs.push({
    id: seasonalId,
    title: seasonal.title,
    message: seasonal.msg,
    type: 'promocao',
    icon: seasonal.icon,
    active: true,
    createdAt: Date.now()
  });
  try { localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifs)); } catch (e) {}
  updateNotificationBadge();
}

/* ============================================================
   Cupons Promocionais (não-fidelidade) no Checkout
   ============================================================ */
const PROMO_COUPONS_KEY = 'premium_pizzaria_promo_coupons';

function loadPromoCoupons() {
  try {
    var raw = localStorage.getItem(PROMO_COUPONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function getActivePromoCoupons() {
  var all = loadPromoCoupons();
  var now = Date.now();
  return all.filter(function(c) {
    if (c.active === false) return false;
    if (c.expires && new Date(c.expires + 'T23:59:59').getTime() < now) return false;
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return false;
    return true;
  });
}

function calcCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.minOrder > 0 && subtotal < coupon.minOrder) return 0;
  if (coupon.discountType === 'percent') {
    return subtotal * (coupon.discountValue / 100);
  }
  return Math.min(coupon.discountValue, subtotal);
}

function getCouponLabel(coupon) {
  if (!coupon) return '';
  var discountLabel = coupon.discountType === 'percent'
    ? coupon.discountValue + '% OFF'
    : 'R$ ' + Number(coupon.discountValue).toFixed(2) + ' OFF';
  return coupon.code + ' · ' + discountLabel + (coupon.name ? ' · ' + coupon.name : '');
}

function applyCouponDiscount() {
  var sel = document.getElementById('cart-coupon-select');
  var subtotal = cart.reduce(function(sum, item) { return sum + (item.price * item.quantity); }, 0);
  var discountRow = document.getElementById('summary-discount-row');
  var discountEl = document.getElementById('summary-discount');
  if (!sel || !discountRow || !discountEl) return;

  var selectedCode = sel.value;
  if (!selectedCode) {
    discountRow.style.display = 'none';
    refreshPaymentDetailsScreen();
    return;
  }

  // Try promo coupon first, then loyalty
  var promo = getActivePromoCoupons().find(function(c) { return c.code === selectedCode; });
  var acc = typeof getCurrentAccount === 'function' ? getCurrentAccount() : null;
  var loyalty = acc ? (acc.coupons || []).find(function(c) { return c.code === selectedCode && !c.used; }) : null;
  var coupon = promo || loyalty;

  if (!coupon) {
    discountRow.style.display = 'none';
    refreshPaymentDetailsScreen();
    return;
  }

  var discount = calcCouponDiscount(coupon, subtotal);
  if (discount <= 0) {
    discountRow.style.display = 'none';
    refreshPaymentDetailsScreen();
    return;
  }

  discountRow.style.display = 'flex';
  discountEl.textContent = '-' + formatBRL(discount);
  refreshPaymentDetailsScreen();
}

function refreshCheckoutCoupons() {
  var group = document.getElementById('cart-coupon-group');
  var sel = document.getElementById('cart-coupon-select');
  if (!group || !sel) return;

  // Collect all available coupons
  var options = [];

  // Promotional coupons
  var promo = getActivePromoCoupons();
  promo.forEach(function(c) {
    options.push({ code: c.code, label: getCouponLabel(c) });
  });

  // Loyalty coupons (from account)
  var acc = typeof getCurrentAccount === 'function' ? getCurrentAccount() : null;
  if (acc) {
    var loyalty = (acc.coupons || []).filter(function(c) { return !c.used; });
    loyalty.forEach(function(c) {
      options.push({ code: c.code, label: c.code + ' · ' + (c.name || 'Cupom fidelidade') });
    });
  }

  if (!options.length) {
    group.style.display = 'none';
    return;
  }
  group.style.display = '';
  sel.innerHTML = '<option value="">— Não usar cupom —</option>' +
    options.map(function(o) { return '<option value="' + o.code + '">' + o.label + '</option>'; }).join('');
  applyCouponDiscount();
}

function markPromoCouponUsed(code) {
  var list = loadPromoCoupons();
  var idx = list.findIndex(function(c) { return c.code === code; });
  if (idx >= 0) {
    list[idx].usedCount = (list[idx].usedCount || 0) + 1;
    localStorage.setItem(PROMO_COUPONS_KEY, JSON.stringify(list));
  }
}

// Boot: init functions on defer-loaded script
seedSeasonalNotifications();
initWelcomeCouponPopup();

