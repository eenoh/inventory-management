"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";

export default function InventorySearchBar({
  initialQuery,
}: {
  initialQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQuery);

  // Dynamically update the table as user types (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }

      router.replace(`/inventory?${params.toString()}`);
    }, 250);

    return () => clearTimeout(timeout);
  }, [value, router, searchParams]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    router.replace(`/inventory?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search products..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
        Search
      </button>
    </form>
  );
}
