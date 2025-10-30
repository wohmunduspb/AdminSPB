'use strict';

import { Plus, FileText, Calendar, Users, Search, Download, Trash2, CheckCircle, Settings } from '/src/utils/icons.js';
import { getSalesFilteredRecords, exportSalesToCSV, getSalesStats } from '/src/utils/utils.js';
import { apiCloseSalesBatch } from '/src/services/api.js';


export function SalesView({ salesRecords, salesFormData, setSalesFormData, customerInputRef, handleSalesSubmit, handleSalesKeyPress, inventory, handleEditSale, handleDeleteSale, currentUser, loadFromSheets }) {
  // Sort the inventory alphabetically by item name to ensure a consistent order.
  const sortedInventory = React.useMemo(() => {
    if (!inventory) return [];
    return [...inventory].sort((a, b) => a.nama.localeCompare(b.nama));
  }, [inventory]);

  return (
    React.createElement('div', { className: 'space-y-6' },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
        React.createElement('div', { className: 'lg:col-span-2' },
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Input Penjualan Barang'),
            currentUser.permissions?.sales?.input && React.createElement('div', { className: 'space-y-4' },
              React.createElement('select', { ref: customerInputRef, value: salesFormData.item, onChange: e => { // prettier-ignore
                const selectedItem = sortedInventory.find(item => item.nama === e.target.value);
                setSalesFormData({ ...salesFormData, item: e.target.value, price: selectedItem ? selectedItem.harga.toString() : '' });
              }, onKeyPress: handleSalesKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' },
                React.createElement('option', { value: '' }, 'Pilih Barang'),
                sortedInventory.filter(item => item.stok > 0).map(item => React.createElement('option', { key: item.nama, value: item.nama }, item.nama))
              ),
              salesFormData.item && React.createElement('div', { className: 'text-sm text-gray-600' }, `Stok tersedia: ${sortedInventory.find(item => item.nama === salesFormData.item)?.stok || 0} unit`),
              React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                React.createElement('input', { type: 'number', value: salesFormData.quantity, onChange: e => setSalesFormData({ ...salesFormData, quantity: e.target.value }), onKeyPress: handleSalesKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Jumlah', min: '1' }),
                React.createElement('input', { type: 'number', value: salesFormData.price, onChange: e => setSalesFormData({ ...salesFormData, price: e.target.value }), onKeyPress: handleSalesKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Harga per Unit (Rp)', min: '0', step: '0.01', disabled: !currentUser.permissions?.sales?.edit }) // Disable price edit if no edit permission
              ),
              salesFormData.quantity && salesFormData.price && React.createElement('div', { className: 'bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 font-semibold' }, `Total: Rp ${(parseInt(salesFormData.quantity || 0) * parseFloat(salesFormData.price || 0)).toLocaleString()}`),
              React.createElement('button', { onClick: () => handleSalesSubmit(salesFormData), className: 'w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all text-lg font-semibold shadow-lg' }, 'Simpan Data (Enter) ⚡')
            )
          )
        ),
        React.createElement('div', { className: 'space-y-6' },
          React.createElement('div', { className: 'bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-xl p-6 text-white' },
            React.createElement('h3', { className: 'text-lg font-semibold' }, 'Penjualan Belum Disetor'),
            React.createElement('div', { className: 'text-4xl font-bold mt-2' }, `Rp ${salesRecords.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.total, 0).toLocaleString()}`),
            currentUser.permissions?.sales?.close_batch && React.createElement('button', {
              onClick: async () => {
                if (confirm('Apakah Anda yakin ingin menyetor semua penjualan yang belum disetor? Aksi ini tidak dapat dibatalkan.')) {
                  await apiCloseSalesBatch(); // Ensure we wait for the API call to finish
                  // Wait a moment for the backend to process, then refresh data
                  setTimeout(() => loadFromSheets(), 1500);
                }
              },
              className: 'mt-4 flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all text-sm font-semibold'
            }, React.createElement(CheckCircle, { size: 16 }), 'Setor Penjualan')
          ),
          React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-800' }, 'Total Keseluruhan'),
            React.createElement('div', { className: 'text-4xl font-bold text-gray-800' }, `Rp ${salesRecords.reduce((sum, r) => sum + r.total, 0).toLocaleString()}`),
            React.createElement('div', { className: 'text-gray-600 mt-1' }, 'total penjualan')
          )
        )
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, '10 Transaksi Terakhir'),
        React.createElement('div', { className: 'space-y-3 max-h-96 overflow-y-auto' },
          salesRecords.slice(0, 10).map(record => (
            React.createElement('div', { key: record.id, className: 'flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-green-200 transition-all' },
              React.createElement('div', { className: 'flex-1' },
                React.createElement('span', { className: 'font-semibold text-gray-800' }, record.item),
                React.createElement('div', { className: 'text-sm text-gray-500 mt-1' }, record.dateDisplay)
              ),
              React.createElement('div', { className: 'text-right' },
                React.createElement('div', { className: 'text-sm text-gray-600' }, `${record.quantity} x Rp ${record.price.toLocaleString()}`),
                React.createElement('div', { className: 'font-bold text-green-700' }, `Rp ${record.total.toLocaleString()}`)
              ),
              React.createElement('div', { className: 'flex gap-2 ml-4' },
                (currentUser.role === 'admin' || currentUser.permissions?.sales?.edit) && React.createElement('button', {
                  onClick: () => handleEditSale(record),
                  className: 'p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all focus:outline-none'
                }, React.createElement(FileText, { size: 18 })),
                (currentUser.role === 'admin' || currentUser.permissions?.sales?.delete) && React.createElement('button', {
                  onClick: () => handleDeleteSale(record.id, record.item, record.quantity),
                  className: 'p-2 text-red-600 hover:bg-red-100 rounded-full transition-all focus:outline-none'
                }, React.createElement(Trash2, { size: 18 }))
              )
            )

          )),
          salesRecords.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Belum ada data transaksi')
        )
      )
    )
  );
}
