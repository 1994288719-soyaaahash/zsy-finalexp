const STUDENT = {
  id: "24215220206",
  name: "张斯彦"
};

const STORAGE_KEYS = {
  users: "easy_shop_users",
  products: "easy_shop_products",
  carts: "easy_shop_carts",
  orders: "easy_shop_orders",
  currentUser: "easy_shop_current_user"
};

const DEFAULT_PRODUCTS = [
  { id: 101, name: "轻奢风衣外套", category: "服饰", price: 399, stock: 32, sales: 186, image: "assets/product-coat.svg", desc: "挺括防风面料，适合通勤和旅行穿搭。" },
  { id: 102, name: "运动休闲鞋", category: "鞋靴", price: 249, stock: 58, sales: 342, image: "assets/product-shoes.svg", desc: "轻量缓震鞋底，日常步行和运动都舒适。" },
  { id: 103, name: "智能蓝牙耳机", category: "数码", price: 189, stock: 76, sales: 529, image: "assets/product-earbuds.svg", desc: "主动降噪、长续航，适合学习和通勤。" },
  { id: 104, name: "简约双肩包", category: "箱包", price: 159, stock: 44, sales: 214, image: "assets/product-bag.svg", desc: "多隔层大容量，电脑、书本和随身物品分区收纳。" },
  { id: 105, name: "商务腕表", category: "配饰", price: 520, stock: 21, sales: 96, image: "assets/product-watch.svg", desc: "金属表带搭配简洁表盘，适合商务场景。" },
  { id: 106, name: "女士连衣裙", category: "服饰", price: 299, stock: 27, sales: 168, image: "assets/product-dress.svg", desc: "清爽版型和柔和配色，适合夏季出游。" },
  { id: 107, name: "无线充电台灯", category: "家居", price: 139, stock: 64, sales: 251, image: "assets/product-lamp.svg", desc: "三档色温调节，底座支持手机无线充电。" },
  { id: 108, name: "保温随行杯", category: "日用", price: 89, stock: 93, sales: 407, image: "assets/product-cup.svg", desc: "食品级不锈钢内胆，密封防漏，适合课堂和户外。" }
];

const state = {
  products: [],
  homeCategory: "全部",
  homeKeyword: "",
  sortBy: "default",
  detailProductId: null,
  bannerIndex: 0,
  bannerTimer: null
};

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function money(value) {
  return `¥${Number(value).toFixed(2)}`;
}

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCurrentUser() {
  return readJSON(STORAGE_KEYS.currentUser, null);
}

function saveCurrentUser(user) {
  if (user) {
    writeJSON(STORAGE_KEYS.currentUser, user);
  } else {
    localStorage.removeItem(STORAGE_KEYS.currentUser);
  }
}

