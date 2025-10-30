'use strict';

import { Search, GraduationCap, Users, XCircle, Filter, ChevronDown, ChevronUp } from '/src/utils/icons.js';

const { useState, useMemo } = React;

/**
 * A view to display a searchable list of all students.
 * @param {object} props - The component props.
 * @param {Array<object>} props.students - The list of all student objects.
 * @returns {React.ReactElement} The students list view component.
 */
export function StudentsView({ students }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    kelas: '',
    jk: '',
    agama: '',
    status: ''
  });

  const uniqueOptions = useMemo(() => {
    const klasses = new Set();
    const jks = new Set();
    const agamas = new Set();
    const statuses = new Set();
    (students || []).forEach(student => {
      if (student.kelas) klasses.add(student.kelas);
      if (student.jk) jks.add(student.jk);
      if (student.agama) agamas.add(student.agama);
      if (student.status) statuses.add(student.status);
    });
    return {
      kelas: [...klasses].sort(),
      jk: [...jks].sort(),
      agama: [...agamas].sort(),
      status: [...statuses].sort()
    };
  }, [students]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({ kelas: '', jk: '', agama: '', status: '' });
  };

  const filteredStudents = (students || []).filter(student => {
    const term = searchTerm.toLowerCase();
    const searchMatch = (
      student.nama?.toLowerCase().includes(term) ||
      String(student.noSiswa)?.toLowerCase().includes(term) ||
      student.kelas?.toLowerCase().includes(term)
    );

    const kelasMatch = !filters.kelas || student.kelas === filters.kelas;
    const jkMatch = !filters.jk || student.jk === filters.jk;
    const agamaMatch = !filters.agama || student.agama === filters.agama;
    const statusMatch = !filters.status || student.status === filters.status;

    return searchMatch && kelasMatch && jkMatch && agamaMatch && statusMatch;
  }).sort((a, b) => a.no - b.no);

  const hasActiveFilters = searchTerm || filters.kelas || filters.jk || filters.agama || filters.status;

  const renderSelect = (name, label, options) => (
    React.createElement('select', { name, value: filters[name], onChange: handleFilterChange, className: 'w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:border-sky-500 focus:outline-none' },
      React.createElement('option', { value: '' }, `Semua ${label}`),
      options.map(opt => React.createElement('option', { key: opt, value: opt }, opt))
    )
  );

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl overflow-hidden' },
    React.createElement('div', { className: 'p-6' },
      React.createElement('div', { className: 'flex flex-col sm:flex-row justify-between items-center gap-4' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Daftar Siswa'),
        React.createElement('div', { className: 'relative w-full sm:w-80' },
          React.createElement(Search, { size: 20, className: 'absolute left-4 top-1/2 -translate-y-1/2 text-gray-400' }),
          React.createElement('input', {
            type: 'text',
            placeholder: 'Cari nama, no. siswa, atau kelas...',
            value: searchTerm,
            onChange: e => setSearchTerm(e.target.value),
            className: 'w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:outline-none text-base'
          })
        )
      ),
      React.createElement('div', { className: 'border-t mt-6 pt-4' },
        React.createElement('button', { onClick: () => setShowFilters(!showFilters), className: 'w-full flex justify-between items-center mb-4' },
          React.createElement('div', { className: 'flex items-center gap-2' }, React.createElement(Filter, { size: 18, className: 'text-gray-600' }), React.createElement('h4', { className: 'text-lg font-semibold text-gray-700' }, 'Filter Data Siswa')),
          showFilters ? React.createElement(ChevronUp, { size: 20 }) : React.createElement(ChevronDown, { size: 20 })
        ),
        showFilters && React.createElement('div', { className: 'animate-fade-in-down' }, React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4' }, renderSelect('kelas', 'Kelas', uniqueOptions.kelas), renderSelect('jk', 'Jenis Kelamin', uniqueOptions.jk), renderSelect('agama', 'Agama', uniqueOptions.agama), renderSelect('status', 'Status', uniqueOptions.status)))
      ),
      React.createElement('div', { className: 'mt-6 flex flex-col md:flex-row items-center justify-between bg-sky-50 p-4 rounded-lg' },
        React.createElement('div', { className: 'flex items-center gap-3' }, React.createElement(GraduationCap, { size: 32, className: 'text-sky-500' }), React.createElement('span', { className: 'text-2xl font-bold text-sky-800' }, `${filteredStudents.length} Siswa`), React.createElement('span', { className: 'text-gray-600' }, hasActiveFilters ? 'ditemukan' : 'total')),
        hasActiveFilters && React.createElement('button', { onClick: resetFilters, className: 'mt-3 md:mt-0 flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800' }, React.createElement(XCircle, { size: 16 }), 'Reset Filter')
      )
    ),
    React.createElement('div', { className: 'overflow-x-auto' },
      React.createElement('table', { className: 'w-full table-auto' },
        React.createElement('thead', { className: 'bg-slate-100' },
          React.createElement('tr', null,
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'No'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'No Siswa'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Nama'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Kelas'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'J.K'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Agama'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Tahun Ajaran'),
            React.createElement('th', { className: 'px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider' }, 'Status')
          )
        ),
        React.createElement('tbody', null,
          filteredStudents.map((student, index) => React.createElement('tr', { key: student.noSiswa || index, className: 'border-b border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-sky-50' },
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.no),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-700' }, student.noSiswa),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900' }, student.nama),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.kelas),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.jk),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.agama),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.tahunAjaran),
            React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-slate-700' }, student.status)
          )),
          filteredStudents.length === 0 && React.createElement('tr', null,
            React.createElement('td', { colSpan: '8', className: 'px-6 py-10 text-center text-slate-500' }, 'Tidak ada data siswa yang cocok dengan pencarian.')
          )
        )
      )
    )
  );
}