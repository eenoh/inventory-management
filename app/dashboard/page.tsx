import { prisma } from "@/lib/prisma";
import Sidebar from "../components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { TrendingUp } from "lucide-react";
import { text } from "stream/consumers";
import ProductsChart from "../components/products-chart";

export default async function DashboardPage() {

  const user = await getCurrentUser();
  const userId = user.id;

  // Run Prisma queries in parallel
  const [totalProducts, lowStock, allProducts, recent] = await Promise.all([
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
    prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);


  // Derived metric
  const totalValue = allProducts.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );

  const now = new Date();
  const weeklyProductsData = []

  for (let i = 11; i >= 0;  i--) {
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - i * 7)
    weekStart.setHours(0,0,0,0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6)
    weekStart.setHours(23,59,59,999);
    
    const weekLabel = `${String(weekStart.getMonth() + 1).padStart(
      2, 
      "0"
    )}/${String(weekStart.getDate() + 1).padStart(2, "0")}`;

    const weekProducts = allProducts.filter((product) => {
      const productDate = new Date(product.createdAt)
      return productDate >= weekStart && productDate <= weekEnd;
    });


    weeklyProductsData.push({
      week: weekLabel,
      products: weekProducts.length,
    })
  }



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

          {/* Inventory over time */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>New Products per Week</h2>
            </div>
            <div className="h-48">
              <ProductsChart data={weeklyProductsData} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Stock Levels */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between b-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Stock Levels
              </h2>
            </div>
            <div className="space-y-3">
              {recent.map((product,key) => {
                const stockLevel = product.quantity === 0 
                ? 0 
                : product.quantity <= (product.lowStockAt || 5)
                ? 1 
                : 2;

                const bgColours = ["bg-red-600", "bg-yellow-600", "bg-green-600"]
                const textColours = ["text-red-600", "text-yellow-600", "text-green-600"]
                return (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${bgColours[stockLevel]}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                    <div className={`text-sm font-medium ${textColours[stockLevel]}`}>
                      {product.quantity} units
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {/* Efficiency */}
        </div>
      </main>
    </div>
  );
}
