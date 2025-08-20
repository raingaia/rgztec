// /rgztec/data/demo.js
// Site-wide demo metadata: category icons, featured ids, presets.

window.RGZ_DEMO = {
  icons_base: "/rgztec/images/categories/",

  categories: [
    { slug: "html-templates",  title: "HTML Templates",  icon: "html-templates.webp",  href: "/rgztec/products/category.html?cat=html-templates" },
    { slug: "css-ui-kits",     title: "CSS UI Kits",     icon: "css-ui-kits.webp",     href: "/rgztec/products/category.html?cat=css-ui-kits" },
    { slug: "js-widgets",      title: "JS Widgets",      icon: "js-widgets.webp",      href: "/rgztec/products/category.html?cat=js-widgets" },
    { slug: "react",           title: "React",           icon: "react.webp",           href: "/rgztec/products/category.html?cat=react" },
    { slug: "email-templates", title: "Email Templates", icon: "email-templates.webp", href: "/rgztec/products/category.html?cat=email-templates" },
    { slug: "svg-icons",       title: "SVG / Icons",     icon: "svg-icons.webp",       href: "/rgztec/products/category.html?cat=svg-icons" }
  ],

  featured_ids: [
    "template-1","template-2","template-3","template-4",
    "template-5","template-6","template-7","template-8",
    "template-9","template-10","template-11","template-12",
    "template-13","template-14","template-15","template-16"
  ],

  store_presets: [
    { id:"demo-landing",   title:"Landing Kit",      theme:{ primary:"#f97316" }, products:["template-1","template-4","template-9"] },
    { id:"demo-dashboard", title:"Dashboard Starter",theme:{ primary:"#38BDF8" }, products:["template-2","template-17","template-16"] },
    { id:"demo-portfolio", title:"Portfolio Set",    theme:{ primary:"#14B8A6" }, products:["template-3","template-12","template-8"] }
  ]
};

window.RGZ_DEMO.resolveProducts = function(ids){
  if (!Array.isArray(ids) || !window.RGZ_PRODUCTS) return [];
  const map = new Map(window.RGZ_PRODUCTS.map(p => [p.id, p]));
  return ids.map(id => map.get(id)).filter(Boolean);
};
window.RGZ_DEMO.categoryBySlug = function(slug){
  return (window.RGZ_DEMO.categories || []).find(c => c.slug === slug) || null;
};
window.RGZ_DEMO.iconUrl = function(iconFile){
  const base = window.RGZ_DEMO.icons_base || "/rgztec/images/categories/";
  return base + iconFile;
};
