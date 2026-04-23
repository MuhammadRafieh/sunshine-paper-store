import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Package, Users, ShoppingCart, Truck, DollarSign, BookOpen } from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sunshine Paper Store",
  description: "Paper Store Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gradient-to-b from-white via-green-50/30 to-white`}>
        <nav className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3 font-bold text-xl">
                <div className="bg-white/20 p-2 rounded-lg">
                  <BookOpen size={28} className="text-white" />
                </div>
                <span>Sunshine Paper Store</span>
              </Link>
              <div className="flex items-center gap-1">
                <NavLink href="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
                <NavLink href="/inventory" icon={<Package size={18} />} label="Inventory" />
                <NavLink href="/customers" icon={<Users size={18} />} label="Customers" />
                <NavLink href="/orders" icon={<ShoppingCart size={18} />} label="Orders" />
                <NavLink href="/vendors" icon={<Truck size={18} />} label="Vendors" />
                <NavLink href="/finances" icon={<DollarSign size={18} />} label="Finances" />
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white py-4 text-center text-sm">
          <p>© 2024 Sunshine Paper Store. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-white/20 transition-colors text-sm font-medium"
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
