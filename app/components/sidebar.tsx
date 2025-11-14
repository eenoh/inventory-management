import { UserButton } from "@stackframe/stack";
import { BarChart3, Package, Plus, Settings } from "lucide-react";
import Link from "next/link";

type SidebarProps = {
  currentPath?: string;
};

export default function Sidebar({ currentPath = "/dashboard" }: SidebarProps) {
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Add Product", href: "/add-product", icon: Plus },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed left-0 top-0 bg-[#050816] text-white w-64 min-h-screen p-6 z-10">
      {/* Logo / Brand */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-9 w-9 rounded-2xl bg-purple-500 flex items-center justify-center shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold">Analytics</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Inventory
        </div>
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.href;

          return (
            <Link
              href={item.href}
              key={item.name}
              className={`flex items-center space-x-3 py-2 px-3 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-purple-100 text-gray-900" // light lilac pill
                  : "text-gray-300 hover:bg-white/5"
              }`}
            >
              <IconComponent
                className={`w-5 h-5 ${
                  isActive ? "text-purple-600" : "text-gray-300"
                }`}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <UserButton showUserInfo />
        </div>
      </div>
    </div>
  );
}
