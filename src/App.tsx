import { useEffect, useState, ChangeEvent } from 'react'
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
      console.error('Error fetching:', error.message)
    } else if (data) {
      const brandSet = new Set(data.map(p => p.brand))
      const categorySet = new Set(data.map(p => p.category))
      setProducts(data)
      setFiltered(data)
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🛒 Product Dashboard</h1>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        placeholder="Search by name, brand, category"
        className="p-2 border w-full md:w-64 mb-4"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="p-2 border">
          <option value="">All Brands</option>
          {brands.map((b, i) => (
            <option key={i} value={b}>{b}</option>
          ))}
        </select>

        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-2 border">
          <option value="">All Categories</option>
          {categories.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <button onClick={applyFilters} className="px-4 py-2 bg-blue-500 text-white rounded">Apply</button>
        <button onClick={resetFilters} className="px-4 py-2 bg-gray-400 text-white rounded">Reset</button>
        <button onClick={exportToExcel} className="px-4 py-2 bg-green-600 text-white rounded">Export to Excel</button>
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Brand</th>
            <th className="border p-2">Price</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.name}</td>
              <td className="border p-2">{p.category}</td>
              <td className="border p-2">{p.brand}</td>
              <td className="border p-2">₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
