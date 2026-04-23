'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  length: number;
  width: number;
  gsm: number;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'Card' | 'Paper'>('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setItems([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (editingItem) {
      await fetch(`/api/inventory/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    setShowModal(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => 
    filter === 'all' ? true : item.category === filter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage your stock of Cards and Paper</p>
        </div>
        <a href="/" className="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </a>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Item
        </button>
      </div>

        <div className="flex gap-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setFilter('Card')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'Card' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          Cards (Pkts)
        </button>
        <button
          onClick={() => setFilter('Paper')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'Paper' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          Papers (Rims)
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-left">Category</th>
              <th className="px-6 py-4 text-left">Dimensions</th>
              <th className="px-6 py-4 text-left">GSM</th>
              <th className="px-6 py-4 text-left">Quantity</th>
              <th className="px-6 py-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  <Package size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No items found. Add your first item to get started.</p>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      item.category === 'Card' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{item.length} × {item.width}</td>
                  <td className="px-6 py-4">{item.gsm}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={item.quantity <= item.lowStockThreshold ? 'text-red-600 font-semibold' : ''}>
                        {item.quantity} {item.unit}
                      </span>
                      {item.quantity <= item.lowStockThreshold && (
                        <AlertTriangle size={18} className="text-red-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingItem(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingItem?.name || ''}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  defaultValue={editingItem?.category || 'Card'}
                  className="input-field"
                  required
                >
                  <option value="Card">Card</option>
                  <option value="Paper">Paper</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Length</label>
                  <input
                    type="number"
                    name="length"
                    step="0.01"
                    defaultValue={editingItem?.length || ''}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                  <input
                    type="number"
                    name="width"
                    step="0.01"
                    defaultValue={editingItem?.width || ''}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSM</label>
                  <input
                    type="number"
                    name="gsm"
                    defaultValue={editingItem?.gsm || ''}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    name="unit"
                    defaultValue={editingItem?.unit || 'Pkts'}
                    className="input-field"
                    required
                  >
                    <option value="Pkts">Pkts (Packets)</option>
                    <option value="Rims">Rims (Reams)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    defaultValue={editingItem?.quantity || ''}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    defaultValue={editingItem?.lowStockThreshold || 10}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
