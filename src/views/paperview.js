'use strict';

import { Plus, FileText, Calendar, Users, Search, Download } from '/src/utils/icons.js';
import { getFilteredRecords, getTodayTotal, exportToCSV, getUserStats } from '/src/utils/utils.js';


export function PaperView({ records, formData, setFormData, nameInputRef, handleSubmit, handleKeyPress, currentUser }) {
  return (
    React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
            React.createElement('div', { className: 'flex items-center gap-2 mb-6' }, React.createElement(Plus, { className: 'text-indigo-600', size: 24 }), React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Input Penggunaan Kertas')),
            currentUser.permissions?.paper?.input && React.createElement('div', { className: 'space-y-4' },
              React.createElement('input', { ref: nameInputRef, type: 'text', value: formData.name, onChange: e => setFormData({ ...formData, name: e.target.value }), onKeyPress: handleKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Nama Pengguna' }),
              React.createElement('input', { type: 'text', value: formData.purpose, onChange: e => setFormData({ ...formData, purpose: e.target.value }), onKeyPress: handleKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Kegunaan' }),
              React.createElement('input', { type: 'number', value: formData.quantity, onChange: e => setFormData({ ...formData, quantity: e.target.value }), onKeyPress: handleKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Jumlah (lembar)', min: '1' }),
              React.createElement('button', { onClick: () => handleSubmit(formData), className: 'w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all text-lg font-semibold shadow-lg' }, 'Simpan Data (Enter) ⚡')
            )
          )
        ),
        React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-6 text-white' },
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Penggunaan Hari Ini'),
            React.createElement('div', { className: 'text-5xl font-bold mt-2' }, getTodayTotal(records)),
            React.createElement('div', { className: 'text-indigo-200 mt-1' }, 'lembar kertas')
          ),
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-800' }, 'Total Keseluruhan'),
            React.createElement('div', { className: 'text-4xl font-bold text-gray-800' }, records.reduce((sum, r) => sum + r.quantity, 0)),
            React.createElement('div', { className: 'text-gray-600 mt-1' }, 'lembar kertas')
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, '10 Transaksi Terakhir'),
        React.createElement('div', { className: 'space-y-3 max-h-96 overflow-y-auto' },
          records.slice(0, 10).map(record => (
            React.createElement('div', { key: record.id, className: 'flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-indigo-200 transition-all' },
              React.createElement('div', { className: 'flex-1' },
                React.createElement('div', { className: 'font-semibold text-gray-800' }, record.name),
                React.createElement('div', { className: 'text-sm text-gray-500 mt-1' }, `${record.purpose} • ${record.dateDisplay}`)
              ),
              React.createElement('div', { className: 'text-right ml-4' },
                React.createElement('span', { className: 'bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-sm' }, `${record.quantity} lbr`)
              )
            )
          )),
          records.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Belum ada data transaksi')
        )
      )
    )
  );
}
