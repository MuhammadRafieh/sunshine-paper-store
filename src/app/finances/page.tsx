'use client';

import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Users, Truck, ArrowUpRight, ArrowDownRight, CreditCard, Banknote, ArrowLeftRight, Printer, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerTransaction {
  id: string;
  customerId: string;
  customer?: { name: string };
  type: string;
  amount: number;
  description: string;
  paymentMode?: string | null;
  reference?: string | null;
  balance: number;
  createdAt: string;
}

interface VendorTransaction {
  id: string;
  vendorId: string;
  vendor?: { name: string };
  type: string;
  amount: number;
  description: string;
  paymentMode?: string | null;
  reference?: string | null;
  balance: number;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  transactions?: CustomerTransaction[];
}

interface Vendor {
  id: string;
  name: string;
  transactions?: VendorTransaction[];
}

export default function FinancesPage() {
  const [customerTransactions, setCustomerTransactions] = useState<CustomerTransaction[]>([]);
  const [vendorTransactions, setVendorTransactions] = useState<VendorTransaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tab, setTab] = useState<'customers' | 'vendors'>('customers');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'debit' | 'credit'>('debit');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState('cash');
  const [reference, setReference] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [custTransRes, vendTransRes, custRes, vendRes] = await Promise.all([
      fetch('/api/finances/customer-transactions'),
      fetch('/api/finances/vendor-transactions'),
      fetch('/api/customers'),
      fetch('/api/vendors'),
    ]);
    setCustomerTransactions(await custTransRes.json());
    setVendorTransactions(await vendTransRes.json());
    setCustomers(await custRes.json());
    setVendors(await vendRes.json());
  };

  const handleSubmitTransaction = async () => {
    if (!selectedEntity || amount <= 0) {
      alert('Please select a customer/vendor and enter a valid amount');
      return;
    }

    const endpoint = tab === 'customers' 
      ? '/api/finances/customer-transactions'
      : '/api/finances/vendor-transactions';

    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: tab === 'customers' ? selectedEntity : undefined,
        vendorId: tab === 'vendors' ? selectedEntity : undefined,
        type: transactionType,
        amount: amount.toString(),
        description,
        paymentMode: transactionType === 'credit' ? paymentMode : null,
        reference: transactionType === 'credit' ? (reference || null) : null,
      }),
    });

    setShowTransactionModal(false);
    setSelectedEntity('');
    setAmount(0);
    setDescription('');
    setPaymentMode('cash');
    setReference('');
    fetchData();
  };

  const currentTransactions = tab === 'customers' ? customerTransactions : vendorTransactions;
  const currentEntities = tab === 'customers' ? customers : vendors;

  const getPaymentModeIcon = (mode?: string | null) => {
    switch (mode) {
      case 'cash': return <Banknote size={14} />;
      case 'bank': return <ArrowLeftRight size={14} />;
      case 'cheque': return <CreditCard size={14} />;
      default: return null;
    }
  };

  const getPaymentModeLabel = (mode?: string | null) => {
    if (!mode) return '';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearLedger = async () => {
    const confirmMsg = tab === 'customers' 
      ? 'Are you sure you want to clear ALL customer ledger transactions? This cannot be undone.'
      : 'Are you sure you want to clear ALL vendor ledger transactions? This cannot be undone.';
    
    if (confirm(confirmMsg)) {
      await fetch('/api/finances/clear', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: tab }),
      });
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Ledger</h1>
          <p className="text-gray-600 mt-1">Track credits, debits, and balances</p>
        </div>
        <a href="/" className="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </a>
      </div>

      <button
        onClick={() => setShowTransactionModal(true)}
        className="btn-primary flex items-center gap-2 mb-6"
      >
        <DollarSign size={20} />
        Add Transaction
      </button>
      <button
        onClick={handlePrint}
        className="btn-secondary flex items-center gap-2 mb-6 ml-4 no-print"
      >
        <Printer size={20} />
        Print Ledger
      </button>
      <button
        onClick={handleClearLedger}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 mb-6 ml-4"
      >
        <Trash2 size={20} />
        Clear {tab === 'customers' ? 'Customer' : 'Vendor'} Ledger
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <TrendingUp size={24} className="text-emerald-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-emerald-700">
                PKR {customerTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingDown size={24} className="text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Purchases</p>
              <p className="text-2xl font-bold text-blue-700">
                PKR {vendorTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <DollarSign size={24} className="text-red-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Outstanding Credits</p>
              <p className="text-2xl font-bold text-red-700">
                PKR {customers.reduce((sum, c) => {
                  const bal = customerTransactions.find(t => t.customerId === c.id)?.balance || 0;
                  return sum + Math.max(0, bal);
                }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab('customers')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === 'customers'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users size={20} />
            Customer Ledger
          </button>
          <button
            onClick={() => setTab('vendors')}
            className={`flex-1 px-6 py-4 text-center font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === 'vendors'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Truck size={20} />
            Vendor Ledger
          </button>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Debit</p>
              <p className="text-xl font-bold text-red-600">
                PKR {(tab === 'customers' 
                  ? customerTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
                  : vendorTransactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0)
                ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Credit</p>
              <p className="text-xl font-bold text-green-600">
                PKR {(tab === 'customers' 
                  ? customerTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
                  : vendorTransactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0)
                ).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {currentEntities.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No {tab} found. Add a {tab === 'customers' ? 'customer' : 'vendor'} first.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentEntities.map((entity) => {
                const entityTransactions = currentTransactions.filter(
                  t => {
                    if (tab === 'customers') {
                      return (t as CustomerTransaction).customerId === entity.id;
                    }
                    return (t as VendorTransaction).vendorId === entity.id;
                  }
                );
                const balance = entityTransactions[0]?.balance || 0;

                return (
                  <div key={entity.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 flex items-center justify-between">
                      <h3 className="font-bold text-gray-800">
                        {entity.name}
                      </h3>
                      <span className={`font-semibold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Balance: PKR {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    
                    {entityTransactions.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No transactions yet
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-emerald-50 text-emerald-800 text-sm">
                              <th className="px-4 py-3 text-left">Date</th>
                              <th className="px-4 py-3 text-left">Description</th>
                              <th className="px-4 py-3 text-left">Mode</th>
                              <th className="px-4 py-3 text-left">Reference</th>
                              <th className="px-4 py-3 text-right">Debit (+)</th>
                              <th className="px-4 py-3 text-right">Credit (-)</th>
                              <th className="px-4 py-3 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...entityTransactions].reverse().map((trans) => (
                              <tr key={trans.id} className="border-t border-gray-100">
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {format(new Date(trans.createdAt), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-4 py-3 text-sm">{trans.description}</td>
                                <td className="px-4 py-3 text-sm">
                                  {trans.paymentMode ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                                      {getPaymentModeIcon(trans.paymentMode)}
                                      {getPaymentModeLabel(trans.paymentMode)}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {trans.reference || '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-red-600">
                                  {trans.type === 'debit' ? (
                                    <span className="flex items-center justify-end gap-1">
                                      <ArrowUpRight size={14} />
                                      PKR {trans.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right text-green-600">
                                  {trans.type === 'credit' ? (
                                    <span className="flex items-center justify-end gap-1">
                                      <ArrowDownRight size={14} />
                                      PKR {trans.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                    </span>
                                  ) : '-'}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold">
                                  PKR {trans.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Add Transaction</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTransactionType('debit')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      transactionType === 'debit'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Debit (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType('credit')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                      transactionType === 'credit'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Credit (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tab === 'customers' ? 'Customer' : 'Vendor'}
                </label>
                <select
                  value={selectedEntity}
                  onChange={(e) => setSelectedEntity(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select {tab === 'customers' ? 'customer' : 'vendor'}</option>
                  {currentEntities.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  placeholder="Enter description"
                />
              </div>

              {transactionType === 'credit' && (
                <>
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
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="input-field"
                      placeholder="Transaction ID, Cheque #, etc."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmitTransaction}
                className="btn-primary flex-1"
                disabled={!selectedEntity || amount <= 0}
              >
                Add Transaction
              </button>
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setSelectedEntity('');
                  setAmount(0);
                  setDescription('');
                  setPaymentMode('cash');
                  setReference('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
