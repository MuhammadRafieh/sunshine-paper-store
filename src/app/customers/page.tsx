'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Phone, Mail, DollarSign, CreditCard, Banknote, ArrowLeftRight, ChevronDown, ChevronUp, Printer } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  transactions?: { balance?: number; amount?: number; type?: string; createdAt?: string }[];
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  paymentMode: string | null;
  reference: string | null;
  balance: number;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerTransactions, setCustomerTransactions] = useState<Transaction[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const res = await fetch('/api/customers');
    const data = await res.json();
    setCustomers(data);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    if (editingCustomer) {
      await fetch(`/api/customers/${editingCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    setShowModal(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer? All associated orders and transactions will also be deleted.')) {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      fetchCustomers();
    }
  };

  const openPaymentModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setPaymentAmount(0);
    setPaymentMode('cash');
    setPaymentReference('');
    setShowPaymentModal(true);
  };

  const handleAddPayment = async () => {
    if (!selectedCustomer || paymentAmount <= 0) return;

    await fetch(`/api/customers/${selectedCustomer.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: paymentAmount.toString(),
        paymentMode,
        reference: paymentReference || null,
        description: 'Payment received',
      }),
    });

    setShowPaymentModal(false);
    setSelectedCustomer(null);
    fetchCustomers();
  };

  const openLedgerModal = async (customer: Customer) => {
    setSelectedCustomer(customer);
    const res = await fetch(`/api/customers/${customer.id}`);
    const data = await res.json();
    setCustomerTransactions(data.transactions || []);
    setShowLedgerModal(true);
  };

  const handleClearLedger = async () => {
    if (!selectedCustomer) return;
    if (confirm(`Are you sure you want to clear the ledger for ${selectedCustomer.name}? This cannot be undone.`)) {
      await fetch(`/api/customers/${selectedCustomer.id}/ledger`, { method: 'DELETE' });
      setCustomerTransactions([]);
      fetchCustomers();
    }
  };

  const toggleExpand = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage customer profiles and view ledgers</p>
        </div>
        <a href="/" className="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </a>
      </div>

      <button
        onClick={() => {
          setEditingCustomer(null);
          setShowModal(true);
        }}
        className="btn-primary flex items-center gap-2 mb-6"
      >
        <Plus size={20} />
        Add Customer
      </button>

      <div className="space-y-4">
        {customers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Users size={64} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Customers Yet</h3>
            <p className="text-gray-500 mb-6">Add your first customer to start tracking orders</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Add First Customer
            </button>
          </div>
        ) : (
          customers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(customer.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <Users size={24} className="text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{customer.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {customer.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} />
                            {customer.phone}
                          </span>
                        )}
                        {customer.email && (
                          <span className="flex items-center gap-1">
                            <Mail size={14} />
                            {customer.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className={`text-lg font-bold ${(customer.transactions?.[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        PKR {(customer.transactions?.[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(customer.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {expandedCustomer === customer.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              {expandedCustomer === customer.id && (
                <div className="border-t border-gray-100 bg-gray-50 p-6">
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => openLedgerModal(customer)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      View Ledger
                    </button>
                    <button
                      onClick={() => openPaymentModal(customer)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <DollarSign size={16} />
                      Add Payment
                    </button>
                    <button
                      onClick={() => {
                        setEditingCustomer(customer);
                        setShowModal(true);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(customer.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
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
                  defaultValue={editingCustomer?.name || ''}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={editingCustomer?.phone || ''}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editingCustomer?.email || ''}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address"
                  rows={3}
                  defaultValue={editingCustomer?.address || ''}
                  className="input-field"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingCustomer ? 'Update' : 'Add'} Customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
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

      {showPaymentModal && selectedCustomer && (
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
              <p className="font-medium">{selectedCustomer.name}</p>
              <p className="text-sm text-gray-500">
                Current Balance: 
                <span className={`font-bold ml-1 ${(selectedCustomer.transactions?.[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  PKR {(selectedCustomer.transactions?.[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

      {showLedgerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto ledger-print-container">
            <div className="flex items-center justify-between mb-6 no-print">
              <h2 className="text-2xl font-bold">
                Ledger - {selectedCustomer.name}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearLedger}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 text-red-600"
                  title="Clear Ledger"
                >
                  <Trash2 size={20} />
                  Clear
                </button>
                <button
                  onClick={() => window.print()}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2 text-emerald-600"
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
              Ledger - {selectedCustomer.name}
            </h2>

            <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-bold text-lg">{selectedCustomer.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Current Balance</p>
                  <p className={`text-2xl font-bold ${(customerTransactions[0]?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PKR {(customerTransactions[0]?.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-800">
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
                  {customerTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No transactions yet
                      </td>
                    </tr>
                  ) : (
                    [...customerTransactions].reverse().map((trans) => (
                      <tr key={trans.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(trans.createdAt).toLocaleDateString('en-IN')}
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

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .ledger-print-container { 
            max-width: 100% !important; 
            max-height: 100% !important;
            padding: 0 !important;
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
