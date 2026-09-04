import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  totalItems = 0,
  itemsPerPage = 10,
  onItemsPerPageChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [5, 10, 20, 50]
}) {
  if (totalItems === 0 || totalPages <= 1 && !showItemsPerPage) {
    if (totalItems === 0) return null;
    if (totalPages <= 1 && totalItems <= itemsPerPage) {
      return (
        <div className="flex items-center justify-between text-xs text-slate-500 font-bold px-2 py-3">
          <span>Showing all {totalItems} entries</span>
        </div>
      );
    }
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-3.5 bg-white border-t border-gray-100 rounded-b-2xl text-xs select-none">
      {/* Left Info & Items Per Page */}
      <div className="flex items-center gap-3 text-slate-500 font-bold">
        <span>
          Showing <span className="font-black text-slate-900">{startItem}</span> to{" "}
          <span className="font-black text-slate-900">{endItem}</span> of{" "}
          <span className="font-black text-purple-700 font-mono">{totalItems}</span> entries
        </span>

        {showItemsPerPage && onItemsPerPageChange && (
          <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-gray-200">
            <span className="text-[11px] text-slate-400 font-semibold">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 bg-slate-50 border border-gray-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:border-purple-600 cursor-pointer"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Prev Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Number Buttons */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-1.5 text-slate-400 font-bold">
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[30px] h-[30px] px-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? "bg-purple-600 text-white shadow-xs"
                    : "border border-gray-200 bg-white text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-purple-50 text-slate-600 hover:text-purple-700 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
