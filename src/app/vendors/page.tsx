'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, Phone, Mail, DollarSign, Calculator, Printer, CreditCard, Banknote, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';

interface Vendor {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  transactions?: { balance?: number }[];
}

interface VendorTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  paymentMode: string | null;
  reference: string | null;
  balance: number;
  createdAt: string;
}

interface VendorItem {
  name: string;
  category: 'Card' | 'Paper' | 'Sheets';
  length: string;
  width: string;
  gsm: string;
  quantity: string;
  unit: string;
  rate: string;
  total: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedVendorData, setSelectedVendorData] = useState<Vendor | null>(null);
  const [vendorTransactions, setVendorTransactions] = useState<VendorTransaction[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [purchaseItems, setPurchaseItems] = useState<VendorItem[]>([{
    name: '', category: 'Card', length: '', width: '', gsm: '', quantity: '', unit: 'Pkts', rate: '', total: ''
  }]);
  const [paidAmount, setPaidAmount] = useState(0);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    const res = await fetch('/api/vendors');
    setVendors(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (editingVendor) {
      await fetch(`/api/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    setShowModal(false);
    setEditingVendor(null);
    fetchVendors();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vendor?')) {
      await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
      fetchVendors();
    }
  };

  const openLedgerModal = async (vendor: Vendor) => {
    setSelectedVendorData(vendor);
    const res = await fetch(`/api/vendors/${vendor.id}`);
    const data = await res.json();
    setVendorTransactions(data.transactions || []);
    setShowLedgerModal(true);
  };

  const handleClearVendorLedger = async () => {
    if (!selectedVendorData) return;
    if (confirm(`Are you sure you want to clear the ledger for ${selectedVendorData.name}? This cannot be undone.`)) {
      await fetch(`/api/vendors/${selectedVendorData.id}/ledger`, { method: 'DELETE' });
      setVendorTransactions([]);
      fetchVendors();
    }
  };

  const openPaymentModal = (vendor: Vendor) => {
    setSelectedVendorData(vendor);
    setPaymentAmount(0);
    setPaymentMode('cash');
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const handleAddPayment = async () => {
    if (!selectedVendorData || paymentAmount <= 0) return;

    await fetch(`/api/vendors/${selectedVendorData.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentAmount.toString(),
        paymentMode,
        reference: paymentReference || null,
        description: 'Payment made to vendor',
      }),
    });

    setShowPaymentModal(false);
    setSelectedVendorData(null);
    fetchVendors();
  };

  const calculatePurchasePrice = (item: VendorItem): number => {
    const gsm = parseInt(item.gsm) || 0;
    const length = parseFloat(item.length) || 0;
    const width = parseFloat(item.width) || 0;
    const qty = parseInt(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;

    if (item.category === 'Sheets') {
      return qty * rate;
    } else if (gsm <= 199) {
      return (length * width * gsm * qty * rate) / 3100;
    } else {
      return (length * width * gsm * qty * rate) / 15500;
    }
  };

  const updatePurchaseItem = (index: number, field: keyof VendorItem, value: string) => {
    const newItems = [...purchaseItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'category') {
      if (value === 'Card') {
        newItems[index].unit = 'Pkts';
      } else if (value === 'Paper') {
        newItems[index].unit = 'Rims';
      } else if (value === 'Sheets') {
        newItems[index].unit = 'Pcs';
      }
    }
    
    if (['length', 'width', 'gsm', 'quantity', 'rate', 'category'].includes(field)) {
      newItems[index].total = calculatePurchasePrice(newItems[index]).toFixed(2);
    }
    
    setPurchaseItems(newItems);
  };

  const addPurchaseItem = () => {
    setPurchaseItems([...purchaseItems, {
      name: '', category: 'Card', length: '', width: '', gsm: '', quantity: '', unit: 'Pkts', rate: '', total: ''
    }]);
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };

  const totalPurchaseAmount = purchaseItems.reduce((sum, item) => sum + calculatePurchasePrice(item), 0);

  const handleSubmitPurchase = async () => {
    if (!selectedVendor || purchaseItems.every(i => !i.name)) {
      alert('Please select a vendor and add items');
      return;
    }

    const validItems = purchaseItems.filter(i => i.name && i.quantity);

    await fetch('/api/orders/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: selectedVendor,
        items: validItems.map(i => ({ ...i, total: calculatePurchasePrice(i).toFixed(2) })),
        totalAmount: totalPurchaseAmount.toFixed(2),
        paidAmount: paidAmount.toString(),
      }),
    });

    setShowPurchaseModal(false);
    setSelectedVendor('');
    setPurchaseItems([{
      name: '', category: 'Card', length: '', width: '', gsm: '', quantity: '', unit: 'Pkts', rate: '', total: ''
    }]);
    setPaidAmount(0);
    fetchVendors();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage vendors and track purchases</p>
        </div>
        <div className="flex gap-3">
          <a href="/" className="btn-secondary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </a>
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Calculator size={20} />
            New Purchase
          </button>
          <button
            onClick={() => {
              setEditingVendor(null);
              setShowModal(true);
            }}
            className="bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors font-medium flex items-center gap-2"
          >
            <Plus size={20} />
            Add Vendor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl shadow-md p-12 text-center">
            <Truck size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Vendors Yet</h3>
            <p className="text-gray-500 mb-6">Add your first vendor to start tracking purchases</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add First Vendor
            </button>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Truck size={24} className="text-orange-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{vendor.name}</h3>
                    <p className="text-sm text-gray-500">Vendor</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingVendor(vendor);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {vendor.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={16} />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} />
                    <span>{vendor.email}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Amount Due</span>
                  <span className={`font-bold ${(vendor.transactions?.[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PKR {(vendor.transactions?.[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openLedgerModal(vendor)}
                    className="flex-1 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                  >
                    View Ledger
                  </button>
                  <button
                    onClick={() => openPaymentModal(vendor)}
                    className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <DollarSign size={14} />
                    Add Payment
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingVendor(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingVendor?.name || ''}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingVendor?.phone || ''}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingVendor?.email || ''}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={editingVendor?.address || ''}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingVendor ? 'Update' : 'Add'} Vendor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingVendor(null);
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

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calculator size={28} />
                New Purchase Order
              </h2>
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="input-field"
              >
                <option value="">Select a vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Purchase Items</h3>
                <button
                  onClick={addPurchaseItem}
                  className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>

              {purchaseItems.map((item, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Item Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updatePurchaseItem(index, 'name', e.target.value)}
                        placeholder="Item name"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Category</label>
                      <select
                        value={item.category}
                        onChange={(e) => updatePurchaseItem(index, 'category', e.target.value)}
                        className="input-field"
                      >
                        <option value="Card">Card</option>
                        <option value="Paper">Paper</option>
                        <option value="Sheets">Sheets</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Unit</label>
                      <input
                        type="text"
                        value={item.unit}
                        readOnly
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className={`grid gap-4 ${item.category === 'Sheets' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
                    {item.category !== 'Sheets' && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Length</label>
                          <input
                            type="number"
                            value={item.length}
                            onChange={(e) => updatePurchaseItem(index, 'length', e.target.value)}
                            placeholder="L"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Width</label>
                          <input
                            type="number"
                            value={item.width}
                            onChange={(e) => updatePurchaseItem(index, 'width', e.target.value)}
                            placeholder="W"
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">GSM</label>
                          <input
                            type="number"
                            value={item.gsm}
                            onChange={(e) => updatePurchaseItem(index, 'gsm', e.target.value)}
                            placeholder="GSM"
                            className="input-field"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePurchaseItem(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{item.category === 'Sheets' ? 'Rate/Pc' : 'Rate/kg'}</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updatePurchaseItem(index, 'rate', e.target.value)}
                        placeholder="PKR"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm text-gray-500">
                      Total: <span className="font-semibold text-emerald-700">PKR {item.total || '0.00'}</span>
                    </span>
                    {purchaseItems.length > 1 && (
                      <button
                        onClick={() => removePurchaseItem(index)}
                        className="text-red-500 hover:bg-red-100 p-1 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold">Total Amount:</span>
                <span className="text-3xl font-bold text-emerald-700">
                  PKR {totalPurchaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Made</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  max={totalPurchaseAmount}
                />
              </div>
              {paidAmount < totalPurchaseAmount && (
                <p className="text-red-600 mt-2">
                  Balance Due to Vendor: PKR {(totalPurchaseAmount - paidAmount).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSubmitPurchase}
                className="btn-primary flex-1"
                disabled={!selectedVendor || purchaseItems.every(i => !i.name)}
              >
                Create Purchase
              </button>
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setPurchaseItems([{
                    name: '', category: 'Card', length: '', width: '', gsm: '', quantity: '', unit: 'Pkts', rate: '', total: ''
                  }]);
                  setSelectedVendor('');
                  setPaidAmount(0);
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showLedgerModal && selectedVendorData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto ledger-print-container">
            <div className="flex items-center justify-between mb-6 no-print">
              <h2 className="text-2xl font-bold">
                Ledger - {selectedVendorData.name}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearVendorLedger}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 text-red-600"
                  title="Clear Ledger"
                >
                  <Trash2 size={20} />
                  Clear
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-orange-600"
                >
                  <Printer size={20} />
                  Print
                </button>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center print-only">
              Ledger - {selectedVendorData.name}
            </h2>

            <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Vendor</p>
                  <p className="font-bold text-lg">{selectedVendorData.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className={`text-2xl font-bold ${(vendorTransactions[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PKR {(vendorTransactions[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-orange-50 text-orange-800">
                    <th className="px-4 py-3 text-left text-sm">Date</th>
                    <th className="px-4 py-3 text-left text-sm">Description</th>
                    <th className="px-4 py-3 text-left text-sm">Mode</th>
                    <th className="px-4 py-3 text-left text-sm">Reference</th>
                    <th className="px-4 py-3 text-right text-sm">Debit</th>
                    <th className="px-4 py-3 text-right text-sm">Credit</th>
                    <th className="px-4 py-3 text-right text-sm">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    [...vendorTransactions].reverse().map((trans) => (
                      <tr key={trans.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {format(new Date(trans.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3 text-sm">{trans.description}</td>
                        <td className="px-4 py-3 text-sm">
                          {trans.paymentMode ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {trans.paymentMode === 'cash' && <Banknote size={12} />}
                              {trans.paymentMode === 'bank' && <ArrowLeftRight size={12} />}
                              {trans.paymentMode === 'cheque' && <CreditCard size={12} />}
                              {trans.paymentMode.charAt(0).toUpperCase() + trans.paymentMode.slice(1)}
                            </span>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {trans.reference || '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 text-sm">
                          {trans.type === 'debit' ? `PKR ${trans.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 text-sm">
                          {trans.type === 'credit' ? `PKR ${trans.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sm">
                          PKR {trans.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end no-print">
              <button
                onClick={() => setShowLedgerModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedVendorData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <DollarSign size={28} />
                Add Payment
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">{selectedVendorData.name}</p>
              <p className="text-sm text-gray-500">
                Current Balance Due: 
                <span className={`font-bold ml-1 ${(selectedVendorData.transactions?.[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  PKR {(selectedVendorData.transactions?.[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (PKR)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'cash', label: 'Cash', icon: Banknote },
                    { value: 'bank', label: 'Bank', icon: ArrowLeftRight },
                    { value: 'cheque', label: 'Cheque', icon: CreditCard },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => setPaymentMode(mode.value)}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${
                        paymentMode === mode.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <mode.icon size={20} />
                      <span className="text-xs font-medium">{mode.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="input-field"
                  placeholder="Transaction ID, Cheque #, etc."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddPayment}
                className="btn-primary flex-1"
                disabled={paymentAmount <= 0}
              >
                Add Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .ledger-print-container { 
            max-width: 100% !important; 
            max-height: 100% !important;
            padding: 20px !important;
          }
          body { background: white !important; }
        }
        @media screen {
          .print-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
