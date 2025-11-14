import { prisma } from "@/lib/prisma";
import Sidebar from "../components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { deleteProduct } from "@/lib/actions/product";
import InventorySearchBar from "../components/inventory-search-bar";
import Pagination from "../components/pagination";

export const dynamic = "force-dynamic";

type InventoryPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function InventoryPage({ searchParams }: InventoryPageProps) {
  const user = await getCurrentUser();
  const userId = user.id;

  // Next.js 16: searchParams is a Promise, so we await it
  const sp = await searchParams;

  const q = (sp.q ?? "").trim();
  const pageSize = 10;
  const page = Math.max(1, Number(sp.page ?? "1")); // ✅ fixed row 43 (using sp.page)
  
  const where = {
    userId,
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [totalCount, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar currentPath="/inventory" />
      <main className="ml-64 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Inventory
              </h1>
              <p className="text-sm text-gray-500">
                Manage your products and track inventory levels.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Searchbar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <InventorySearchBar initialQuery={q} />
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Low Stock At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.sku || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.lowStockAt ?? "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={product.id} />
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}

                {totalCount === 0 && (
                  <tr>
                    <td
                      className="px-6 py-4 text-sm text-gray-500 text-center"
                      colSpan={6}
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Pagination 
                currentPage={page} 
                totalPages={totalPages} 
                baseUrl="/inventory" 
                searchParams={{
                  q,
                  pageSize: String(pageSize)
                }} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
