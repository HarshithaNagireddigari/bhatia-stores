"use client";

import Image from "next/image";
import { ShoppingCart, Heart } from "lucide-react";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext"; // Assuming a hook exists for wishlist actions

export type Product = {
  id: string;
  name: string;
  price: string; // formatted price string, e.g. "₹199"
  image: string; // URL or relative path
  stock?: number;
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { toggleItem, hasItem } = useWishlist();

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(/[^0-9.]/g, "")),
      image: product.image,
      quantity: 1,
    });
  };

  return (
    <div className="flex flex-col rounded-xl border border-neutral/10 bg-white/30 backdrop-blur-md p-4 transition-shadow hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image src={product.image} alt={product.name} fill className="object-cover" />
      </div>
      <h3 className="mt-3 text-base font-medium text-gray-900 dark:text-white line-clamp-2">{product.name}</h3>
      <p className="mt-1 text-sm font-semibold text-primary">{product.price}</p>
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={handleAddToCart}
          className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white transition hover:bg-primary-600"
        >
          <ShoppingCart size={14} /> Add to Cart
        </button>
        <button
          onClick={() => toggleItem({ productId: product.id, name: product.name, price: parseFloat(product.price.replace(/[^0-9.]/g, "")), image: product.image, quantity: 1 })}
          aria-label={hasItem(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          className="rounded-full p-1 text-gray-600 hover:text-primary"
        >
          <Heart size={16} fill={hasItem(product.id) ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
}