function getUsers() {
  return readJSON(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  writeJSON(STORAGE_KEYS.users, users);
}

function saveProducts() {
  writeJSON(STORAGE_KEYS.products, state.products);
}

function getCarts() {
  return readJSON(STORAGE_KEYS.carts, []);
}

function saveCarts(carts) {
  writeJSON(STORAGE_KEYS.carts, carts);
}

function getOrders() {
  return readJSON(STORAGE_KEYS.orders, []);
}

function saveOrders(orders) {
  writeJSON(STORAGE_KEYS.orders, orders);
}

function getUserCart(userId) {
  const carts = getCarts();
  let cart = carts.find((item) => item.userId === userId);
  if (!cart) {
    cart = { userId, items: [] };
    carts.push(cart);
    saveCarts(carts);
  }
  return cart;
}

function updateUserCart(userId, items) {
  const carts = getCarts();
  const index = carts.findIndex((item) => item.userId === userId);
  if (index >= 0) {
    carts[index].items = items;
  } else {
    carts.push({ userId, items });
  }
  saveCarts(carts);
  updateCartCount();
}

async function loadProductsFromJSON() {
  try {
    const response = await fetch("data/products.json", { cache: "no-store" });
    if (!response.ok) throw new Error("products json failed");
    return await response.json();
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

async function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    saveUsers([
      { id: 1, username: "buyer1", password: "123456", email: "buyer@test.com", role: "buyer" },
      { id: 2, username: "seller", password: "seller123", email: "seller@test.com", role: "seller" },
      { id: 3, username: "admin", password: "admin123", email: "admin@test.com", role: "admin" }
    ]);
  }

  if (!localStorage.getItem(STORAGE_KEYS.products)) {
    const products = await loadProductsFromJSON();
    writeJSON(STORAGE_KEYS.products, products);
  }

  if (!localStorage.getItem(STORAGE_KEYS.carts)) saveCarts([]);
  if (!localStorage.getItem(STORAGE_KEYS.orders)) saveOrders([]);
  state.products = readJSON(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function requireLogin(targetPage) {
  const user = getCurrentUser();
  if (!user) {
    showToast("请先登录");
    showPage("login");
    return null;
  }
  if (targetPage === "admin" && !["seller", "admin"].includes(user.role)) {
    showToast("当前账号没有商品管理权限");
    showPage("home");
    return null;
  }
  return user;
}

function showPage(pageId) {
  if (["cart", "checkout", "profile"].includes(pageId) && !requireLogin()) return;
  if (pageId === "admin" && !requireLogin("admin")) return;

  $all(".page").forEach((page) => page.classList.remove("active-page"));
  $(`#${pageId}Page`).classList.add("active-page");
  $all(".nav-link").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === pageId);
  });

  if (pageId === "home") renderHome();
  if (pageId === "cart") renderCart();
  if (pageId === "checkout") renderCheckout();
  if (pageId === "profile") renderProfile();
  if (pageId === "admin") renderAdmin();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateUserBar() {
  const user = getCurrentUser();
  const userArea = $("#userArea");
  const adminLink = $(".admin-only");

  if (user) {
    userArea.innerHTML = `<span>${user.username}（${roleName(user.role)}）</span><button type="button" id="logoutBtn">退出</button>`;
    $("#logoutBtn").addEventListener("click", () => {
      saveCurrentUser(null);
      updateUserBar();
      updateCartCount();
      showPage("home");
    });
    adminLink.hidden = !["seller", "admin"].includes(user.role);
  } else {
    userArea.innerHTML = `<button type="button" data-page="login">登录</button><span>/</span><button type="button" data-page="register">注册</button>`;
    adminLink.hidden = true;
  }
}

function roleName(role) {
  return ({ buyer: "买家", seller: "卖家", admin: "平台管理者" })[role] || role;
}

function updateCartCount() {
  const user = getCurrentUser();
  const count = user ? getUserCart(user.id).items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  $("#cartCount").textContent = count;
}

function renderHome() {
  renderCategories();
  const grid = $("#productGrid");
  let products = filterProducts();

  if (state.sortBy === "priceAsc") products.sort((a, b) => a.price - b.price);
  if (state.sortBy === "priceDesc") products.sort((a, b) => b.price - a.price);
  if (state.sortBy === "salesDesc") products.sort((a, b) => b.sales - a.sales);

  if (!products.length) {
    grid.innerHTML = `<div class="empty-state">没有找到符合条件的商品</div>`;
    return;
  }

  grid.innerHTML = products.map((product) => `
    <article class="product-card">
      <button class="product-open" type="button" data-detail="${product.id}">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-info">
          <h3>${product.name}</h3>
          <p>${product.desc}</p>
          <div class="product-meta">
            <span class="price">${money(product.price)}</span>
            <span class="small-muted">销量 ${product.sales}</span>
          </div>
        </div>
      </button>
      <div class="product-actions">
        <button class="secondary-btn" type="button" data-detail="${product.id}">查看详情</button>
        <button class="icon-btn" type="button" data-add-cart="${product.id}" title="加入购物车" aria-label="加入购物车">＋</button>
      </div>
    </article>
  `).join("");
}

function filterProducts() {
  const keyword = state.homeKeyword.trim().toLowerCase();
  return state.products.filter((product) => {
    const categoryOK = state.homeCategory === "全部" || product.category === state.homeCategory;
    const keywordOK = !keyword || [product.name, product.category, product.desc].join(" ").toLowerCase().includes(keyword);
    return categoryOK && keywordOK;
  });
}

function renderCategories() {
  const categories = ["全部", ...new Set(state.products.map((product) => product.category))];
  $("#categoryFilter").innerHTML = categories.map((category) => `
    <button class="category-btn ${state.homeCategory === category ? "active" : ""}" type="button" data-category="${category}">${category}</button>
  `).join("");
}

function renderDetail(productId) {
  const product = state.products.find((item) => item.id === Number(productId));
  if (!product) return;
  state.detailProductId = product.id;
  $("#detailImage").src = product.image;
  $("#detailImage").alt = product.name;
  $("#detailCategory").textContent = product.category;
  $("#detailTitle").textContent = product.name;
  $("#detailDesc").textContent = product.desc;
  $("#detailPrice").textContent = money(product.price);
  $("#detailStock").textContent = `库存 ${product.stock}`;
  $("#detailSales").textContent = `销量 ${product.sales}`;
  $("#detailQty").value = "1";
  showPage("detail");
}

function addToCart(productId, quantity = 1) {
  const user = requireLogin();
  if (!user) return false;
  const product = state.products.find((item) => item.id === Number(productId));
  if (!product || product.stock <= 0) {
    showToast("商品库存不足");
    return false;
  }

  const cart = getUserCart(user.id);
  const existing = cart.items.find((item) => item.productId === product.id);
  const nextQty = Math.max(1, Number(quantity) || 1);
  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + nextQty);
  } else {
    cart.items.push({ productId: product.id, quantity: Math.min(product.stock, nextQty) });
  }
  updateUserCart(user.id, cart.items);
  showToast("已加入购物车");
  return true;
}

