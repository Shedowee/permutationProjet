import React from 'react';

const Table = ({ 
  data = [], 
  columns = [], 
  className = '',
  striped = false,
  hoverable = true,
  loading = false,
  emptyMessage = "Aucune donnée disponible"
}) => {
  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center bg-white rounded-2xl border border-surface-200">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          <p className="text-surface-400 text-xs font-medium uppercase tracking-widest">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-48 flex flex-col items-center justify-center bg-white rounded-2xl border border-surface-200 text-surface-400">
        <p className="text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-2xl border border-surface-200 bg-white shadow-sm ${className}`}>
      <table className="min-w-full divide-y divide-surface-100">
        <thead className="bg-surface-50">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={column.key || index}
                className="px-6 py-4 text-left text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-surface-50`}>
          {data.map((row, rowIndex) => (
            <tr 
              key={row.id || row._id || rowIndex}
              className={`
                group transition-all duration-200 
                ${hoverable ? 'hover:bg-primary-50/50' : ''} 
                ${striped && rowIndex % 2 === 0 ? 'bg-surface-50/30' : ''}
              `}
            >
              {columns.map((column, colIndex) => (
                <td key={column.key || colIndex} className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-surface-600 group-hover:text-surface-900 transition-colors">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
