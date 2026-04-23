import Link from "next/link";
import { LayoutDashboard, Package, Users, ShoppingCart, Truck, DollarSign, ArrowRight, BookOpen } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-b from-white via-green-50/50 to-emerald-50/30">
      <div className="text-center max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl shadow-lg mb-4">
            <BookOpen size={64} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-emerald-800 mb-4">
          Welcome to Sunshine Paper Store
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Your trusted partner for quality paper products. Manage inventory, 
          track orders, and monitor finances all in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <QuickAccessCard
            href="/inventory"
            icon={<Package size={40} />}
            title="Inventory"
            description="Manage stock, track quantities, and monitor low stock alerts"
            color="emerald"
          />
          <QuickAccessCard
            href="/orders"
            icon={<ShoppingCart size={40} />}
            title="Orders"
            description="Create orders, calculate prices, and track customer purchases"
            color="teal"
          />
          <QuickAccessCard
            href="/finances"
            icon={<DollarSign size={40} />}
            title="Finances"
            description="View ledger, track credits, debits, and manage balances"
            color="green"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SecondaryCard
            href="/dashboard"
            icon={<LayoutDashboard size={24} />}
            title="Dashboard"
          />
          <SecondaryCard
            href="/customers"
            icon={<Users size={24} />}
            title="Customers"
          />
          <SecondaryCard
            href="/vendors"
            icon={<Truck size={24} />}
            title="Vendors"
          />
        </div>
      </div>
    </div>
  );
}

function QuickAccessCard({
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
  color: "emerald" | "teal" | "green";
}) {
  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
    teal: "bg-teal-50 border-teal-200 hover:bg-teal-100 hover:border-teal-300",
    green: "bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300",
  };

  return (
    <Link
      href={href}
      className={`${colorClasses[color]} border-2 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 text-emerald-700 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <span className="flex items-center text-sm font-medium text-emerald-700 group-hover:text-emerald-800">
          Go to {title}
          <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

function SecondaryCard({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-3 bg-white border-2 border-gray-200 rounded-xl p-4 text-gray-700 hover:border-emerald-400 hover:text-emerald-700 transition-all duration-200 hover:shadow-md"
    >
      {icon}
      <span className="font-medium">{title}</span>
    </Link>
  );
}
