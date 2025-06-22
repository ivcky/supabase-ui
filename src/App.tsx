
import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import supabase from './supabaseClient'
import * as XLSX from 'xlsx'

type Product = {
  id: number
  name: string
  category: string
  brand: string
  price: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [selectedBrand, selectedCategory, search, products])

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Error fetching:', error.message)
    } else if (data) {
      const typedData = data as Product[]
      const brandSet = new Set(typedData.map((p: Product) => p.brand))
      const categorySet = new Set(typedData.map((p: Product) => p.category))
      setProducts(typedData)
      setFiltered(typedData)
      setBrands(Array.from(brandSet))
      setCategories(Array.from(categorySet))
    }
  }

  const applyFilters = () => {
    let filteredData = [...products]
    if (selectedBrand) {
      filteredData = filteredData.filter(p => p.brand === selectedBrand)
    }
    if (selectedCategory) {
      filteredData = filteredData.filter(p => p.category === selectedCategory)
    }
    if (search.trim()) {
      const s = search.toLowerCase()
      filteredData = filteredData.filter(
        p =>
          p.name.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.category.toLowerCase().includes(s)
      )
    }
    setFiltered(filteredData)
  }

  const resetFilters = () => {
    setSelectedBrand('')
    setSelectedCategory('')
    setSearch('')
    setFiltered(products)
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filtered)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'Filtered_Products.xlsx')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">🛒 Product Dashboard</h1>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search by name, brand, category"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Export to Excel ({filtered.length} items)
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filtered.length} of {products.length} products
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(product => (
          <div key={product.id} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h3 className="font-semibold text-lg mb-2 text-gray-800">{product.name}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Brand:</span> {product.brand}</p>
              <p><span className="font-medium">Category:</span> {product.category}</p>
              <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && products.length > 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products match your current filters.</p>
        </div>
      )}

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Loading products...</p>
        </div>
      )}
    </div>
  )
}

export default App
