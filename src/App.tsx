import { useEffect, useState, type ChangeEvent } from 'react'
import { supabase } from './supabaseClient'
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

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*')
    if (error) {
      console.error('Error fetching data:', error.message)
      return
    }

    const productList = data as Product[]
    const brandSet = new Set(productList.map(p => p.brand))
    const categorySet = new Set(productList.map(p => p.category))

    setProducts(productList)
    setFiltered(productList)
    setBrands(Array.from(brandSet))
    setCategories(Array.from(categorySet))
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
    XLSX.utils.book_append_sheet(wb, ws, 'FilteredData')
    XLSX.writeFile(wb, 'Filtered_Products.xlsx')
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6">🛒 Product Dashboard</h1>

      {/* Search Input */}
      <input
        type="text"
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="🔍 Search by name, brand, or category"
        className="p-2 border border-gray-300 rounded w-full md:w-72 mb-4"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Brands</option>
          {brands.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Apply</button>
        <button onClick={resetFilters} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Reset</button>
        <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Export</button>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Brand</th>
              <th className="p-2 border">Price</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">{p.category}</td>
                <td className="p-2 border">{p.brand}</td>
                <td className="p-2 border">₹{p.price}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-2 border text-center" colSpan={4}>No results found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
