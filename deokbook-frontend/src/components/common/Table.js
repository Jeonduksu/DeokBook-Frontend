// src/components/common/Table.js
import React from 'react';

const Table = ({ columns, data, actions }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                    {columns.map((column, index) => (
                        <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                            {column.header}
                        </th>
                    ))}
                    {actions && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            작업
                        </th>
                    )}
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((column, colIndex) => (
                            <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {column.render ? column.render(row[column.key], row) : row[column.key]}
                            </td>
                        ))}
                        {actions && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex gap-2">
                                    {actions.map((action, actionIndex) => (
                                        <button
                                            key={actionIndex}
                                            onClick={() => action.onClick(row)}
                                            className={`${action.className || 'text-blue-600 hover:text-blue-800'}`}
                                            title={action.title}
                                        >
                                            {action.icon}
                                        </button>
                                    ))}
                                </div>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;