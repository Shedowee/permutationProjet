import React from 'react';
import { useContext } from 'react';
import { motion } from 'framer-motion';
import { DashboardSurfaceContext } from '../context/DashboardSurfaceContextBase';

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
  const dashboardSurface = useContext(DashboardSurfaceContext);
  const { currentPage, totalPages, onPageChange, totalItems, pageSize } = pagination || {};
  const hasPagination = !!pagination && totalPages > 1;
  const surfaceClasses = dashboardSurface
    ? 'surface-table'
    : 'bg-white/92 border border-slate-200/80 shadow-[0_18px_44px_-32px_rgba(15,23,42,0.26)] rounded-lg overflow-hidden';

  if (loading) {
    return (
      <div className={`w-full h-64 flex items-center justify-center ${surfaceClasses}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-sky-100 border-t-primary-600 animate-spin"></div>
          </div>
          <p className="text-xs font-black text-surface-600 uppercase tracking-[0.2em]">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full h-64 flex flex-col items-center justify-center text-surface-500 ${surfaceClasses}`}>
        <div className="w-14 h-14 bg-slate-50 rounded-lg flex items-center justify-center mb-4 border border-slate-200">
          <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`relative flex flex-col ${surfaceClasses} ${className} ${dashboardSurface ? '!text-surface-900' : ''}`}>
      <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-slate-200/80 border-separate border-spacing-0">
          <thead className={`${dashboardSurface ? 'bg-slate-50/92' : 'bg-slate-50/90'} sticky top-0 z-10 backdrop-blur-md`}>
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={column.key || index}
                  className="px-5 py-3.5 text-left text-[11px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-200"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y divide-slate-100 ${dashboardSurface ? 'bg-transparent' : 'bg-white/70'}`}>
            {data.map((row, rowIndex) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                key={row.id || row._id || rowIndex}
                className={`
                  group transition-standard
                  ${hoverable ? 'hover:bg-sky-50/55' : ''} 
                  ${striped && rowIndex % 2 === 0 ? 'bg-slate-50/45' : ''}
                `}
              >
                {columns.map((column, colIndex) => (
                  <td key={column.key || colIndex} className="px-5 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-surface-800 group-hover:text-slate-950 transition-standard">
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
          <div className={`px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 ${dashboardSurface ? 'bg-slate-50/85' : 'bg-slate-50/70'}`}>
            <div className="text-xs font-bold text-surface-600 uppercase tracking-widest">
              Affichage de <span className="text-primary-700">{(currentPage - 1) * pageSize + 1}</span> à <span className="text-primary-700">{Math.min(currentPage * pageSize, totalItems)}</span> sur <span className="text-primary-700">{totalItems}</span> entrées
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-slate-200 text-surface-600 hover:text-sky-700 hover:border-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                        w-9 h-9 rounded-lg text-xs font-black transition-all
                        ${currentPage === page 
                          ? 'bg-primary-700 text-white shadow-lg shadow-primary-500/24' 
                          : 'bg-white border border-slate-200 text-surface-600 hover:text-sky-700 hover:border-sky-300'
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
                className="p-2 rounded-lg bg-white border border-slate-200 text-surface-600 hover:text-sky-700 hover:border-sky-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
