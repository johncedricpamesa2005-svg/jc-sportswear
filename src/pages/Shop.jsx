import React, { useEffect, useMemo, useState } from 'react';
import { Product, categories } from '../product.jsx';

export default function Shop({ products, wish, onWish, onView, onBuy, initialCategory = 'All' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState('default');

  useEffect(() => setCategory(initialCategory || 'All'), [initialCategory]);

  const filtered = useMemo(() => {
    const result = products.filter(p =>
      (category === 'All' || p.category === category) &&
      (p.name + ' ' + p.category).toLowerCase().includes(query.toLowerCase())
    );
    if (sort === 'low') result.sort((a, b) => a.price - b.price);
    if (sort === 'high') result.sort((a, b) => b.price - a.price);
    if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [products, query, category, sort]);

  return (
    <main className="container page py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <span className="badge bg-danger text-uppercase px-3 py-1 mb-1">CATALOG</span>
          <h1 className="fw-black text-dark mb-1">Shop Sportswear</h1>
          <p className="text-muted mb-0">Quality tournament gear for every athlete.</p>
        </div>
        <div className="d-flex gap-2 shop-controls">
          <input
            className="form-control"
            placeholder="Search products..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="form-select w-auto" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="default">Sort by</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="category-scroll mb-4 d-flex gap-2 overflow-auto pb-2">
        {categories.map(c => (
          <button
            key={c}
            className={`btn rounded-pill px-3 py-1 ${category === c ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="row g-4">
        {filtered.map(p => (
          <Product
            key={p.id}
            p={p}
            liked={wish.includes(p.id)}
            onView={onView}
            onWish={onWish}
            onBuy={onBuy}
          />
        ))}
      </div>

      {!filtered.length && (
        <div className="alert alert-light text-center py-5 shadow-sm border mt-4">
          <i className="bi bi-search display-6 text-muted mb-3 d-block"/>
          <h5>No products match your search.</h5>
          <p className="text-muted">Try selecting a different category or clearing the search query.</p>
        </div>
      )}
    </main>
  );
}
