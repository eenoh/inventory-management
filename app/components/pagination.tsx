import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    // center range around current page
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // start
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    // middle
    rangeWithDots.push(...range);

    // end
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${baseUrl}?${params.toString()}`;
  };

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav className="flex items-center justify-center gap-1">
      {/* Previous */}
      <Link
        href={currentPage <= 1 ? buildHref(1) : buildHref(prevPage)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
          currentPage <= 1
            ? "text-gray-400 cursor-not-allowed bg-gray-100"
            : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300"
        }`}
        aria-disabled={currentPage <= 1}
        tabIndex={currentPage <= 1 ? -1 : 0}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Link>

      {/* Numbered pages */}
      {visiblePages.map((page, index) => {
        if (page === "...") {
          return (
            <span
              key={`dots-${index}`}
              className="px-3 py-2 text-sm text-gray-400"
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isCurrent = pageNumber === currentPage;

        return (
          <Link
            key={pageNumber}
            href={buildHref(pageNumber)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              isCurrent
                ? "bg-purple-600 text-white"
                : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300"
            }`}
          >
            {pageNumber}
          </Link>
        );
      })}

      {/* Next */}
      <Link
        href={currentPage >= totalPages ? buildHref(totalPages) : buildHref(nextPage)}
        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
          currentPage >= totalPages
            ? "text-gray-400 cursor-not-allowed bg-gray-100"
            : "text-gray-700 hover:bg-gray-100 bg-white border border-gray-300"
        }`}
        aria-disabled={currentPage >= totalPages}
        tabIndex={currentPage >= totalPages ? -1 : 0}
      >
        Next
        <ChevronRight className="w-4 h-4 ml-1" />
      </Link>
    </nav>
  );
}