function renderCart() {
  const user = requireLogin();
  if (!user) return;
  const cart = getUserCart(user.id);
  const list = $("#cartList");

  if (!cart.items.length) {
    list.innerHTML = `<div class="empty-state">购物车为空</div>`;
    $("#cartTotal").textContent = "合计：¥0.00";
    return;
  }

  let total = 0;
  list.innerHTML = cart.items.map((item, index) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    if (!product) return "";
    const subtotal = product.price * item.quantity;
    total += subtotal;
    return `
      <div class="cart-item">
        <img src="${product.image}" alt="${product.name}">
        <div>
          <strong>${product.name}</strong>
          <p class="small-muted">${product.category} · 单价 ${money(product.price)}</p>
        </div>
        <div class="quantity-control">
          <button type="button" data-cart-minus="${index}">−</button>
          <input type="number" value="${item.quantity}" min="1" max="${product.stock}" data-cart-qty="${index}">
          <button type="button" data-cart-plus="${index}">+</button>
        </div>
        <strong>${money(subtotal)}</strong>
        <button class="icon-btn" type="button" data-cart-remove="${index}" title="删除" aria-label="删除">×</button>
      </div>
    `;
  }).join("");

  $("#cartTotal").textContent = `合计：${money(total)}`;
}

function changeCartItem(index, deltaOrValue, replace = false) {
  const user = requireLogin();
  if (!user) return;
  const cart = getUserCart(user.id);
  const item = cart.items[index];
  if (!item) return;
  const product = state.products.find((entry) => entry.id === item.productId);
  const max = product ? product.stock : 99;
  item.quantity = replace ? Number(deltaOrValue) : item.quantity + Number(deltaOrValue);
  item.quantity = Math.max(1, Math.min(max, item.quantity || 1));
  updateUserCart(user.id, cart.items);
  renderCart();
}

function removeCartItem(index) {
  const user = requireLogin();
  if (!user) return;
  const cart = getUserCart(user.id);
  cart.items.splice(index, 1);
  updateUserCart(user.id, cart.items);
  renderCart();
}

