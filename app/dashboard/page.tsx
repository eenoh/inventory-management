import { prisma } from "@/lib/prisma";
import Sidebar from "../components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { TrendingUp } from "lucide-react";

export default async function DashboardPage() {

  const user = await getCurrentUser();
  const userId = user.id;

  // Run Prisma queries in parallel
  const [totalProducts, lowStock, allProducts] = await Promise.all([
    prisma.product.count({ where: { userId } }),
    prisma.product.count({
      where: {
        userId,
        lowStockAt: { not: null },
        quantity: { lte: 5 },
      },
    }),
    prisma.product.findMany({
      where: { userId },
      select: { price: true, quantity: true, createdAt: true },
    }),
  ]);

  // Derived metric
  const totalValue = allProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );

  // Array of metrics for rendering
  const metrics = [
    {
      label: "Total Products",
      value: totalProducts,
      formatted: totalProducts,
    },
    {
      label: "Total Value",
      value: totalValue,
      formatted: `$${Number(totalValue).toFixed(0)}`,
    },
    {
      label: "Low Stock",
      value: lowStock,
      formatted: lowStock,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/dashboard" />

      <main className="ml-64 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Welcome back! Here is an overview of your inventory.
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Key Metrics
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

              {metrics.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {item.formatted}
                  </div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                  <div className="flex items-center justify-center mt-1">
                    <span className="text-xs text-green-600 flex items-center">
                      {item.formatted}
                      <TrendingUp className="w-3 h-3 text-green-600 ml-1" />
                    </span>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Levels */}
        </div>

      </main>
    </div>
  );
}
