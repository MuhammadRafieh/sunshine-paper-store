'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ShoppingCart, Calculator, Trash2, Check, Clock, Package, DollarSign, CreditCard, Banknote, ArrowLeftRight, Package as PackageIcon, Eye, XCircle } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  length: number;
  width: number;
  gsm: number;
  quantity: number;
  unit: string;
}

interface Customer {
  id: string;
  name: string;
}

interface OrderItem {
  id: string;
  name: string;
  category: 'Card' | 'Paper' | 'Sheets';
  length: number;
  width: number;
  gsm: number;
  quantity: number;
  unit: string;
  rate: number;
  total: number;
  isOutsourced?: boolean;
  inventoryItemId?: string;
}

interface Order {
  id: string;
  customerId: string;
  customer?: { name: string };
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'unpaid' | 'refunded';
  isCancelled?: boolean;
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [orderPaymentMode, setOrderPaymentMode] = useState('cash');
  const [orderReference, setOrderReference] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'delivered' | 'cancelled'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [activeSection, setActiveSection] = useState<'orders' | 'new'>('orders');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [custRes, ordRes, invRes] = await Promise.all([
      fetch('/api/customers'),
      fetch('/api/orders'),
      fetch('/api/inventory'),
    ]);
    setCustomers(await custRes.json());
    setOrders(await ordRes.json());
    setInventory(await invRes.json());
  };

  const calculatePrice = (category: string, length: number, width: number, gsm: number, qty: number, rate: number): number => {
    if (category === 'Sheets') {
      return qty * rate;
    } else if (gsm <= 199) {
      return (length * width * gsm * qty * rate) / 3100;
    } else {
      return (length * width * gsm * qty * rate) / 15500;
    }
  };

  const addManualItem = () => {
    setOrderItems([...orderItems, {
      id: Date.now().toString(),
      name: '',
      category: 'Card',
      length: 0,
      width: 0,
      gsm: 0,
      quantity: 0,
      unit: 'Pkts',
      rate: 0,
      total: 0,
      isOutsourced: true,
    }]);
  };

  const addInventoryItem = (invItem: InventoryItem) => {
    const existingIndex = orderItems.findIndex(i => i.inventoryItemId === invItem.id);
    
    if (existingIndex >= 0) {
      const updated = [...orderItems];
      const newQty = updated[existingIndex].quantity + 1;
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        total: calculatePrice(
          updated[existingIndex].category,
          updated[existingIndex].length,
          updated[existingIndex].width,
          updated[existingIndex].gsm,
          newQty,
          updated[existingIndex].rate
        ),
      };
      setOrderItems(updated);
    } else {
      const category = invItem.category as 'Card' | 'Paper' | 'Sheets';
      setOrderItems([...orderItems, {
        id: Date.now().toString(),
        name: invItem.name,
        category,
        length: invItem.length,
        width: invItem.width,
        gsm: invItem.gsm,
        quantity: 1,
        unit: invItem.unit,
        rate: 0,
        total: 0,
        isOutsourced: false,
        inventoryItemId: invItem.id,
      }]);
    }
  };

  const updateOrderItem = (id: string, field: keyof OrderItem, value: any) => {
    setOrderItems(orderItems.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        if (field === 'category') {
          if (value === 'Card') {
            updated.unit = 'Pkts';
          } else if (value === 'Paper') {
            updated.unit = 'Rims';
          } else if (value === 'Sheets') {
            updated.unit = 'Pcs';
          }
        }
        
        if (['length', 'width', 'gsm', 'quantity', 'rate', 'category'].includes(field)) {
          updated.rate = parseFloat(String(updated.rate)) || 0;
          updated.total = calculatePrice(
            updated.category,
            parseFloat(String(updated.length)) || 0,
            parseFloat(String(updated.width)) || 0,
            parseInt(String(updated.gsm)) || 0,
            parseInt(String(updated.quantity)) || 0,
            updated.rate
          );
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setOrderItems(orderItems.filter(i => i.id !== id));
  };

  const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmitOrder = async () => {
    if (!selectedCustomer || orderItems.length === 0) {
      alert('Please select a customer and add items');
      return;
    }

    if (orderItems.some(item => !item.name || item.quantity <= 0)) {
      alert('Please fill in all item details (name and quantity are required)');
      return;
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedCustomer,
        items: orderItems,
        totalAmount: totalAmount.toFixed(2),
        paidAmount: paidAmount.toString(),
        status: 'pending',
        paymentMode: orderPaymentMode,
        reference: orderReference || null,
      }),
    });

    if (res.ok) {
      setShowNewOrder(false);
      setSelectedCustomer('');
      setOrderItems([]);
      setPaidAmount(0);
      setOrderPaymentMode('cash');
      setOrderReference('');
      setActiveSection('orders');
      fetchData();
    } else {
      const error = await res.json();
      alert('Failed to create order: ' + (error.message || error.error));
    }
  };

  const markAsDelivered = async (orderId: string) => {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'delivered' }),
    });
    fetchData();
  };

  const deleteOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order? The ledger will be updated and inventory restored.')) {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancelOrder: true }),
      });
      fetchData();
    }
  };

  const openPaymentModal = (order: Order) => {
    setSelectedOrder(order);
    setPaymentAmount(order.totalAmount - order.paidAmount);
    setPaymentMode('cash');
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const openDetailsModal = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleAddPayment = async () => {
    if (!selectedOrder || paymentAmount <= 0) return;

    await fetch(`/api/orders/${selectedOrder.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        addPayment: true,
        paymentAmount: paymentAmount.toString(),
        paymentMode,
        reference: paymentReference || null,
      }),
    });

    setShowPaymentModal(false);
    setSelectedOrder(null);
    fetchData();
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return order.status === 'pending' && !order.isCancelled;
    if (activeTab === 'cancelled') return order.status === 'cancelled' || order.isCancelled;
    return order.status === 'delivered';
  }).filter(order => {
    if (filterPayment === 'all') return true;
    return order.paymentStatus === filterPayment;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
          <p className="text-gray-600 mt-1">Create orders and track customer purchases</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.back()} className="btn-secondary flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back
          </button>
          {activeSection === 'orders' && (
            <button onClick={() => { setShowNewOrder(true); setActiveSection('new'); }} className="btn-primary flex items-center gap-2">
              <Plus size={20} />
              New Order
            </button>
          )}
        </div>
      </div>

      {activeSection === 'orders' && (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setActiveTab('all')} className={`px-4 py-2 font-medium transition-colors ${activeTab === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>All</button>
              <button onClick={() => setActiveTab('pending')} className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}><Clock size={16} />Pending</button>
              <button onClick={() => setActiveTab('delivered')} className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'delivered' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}><Check size={16} />Delivered</button>
              <button onClick={() => setActiveTab('cancelled')} className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${activeTab === 'cancelled' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}><XCircle size={16} />Cancelled</button>
            </div>

            <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => setFilterPayment('all')} className={`px-4 py-2 font-medium transition-colors ${filterPayment === 'all' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>All Payments</button>
              <button onClick={() => setFilterPayment('paid')} className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${filterPayment === 'paid' ? 'bg-green-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}><DollarSign size={16} />Paid</button>
              <button onClick={() => setFilterPayment('unpaid')} className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${filterPayment === 'unpaid' ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>Unpaid</button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100"><h2 className="text-xl font-bold text-gray-800">Orders</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="table-header">
                  <th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-left">Payment</th><th className="px-4 py-3 text-left">Order ID</th><th className="px-4 py-3 text-left">Customer</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3 text-right">Paid</th><th className="px-4 py-3 text-right">Balance</th><th className="px-4 py-3 text-left">Date</th><th className="px-4 py-3 text-center">Actions</th>
                </tr></thead>
                <tbody>
                  {filteredOrders.length === 0 ? (<tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500"><ShoppingCart size={48} className="mx-auto mb-4 opacity-50" /><p>No orders found.</p></td></tr>) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className={`border-t border-gray-100 hover:bg-gray-50 ${order.isCancelled ? 'bg-gray-100 opacity-60' : order.paymentStatus === 'unpaid' ? 'bg-red-50/30' : 'bg-green-50/30'}`}>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${order.status === 'pending' ? 'bg-amber-100 text-amber-700' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                          {order.status === 'pending' && <><Clock size={12} />Pending</>}
                          {order.status === 'delivered' && <><Check size={12} />Delivered</>}
                          {order.status === 'cancelled' && <><XCircle size={12} />Cancelled</>}
                        </span></td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'refunded' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-700'}`}>
                          {order.paymentStatus === 'paid' && <><DollarSign size={12} />Paid</>}
                          {order.paymentStatus === 'refunded' && <><DollarSign size={12} />Refunded</>}
                          {order.paymentStatus === 'unpaid' && 'Unpaid'}
                        </span></td>
                        <td className="px-4 py-3 font-mono text-sm">#{order.id.slice(-6)}</td>
                        <td className="px-4 py-3">{order.customer?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 font-semibold text-right">PKR {order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-green-600 text-right">PKR {order.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-red-600 text-right">PKR {(order.totalAmount - order.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-gray-500 text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3"><div className="flex items-center justify-center gap-2">
                          <button onClick={() => openDetailsModal(order)} className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="View Details"><Eye size={16} /></button>
                          {order.status === 'pending' && <button onClick={() => markAsDelivered(order.id)} className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1"><Check size={14} />Deliver</button>}
                          {order.status === 'pending' && <button onClick={() => cancelOrder(order.id)} className="px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-xs font-medium flex items-center gap-1"><XCircle size={14} />Cancel</button>}
                          {order.paymentStatus === 'unpaid' && order.status === 'pending' && <button onClick={() => openPaymentModal(order)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"><DollarSign size={14} />Pay</button>}
                          <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" title="Delete Order"><Trash2 size={16} /></button>
                        </div></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {showNewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2"><Calculator size={28} />New Order</h2>
              <button onClick={() => { setShowNewOrder(false); setActiveSection('orders'); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-3">Inventory Items</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                  {inventory.length === 0 ? (<p className="text-gray-500 text-center py-4">No inventory items</p>) : (
                    inventory.map((item) => (
                      <div key={item.id} onClick={() => addInventoryItem(item)} className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-emerald-50 cursor-pointer transition-colors border border-gray-100">
                        <div><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-500">{item.category} | {item.length}×{item.width} | GSM: {item.gsm} | Stock: {item.quantity} {item.unit}</p></div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">Order Items</h3>
                  <button onClick={addManualItem} className="text-emerald-600 hover:bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm font-medium border border-emerald-200"><Plus size={16} />Custom Item</button>
                </div>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {orderItems.length === 0 ? (<div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg"><Package size={40} className="mx-auto mb-2 text-gray-400" /><p className="text-gray-500">Click inventory items or add custom items</p></div>) : (
                    orderItems.map((item, index) => (
                      <div key={item.id} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-emerald-700">{item.isOutsourced ? 'Custom Item' : 'From Inventory'}</span>
                          <button onClick={() => removeItem(item.id)} className="text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={18} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                          <div className="lg:col-span-2"><label className="block text-xs text-gray-500 mb-1">Item Name *</label><input type="text" value={item.name} onChange={(e) => updateOrderItem(item.id, 'name', e.target.value)} placeholder="Enter item name" className="input-field" /></div>
                          <div><label className="block text-xs text-gray-500 mb-1">Category</label><select value={item.category} onChange={(e) => updateOrderItem(item.id, 'category', e.target.value)} className="input-field"><option value="Card">Card</option><option value="Paper">Paper</option><option value="Sheets">Sheets</option></select></div>
                          <div><label className="block text-xs text-gray-500 mb-1">Unit</label><input type="text" value={item.unit} readOnly className="input-field bg-gray-100 cursor-not-allowed" /></div>
                        </div>

                        <div className={`grid gap-4 mb-3 ${item.category === 'Sheets' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-5'}`}>
                          {item.category !== 'Sheets' && (<><div><label className="block text-xs text-gray-500 mb-1">Length</label><input type="number" value={item.length || ''} onChange={(e) => updateOrderItem(item.id, 'length', e.target.value)} placeholder="L" className="input-field" /></div><div><label className="block text-xs text-gray-500 mb-1">Width</label><input type="number" value={item.width || ''} onChange={(e) => updateOrderItem(item.id, 'width', e.target.value)} placeholder="W" className="input-field" /></div><div><label className="block text-xs text-gray-500 mb-1">GSM</label><input type="number" value={item.gsm || ''} onChange={(e) => updateOrderItem(item.id, 'gsm', e.target.value)} placeholder="GSM" className="input-field" /></div></>)}
                          <div><label className="block text-xs text-gray-500 mb-1">Quantity *</label><input type="number" value={item.quantity || ''} onChange={(e) => updateOrderItem(item.id, 'quantity', e.target.value)} placeholder="Qty" className="input-field" /></div>
                          <div><label className="block text-xs text-gray-500 mb-1">{item.category === 'Sheets' ? 'Rate/Pc (PKR) *' : 'Rate/kg (PKR) *'}</label><input type="number" value={item.rate || ''} onChange={(e) => updateOrderItem(item.id, 'rate', e.target.value)} placeholder="PKR" className="input-field" /></div>
                        </div>

                        <div className="flex items-center justify-end"><span className="text-lg font-bold text-emerald-700">PKR {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer *</label>
              <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} className="input-field">
                <option value="">Select a customer</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4"><span className="text-xl font-bold">Total Amount:</span><span className="text-3xl font-bold text-emerald-700">PKR {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (PKR)</label><input type="number" value={paidAmount} onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} className="input-field" max={totalAmount || 0} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label><select value={orderPaymentMode} onChange={(e) => setOrderPaymentMode(e.target.value)} className="input-field"><option value="cash">Cash</option><option value="bank">Bank Transfer</option><option value="cheque">Cheque</option><option value="card">Card</option><option value="other">Other</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reference (Optional)</label><input type="text" value={orderReference} onChange={(e) => setOrderReference(e.target.value)} className="input-field" placeholder="Cheque #, Transaction ID, etc." /></div>
              </div>
              {paidAmount < totalAmount && paidAmount > 0 && (<p className="text-red-600 mt-2">Balance Due: PKR {(totalAmount - paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>)}
            </div>

            <div className="flex gap-4">
              <button onClick={handleSubmitOrder} className="btn-primary flex-1" disabled={!selectedCustomer || orderItems.length === 0}>Create Order</button>
              <button onClick={() => { setShowNewOrder(false); setActiveSection('orders'); setOrderItems([]); setSelectedCustomer(''); setPaidAmount(0); }} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold flex items-center gap-2"><DollarSign size={28} />Add Payment</h2><button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>
            <div className="mb-4 p-4 bg-gray-50 rounded-lg"><p className="text-sm text-gray-500">Order #{selectedOrder.id.slice(-6)}</p><p className="text-sm text-gray-500">Customer: {selectedOrder.customer?.name}</p><p className="font-semibold mt-2">Total: PKR {selectedOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | Paid: PKR {selectedOrder.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} | <span className="text-red-600">Balance: PKR {(selectedOrder.totalAmount - selectedOrder.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></p></div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (PKR)</label><input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)} className="input-field" max={(selectedOrder.totalAmount - selectedOrder.paidAmount) || 0} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label><div className="grid grid-cols-3 gap-2">{[{ value: 'cash', label: 'Cash', icon: Banknote }, { value: 'bank', label: 'Bank', icon: ArrowLeftRight }, { value: 'cheque', label: 'Cheque', icon: CreditCard }].map((mode) => (<button key={mode.value} type="button" onClick={() => setPaymentMode(mode.value)} className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-colors ${paymentMode === mode.value ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300'}`}><mode.icon size={20} /><span className="text-xs font-medium">{mode.label}</span></button>))}</div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Reference / Notes (Optional)</label><input type="text" value={paymentReference} onChange={(e) => setPaymentReference(e.target.value)} className="input-field" placeholder="Transaction ID, Cheque #, etc." /></div>
            </div>
            <div className="flex gap-4 mt-6"><button onClick={handleAddPayment} className="btn-primary flex-1" disabled={paymentAmount <= 0}>Add Payment</button><button onClick={() => setShowPaymentModal(false)} className="btn-secondary flex-1">Cancel</button></div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Package size={28} />
                Order Details
              </h2>
              <button onClick={() => setShowDetailsModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-semibold">#{selectedOrder.id.slice(-6)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Customer</p>
                <p className="font-semibold">{selectedOrder.customer?.name || 'Unknown'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-800">
                    <th className="px-4 py-3 text-left text-sm">Item</th>
                    <th className="px-4 py-3 text-left text-sm">Category</th>
                    <th className="px-4 py-3 text-left text-sm">Dimensions</th>
                    <th className="px-4 py-3 text-left text-sm">GSM</th>
                    <th className="px-4 py-3 text-right text-sm">Qty</th>
                    <th className="px-4 py-3 text-right text-sm">Rate</th>
                    <th className="px-4 py-3 text-right text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-medium">{item.name || 'Unknown Item'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          item.category === 'Card' ? 'bg-blue-100 text-blue-800' :
                          item.category === 'Paper' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.length > 0 && item.width > 0 ? `${item.length} × ${item.width}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">{item.gsm || '-'}</td>
                      <td className="px-4 py-3 text-right">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-right text-sm">PKR {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-right font-semibold">PKR {item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan={6} className="px-4 py-3 text-right font-bold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-emerald-700">
                      PKR {selectedOrder.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Paid Amount</p>
                <p className="font-bold text-green-700">PKR {selectedOrder.paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Balance</p>
                <p className="font-bold text-red-700">PKR {(selectedOrder.totalAmount - selectedOrder.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Payment Status</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                  selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {selectedOrder.paymentStatus === 'paid' ? <><Check size={12} />Paid</> : 'Unpaid'}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setShowDetailsModal(false)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
