import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import MapView from "../components/MapView";

// Demo list just for the left sidebar visual (map markers come from backend)
const DEMO = [
  { name: "Tomatoes", price: "12.00 RON/KG", tag: "Vegetables" },
  { name: "Potatoes", price: "6.00 RON/KG", tag: "Vegetables" },
  { name: "Apples",   price: "8.00 RON/KG", tag: "Fruits" },
  { name: "Milk",     price: "7.00 RON/L",  tag: "Dairy" },
  { name: "Cheese",   price: "28.00 RON/KG",tag: "Dairy" },
  { name: "Eggs",     price: "1.00 RON/PC", tag: "Dairy" },
  { name: "Chicken",  price: "18.00 RON/KG",tag: "Meat" },
];

export default function Browse() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return DEMO;
    return DEMO.filter(x => x.name.toLowerCase().includes(s));
  }, [q]);

  return (
      <div className="page">
        <aside className="sidebar">
          <h2 className="section-title">Products</h2>
          <div className="col" style={{ gap: 12 }}>
            {list.map((p, i) => <ProductCard key={i} {...p} />)}
          </div>
        </aside>
        <main className="content">
          {/* Map filters by q (no city needed) */}
          <MapView q={q || undefined} />
        </main>
      </div>
  );
}
