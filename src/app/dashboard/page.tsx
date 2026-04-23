'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Truck, DollarSign,
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight
} from 'lucide-react';

interface DashboardData {
  totalStockValue: number;
  totalOutstandingCredits: number;
  totalVendorDues: number;
  totalSales: number;
  totalPurchases: number;
  totalInventoryItems: number;
  totalCustomers: number;
  totalVendors: number;
  totalOrders: number;
  lowStockItems: any[];
  recentOrders: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const result = await res.json();
      setData(result || getDefaultData());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setData(getDefaultData());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultData = (): DashboardData => ({
    totalStockValue: 0,
    totalOutstandingCredits: 0,
    totalVendorDues: 0,
    totalSales: 0,
    totalPurchases: 0,
    totalInventoryItems: 0,
    totalCustomers: 0,
    totalVendors: 0,
    totalOrders: 0,
    lowStockItems: [],
    recentOrders: [],
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Stock Value',
      value: `PKR ${(data?.totalStockValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <Package size={24} />,
      color: 'emerald',
      href: '/inventory',
    },
    {
      title: 'Outstanding Credits',
      value: `PKR ${(data?.totalOutstandingCredits || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp size={24} />,
      color: 'red',
      href: '/finances',
    },
    {
      title: 'Total Sales',
      value: `PKR ${(data?.totalSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <ShoppingCart size={24} />,
      color: 'blue',
      href: '/orders',
    },
    {
      title: 'Vendor Dues',
      value: `PKR ${(data?.totalVendorDues || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: <TrendingDown size={24} />,
      color: 'orange',
      href: '/finances',
    },
  ];

  const counts = [
    { label: 'Inventory Items', value: data?.totalInventoryItems || 0, icon: <Package size={20} />, color: 'emerald', href: '/inventory' },
    { label: 'Customers', value: data?.totalCustomers || 0, icon: <Users size={20} />, color: 'blue', href: '/customers' },
    { label: 'Vendors', value: data?.totalVendors || 0, icon: <Truck size={20} />, color: 'orange', href: '/vendors' },
    { label: 'Orders', value: data?.totalOrders || 0, icon: <ShoppingCart size={20} />, color: 'purple', href: '/orders' },
  ];

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your paper store operations</p>
        </div>
        <a href="/" className="btn-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.href}
            className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group`}
          >
            <div className="flex items-start justify-between">
              <div className={`${colorClasses[stat.color]} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <ArrowRight size={20} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <p className="text-sm text-gray-500 mt-4">{stat.title}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color === 'red' ? 'text-red-600' : 'text-gray-800'}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {counts.map((count) => (
          <Link
            key={count.label}
            href={count.href}
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-shadow group cursor-pointer"
          >
            <div className={`${colorClasses[count.color]} w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2`}>
              {count.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{count.value}</p>
            <p className="text-sm text-gray-500 group-hover:text-emerald-600 transition-colors">{count.label}</p>
          </Link>
        ))}
      </div>

      {data.lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="bg-red-50 px-6 py-4 flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-600" />
            <h2 className="text-xl font-bold text-red-800">Low Stock Alert</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.lowStockItems.map((item) => (
                <div key={item.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.category} | GSM: {item.gsm}</p>
                    </div>
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/inventory"
              className="mt-4 inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
            >
              View Inventory
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link
            href="/orders"
            className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            View All
            <ArrowRight size={16} />
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p>No orders yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Customer</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-right">Balance</th>
                <th className="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">#{order.id.slice(-6)}</td>
                  <td className="px-6 py-4">{order.customer?.name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-right font-semibold">
                    PKR {order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    PKR {(order.totalAmount - order.paidAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <QuickLinkCard
          href="/inventory"
          icon={<Package size={32} />}
          title="Manage Inventory"
          description="Add, edit, or remove stock items"
          color="emerald"
        />
        <QuickLinkCard
          href="/orders"
          icon={<ShoppingCart size={32} />}
          title="Create Order"
          description="Calculate prices and create new orders"
          color="blue"
        />
        <QuickLinkCard
          href="/finances"
          icon={<DollarSign size={32} />}
          title="View Ledger"
          description="Track all financial transactions"
          color="orange"
        />
      </div>
    </div>
  );
}

function QuickLinkCard({
  href,
  icon,
  title,
  description,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'emerald' | 'blue' | 'orange';
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
  };

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} border-2 rounded-xl p-6 transition-all duration-200 hover:shadow-md`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-80">{description}</p>
    </Link>
  );
}
