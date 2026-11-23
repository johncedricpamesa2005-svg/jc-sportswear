import React from 'react';

export const A = '/assets/';
export const money = n => '₱' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2 });
export const categories = ['All', 'Basketball', 'Football', 'Volleyball', 'Running', 'Gym', 'Tennis'];

export const getImageSrc = (img) => {
    if (!img) return '/assets/bballshirt.jpg';
    if (img.startsWith('http') || img.startsWith('/')) return img;
    return A + img;
};

export function Product({ p, liked, onView, onWish, onBuy, isHook, onHookClick }) {
    if (isHook) {
        return (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <div
                    className="product-card hook-card h-100"
                    onClick={() => onHookClick(p)}
                    style={{ cursor: 'pointer' }}
                    title="Click to sign in and purchase this product"
                >
                    <div className="product-img position-relative">
                        <img src={getImageSrc(p.image)} alt={p.name} />
                        {p.badge && <span className="badge-custom">{p.badge}</span>}
                        <div className="hook-overlay">
                            <span><i className="bi bi-box-arrow-in-right me-1"/> Click to Sign In & Buy</span>
                        </div>
                    </div>
                    <div className="p-3 d-flex flex-column flex-grow-1">
                        <small className="text-muted fw-bold text-uppercase">{p.category}</small>
                        <h5 className="mt-1 mb-2 text-dark">{p.name}</h5>
                        <div className="rating text-warning">★ {p.rating}</div>
                        <div className="mt-1">
                            <strong className="text-dark fs-5">{money(p.price)}</strong>{' '}
                            {p.oldPrice && <del className="text-muted">{money(p.oldPrice)}</del>}
                        </div>
                        <div className="mt-auto pt-3">
                            <button
                                type="button"
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onHookClick(p);
                                }}
                            >
                                <i className="bi bi-lock-fill"/> Sign In to Buy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
            <div className="product-card h-100 d-flex flex-column">
                <div className="product-img position-relative">
                    <img src={getImageSrc(p.image)} alt={p.name} />
                    {p.badge && <span className="badge-custom">{p.badge}</span>}
                    {onWish && (
                        <button
                            className={`wish ${liked ? 'active' : ''}`}
                            onClick={() => onWish(p)}
                            aria-label="Wishlist"
                        >
                            {liked ? '♥' : '♡'}
                        </button>
                    )}
                </div>
                <div className="p-3 d-flex flex-column flex-grow-1">
                    <small className="text-muted fw-bold text-uppercase">{p.category}</small>
                    <h5 className="mt-1 mb-2">{p.name}</h5>
                    <div className="rating text-warning">★ {p.rating}</div>
                    <div>
                        <strong>{money(p.price)}</strong>{' '}
                        {p.oldPrice && <del className="text-muted">{money(p.oldPrice)}</del>}
                    </div>
                    <div className="mt-auto pt-3">
                        {onView && (
                            <button className="btn btn-outline-dark w-100 mb-2" onClick={() => onView(p)}>
                                <i className="bi bi-eye me-1"/> View Details
                            </button>
                        )}
                        <div className="d-flex gap-2">
                            <button type="button" className="btn btn-dark flex-fill" onClick={() => onBuy && onBuy(p)}>
                                Buy Now
                            </button>
                            <button type="button" className="btn btn-primary flex-fill" onClick={() => onBuy && onBuy(p)}>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
