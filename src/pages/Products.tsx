import { useState, useMemo, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { Filter } from "lucide-react";
import { useSearchStore } from "../store/searchStore";
import { useLocation } from "react-router-dom";

const categories = ["All", "Seeds", "Saplings", "Pesticides", "Fertilizers", "Shop by Krishibhavan"];

interface Product {
  _id: string;
  id: string;
  name: string;
  description: string;
  price_registered: number;
  price_unregistered: number;
  category: string;
  imageUrl: string;
  stock: number;
  krishiBhavan: string;
  sellerId: string;
  officeId: string;
}

export const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { query } = useSearchStore();
  const location = useLocation();
  const [userSellerId, setUserSellerId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get("category");
    if (categoryParam) {
      setSelectedCategory(
        categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)
      );
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/products");
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      try {
        const response = await fetch(`http://localhost:5000/users/${userId}`);
        const userData = await response.json();
        setUserSellerId(userData.sellerId); // Store the sellerId assigned to this user
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered: Product[] = [];

    if (selectedCategory === "Shop by Krishibhavan") {
      filtered = products.slice().sort((a, b) =>
        a.krishiBhavan.localeCompare(b.krishiBhavan)
      );
    } else {
      filtered = products.filter(
        (product) =>
          selectedCategory === "All" ||
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.category.toLowerCase().includes(searchQuery)
      );
    }

    return filtered;
  }, [selectedCategory, query, products]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center space-x-2 text-gray-600"
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className={`md:w-64 space-y-6 ${showFilters ? "block" : "hidden md:block"}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedCategory === cat
                      ? "bg-green-100 text-green-800"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">
                No products found matching your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
