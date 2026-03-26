import React from 'react';
import { motion } from 'framer-motion';

const Table = ({ 
  data = [], 
  columns = [], 
  className = '',
  striped = false,
  hoverable = true,
  loading = false,
  emptyMessage = "Aucune donnée disponible",
  pagination = null, // { currentPage, totalPages, onPageChange, totalItems, pageSize }
}) => {
  const { currentPage, totalPages, onPageChange, totalItems, pageSize } = pagination || {};
  const hasPagination = !!pagination && totalPages > 1;

  if (loading) {
    return (
      <div className="w-full h-64 flex items-center justify-center bg-white rounded-2xl border border-surface-100 shadow-soft">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary-100 border-t-primary-500 animate-spin"></div>
          </div>
          <p className="text-xs font-black text-surface-600 uppercase tracking-[0.2em]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-2xl border border-surface-100 shadow-soft text-surface-500">
        <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-surface-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col rounded-2xl border border-surface-100 bg-white shadow-soft ${className}`}>
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-surface-100 border-separate border-spacing-0">
          <thead className="bg-surface-50/50 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={column.key || index}
                  className="px-6 py-5 text-left text-[11px] font-black text-surface-600 uppercase tracking-widest border-b border-surface-100"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-50 bg-white">
            {data.map((row, rowIndex) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                key={row.id || row._id || rowIndex}
                className={`
                  group transition-standard
                  ${hoverable ? 'hover:bg-primary-50/40' : ''} 
                  ${striped && rowIndex % 2 === 0 ? 'bg-surface-50/20' : ''}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={column.key || colIndex} className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-surface-800 group-hover:text-primary-700 transition-standard">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
        </div>

        {hasPagination && (
          <div className="px-6 py-4 border-t border-surface-100 bg-surface-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-bold text-surface-600 uppercase tracking-widest">
              Affichage de <span className="text-primary-600">{(currentPage - 1) * pageSize + 1}</span> à <span className="text-primary-600">{Math.min(currentPage * pageSize, totalItems)}</span> sur <span className="text-primary-600">{totalItems}</span> entrées
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white border border-surface-200 text-surface-600 hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show limited page numbers for better UX
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => onPageChange(page)}
                      className={`
                        w-10 h-10 rounded-xl text-xs font-black transition-all
                        ${currentPage === page 
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110' 
                          : 'bg-white border border-surface-200 text-surface-600 hover:text-primary-600 hover:border-primary-200'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                } else if (
                  (page === 2 && currentPage > 3) || 
                  (page === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span key={page} className="px-2 text-surface-500 font-bold">...</span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white border border-surface-200 text-surface-600 hover:text-primary-600 hover:border-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Table;