function renderCheckout() {
  const user = requireLogin();
  if (!user) return;
  const cart = getUserCart(user.id);
  const summary = $("#orderSummary");

  if (!cart.items.length) {
    summary.innerHTML = `<div class="empty-state">购物车为空，无法结算</div>`;
    return;
  }

  let total = 0;
  summary.innerHTML = cart.items.map((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    if (!product) return "";
    const subtotal = product.price * item.quantity;
    total += subtotal;
    return `
      <div class="summary-row">
        <span>${product.name} × ${item.quantity}</span>
        <strong>${money(subtotal)}</strong>
      </div>
    `;
  }).join("") + `
    <div class="summary-row">
      <strong>订单总额</strong>
      <strong>${money(total)}</strong>
    </div>
  `;
}

function submitOrder(event) {
  event.preventDefault();
  const user = requireLogin();
  if (!user) return;

  const receiverName = $("#receiverName").value.trim();
  const phone = $("#orderPhone").value.trim();
  const address = $("#orderAddress").value.trim();
  const error = $("#checkoutError");
  error.textContent = "";

  if (!receiverName) {
    error.textContent = "请填写收货人";
    return;
  }
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    error.textContent = "请输入正确的 11 位手机号";
    return;
  }
  if (address.length < 8) {
    error.textContent = "收货地址至少 8 个字";
    return;
  }

  const cart = getUserCart(user.id);
  if (!cart.items.length) {
    error.textContent = "购物车为空";
    return;
  }

  let total = 0;
  const items = cart.items.map((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    const subtotal = product.price * item.quantity;
    total += subtotal;
    product.stock = Math.max(0, product.stock - item.quantity);
    product.sales += item.quantity;
    return { ...item, name: product.name, price: product.price, subtotal };
  });

  const orders = getOrders();
  orders.unshift({
    orderId: Date.now(),
    userId: user.id,
    receiverName,
    phone,
    address,
    payMethod: $("#payMethod").value,
    status: $("#payMethod").value === "cod" ? "待收货付款" : "已支付",
    createTime: new Date().toLocaleString(),
    items,
    total
  });

  saveProducts();
  saveOrders(orders);
  updateUserCart(user.id, []);
  event.target.reset();
  showToast("订单提交成功");
  showPage("profile");
}

function renderProfile() {
  const user = requireLogin();
  if (!user) return;

  $("#profileInfo").innerHTML = `
    <span>用户名：${user.username}</span>
    <span>角色：${roleName(user.role)}</span>
    <span>邮箱：${user.email}</span>
    <span>学号姓名：${STUDENT.id} ${STUDENT.name}</span>
  `;

  const orders = getOrders().filter((order) => order.userId === user.id);
  $("#orderHistory").innerHTML = orders.length ? orders.map((order) => `
    <article class="order-card">
      <div>
        <strong>订单号：${order.orderId}</strong>
        <p class="small-muted">${order.createTime} · ${order.status}</p>
        <p>${order.items.map((item) => `${item.name} × ${item.quantity}`).join("，")}</p>
      </div>
      <strong>${money(order.total)}</strong>
    </article>
  `).join("") : `<div class="empty-state">暂无历史订单</div>`;
}

