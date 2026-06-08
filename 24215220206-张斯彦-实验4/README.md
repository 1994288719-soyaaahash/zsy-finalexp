# 易购优选 Web 大作业

## 文件结构

```text
24215220206-张斯彦-实验4/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── data/
│   └── products.json
└── assets/
    ├── banner-digital.svg
    ├── banner-fashion.svg
    ├── banner-home.svg
    └── product-*.svg
```

## 功能

- 首页：轮播图、搜索、分类筛选、商品排序、商品列表。
- 登录注册：用户名、密码、邮箱格式校验。
- 商品详情：展示图片、价格、库存、销量，可加入购物车或立即购买。
- 购物车：商品数量增减、删除、合计、结算。
- 订单结算：收货人、手机号、地址校验，提交后生成历史订单。
- 个人中心：账户信息、修改密码、历史订单。
- 商品管理：卖家和平台管理者可新增、搜索、修改、删除商品。
- 数据存储：商品初始数据通过 `fetch` 读取 `data/products.json`，用户、购物车、订单和修改后的商品保存在 `localStorage`。

## 测试账号

```text
买家：buyer1 / 123456
卖家：seller / seller123
平台管理者：admin / admin123
```

## 运行方式

推荐在项目目录运行本地服务器：

```powershell
python -m http.server 5500
```

然后访问 `http://localhost:5500/`。直接双击 `index.html` 也可运行，页面会在无法读取 JSON 文件时使用内置商品数据。
