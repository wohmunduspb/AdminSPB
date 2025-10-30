'use strict';

import { Plus, AlertTriangle } from '/src/utils/icons.js';
// Import API functions for saving inventory data and logs.
import { apiSaveInventory, apiSaveInventoryLog } from '/src/services/api.js';


/**
 * A view for managing inventory. It allows users to view stock levels,
 * add new stock to existing items, and add new items to the inventory.
 * @param {object} props - The component props.
 * @param {Array<object>} props.inventory - The list of all inventory items.
 * @param {function} props.setInventory - The state setter for the inventory list.
 * @param {object} props.inventoryForm - The state for the selected item form.
 * @param {function} props.setInventoryForm - The state setter for the inventory form.
 * @param {string} props.addStock - The state for the "add stock" input value.
 * @param {function} props.setAddStock - The state setter for the "add stock" input.
 * @param {boolean} props.showNewItemForm - The state controlling the visibility of the "add new item" form.
 * @param {function} props.setShowNewItemForm - The state setter for the "add new item" form visibility.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @param {function} props.setInventoryLogRecords - The state setter for the inventory log records.
 * @returns {React.ReactElement} The inventory management view.
 */
export function InventoryView({ inventory, setInventory, inventoryForm, setInventoryForm, addStock, setAddStock, showNewItemForm, setShowNewItemForm, currentUser, setInventoryLogRecords }) {
  return (
    React.createElement('div', { className: 'space-y-6' },
      // The entire view is only rendered if the user has permission to view the inventory.
      currentUser.permissions?.inventory?.view &&
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
          React.createElement('div', { className: 'flex items-center gap-2 mb-6' }, React.createElement(Plus, { className: 'text-purple-600', size: 24 }), React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Kelola Stok Barang')),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Nama Barang'),
                // Dropdown to select an existing item.
                React.createElement('select', { id: 'inventory-item-select', name: 'inventoryItem', value: (inventoryForm && inventoryForm.nama) || '', onChange: e => {
                  const selectedItem = inventory.find(item => item.nama === e.target.value);
                  setInventoryForm(selectedItem || { nama: '', stok: 0, harga: 0 });
                }, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg' },
                  React.createElement('option', { value: '' }, 'Pilih Barang'),
                  inventory.map(item => React.createElement('option', { key: item.nama, value: item.nama }, item.nama))
                )
              ),
              React.createElement('div', null, // prettier-ignore
                React.createElement('label', { htmlFor: 'current-stock', className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Stok Saat Ini'),
                React.createElement('input', { id: 'current-stock', name: 'currentStock', type: 'number', value: (inventoryForm && inventoryForm.stok) || 0, readOnly: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-lg' })
              ),
              (currentUser.role === 'admin' || currentUser.permissions?.inventory?.add_stock) && React.createElement('div', null, // prettier-ignore
                React.createElement('label', { htmlFor: 'add-stock-quantity', className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Tambah Stok'),
                React.createElement('input', { id: 'add-stock-quantity', name: 'addStockQuantity', type: 'number', value: addStock, onChange: e => setAddStock(e.target.value), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg', placeholder: 'Contoh: 10', min: '0' })
              ),
              // Button to submit the "Add Stock" action.
              (currentUser.role === 'admin' || currentUser.permissions?.inventory?.add_stock) && React.createElement('button', { onClick: () => {
                  if (!inventoryForm || !inventoryForm.nama || !addStock) { alert('Pilih barang dan masukkan jumlah tambahan.'); return; }
                  const number = parseInt(addStock);
                  if (Number.isNaN(number) || number < 0) { alert('Jumlah tidak valid.'); return; }
                  const itemToUpdate = inventory.find(item => item.nama === inventoryForm.nama);
                  if (!itemToUpdate) return;
                  const updatedItem = { ...itemToUpdate, stok: itemToUpdate.stok + number };
                  // Create a log record for this stock change.
                  const logRecord = {
                    id: Date.now(),
                    date: new Date().toISOString(),
                    item: inventoryForm.nama,
                    change: `+${number}`,
                    reason: 'Tambah Stok Manual',
                    user: currentUser.username
                  };
                  
                  // Optimistically update the UI.
                  setInventoryLogRecords(prev => [logRecord, ...prev]);
                  // Save the log to the backend.
                  apiSaveInventoryLog(logRecord);
                  // Optimistically update the inventory list in the UI.
                  setInventory(inventory.map(item => item.nama === inventoryForm.nama ? updatedItem : item));
                  // Save the updated inventory item to the backend.
                  apiSaveInventory(updatedItem);
                  setAddStock('');
                }, className: 'w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-violet-700 transition-all font-semibold shadow-lg' }, 'Tambah Stok'),
              // Button to toggle the "Add New Item" form.
              (currentUser.role === 'admin' || currentUser.permissions?.inventory?.add_new_item) && React.createElement('button', { onClick: () => setShowNewItemForm(!showNewItemForm), className: 'w-full mt-2 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold' }, 'Tambah Barang Baru')
            ),
            React.createElement('div', { className: 'space-y-4' },
              // Form for adding a completely new item to the inventory.
              (currentUser.role === 'admin' || currentUser.permissions?.inventory?.add_new_item) && showNewItemForm && React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
                React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Tambah Barang Baru'),
                React.createElement('div', { className: 'space-y-4' },
                  React.createElement('input', { id: 'new-item-name', name: 'newItemName', type: 'text', placeholder: 'Nama Barang', value: inventoryForm.nama, onChange: e => setInventoryForm({ ...inventoryForm, nama: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg' }),
                  React.createElement('input', { id: 'new-item-stock', name: 'newItemStock', type: 'number', placeholder: 'Stok Awal', value: inventoryForm.stok, onChange: e => setInventoryForm({ ...inventoryForm, stok: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg' }),
                  React.createElement('input', { id: 'new-item-price', name: 'newItemPrice', type: 'number', placeholder: 'Harga', value: inventoryForm.harga, onChange: e => setInventoryForm({ ...inventoryForm, harga: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-600 focus:outline-none text-lg' }),
                  React.createElement('button', { onClick: () => {
                    if (!inventoryForm.nama || !inventoryForm.stok || !inventoryForm.harga) { alert('Semua field harus diisi.'); return; }
                    const newItem = { nama: inventoryForm.nama, stok: parseInt(inventoryForm.stok), harga: parseFloat(inventoryForm.harga) };
                    // Optimistically update UI and save to backend.
                    setInventory([...inventory, newItem]);
                    apiSaveInventory(newItem);
                    setInventoryForm({ nama: '', stok: '', harga: '' });
                    setShowNewItemForm(false);
                  }, className: 'w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-all font-semibold' }, 'Simpan Barang Baru')
                )
              ),
              // List displaying all current inventory items.
              React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
                React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Daftar Barang'),
                React.createElement('div', { className: 'space-y-2 max-h-96 overflow-y-auto' },
                  inventory.map(item => {
                    // Highlight items with low stock.
                    const isLowStock = item.stok <= 10;
                    return React.createElement('div', { key: item.nama, className: `flex items-center justify-between p-3 rounded-lg ${isLowStock ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}` },
                      React.createElement('div', { className: 'font-semibold text-gray-800' }, item.nama),
                      React.createElement('div', { className: 'text-right' },
                        React.createElement('div', { className: 'text-sm text-gray-600' }, `Harga: Rp ${item.harga.toLocaleString()}`),
                        React.createElement('div', { className: `font-bold flex items-center justify-end gap-2 ${isLowStock ? 'text-red-600' : 'text-purple-600'}` },
                          // Show a warning icon for low stock items.
                          isLowStock && React.createElement(AlertTriangle, { size: 16 }),
                          `Stok: ${item.stok}`
                        )
                      )
                    );
                  }),
                  inventory.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Belum ada data stok')
                )
              )
            )
          )
        )
      )
    )
  ;
}
