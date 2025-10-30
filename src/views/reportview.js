'use strict';

import { Plus, FileText, Calendar, Users, Search, Download, TrendingUp, ChevronDown, Clipboard, Trash2, Mail, Printer, Box, DollarSign, CheckCircle } from '/src/utils/icons.js';
// Import utility functions for data filtering, aggregation, and exporting.
import { getFilteredRecords, getTodayTotal, exportToCSV, getUserStats } from '/src/utils/utils.js';
import { getSalesFilteredRecords, exportSalesToCSV, getSalesStats } from '/src/utils/utils.js';
import { KODE_SURAT_OPTIONS, TINGKAT_OPTIONS, ROMAN_MONTHS, getSuratFilteredRecords, exportSuratToCSV } from '/src/utils/utils.js';


/**
 * A sub-component of ReportView that displays a detailed report on paper usage.
 * It includes filtering, summary statistics, and a paginated data table.
 * @param {object} props - The component props.
 * @param {Array<object>} props.records - The full list of paper usage records.
 * @param {object} props.filter - The current filter state.
 * @param {function} props.setFilter - The function to update the filter state.
 * @returns {React.ReactElement} The paper report component.
 */
function PaperReport({ records, filter, setFilter }) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredRecords = getFilteredRecords(records, filter);
  const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalFiltered = filteredRecords.reduce((sum, r) => sum + r.quantity, 0);
  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      // Filter controls
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' }, React.createElement(Search, { size: 24, className: 'text-indigo-600' }), React.createElement('h3', { className: 'text-xl font-bold text-gray-800' }, 'Filter Laporan Penggunaan Kertas')),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4' },
        React.createElement('input', { type: 'date', value: filter.startDate, onChange: e => setFilter({ ...filter, startDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }),
        React.createElement('input', { type: 'date', value: filter.endDate, onChange: e => setFilter({ ...filter, endDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }),
        React.createElement('input', { type: 'text', value: filter.name, onChange: e => setFilter({ ...filter, name: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none', placeholder: 'Cari nama...' }),
        React.createElement('input', { type: 'text', value: filter.purpose, onChange: e => setFilter({ ...filter, purpose: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none', placeholder: 'Cari kegunaan...' })
      ),
      React.createElement('div', { className: 'flex gap-3 mt-4' },
        React.createElement('button', { onClick: () => setFilter({ startDate: '', endDate: '', name: '', purpose: '' }), className: 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all' }, 'Reset Filter'),
        React.createElement('button', { onClick: () => exportToCSV(filteredRecords, `laporan-kertas-${new Date().toISOString().split('T')[0]}.csv`), className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all' }, React.createElement(Download, { size: 18 }), 'Export CSV Kertas')
      )
    ),
    // Summary statistic cards
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Total Kertas'),
        React.createElement('div', { className: 'text-3xl font-bold text-indigo-600' }, totalFiltered),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'lembar')
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Total Transaksi'),
        React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, filteredRecords.length),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'transaksi')
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Rata-rata per Transaksi'),
        React.createElement('div', { className: 'text-3xl font-bold text-purple-600' }, filteredRecords.length > 0 ? Math.round(totalFiltered / filteredRecords.length) : 0),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'lembar')
      )
    ),
    // Bar chart for usage per user
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Penggunaan per Pengguna'),
      React.createElement('div', { className: 'space-y-4' },
        (() => {
          const stats = getUserStats(filteredRecords);
          if (stats.length === 0) return React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Tidak ada data yang sesuai filter');
          const maxValue = Math.max(...stats.map(s => s[1]));
          return stats.map(([name, total]) => {
            const barWidth = maxValue > 0 ? (total / maxValue) * 100 : 0;
            return React.createElement('div', { key: name, className: 'grid grid-cols-3 gap-2 items-center' },
              React.createElement('div', { className: 'font-semibold text-gray-700 truncate' }, name),
              React.createElement('div', { className: 'col-span-2 flex items-center' },
                React.createElement('div', { className: 'bg-indigo-500 rounded-md h-5 transition-all duration-500', style: { width: `${barWidth}%` } }),
                React.createElement('span', { className: 'ml-2 text-sm font-bold text-indigo-700' }, `${total} lembar`)
              )
            );
          });
        })()
      )
    ),
    // Detailed data table with pagination
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Data Detail Penggunaan Kertas'),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full' },
          React.createElement('thead', null,
            React.createElement('tr', { className: 'border-b-2 border-gray-200' },
              React.createElement('th', { className: 'text-left py-3 px-4 font-semibold text-gray-700' }, 'Tanggal'),
              React.createElement('th', { className: 'text-left py-3 px-4 font-semibold text-gray-700' }, 'Nama'),
              React.createElement('th', { className: 'text-left py-3 px-4 font-semibold text-gray-700' }, 'Kegunaan'),
              React.createElement('th', { className: 'text-right py-3 px-4 font-semibold text-gray-700' }, 'Jumlah')
            )
          ),
          React.createElement('tbody', null,
            paginatedRecords.map(record => (
              React.createElement('tr', { key: record.id, className: 'border-b border-gray-100 hover:bg-gray-50' },
                React.createElement('td', { className: 'py-3 px-4 text-gray-600' }, record.dateDisplay),
                React.createElement('td', { className: 'py-3 px-4 font-semibold text-gray-800' }, record.name),
                React.createElement('td', { className: 'py-3 px-4 text-gray-600' }, record.purpose),
                React.createElement('td', { className: 'py-3 px-4 text-right font-bold text-indigo-600' }, record.quantity)
              )
            ))
          )
        ),
        filteredRecords.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Tidak ada data yang sesuai filter'),
        // Pagination controls
        totalPages > 1 && React.createElement('div', { className: 'flex justify-between items-center mt-4' },
          React.createElement('button', {
            onClick: () => setCurrentPage(prev => Math.max(prev - 1, 1)),
            disabled: currentPage === 1,
            className: 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50'
          }, 'Sebelumnya'),
          React.createElement('span', { className: 'text-sm text-gray-600' }, `Halaman ${currentPage} dari ${totalPages}`),
          React.createElement('button', {
            onClick: () => setCurrentPage(prev => Math.min(prev + 1, totalPages)),
            disabled: currentPage === totalPages,
            className: 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50'
          }, 'Selanjutnya')
        )
      )
    )
  );
}

/**
 * A sub-component of ReportView that displays a detailed report on sales.
 * It includes filtering, summary statistics, a "Copy for WA" feature, and a data table with actions.
 * @param {object} props - The component props.
 * @param {Array<object>} props.salesRecords - The full list of sales records.
 * @param {object} props.salesFilter - The current filter state for sales.
 * @param {function} props.setSalesFilter - The function to update the sales filter state.
 * @param {function} props.handleEditSale - Callback to initiate editing a sale.
 * @param {function} props.handleDeleteSale - Callback to delete a sale.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @returns {React.ReactElement} The sales report component.
 */
function SalesReport({ salesRecords, salesFilter, setSalesFilter, handleEditSale, handleDeleteSale, currentUser }) {
  const salesFilteredRecords = getSalesFilteredRecords(salesRecords, salesFilter);
  const [copyStatus, setCopyStatus] = React.useState('Copy for WA');
  const totalSalesFiltered = salesFilteredRecords.reduce((sum, r) => sum + r.total, 0);

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      // Filter controls
      React.createElement('div', { className: 'flex items-center gap-2 mb-4' }, React.createElement(Search, { size: 24, className: 'text-green-600' }), React.createElement('h3', { className: 'text-xl font-bold text-gray-800' }, 'Filter Laporan Penjualan')),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
        React.createElement('input', { type: 'date', value: salesFilter.startDate, onChange: e => setSalesFilter({ ...salesFilter, startDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none' }),
        React.createElement('input', { type: 'date', value: salesFilter.endDate, onChange: e => setSalesFilter({ ...salesFilter, endDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none' }),
        React.createElement('input', { type: 'text', value: salesFilter.item, onChange: e => setSalesFilter({ ...salesFilter, item: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none', placeholder: 'Cari barang...' })
      ),
      React.createElement('div', { className: 'flex gap-3 mt-4' },
        React.createElement('button', { onClick: () => setSalesFilter({ startDate: '', endDate: '', item: '' }), className: 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all' }, 'Reset Filter'),
        React.createElement('button', { onClick: () => exportSalesToCSV(salesFilteredRecords, `laporan-penjualan-${new Date().toISOString().split('T')[0]}.csv`), className: 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all' }, React.createElement(Download, { size: 18 }), 'Export CSV'),
        // "Copy for WA" button to generate a formatted text summary for WhatsApp.
        React.createElement('button', { onClick: () => {
          const summary = salesFilteredRecords.reduce((acc, record) => {
            if (!acc[record.item]) {
              acc[record.item] = { totalQuantity: 0, totalSales: 0 };
            }
            acc[record.item].totalQuantity += record.quantity;
            acc[record.item].totalSales += record.total;
            return acc;
          }, {});

          const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          let reportText = `*LAPORAN PENJUALAN*\n_${today}_\n\n`;
          reportText += "```\n";
          reportText += "Nama Barang | Jml | Total Harga\n";
          reportText += "--------------------------------\n";

          let grandTotal = 0;
          Object.entries(summary).forEach(([item, data]) => {
            reportText += `${item} | ${data.totalQuantity} | Rp ${data.totalSales.toLocaleString()}\n`;
            grandTotal += data.totalSales;
          });

          reportText += "--------------------------------\n";
          reportText += `*TOTAL: Rp ${grandTotal.toLocaleString()}*`;
          reportText += "```";

          navigator.clipboard.writeText(reportText).then(() => {
            setCopyStatus('Tersalin!');
            setTimeout(() => setCopyStatus('Copy for WA'), 2000);
          });
        }, className: 'flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all' }, React.createElement(Clipboard, { size: 18 }), copyStatus)
      )
    ),
    // Summary statistic cards
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Total Penjualan'),
        React.createElement('div', { className: 'text-3xl font-bold text-green-600' }, `Rp ${totalSalesFiltered.toLocaleString()}`),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'rupiah')
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Total Transaksi'),
        React.createElement('div', { className: 'text-3xl font-bold text-blue-600' }, salesFilteredRecords.length),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'transaksi')
      ),
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
        React.createElement('h4', { className: 'text-sm font-semibold text-gray-600 mb-2' }, 'Rata-rata per Transaksi'),
        React.createElement('div', { className: 'text-3xl font-bold text-purple-600' }, salesFilteredRecords.length > 0 ? `Rp ${Math.round(totalSalesFiltered / salesFilteredRecords.length).toLocaleString()}`: 'Rp 0'),
        React.createElement('div', { className: 'text-sm text-gray-500' }, 'rupiah')
      )
    ),
    // Bar chart for sales per item
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Penjualan per Barang'),
      React.createElement('div', { className: 'space-y-4' },
        (() => {
          const stats = getSalesStats(salesFilteredRecords);
          if (stats.length === 0) return React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Tidak ada data yang sesuai filter');
          const maxValue = Math.max(...stats.map(s => s[1]));
          return stats.map(([item, total]) => {
            const barWidth = maxValue > 0 ? (total / maxValue) * 100 : 0;
            return React.createElement('div', { key: item, className: 'grid grid-cols-3 gap-2 items-center' },
              React.createElement('div', { className: 'font-semibold text-gray-700 truncate' }, item),
              React.createElement('div', { className: 'col-span-2 flex items-center' },
                React.createElement('div', { className: 'bg-green-500 rounded-md h-5 transition-all duration-500', style: { width: `${barWidth}%` } }),
                React.createElement('span', { className: 'ml-2 text-sm font-bold text-green-700' }, `Rp ${total.toLocaleString()}`)
              )
            );
          });
        })()
      )
    ),
    // Detailed data table with actions
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Data Detail Penjualan'),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full table-auto' },
          React.createElement('thead', null, React.createElement('tr', { className: 'border-b-2 border-gray-200' },
            React.createElement('th', { className: 'text-left py-3 px-4 font-semibold text-gray-700' }, 'Tanggal'),
            React.createElement('th', { className: 'text-left py-3 px-4 font-semibold text-gray-700' }, 'Barang'),
            React.createElement('th', { className: 'text-right py-3 px-4 font-semibold text-gray-700' }, 'Jumlah'),
            React.createElement('th', { className: 'text-right py-3 px-4 font-semibold text-gray-700' }, 'Harga'),
            React.createElement('th', { className: 'text-right py-3 px-4 font-semibold text-gray-700' }, 'Total'),
            React.createElement('th', { className: 'text-center py-3 px-4 font-semibold text-gray-700' }, 'Aksi')
          )),
          React.createElement('tbody', null, salesFilteredRecords.map(record => React.createElement('tr', { key: record.id, className: 'border-b border-gray-100 hover:bg-gray-50' },
            React.createElement('td', { className: 'py-3 px-4 text-gray-600' }, record.dateDisplay),
            React.createElement('td', { className: 'py-3 px-4 font-semibold text-gray-800' }, record.item),
            React.createElement('td', { className: 'py-3 px-4 text-right text-gray-600' }, record.quantity),
            React.createElement('td', { className: 'py-3 px-4 text-right text-gray-600' }, `Rp ${record.price.toLocaleString()}`),
            React.createElement('td', { className: 'py-3 px-4 text-right font-bold text-green-600' }, `Rp ${record.total.toLocaleString()}`),
            // Action buttons (Edit, Delete) are only visible to admins.
            React.createElement('td', { className: 'py-3 px-4 text-center' },
              (currentUser.role === 'admin' || currentUser.permissions?.sales?.edit) && React.createElement('button', { onClick: () => handleEditSale(record), className: 'p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all' }, React.createElement(FileText, { size: 18 })),
              (currentUser.role === 'admin' || currentUser.permissions?.sales?.delete) && React.createElement('button', { onClick: () => handleDeleteSale(record.id, record.item, record.quantity), className: 'ml-2 p-2 text-red-600 hover:bg-red-100 rounded-full transition-all' }, React.createElement(Trash2, { size: 18 }))
            )
          )))
        ),
        salesFilteredRecords.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Tidak ada data yang sesuai filter')
      )
    )
  );
}

/**
 * A sub-component of ReportView that displays a report on generated letter numbers ('Nomor Surat').
 * It groups related letters (e.g., multiple letters generated at once) and allows expanding to see details.
 * @param {object} props - The component props.
 * @param {Array<object>} props.nomorSuratRecords - The full list of letter number records.
 * @param {object} props.suratFilter - The current filter state for letter numbers.
 * @param {function} props.setSuratFilter - The function to update the letter number filter state.
 * @param {Set<string>} props.expandedRecords - A Set containing the IDs of expanded parent records.
 * @param {function} props.setExpandedRecords - The function to update the expanded records set.
 * @returns {React.ReactElement} The letter number report component.
 */
function SuratReport({ nomorSuratRecords, suratFilter, setSuratFilter, expandedRecords, setExpandedRecords }) {
  const groupedFilteredRecords = React.useMemo(() => {
    const filtered = getSuratFilteredRecords(nomorSuratRecords, suratFilter);
    const recordsById = new Map(filtered.map(r => [r.id, { ...r, isParent: false, children: [] }]));
    const topLevelRecords = [];

    recordsById.forEach(record => {
      // Use parent_id from DB or parentId from UI state
      if (record.parent_id || record.parentId) {
        // This is a child record, try to find its parent
        const parent = recordsById.get(record.parent_id || record.parentId);
        if (parent) {
          parent.isParent = true; // Mark the found parent as an actual parent
          parent.children.push(record);
        } else {
          // If parent is not found (e.g., filtered out), treat this child as a top-level single record
          topLevelRecords.push(record);
        }
      } else {
        // This is a top-level record (either a standalone or a parent)
        topLevelRecords.push(record);
      }
    });

    // Sort children within each parent
    topLevelRecords.forEach(record => {
      if (record.isParent) {
        record.children.sort((a, b) => a.id - b.id);
      }
    });

    // Sort top-level records by date
    return topLevelRecords.sort((a, b) => new Date(b.tanggal_dibuat || b.tanggalDibuat) - new Date(a.tanggal_dibuat || a.tanggalDibuat));
  }, [nomorSuratRecords, suratFilter]);

  const toggleExpanded = (recordId) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) newExpanded.delete(recordId);
    else newExpanded.add(recordId);
    setExpandedRecords(newExpanded);
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
      // Header and filter controls
      React.createElement('div', { className: 'flex items-center justify-between mb-6' }, React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Laporan Nomor Surat'), React.createElement('button', { onClick: () => exportSuratToCSV(groupedFilteredRecords, 'laporan_nomor_surat.csv'), className: 'flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all' }, React.createElement(Download, { size: 16 }), 'Export CSV')),
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6' },
        React.createElement('input', { type: 'date', value: suratFilter.startDate, onChange: e => setSuratFilter({ ...suratFilter, startDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }),
        React.createElement('input', { type: 'date', value: suratFilter.endDate, onChange: e => setSuratFilter({ ...suratFilter, endDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }),
        React.createElement('select', { value: suratFilter.kode, onChange: e => setSuratFilter({ ...suratFilter, kode: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }, React.createElement('option', { value: '' }, 'Semua Kode'), KODE_SURAT_OPTIONS.map(kode => React.createElement('option', { key: kode.value, value: kode.value }, kode.label))),
        React.createElement('select', { value: suratFilter.tingkat, onChange: e => setSuratFilter({ ...suratFilter, tingkat: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-600 focus:outline-none' }, React.createElement('option', { value: '' }, 'Semua Tingkat'), TINGKAT_OPTIONS.map(tingkat => React.createElement('option', { key: tingkat.value, value: tingkat.value }, tingkat.label)))
      ),
      // Data table for letter numbers
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full table-auto' },
          React.createElement('thead', { className: 'bg-gray-50' }, React.createElement('tr', null, React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Tanggal Dibuat'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Nomor Surat'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Kode'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Tingkat'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Bulan'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Tahun'), React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider' }, 'Catatan'))),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            groupedFilteredRecords.map(record => {
              const isParent = record.isParent;
              const parentId = isParent ? (record.parent_id || record.parentId) : record.id;
              const isExpanded = expandedRecords.has(parentId);
              return React.createElement(React.Fragment, { key: parentId },
                // Parent row (clickable to expand)
                React.createElement('tr', { className: 'hover:bg-gray-50', onClick: () => isParent && toggleExpanded(parentId) }, // prettier-ignore
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, new Date(record.tanggal_dibuat || record.tanggalDibuat).toLocaleDateString('id-ID')),
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900' }, isParent ? React.createElement('div', { className: 'flex items-center gap-2' }, React.createElement(ChevronDown, { size: 16, className: `text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}` }), `${record.nomor.split('.')[0]}.x`) : record.nomor),
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, record.kode),
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, record.tingkat),
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, record.bulan),
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, record.tahun), // Changed from record.bulan to record.tahun
                  React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, isParent ? (() => { const namaSurat = KODE_SURAT_OPTIONS.find(opt => opt.value === record.kode)?.label.split(' - ')[1] || ''; const catatan = record.catatan; return `${catatan || namaSurat} (${record.children.length} surat)`; })() : (record.catatan || '-')) // Changed from record.tahun to record.catatan
                ),
                isParent && isExpanded && record.children.map(child => React.createElement('tr', { key: child.id, className: 'bg-purple-50' },
                  React.createElement('td', { className: 'px-4 py-2' }),
                  React.createElement('td', { className: 'pl-12 pr-4 py-2 whitespace-nowrap text-sm font-mono text-purple-800' }, child.nomor),
                  React.createElement('td', { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-700' }, child.kode),
                  React.createElement('td', { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-700' }, child.tingkat),
                  React.createElement('td', { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-700' }, child.bulan),
                  React.createElement('td', { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-700' }, child.tahun),
                  React.createElement('td', { className: 'px-4 py-2 whitespace-nowrap text-sm text-gray-700' }, child.catatan || '-')
                ))
              );
            }),
            groupedFilteredRecords.length === 0 && React.createElement('tr', null, React.createElement('td', { colSpan: '7', className: 'px-4 py-8 text-center text-gray-500' }, 'Tidak ada data yang sesuai dengan filter'))
          )
        )
      )
    )
  );
}

/**
 * A sub-component of ReportView that displays a report of generated SIMK (Surat Izin Mengikuti Kegiatan).
 * It allows filtering by date and teacher name, and provides a reprint action.
 * @param {object} props - The component props.
 * @param {Array<object>} props.simkRecords - The full list of SIMK records.
 * @param {object} props.simkFilter - The current filter state for SIMK.
 * @param {function} props.setSimkFilter - The function to update the SIMK filter state.
 * @param {function} props.onReprint - Callback to reprint a SIMK letter.
 * @returns {React.ReactElement} The SIMK report component.
 */
function SimkReport({ simkRecords, simkFilter, setSimkFilter, onReprint }) {
  const filteredRecords = simkRecords.filter(record => {
    // Use generated_at from DB or generatedAt from newly created record in UI state
    const recordDate = new Date(record.generated_at || record.generatedAt);
    const matchNama = !simkFilter.nama || record.nama.toLowerCase().includes(simkFilter.nama.toLowerCase());
    
    const startDateObj = simkFilter.startDate ? new Date(simkFilter.startDate + 'T00:00:00') : null;
    const endDateObj = simkFilter.endDate ? new Date(simkFilter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    return matchNama && matchStartDate && matchEndDate;
  });

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    // Header and filter controls
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Laporan Surat Izin (SIMK)'),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-6' },
      React.createElement('input', { type: 'date', value: simkFilter.startDate, onChange: e => setSimkFilter({ ...simkFilter, startDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none' }),
      React.createElement('input', { type: 'date', value: simkFilter.endDate, onChange: e => setSimkFilter({ ...simkFilter, endDate: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none' }),
      React.createElement('input', { type: 'text', value: simkFilter.nama, onChange: e => setSimkFilter({ ...simkFilter, nama: e.target.value }), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-teal-600 focus:outline-none', placeholder: 'Cari nama guru...' })
    ),
    // Data table for SIMK records
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'w-full table-auto' },
        React.createElement('thead', { className: 'bg-gray-50' }, React.createElement('tr', null,
          React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Tgl Dibuat'),
          React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Nomor Surat'),
          React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Keterangan'),
          React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Acara'),
          React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Aksi')
        )),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          filteredRecords.map(record => React.createElement('tr', { key: record.generated_at || record.generatedAt, className: 'hover:bg-gray-50' },
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, new Date(record.generated_at || record.generatedAt).toLocaleDateString('id-ID')),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900' }, record.nomor_surat || record.nomorSurat),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-900' }, record.nama),
            React.createElement('td', { className: 'px-4 py-4 text-sm text-gray-900' }, record.acara),
            React.createElement('td', { className: 'px-4 py-4 text-center' }, React.createElement('button', { onClick: () => onReprint(record), className: 'p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all' }, React.createElement(Printer, { size: 18 })))
          )),
          filteredRecords.length === 0 && React.createElement('tr', null, React.createElement('td', { colSpan: '4', className: 'px-4 py-8 text-center text-gray-500' }, 'Tidak ada data yang sesuai dengan filter'))
        )
      )
    )
  );
}

/**
 * A sub-component of ReportView that displays a log of all inventory changes.
 * It allows filtering by date, item name, and reason for the change.
 * @param {object} props - The component props.
 * @param {Array<object>} props.logRecords - The full list of inventory log records.
 * @param {object} props.filter - The current filter state.
 * @param {function} props.setFilter - The function to update the filter state.
 * @returns {React.ReactElement} The inventory log report component.
 */
function InventoryLogReport({ logRecords, filter, setFilter, currentUser, onCorrectStock }) {
  const filteredRecords = (logRecords || []).filter(record => {
    const recordDate = new Date(record.date);
    const matchItem = !filter.item || record.item.toLowerCase().includes(filter.item.toLowerCase());
    const matchReason = !filter.reason || record.reason.toLowerCase().includes(filter.reason.toLowerCase()); // Corrected from filter.reason to record.reason
    
    const startDateObj = filter.startDate ? new Date(filter.startDate + 'T00:00:00') : null;
    const endDateObj = filter.endDate ? new Date(filter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    return matchItem && matchReason && matchStartDate && matchEndDate;
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  const canCorrectStock = currentUser.role === 'admin' || currentUser.permissions?.inventory?.correct_stock;

  // Create a set of IDs from original records that have been corrected.
  // This is more efficient than searching the entire array for every row.
  const correctedOriginalIds = React.useMemo(() => {
    const ids = new Set();
    (logRecords || []).forEach(record => {
      if (record.reason && record.reason.includes('(Ref ID:')) {
        const match = record.reason.match(/\(Ref ID: (\d+)\)/);
        if (match && match[1]) ids.add(parseInt(match[1]));
      }
    });
    return ids;
  }, [logRecords]);

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    // Header and filter controls
    React.createElement('div', { className: 'flex items-center gap-2 mb-6' },
      React.createElement(Box, { size: 24, className: 'text-purple-600' }),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Laporan Riwayat Stok')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-4 gap-4 mb-6' },
      React.createElement('input', { type: 'date', value: filter.startDate, onChange: e => setFilter(prev => ({ ...prev, startDate: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none' }),
      React.createElement('input', { type: 'date', value: filter.endDate, onChange: e => setFilter(prev => ({ ...prev, endDate: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none' }),
      React.createElement('input', { type: 'text', placeholder: 'Cari nama barang...', value: filter.item, onChange: e => setFilter(prev => ({ ...prev, item: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none' }),
      React.createElement('input', { type: 'text', placeholder: 'Cari alasan...', value: filter.reason, onChange: e => setFilter(prev => ({ ...prev, reason: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none' })
    ),
    // Data table for inventory logs
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'w-full table-auto' },
        React.createElement('thead', { className: 'bg-gray-50' },
          React.createElement('tr', null,
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Tanggal'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Barang'),
            React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Perubahan'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Alasan'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Oleh'),
            canCorrectStock && React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Aksi')
          )
        ),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          filteredRecords.map(record => {
            // Style the change amount based on whether it's an increase or decrease.
            const isIncrease = parseFloat(record.change) > 0;
            // A record is uncorrectable if it's an original entry that has been corrected,
            // OR if it's a "reversing" entry itself.
            const isUncorrectable = correctedOriginalIds.has(record.id) || (record.reason && record.reason.includes('Koreksi (Batal)'));

            return React.createElement('tr', { key: record.id, className: 'hover:bg-gray-50' },
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, new Date(record.date).toLocaleString('id-ID')),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900' }, record.item),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-center font-bold' },
                React.createElement('span', { className: isIncrease ? 'text-green-600' : 'text-red-600' }, record.change)
              ),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, record.reason),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, record.user),
              canCorrectStock && React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-center' },
                !isUncorrectable && // Only show the button if the record is correctable
                React.createElement('button', {
                  onClick: () => onCorrectStock(record),
                  className: 'bg-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-yellow-600 transition-all'
                }, 'Koreksi')
              )
            );
          }),
          filteredRecords.length === 0 && React.createElement('tr', null,
            React.createElement('td', { colSpan: '5', className: 'px-4 py-8 text-center text-gray-500' }, 'Tidak ada data log yang sesuai dengan filter.')
          )
        )
      )
    )
  );
}

/**
 * A sub-component of ReportView that displays a report of all recorded late fees.
 * @param {object} props - The component props.
 * @param {Array<object>} props.dendaRecords - The full list of late fee records.
 * @param {object} props.filter - The current filter state.
 * @param {function} props.setFilter - The function to update the filter state.
 * @param {Array<object>} props.teachers - The list of all teacher objects to find wali kelas.
 * @param {function} props.onUpdateStatus - Callback to update the status of a fee record.
 * @param {function} props.onDelete - Callback to delete a fee record.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @returns {React.ReactElement} The late fee report component.
 */
function DendaReport({ dendaRecords, filter, setFilter, teachers, onUpdateStatus, onDelete, currentUser, reportMode: initialReportMode }) {
  const [reportMode, setReportMode] = React.useState('all'); // 'all' or 'unpaid'

  // Create a map for quick lookup of wali kelas by class name
  const waliKelasMap = React.useMemo(() => {
    const map = new Map();
    (teachers || []).forEach(teacher => {
      if (teacher.waliKelas) {
        map.set(teacher.waliKelas, teacher.namaGuru);
      }
    });
    return map;
  }, [teachers]);

  const filteredRecords = (dendaRecords || []).filter(record => {
    const recordDate = new Date(record.created_at);
    const matchStudent = !filter.student_name || record.student_name.toLowerCase().includes(filter.student_name.toLowerCase());
    const matchStatus = initialReportMode === 'unpaid' ? record.status === 'Belum Bayar' : (!filter.status || record.status === filter.status);

    const startDateObj = filter.startDate ? new Date(filter.startDate + 'T00:00:00') : null;
    const endDateObj = filter.endDate ? new Date(filter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    // New filter logic for payment month
    const matchPaymentMonth = !filter.paymentMonth || (
      new Date(record.payment_for_month).getFullYear() === new Date(filter.paymentMonth).getFullYear() &&
      new Date(record.payment_for_month).getMonth() === new Date(filter.paymentMonth).getMonth()
    );

    return matchStudent && matchStatus && matchStartDate && matchEndDate && matchPaymentMonth;
  });

  const totalDenda = filteredRecords.reduce((sum, r) => sum + r.fee_amount, 0);
  const canDelete = currentUser.role === 'admin' || currentUser.permissions?.denda?.hapus;

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-6' },
      React.createElement(DollarSign, { size: 24, className: 'text-red-600' }),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, initialReportMode === 'unpaid' ? 'Laporan Tunggakan Denda' : 'Laporan Denda Keterlambatan')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-5 gap-4 mb-6' },
      React.createElement('input', { type: 'month', value: filter.paymentMonth, onChange: e => setFilter(prev => ({ ...prev, paymentMonth: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none' }),
      React.createElement('input', { type: 'date', value: filter.startDate, onChange: e => setFilter(prev => ({ ...prev, startDate: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none' }),
      React.createElement('input', { type: 'date', value: filter.endDate, onChange: e => setFilter(prev => ({ ...prev, endDate: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none' }),
      React.createElement('input', { type: 'text', placeholder: 'Cari nama siswa...', value: filter.student_name, onChange: e => setFilter(prev => ({ ...prev, student_name: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none' }),
      initialReportMode !== 'unpaid' && React.createElement('select', { value: filter.status, onChange: e => setFilter(prev => ({ ...prev, status: e.target.value })), className: 'w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-red-600 focus:outline-none' },
          React.createElement('option', { value: '' }, 'Semua Status'),
          React.createElement('option', { value: 'Belum Bayar' }, 'Belum Bayar'),
          React.createElement('option', { value: 'Dibayar ke Client' }, 'Dibayar ke Client'),
          React.createElement('option', { value: 'Sudah Bayar' }, 'Lunas')
        )
    ),
    React.createElement('div', { className: 'bg-red-50 border border-red-200 p-4 rounded-lg mb-6 text-center' },
      React.createElement('h4', { className: 'text-sm font-semibold text-red-700' }, 'Total Denda Terfilter'),
      React.createElement('div', { className: 'text-3xl font-bold text-red-800' }, `Rp ${totalDenda.toLocaleString()}`)
    ),
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'w-full table-auto text-sm' },
        React.createElement('thead', { className: 'bg-gray-50' },
          React.createElement('tr', null,
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Tgl Dicatat'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Nama Siswa'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Kelas'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Wali Kelas'),
            React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Pembayaran Bulan'),
            React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Telat (Hari)'),
            React.createElement('th', { className: 'px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase' }, 'Jumlah Denda'),
            React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Status'),
            React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Aksi')
          )
        ),
        React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
          filteredRecords.map(record => React.createElement('tr', { key: record.id, className: 'hover:bg-gray-50' },
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, new Date(record.created_at).toLocaleDateString('id-ID')),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900' }, record.student_name),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, record.student_kelas || '-'),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, waliKelasMap.get(record.student_kelas) || '-'),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, new Date(record.payment_for_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600' }, record.days_late),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-red-800' }, `Rp ${record.fee_amount.toLocaleString()}`),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-center' },
              record.status === 'Sudah Bayar'
                ? React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' }, 'Lunas')
                : record.status === 'Dibayar ke Client'
                  ? React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800' }, 'Dibayar Client')
                  : React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800' }, 'Belum Bayar')
            ),
            React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-center text-sm font-medium' },
              record.status === 'Belum Bayar' ? React.createElement('button', { onClick: () => onUpdateStatus(record.id, 'Dibayar ke Client'), title: 'Tandai sudah dibayar ke client', className: 'text-blue-600 hover:text-blue-900 mr-3' }, React.createElement(Users, { size: 18 })) : record.status === 'Dibayar ke Client' ? React.createElement('button', { onClick: () => onUpdateStatus(record.id, 'Sudah Bayar'), title: 'Tandai Lunas (sudah disetor)', className: 'text-green-600 hover:text-green-900 mr-3' }, React.createElement(CheckCircle, { size: 18 })) : null,
              canDelete && React.createElement('button', { onClick: () => onDelete(record.id), className: 'text-red-600 hover:text-red-900' }, React.createElement(Trash2, { size: 18 }))
            )
          )),
          filteredRecords.length === 0 && React.createElement('tr', null, React.createElement('td', { colSpan: '9', className: 'px-4 py-8 text-center text-gray-500' }, 'Tidak ada data denda yang sesuai dengan filter.'))
        )
      )
    )
  );
}

/**
 * The main container for all report types. It acts as a router,
 * rendering the correct report sub-component based on the `reportType` prop
 * and the current user's permissions.
 * @param {object} props - The component props.
 * @param {string} props.reportType - The type of report to display (e.g., 'paper', 'sales').
 * @param {Array<object>} props.records - Paper usage records.
 * @param {Array<object>} props.salesRecords - Sales records.
 * @param {Array<object>} props.nomorSuratRecords - Letter number records.
 * @param {Array<object>} props.simkRecords - SIMK records.
 * @param {Array<object>} props.inventoryLogRecords - Inventory log records.
 * @param {object} props.filter - Filter state for paper report.
 * @param {function} props.setFilter - State setter for paper filter.
 * @param {object} props.salesFilter - Filter state for sales report.
 * @param {function} props.setSalesFilter - State setter for sales filter.
 * @param {object} props.suratFilter - Filter state for surat report.
 * @param {function} props.setSuratFilter - State setter for surat filter.
 * @param {object} props.simkFilter - Filter state for SIMK report.
 * @param {function} props.setSimkFilter - State setter for SIMK filter.
 * @param {object} props.inventoryLogFilter - Filter state for inventory log report.
 * @param {function} props.setInventoryLogFilter - State setter for inventory log filter.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @param {function} props.onReprint - Callback to reprint a SIMK letter.
 * @returns {React.ReactElement} The appropriate report component or a default message.
 */
export function ReportView({ reportType, records, salesRecords, nomorSuratRecords, simkRecords, inventoryLogRecords, dendaRecords, teachers, filter, setFilter, salesFilter, setSalesFilter, suratFilter, setSuratFilter, simkFilter, setSimkFilter, inventoryLogFilter, setInventoryLogFilter, dendaFilter, setDendaFilter, handleEditSale, handleDeleteSale, currentUser, onReprint, onCorrectStock, onUpdateDendaStatus, onDeleteDenda }) {
  const [expandedRecords, setExpandedRecords] = React.useState(new Set()); 

  const isAdmin = currentUser.role === 'admin';

  if (reportType === 'paper' && (isAdmin || currentUser.permissions?.report?.paper)) {
    return React.createElement(PaperReport, { records, filter, setFilter });
  }
  if (reportType === 'sales' && (isAdmin || currentUser.permissions?.report?.sales)) {
    return React.createElement(SalesReport, { salesRecords, salesFilter, setSalesFilter, handleEditSale, handleDeleteSale, currentUser });
  }
  if (reportType === 'surat' && (isAdmin || currentUser.permissions?.report?.surat)) {
    return React.createElement(SuratReport, { nomorSuratRecords, suratFilter, setSuratFilter, expandedRecords, setExpandedRecords });
  }
  if (reportType === 'simk' && (isAdmin || currentUser.permissions?.report?.simk)) {
    return React.createElement(SimkReport, { simkRecords, simkFilter, setSimkFilter, onReprint });
  }
  if (reportType === 'inventory_log' && (isAdmin || currentUser.permissions?.report?.inventory_log)) {
    return React.createElement(InventoryLogReport, { logRecords: inventoryLogRecords, filter: inventoryLogFilter, setFilter: setInventoryLogFilter, currentUser: currentUser, onCorrectStock: onCorrectStock });
  }
  if ((reportType === 'denda' || reportType === 'tunggakan_denda') && (isAdmin || currentUser.permissions?.report?.denda || currentUser.permissions?.report?.tunggakan_denda)) {
    return React.createElement(DendaReport, { dendaRecords, filter: dendaFilter, setFilter: setDendaFilter, teachers, onUpdateStatus: onUpdateDendaStatus, onDelete: onDeleteDenda, currentUser, reportMode: reportType === 'tunggakan_denda' ? 'unpaid' : 'all' });
  }

  return React.createElement('div', { className: 'text-center p-10 bg-white rounded-lg shadow' },
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-700' }, 'Modul Laporan'),
    React.createElement('p', { className: 'mt-2 text-gray-500' }, 'Silakan pilih jenis laporan dari sidebar untuk memulai.')
  );
}
