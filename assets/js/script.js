const WHATSAPP_NUMBER = '5586994854771';

const promotions = [
  {
    title: 'Pizza grande a partir de R$ 30',
    description: 'Oferta editável para atrair pedidos rápidos no início da jornada.',
    priceLabel: 'Hoje',
    message: 'Olá! Quero essa promoção da pizza grande a partir de R$ 30.'
  },
  {
    title: 'Combo Família',
    description: 'Pizza grande + refrigerante 2L + borda recheada.',
    priceLabel: 'Combo',
    message: 'Olá! Quero pedir o Combo Família.'
  },
  {
    title: 'Combo Casal',
    description: 'Pizza média + refrigerante 1L para uma noite especial.',
    priceLabel: 'Casal',
    message: 'Olá! Quero pedir o Combo Casal.'
  },
  {
    title: 'Promoção do dia',
    description: 'Espaço ideal para destacar a ação comercial mais forte do dia.',
    priceLabel: 'Oferta',
    message: 'Olá! Quero consultar a promoção do dia.'
  }
];

const menu = [
  {
    id: 'calabresa-premium',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Calabresa Premium',
    description: 'Molho artesanal, mussarela especial, calabresa selecionada, cebola roxa e orégano.',
    price: 30,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'frango-catupiry',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Frango com Catupiry',
    description: 'Frango bem temperado, muito recheio e catupiry cremoso.',
    price: 34,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'portuguesa',
    category: 'tradicionais',
    type: 'pizza',
    name: 'Portuguesa',
    description: 'Presunto, ovos, cebola, ervilha, mussarela e toque especial da casa.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'quatro-queijos',
    category: 'especiais',
    type: 'pizza',
    name: 'Quatro Queijos',
    description: 'Mix intenso de queijos derretidos para quem ama cremosidade.',
    price: 39,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'bacon-especial',
    category: 'especiais',
    type: 'pizza',
    name: 'Bacon Especial',
    description: 'Bacon crocante, mussarela e cobertura generosa.',
    price: 41,
    image: 'https://images.unsplash.com/photo-1601924582975-7e6ec6dc1b08?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'chocolate-morango',
    category: 'doces',
    type: 'pizza',
    name: 'Chocolate com Morango',
    description: 'Uma sobremesa irresistível para fechar o pedido com chave de ouro.',
    price: 36,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'combo-premium',
    category: 'combos',
    type: 'combo',
    name: 'Combo Premium',
    description: '2 pizzas grandes + borda recheada + refrigerante 2L.',
    price: 89,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'combo-casal',
    category: 'combos',
    type: 'combo',
    name: 'Combo Casal',
    description: '1 pizza grande + 1 refrigerante lata + 1 pizza doce média.',
    price: 69,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'combo-galera',
    category: 'combos',
    type: 'combo',
    name: 'Combo Galera',
    description: '3 pizzas grandes + borda recheada + refrigerante 2L.',
    price: 119,
    image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'combo-familia',
    category: 'combos',
    type: 'combo',
    name: 'Combo Família',
    description: '2 pizzas família + borda recheada + 2 guaraná 2L.',
    price: 139,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'refrigerante-2l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Refrigerante 2L',
    description: 'Acompanhamento ideal para combos e família.',
    price: 12,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'carne-chapa-150',
    category: 'porcoes',
    type: 'porcao',
    name: 'Carne na Chapa (150g)',
    description: 'Carne acebolada na chapa quente, servida no ponto certo.',
    price: 15,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'file-fritas-500',
    category: 'tira-gosto',
    type: 'tira-gosto',
    name: 'Filé com Fritas (500g)',
    description: 'Tiras de filé mignon aceboladas com porção generosa de batatas fritas crocantes.',
    price: 45,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'frango-500',
    category: 'tira-gosto',
    type: 'tira-gosto',
    name: 'Frango Frito (500g)',
    description: 'Pedaços de frango crocantes e suculentos, bem temperados.',
    price: 35,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'farofa',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Farofa da Casa',
    description: 'Farofa crocante e temperada, acompanhamento perfeito para carnes.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'maria-isabel',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Maria Isabel',
    description: 'Arroz tradicional piauiense com carne de sol picadinha e temperos regionais.',
    price: 15,
    image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'batata-300',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Porção de Batata Frita (300g)',
    description: 'Batatas fritas douradas e crocantes, sequinhas e salgadas na medida.',
    price: 16,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'batata-400',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Porção de Batata Frita (400g)',
    description: 'Porção grande de batatas fritas crocantes, perfeita para compartilhar.',
    price: 20,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'vinagrete',
    category: 'acompanhamentos',
    type: 'acompanhamento',
    name: 'Vinagrete Especial',
    description: 'Molho vinagrete fresco com tomate, cebola e pimentão picadinhos.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cerveja-stella',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Stella Artois Long Neck',
    description: 'Cerveja premium Stella Artois, gelada e refrescante.',
    price: 9,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cerveja-skol',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Skol Lata',
    description: 'Cerveja Skol gelada, a preferida para os momentos de descontração.',
    price: 7,
    image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'cerveja-budweiser',
    category: 'cervejas',
    type: 'cerveja',
    name: 'Cerveja Budweiser Long Neck',
    description: 'Cerveja americana Budweiser long neck bem gelada.',
    price: 9,
    image: 'https://images.unsplash.com/photo-1527838832700-50592524df75?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'agua-com-gas',
    category: 'bebidas',
    type: 'bebida',
    name: 'Água Mineral com Gás 500ml',
    description: 'Água mineral gaseificada fresca.',
    price: 4.5,
    image: 'https://images.unsplash.com/photo-1608885898957-a599fb18ec3f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'agua-sem-gas',
    category: 'bebidas',
    type: 'bebida',
    name: 'Água Mineral sem Gás 500ml',
    description: 'Água mineral natural fresca.',
    price: 4,
    image: 'https://images.unsplash.com/photo-1608885898957-a599fb18ec3f?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'guarana-1l-item',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica 1L',
    description: 'Refrigerante Guaraná Antarctica 1 litro bem gelado.',
    price: 8,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'guarana-2l-item',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica 2L',
    description: 'Refrigerante Guaraná Antarctica tamanho família 2 litros.',
    price: 12,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coca-1l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola 1L',
    description: 'Refrigerante Coca-Cola garrafa de 1 litro bem gelada.',
    price: 9,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'guarana-350ml',
    category: 'bebidas',
    type: 'bebida',
    name: 'Guaraná Antarctica Lata 350ml',
    description: 'Refrigerante Guaraná Antarctica lata de 350ml gelada.',
    price: 5,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coca-350ml',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante Coca-Cola lata de 350ml gelada.',
    price: 5.5,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'coca-1-5l',
    category: 'bebidas',
    type: 'bebida',
    name: 'Coca-Cola 1.5L',
    description: 'Refrigerante Coca-Cola garrafa de 1.5 litros.',
    price: 11,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'fanta-laranja-retornavel',
    category: 'bebidas',
    type: 'bebida',
    name: 'Fanta Laranja Retornável 2L',
    description: 'Refrigerante Fanta Laranja garrafa retornável de 2 litros.',
    price: 8.5,
    image: 'https://images.unsplash.com/photo-1624552184280-9e9631bbeee9?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'suco-maracuja-300',
    category: 'bebidas',
    type: 'bebida',
    name: 'Suco Natural de Maracujá 300ml',
    description: 'Suco natural e refrescante de maracujá da fruta.',
    price: 8,
    image: 'https://images.unsplash.com/photo-1536746803623-cef87080bfc8?auto=format&fit=crop&w=600&q=80'
  }
];

