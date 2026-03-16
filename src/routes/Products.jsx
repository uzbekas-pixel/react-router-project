import React, { useState } from "react";
import img1 from "./images/h.jpg";
import img2 from "./images/w.jpg";
import { useLang } from "../context/useLang";
import ScrollReveal from "../components/ScrollReveal";

const allPosts = [
  { id: 1, img: img1, title: "East Village Ice Cream Crawl", text: "We will stop at five different world-class ice cream shops on this 1.5 mile 1.5 hour tour...", author: "Maria Phillips", comments: 2, category: "Food" },
  { id: 2, img: img2, title: "Brooklyn Bridge cinematic photo walk", text: "This experience takes place at the Brooklyn Bridge Park and Brooklyn Bridge...", author: "James Calzoni", comments: 17, category: "Nature" },
  { id: 3, img: img1, title: "Central Park Morning Walk", text: "A peaceful morning walk through Central Park with stunning views and fresh air...", author: "Sarah Johnson", comments: 8, category: "Nature" },
  { id: 4, img: img2, title: "NYC Food Tour Downtown", text: "Explore the best food spots in downtown New York City with our expert guide...", author: "Mike Brown", comments: 5, category: "Food" },
];

const categories = ["All", "Food", "Nature"];

const Products = ({ darkMode, showToast }) => {
  const { t } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState([]);
  const [showFavOnly, setShowFavOnly] = useState(false);

  const toggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((f) => f !== id));
      showToast(t.removed, "error");
    } else {
      setFavorites([...favorites, id]);
      showToast(t.saved, "success");
    }
  };

  const filtered = allPosts.filter((post) => {
    const matchSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
                        post.author.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "All" || post.category === activeCategory;
    const matchFav = showFavOnly ? favorites.includes(post.id) : true;
    return matchSearch && matchCategory && matchFav;
  });

  return (
    <div className="page-transition w-full max-w-5xl mx-auto px-10 py-12 pb-24 translate-y-20">
      <ScrollReveal direction="up">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>{t.productsTitle}</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-xl border transition-all duration-300 ${
                showFavOnly ? "bg-red-500 text-white border-red-500"
                : darkMode ? "border-slate-600 text-gray-400 hover:border-red-400 hover:text-red-400"
                : "border-gray-200 text-gray-500 hover:border-red-400 hover:text-red-400"
              }`}>
              {showFavOnly ? "❤️" : "🤍"} {favorites.length > 0 && `(${favorites.length})`}
            </button>
            <a href="#" className="text-purple-400 text-sm font-medium hover:underline">{t.viewAll} →</a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input type="text" placeholder={t.search} value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl border text-sm outline-none transition-all duration-300 ${
                darkMode ? "bg-slate-800 border-slate-600 text-white placeholder-gray-500 focus:border-blue-400"
                : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-400"
              }`} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">✕</button>
            )}
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat ? "bg-blue-500 text-white"
                  : darkMode ? "bg-slate-800 text-gray-400 hover:bg-slate-700"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {filtered.map((post, index) => (
            <ScrollReveal key={post.id} direction="up" delay={index * 150}>
              <div className={`relative flex gap-5 p-4 rounded-2xl transition-all duration-300 ${darkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:shadow-md"}`}>
                <button onClick={() => toggleFavorite(post.id)}
                  className="absolute top-3 right-3 text-xl transition-transform duration-200 hover:scale-125">
                  {favorites.includes(post.id) ? "❤️" : "🤍"}
                </button>
                <div className="w-[140px] h-[180px] rounded-xl overflow-hidden shrink-0">
                  <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col justify-between py-1 pr-6">
                  <span className="text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-1 rounded-lg w-fit mb-2">{post.category}</span>
                  <div>
                    <h3 className={`text-base font-bold mb-2 leading-snug ${darkMode ? "text-white" : "text-gray-900"}`}>{post.title}</h3>
                    <p className={`text-xs leading-relaxed ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{post.text}</p>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-xs mt-3">
                    <span>📅 {t.today}</span>
                    <span>👤 {post.author}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="text-5xl">{showFavOnly ? "🤍" : "🔍"}</span>
          <p className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>
            {showFavOnly ? t.noFavorites : t.noResults}
          </p>
          <button onClick={() => { setSearch(""); setActiveCategory("All"); setShowFavOnly(false); }}
            className="mt-2 px-4 py-2 bg-blue-500 text-white text-sm rounded-xl hover:bg-blue-400 transition">
            {t.clear}
          </button>
        </div>
      )}
    </div>
  );
};

export default Products;