function renderAdmin() {
  const user = requireLogin("admin");
  if (!user) return;

  const keyword = $("#adminSearchInput").value.trim().toLowerCase();
  const products = state.products.filter((product) => !keyword || product.name.toLowerCase().includes(keyword));
  $("#adminTableBody").innerHTML = products.map((product) => `
    <tr>
      <td>${product.id}</td>
      <td><input value="${product.name}" data-edit="name" data-id="${product.id}"></td>
      <td><input value="${product.category}" data-edit="category" data-id="${product.id}"></td>
      <td><input type="number" min="0" step="0.01" value="${product.price}" data-edit="price" data-id="${product.id}"></td>
      <td><input type="number" min="0" step="1" value="${product.stock}" data-edit="stock" data-id="${product.id}"></td>
      <td>
        <div class="table-actions">
          <button type="button" data-save-product="${product.id}">保存</button>
          <button type="button" class="danger" data-delete-product="${product.id}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function addProduct(event) {
  event.preventDefault();
  const error = $("#productError");
  const name = $("#newName").value.trim();
  const category = $("#newCat").value.trim();
  const price = Number($("#newPrice").value);
  const stock = Number($("#newStock").value);
  const image = $("#newImage").value.trim() || "assets/product-gift.svg";
  const desc = $("#newDesc").value.trim() || "新上架商品。";
  error.textContent = "";

  if (!name || !category || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
    error.textContent = "请填写完整且有效的商品信息";
    return;
  }

  state.products.unshift({
    id: Date.now(),
    name,
    category,
    price,
    stock,
    sales: 0,
    image,
    desc
  });
  saveProducts();
  event.target.reset();
  $("#newImage").value = "assets/product-gift.svg";
  renderAdmin();
  renderHome();
  showToast("商品已添加");
}

function saveProduct(productId) {
  const product = state.products.find((item) => item.id === Number(productId));
  if (!product) return;
  $all(`[data-id="${productId}"][data-edit]`).forEach((input) => {
    const key = input.dataset.edit;
    product[key] = ["price", "stock"].includes(key) ? Number(input.value) : input.value.trim();
  });
  if (!product.name || !product.category || product.price <= 0 || product.stock < 0) {
    showToast("商品信息不完整");
    renderAdmin();
    return;
  }
  saveProducts();
  renderAdmin();
  renderHome();
  showToast("商品已保存");
}

function deleteProduct(productId) {
  if (!confirm("确定删除该商品？")) return;
  state.products = state.products.filter((product) => product.id !== Number(productId));
  saveProducts();
  renderAdmin();
  renderHome();
  showToast("商品已删除");
}

function handleLogin(event) {
  event.preventDefault();
  const username = $("#loginUser").value.trim();
  const password = $("#loginPwd").value;
  const error = $("#loginError");
  const user = getUsers().find((item) => item.username === username && item.password === password);
  error.textContent = "";

  if (!user) {
    error.textContent = "用户名或密码错误";
    return;
  }

  saveCurrentUser(user);
  updateUserBar();
  updateCartCount();
  event.target.reset();
  showToast("登录成功");
  showPage("home");
}

function handleRegister(event) {
  event.preventDefault();
  const username = $("#regUser").value.trim();
  const email = $("#regEmail").value.trim();
  const password = $("#regPwd").value;
  const error = $("#regError");
  const users = getUsers();
  error.textContent = "";

  if (username.length < 3) {
    error.textContent = "用户名至少 3 位";
    return;
  }
  if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
    error.textContent = "邮箱格式不正确";
    return;
  }
  if (password.length < 6) {
    error.textContent = "密码至少 6 位";
    return;
  }
  if (users.some((user) => user.username === username)) {
    error.textContent = "用户名已存在";
    return;
  }

  users.push({ id: Date.now(), username, email, password, role: "buyer" });
  saveUsers(users);
  event.target.reset();
  showToast("注册成功，请登录");
  showPage("login");
}

function changePassword(event) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) return;
  const oldPwd = $("#oldPwd").value;
  const newPwd = $("#newPwd").value;
  const error = $("#passwordError");
  error.textContent = "";

  if (oldPwd !== user.password) {
    error.textContent = "原密码错误";
    return;
  }
  if (newPwd.length < 6) {
    error.textContent = "新密码至少 6 位";
    return;
  }

  const users = getUsers();
  const index = users.findIndex((item) => item.id === user.id);
  users[index].password = newPwd;
  saveUsers(users);
  saveCurrentUser({ ...user, password: newPwd });
  event.target.reset();
  showToast("密码已修改");
}

function setupBanner() {
  const slides = $all(".banner-slide");
  $("#bannerDots").innerHTML = slides.map((_, index) => `
    <button class="banner-dot ${index === 0 ? "active" : ""}" type="button" data-banner="${index}" aria-label="第 ${index + 1} 张"></button>
  `).join("");

  function move(nextIndex) {
    state.bannerIndex = (nextIndex + slides.length) % slides.length;
    $("#bannerTrack").style.transform = `translateX(-${state.bannerIndex * 100}%)`;
    $all(".banner-dot").forEach((dot, index) => dot.classList.toggle("active", index === state.bannerIndex));
  }

  $("#prevBanner").addEventListener("click", () => move(state.bannerIndex - 1));
  $("#nextBanner").addEventListener("click", () => move(state.bannerIndex + 1));
  $("#bannerDots").addEventListener("click", (event) => {
    const button = event.target.closest("[data-banner]");
    if (button) move(Number(button.dataset.banner));
  });
  state.bannerTimer = window.setInterval(() => move(state.bannerIndex + 1), 4500);
}

function setupEvents() {
  document.body.addEventListener("click", (event) => {
    const pageButton = event.target.closest("[data-page]");
    const detailButton = event.target.closest("[data-detail]");
    const addCartButton = event.target.closest("[data-add-cart]");
    const cartMinus = event.target.closest("[data-cart-minus]");
    const cartPlus = event.target.closest("[data-cart-plus]");
    const cartRemove = event.target.closest("[data-cart-remove]");
    const saveButton = event.target.closest("[data-save-product]");
    const deleteButton = event.target.closest("[data-delete-product]");
    const categoryButton = event.target.closest("[data-category]");

    if (pageButton) showPage(pageButton.dataset.page);
    if (detailButton) renderDetail(detailButton.dataset.detail);
    if (addCartButton) addToCart(addCartButton.dataset.addCart, 1);
    if (cartMinus) changeCartItem(Number(cartMinus.dataset.cartMinus), -1);
    if (cartPlus) changeCartItem(Number(cartPlus.dataset.cartPlus), 1);
    if (cartRemove) removeCartItem(Number(cartRemove.dataset.cartRemove));
    if (saveButton) saveProduct(saveButton.dataset.saveProduct);
    if (deleteButton) deleteProduct(deleteButton.dataset.deleteProduct);
    if (categoryButton) {
      state.homeCategory = categoryButton.dataset.category;
      renderHome();
    }
  });

  document.body.addEventListener("change", (event) => {
    if (event.target.matches("[data-cart-qty]")) {
      changeCartItem(Number(event.target.dataset.cartQty), Number(event.target.value), true);
    }
  });

  $("#homeSearchBtn").addEventListener("click", () => {
    state.homeKeyword = $("#homeSearchInput").value;
    renderHome();
  });

  $("#homeSearchInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      state.homeKeyword = event.target.value;
      renderHome();
    }
  });

  $("#sortSelect").addEventListener("change", (event) => {
    state.sortBy = event.target.value;
    renderHome();
  });

  $("#detailMinus").addEventListener("click", () => {
    $("#detailQty").value = Math.max(1, Number($("#detailQty").value) - 1);
  });

  $("#detailPlus").addEventListener("click", () => {
    const product = state.products.find((item) => item.id === state.detailProductId);
    $("#detailQty").value = Math.min(product.stock, Number($("#detailQty").value) + 1);
  });

  $("#detailAddCart").addEventListener("click", () => {
    addToCart(state.detailProductId, Number($("#detailQty").value));
  });

  $("#detailBuyNow").addEventListener("click", () => {
    if (addToCart(state.detailProductId, Number($("#detailQty").value))) showPage("cart");
  });

  $("#gotoCheckoutBtn").addEventListener("click", () => showPage("checkout"));
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#registerForm").addEventListener("submit", handleRegister);
  $("#checkoutForm").addEventListener("submit", submitOrder);
  $("#passwordForm").addEventListener("submit", changePassword);
  $("#productForm").addEventListener("submit", addProduct);
  $("#adminSearchInput").addEventListener("input", renderAdmin);
}

async function boot() {
  $("#studentBadge").textContent = `学号：${STUDENT.id}  姓名：${STUDENT.name}`;
  $("#footerStudent").textContent = `${STUDENT.id} ${STUDENT.name}`;
  await initStorage();
  setupBanner();
  setupEvents();
  updateUserBar();
  updateCartCount();
  renderHome();
}

document.addEventListener("DOMContentLoaded", boot);
