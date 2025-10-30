'use strict';

import { Printer, DollarSign, Users, FileText, AlertTriangle, PlusCircle, Mail, Box } from '/src/utils/icons.js';
import { TeacherStats } from '/src/components/TeacherStats.js';
import { StudentStats } from '/src/components/StudentStats.js';
import { getTodaySalesTotal, getSalesTrend } from '/src/utils/utils.js';


function SalesTrendChart({ salesRecords }) {
  const trendData = getSalesTrend(salesRecords, 7);
  const maxValue = Math.max(...trendData.map(d => d.total));
  const safeMaxValue = maxValue > 0 ? maxValue : 1;

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, 'Tren Penjualan 7 Hari Terakhir'),
    React.createElement('div', { className: 'flex justify-between items-end h-48' },
      trendData.map(({ date, total }) => {
        const barHeight = (total / safeMaxValue) * 100;
        return React.createElement('div', { key: date.toISOString(), className: 'flex flex-col items-center w-full' },
          React.createElement('div', {
            className: 'w-3/4 bg-green-500 rounded-t-lg transition-all duration-500 hover:bg-green-600',
            style: { height: `${barHeight}%` },
            title: `Rp ${total.toLocaleString()}`
          }),
          React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }))
        );
      })
    )
  );
}

function LowStockAlert({ inventory, setCurrentView, currentUser }) {
  const LOW_STOCK_THRESHOLD = 10;

  const lowStockItems = inventory.filter(item => item.stok <= LOW_STOCK_THRESHOLD);

  if (lowStockItems.length === 0) {
    return null;
  }

  return React.createElement('div', { className: 'bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-lg p-4' },
    React.createElement('div', { className: 'flex items-center' },
      React.createElement(AlertTriangle, { className: 'text-red-500', size: 24 }),
      React.createElement('div', { className: 'ml-3' },
        React.createElement('h4', { className: 'text-lg font-bold text-red-800' }, 'Peringatan Stok Rendah!'),
        React.createElement('p', { className: 'text-sm text-red-700' }, `Ada ${lowStockItems.length} barang yang perlu diisi ulang.`),
        React.createElement('button', { onClick: () => setCurrentView('inventory'), className: 'mt-2 text-sm font-semibold text-red-800 hover:underline' }, 'Lihat Stok Sekarang →')
      )
    ),
  );
}

function RecentActivity({ salesRecords, paperRecords, inventoryLogRecords }) {
  const combinedRecords = [
    ...(salesRecords || []).map(r => ({ ...r, type: 'Penjualan', icon: DollarSign, color: 'green' })),
    ...(paperRecords || []).map(r => ({ ...r, type: 'Kertas', icon: Printer, color: 'indigo' })),
    ...(inventoryLogRecords || []).map(r => ({ ...r, type: 'Stok', icon: Box, color: 'purple' }))
  ];

  const sortedRecords = combinedRecords
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Ambil 5 aktivitas terbaru

  const renderRecord = (record) => {
    const Icon = record.icon;
    switch (record.type) {
      case 'Penjualan':
        return `[${record.item}] terjual sebanyak ${record.quantity} seharga Rp ${record.total.toLocaleString()}`;
      case 'Kertas':
        return `[${record.name}] menggunakan ${record.quantity} lembar untuk "${record.purpose}"`;
      case 'Stok':
        return `[${record.item}] berubah ${record.change} karena "${record.reason}" oleh ${record.user}`;
      default:
        return 'Aktivitas tidak diketahui';
    }
  };

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    React.createElement('h3', { className: 'text-lg font-bold text-gray-800 mb-4' }, 'Aktivitas Terbaru'),
    React.createElement('div', { className: 'space-y-4' },
      sortedRecords.length > 0 ? sortedRecords.map(record =>
        React.createElement('div', { key: `${record.type}-${record.id}`, className: 'flex items-start gap-4' },
          React.createElement('div', { className: `flex-shrink-0 w-10 h-10 rounded-full bg-${record.color}-100 flex items-center justify-center` },
            React.createElement(record.icon, { size: 20, className: `text-${record.color}-600` })
          ),
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm text-gray-700' }, renderRecord(record)),
            React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, new Date(record.date).toLocaleString('id-ID'))
          )
        )
      ) : React.createElement('p', { className: 'text-sm text-gray-500 text-center py-4' }, 'Belum ada aktivitas.')
    )
  );
}

export function Dashboard({ records, salesRecords, inventory, setCurrentView, currentUser, teachers, students, inventoryLogRecords }) {
  return React.createElement('div', { className: 'space-y-6' },
    // Header
    React.createElement('div', { className: 'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6' },
      React.createElement('div', null,
        React.createElement('h1', { className: 'text-3xl font-bold text-gray-800' }, `Selamat datang kembali, ${currentUser.username}!`),
        React.createElement('p', { className: 'text-gray-500 mt-1' }, 'Berikut adalah ringkasan aktivitas hari ini.')
      ) 
    ),
    // Main Grid
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      // Left Column
      React.createElement('div', { className: 'lg:col-span-2 space-y-6' },
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6' },
          React.createElement('div', { className: 'bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white' },
            React.createElement('div', { className: 'flex items-center gap-3 mb-2' }, React.createElement(DollarSign, { size: 20 }), React.createElement('h3', { className: 'font-semibold' }, 'Penjualan Hari Ini')),
            React.createElement('div', { className: 'text-4xl font-bold' }, `Rp ${getTodaySalesTotal(salesRecords).toLocaleString()}`),
            React.createElement('div', { className: 'text-green-200 mt-1 text-sm' }, 'total pendapatan hari ini')
          ),
          React.createElement('div', { className: 'bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl shadow-xl p-6 text-white' },
            React.createElement('div', { className: 'flex items-center gap-3 mb-2' }, React.createElement(Printer, { size: 20 }), React.createElement('h3', { className: 'font-semibold' }, 'Penggunaan Kertas')),
            React.createElement('div', { className: 'text-4xl font-bold' }, records.reduce((sum, r) => sum + r.quantity, 0)),
            React.createElement('div', { className: 'text-indigo-200 mt-1 text-sm' }, 'lembar (total keseluruhan)')
          )
        ),
        currentUser.permissions?.students?.view && React.createElement(StudentStats, { students })
      ),
      // Right Column
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6' },
            React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
                React.createElement('div', { className: 'flex items-center gap-3 mb-2' }, React.createElement(Users, { size: 20, className: 'text-purple-600' }), React.createElement('h3', { className: 'font-semibold text-gray-700' }, 'Total Guru')),
                React.createElement('div', { className: 'text-4xl font-bold text-gray-800' }, teachers.length),
                React.createElement('div', { className: 'text-gray-500 mt-1 text-sm' }, 'guru terdaftar')
            ),
            React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
                React.createElement('div', { className: 'flex items-center gap-3 mb-2' }, React.createElement(Users, { size: 20, className: 'text-orange-600' }), React.createElement('h3', { className: 'font-semibold text-gray-700' }, 'Total Siswa')),
                React.createElement('div', { className: 'text-4xl font-bold text-gray-800' }, students.length),
                React.createElement('div', { className: 'text-gray-500 mt-1 text-sm' }, 'siswa terdaftar')
            )
        ),
        currentUser.permissions?.inventory?.view && React.createElement(LowStockAlert, { inventory, setCurrentView, currentUser }),
        React.createElement(RecentActivity, { salesRecords, paperRecords: records, inventoryLogRecords }),
        currentUser.permissions?.teachers?.view && React.createElement(TeacherStats, { teachers })
      )
    )
  );
}