const categories = [
  { id: 'todos', label: 'Todos', icon: '🍽️' },
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
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'guarana-zero-1l',
    label: '02x Guaraná Zero 01L',
    detail: 'Opção zero açúcar para o combo.',
    price: 14,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'sem-bebida',
    label: 'Não quero bebida',
    detail: 'Continuar apenas com a pizza.',
    price: 0,
    image: 'https://images.unsplash.com/photo-1601924582975-7e6ec6dc1b08?auto=format&fit=crop&w=500&q=80'
  }
];

const sachetOptions = [
  {
    id: 'sem-sache',
    label: 'Não quero sachê',
    detail: 'Enviar sem ketchup ou maionese.',
    price: 0,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'ketchup-maionese',
    label: 'Enviar ketchup e maionese',
    detail: 'Sachês variados para acompanhar.',
    price: 0,
    image: 'https://images.unsplash.com/photo-1601924582975-7e6ec6dc1b08?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'somente-ketchup',
    label: 'Enviar somente ketchup',
    detail: 'Apenas sachês de ketchup.',
    price: 0,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80'
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
  promoGrid.innerHTML = promotions
    .map(
      (promo) => `
        <article class="promo-card">
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
  if (activeCategory === 'todos') return menu;
  return menu.filter((item) => item.category === activeCategory);
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
          <div class="menu-card__image" style="background-image:url('${item.image}')"></div>
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

  title.textContent = currentStep.title;
  document.querySelector('.pizza-modal__text').textContent = currentStep.helper;

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
    renderPizzaModal();
  });

  document.getElementById('pizza-modal-confirm').addEventListener('click', handlePizzaStepContinue);
}

function getStepShortLabel(id) {
  switch (id) {
    case 'tamanho': return 'Tamanho';
    case 'primeira-pizza': return '1º Sabor';
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
      <div class="product-detail-head__image" style="background-image:url('${selectedPizza.image}')"></div>
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
        .map(
          (step, index) => {
            const isActive = index === pizzaSelection.step;
            const isDone = index < pizzaSelection.step;
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

      ${renderChoiceSectionHeader('TODOS OS SABORES', 'Escolha 1 Sabor para pizza', true, 'Selecionado')}
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
      <span class="product-option__image" style="background-image:url('${image}')"></span>
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
        <span class="popular-flavor-card__image" style="background-image: url('${flavor.image}')"></span>
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
    renderPizzaModal();
    return;
  }

  confirmPizzaSelection();
}

let cart = [];

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
              <div class="combo-slide-card__image" style="background-image:url('${combo.image}')"></div>
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
const cartNextBtn3 = document.getElementById('cart-next-btn-3');

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
  } else {
    floatingCartBar.style.display = 'none';
  }
}

function openCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  navigateCartStep('cart-step-items');
  renderCart();
}

function closeCartDrawer() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
}

function navigateCartStep(stepId) {
  document.querySelectorAll('.cart-step').forEach(step => {
    step.classList.remove('is-active');
  });
  const target = document.getElementById(stepId);
  if (target) target.classList.add('is-active');
}

function renderCart() {
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
    navigateCartStep('cart-step-auth');
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

function finalizeOrder() {
  const name = checkoutName.value.trim();
  const phone = checkoutPhone.value.trim();
  const payment = checkoutPayment.value;
  
  let paymentStr = '';
  if (payment === 'pix') {
    paymentStr = 'Pix';
  } else if (payment === 'cartao') {
    paymentStr = 'Cartão de Crédito/Débito';
  } else if (payment === 'dinheiro') {
    const changeVal = checkoutChange ? checkoutChange.value.trim() : '';
    paymentStr = changeVal ? `Dinheiro (Troco para ${changeVal})` : 'Dinheiro (Sem troco)';
  }
  
  let deliveryStr = '';
  if (deliveryType === 'delivery') {
    const street = checkoutStreet ? checkoutStreet.value.trim() : '';
    const neighborhood = checkoutNeighborhood ? checkoutNeighborhood.value.trim() : '';
    const ref = checkoutRef ? checkoutRef.value.trim() : '';
    
    if (!street || !neighborhood) {
      window.alert('Por favor, preencha a rua e o bairro para a entrega.');
      return;
    }
    
    deliveryStr = `🛵 *Entrega para:*\n- Rua: ${street}\n- Bairro: ${neighborhood}${ref ? `\n- Referência: ${ref}` : ''}`;
  } else {
    deliveryStr = `🛍️ *Retirada no Balcão*`;
  }
  
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
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
    `*🍕 NOVO PEDIDO - PIZZARIA PREMIUM 🍕*`,
    `---------------------------------------------`,
    `👤 *Cliente:* ${name}`,
    `📞 *WhatsApp:* ${phone}`,
    `---------------------------------------------`,
    `🛒 *Itens do Pedido:*`,
    itemsLines,
    `---------------------------------------------`,
    deliveryStr,
    `💳 *Forma de Pagamento:* ${paymentStr}`,
    `---------------------------------------------`,
    `💰 *Total Geral:* *${formatBRL(cartTotal)}*`,
    `---------------------------------------------`,
    `Gostaria de confirmar meu pedido, obrigado!`
  ];
  
  const fullMessage = messageLines.join('\n');
  lastOrderMessage = fullMessage;
  
  // Open WhatsApp
  window.open(buildWhatsAppUrl(fullMessage), '_blank', 'noopener,noreferrer');
  
  // Show success step
  navigateCartStep('cart-step-success');
  
  // Clear cart state
  cart = [];
  updateFloatingCartBar();
}

if (cartNextBtn3) {
  cartNextBtn3.addEventListener('click', finalizeOrder);
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

// Initial renders/hydrations
hydrateStaticWhatsAppLinks();
renderPromotions();
renderTabs();
renderMenu();
renderCombosCarousel();
hydrateCategoryTriggers();
