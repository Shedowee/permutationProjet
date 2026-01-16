import React from 'react';

const Table = ({ 
  data = [], 
  columns = [], 
  className = '',
  striped = false,
  hoverable = true,
  caption = null
}) => {
  return (
    <div className="overflow-x-auto rounded-xl">
      <table className={`min-w-full divide-y divide-gray-700/50 ${className}`}>
        {caption && (
          <caption className="text-left text-sm font-medium text-gray-300 mb-2 block">
            {caption}
          </caption>
        )}
        <thead className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y divide-gray-700/50 ${striped ? 'divide-gray-800' : ''}`}>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex}
              className={`transition-colors duration-200 ${hoverable ? 'hover:bg-white/5' : ''} ${striped && rowIndex % 2 === 0 ? 'bg-white/5' : ''}`}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
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
