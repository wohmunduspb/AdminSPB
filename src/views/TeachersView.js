'use strict';

import { Search, User, Users, XCircle, Filter, ChevronDown, ChevronUp } from '/src/utils/icons.js';

const { useState, useMemo } = React;

/**
 * A view to display a searchable list of all teachers.
 * @param {object} props - The component props.
 * @param {Array<object>} props.teachers - The list of all teacher objects.
 * @returns {React.ReactElement} The teachers list view component.
 */
export function TeachersView({ teachers }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    pendidikan: '',
    jabatan: '',
    isWaliKelas: '' // '', 'yes', 'no'
  });

  const uniqueOptions = useMemo(() => {
    // Hardcode the main education levels for filtering
    const pendidikans = ['SD', 'SMP', 'SMA'];
    const jabatans = new Set();
    (teachers || []).forEach(teacher => {
      if (teacher.jabatan) jabatans.add(teacher.jabatan);
    });
    return {
      // Ensure 'pendidikans' is an array of the desired options
      pendidikan: pendidikans,
      jabatan: [...jabatans].sort()
    };
  }, [teachers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      pendidikan: '',
      jabatan: '',
      isWaliKelas: ''
    });
  };

  const filteredTeachers = (teachers || []).filter(teacher => {
    const term = searchTerm.toLowerCase();
    const searchMatch = (
      teacher.namaGuru?.toLowerCase().includes(term) ||
      teacher.kodeGuru?.toLowerCase().includes(term) ||
      teacher.jabatan?.toLowerCase().includes(term) ||
      teacher.waliKelas?.toLowerCase().includes(term)
    );

    const pendidikanMatch = !filters.pendidikan || (
      teacher.pendidikan && (
        teacher.pendidikan.toLowerCase().includes(filters.pendidikan.toLowerCase()) ||
        teacher.pendidikan.toLowerCase().includes('all') ||
        (filters.pendidikan.toLowerCase() === 'sd' && teacher.pendidikan.toLowerCase().includes('sd')) ||
        (filters.pendidikan.toLowerCase() === 'smp' && teacher.pendidikan.toLowerCase().includes('smp')) ||
        (filters.pendidikan.toLowerCase() === 'sma' && teacher.pendidikan.toLowerCase().includes('sma'))
      )
    );

    const jabatanMatch = !filters.jabatan || teacher.jabatan === filters.jabatan;
    const waliKelasMatch = !filters.isWaliKelas || (filters.isWaliKelas === 'yes' ? !!teacher.waliKelas : !teacher.waliKelas);

    return searchMatch && pendidikanMatch && jabatanMatch && waliKelasMatch;
  }).sort((a, b) => a.no - b.no);

  const hasActiveFilters = searchTerm || filters.pendidikan || filters.jabatan || filters.isWaliKelas;

  const renderSelect = (name, label, options, customOptions = []) => (
    React.createElement('select', { name, value: filters[name], onChange: handleFilterChange, className: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-indigo-500 focus:outline-none' },
      React.createElement('option', { value: '' }, `Semua ${label}`),
      ...customOptions,
      options.map(opt => React.createElement('option', { key: opt, value: opt }, opt))
    )
  );

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl overflow-hidden' },
    React.createElement('div', { className: 'p-6' },
      React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-center gap-4' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Daftar Guru'),
        React.createElement('div', { className: 'relative w-full sm:w-72' },
          React.createElement(Search, { size: 20, className: 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Cari nama, kode, jabatan...',
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            className: 'w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none'
          })
        )
      ),
      React.createElement('div', { className: 'border-t mt-6 pt-4' },
        React.createElement('button', { onClick: () => setShowFilters(!showFilters), className: 'w-full flex justify-between items-center mb-4' },
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement(Filter, { size: 18, className: 'text-gray-600' }),
            React.createElement('h4', { className: 'text-lg font-semibold text-gray-700' }, 'Filter Data Guru')
          ),
          showFilters ? React.createElement(ChevronUp, { size: 20 }) : React.createElement(ChevronDown, { size: 20 })
        ),
        showFilters && React.createElement('div', { className: 'animate-fade-in-down' },
          React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 gap-4' },
            renderSelect('pendidikan', 'Pendidikan', uniqueOptions.pendidikan),
            renderSelect('jabatan', 'Jabatan', uniqueOptions.jabatan),
            renderSelect('isWaliKelas', 'Status Wali Kelas', [], [
              React.createElement('option', { key: 'yes', value: 'yes' }, 'Wali Kelas'),
              React.createElement('option', { key: 'no', value: 'no' }, 'Bukan Wali Kelas')
            ])
          )
        )
      ),
      React.createElement('div', { className: 'mt-6 flex flex-col md:flex-row items-center justify-between bg-indigo-50 p-4 rounded-lg' },
        React.createElement('div', { className: 'flex items-center gap-3' },
          React.createElement(Users, { size: 32, className: 'text-indigo-500' }),
          React.createElement('span', { className: 'text-2xl font-bold text-indigo-800' }, `${filteredTeachers.length} Guru`),
          React.createElement('span', { className: 'text-gray-600' }, hasActiveFilters ? 'ditemukan' : 'total')
        ),
        hasActiveFilters && React.createElement('button', { onClick: resetFilters, className: 'mt-3 md:mt-0 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800' }, React.createElement(XCircle, { size: 16 }), 'Reset Filter')
      )
    ),
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'w-full table-auto' },
        React.createElement('thead', { className: 'bg-slate-100' },
          React.createElement('tr', null,
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'No'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Kode Guru'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Nama Guru'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Wali Kelas'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Pendidikan'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Jabatan'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Total Siswa')
          )
        ),
        React.createElement('tbody', null,
          filteredTeachers.map((teacher, index) => React.createElement('tr', { key: teacher.kodeGuru, className: 'border-b border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-indigo-50' },
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-500' }, teacher.no),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700' }, teacher.kodeGuru),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900' }, teacher.namaGuru),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm' },
              teacher.waliKelas ? React.createElement('span', { className: 'bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full' }, teacher.waliKelas) : React.createElement('span', { className: 'text-slate-400' }, '-')
            ),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-600' }, teacher.pendidikan || '-'),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-600' }, teacher.jabatan || '-'),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-600' }, teacher.totalSiswa || '0')
          )),
          filteredTeachers.length === 0 && React.createElement('tr', null,
            React.createElement('td', { colSpan: '7', className: 'px-6 py-10 text-center text-slate-500' }, 'Tidak ada data guru yang cocok dengan pencarian.')
          )
        )
      )
    )
  );
}