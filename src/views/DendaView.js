'use strict';

import { DollarSign, Save, Users, Search, CheckCircle } from '/src/utils/icons.js';

const { useState, useMemo, useEffect } = React;

/**
 * A view for calculating and recording late payment fees for students.
 * @param {object} props - The component props.
 * @param {Array<object>} props.students - The list of all student objects.
 * @param {Array<object>} props.dendaRecords - The list of all late fee records.
 * @param {function} props.onSave - Callback function to save the late fee record.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @returns {React.ReactElement} The late fee calculation view.
 */
export function DendaView({ students, dendaRecords, onSave, currentUser }) {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [nisInput, setNisInput] = useState('');
  const [paymentForMonth, setPaymentForMonth] = useState('');
  const [paymentDate, setPaymentDate] = useState(''); // Tanggal denda dibayar

  const FEE_PER_DAY = 1000;
  const DUE_DATE_DAY = 10; // Tanggal jatuh tempo setiap bulan

  const calculation = useMemo(() => {
    if (!paymentForMonth || !paymentDate) {
      return { daysLate: 0, feeAmount: 0, dueDate: null };
    }

    const paymentMonthDate = new Date(paymentForMonth + '-01T00:00:00');
    const dueDate = new Date(paymentMonthDate.getFullYear(), paymentMonthDate.getMonth(), DUE_DATE_DAY);
    const actualPaymentDate = new Date(paymentDate);

    // Set jam ke 0 untuk perbandingan tanggal yang akurat
    dueDate.setHours(0, 0, 0, 0);
    actualPaymentDate.setHours(0, 0, 0, 0);

    const timeDiff = actualPaymentDate.getTime() - dueDate.getTime();
    const daysLate = timeDiff > 0 ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : 0;
    const feeAmount = daysLate * FEE_PER_DAY;
    return { daysLate, feeAmount, dueDate };
  }, [paymentForMonth, paymentDate]);

  const handleSaveDenda = () => {
    if (!selectedStudent || !paymentForMonth || calculation.daysLate <= 0) {
      alert('Pilih siswa dan pastikan ada denda yang harus dibayar sebelum menyimpan.');
      return;
    }

    const record = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      student_no_siswa: selectedStudent.noSiswa,
      student_name: selectedStudent.nama, // from nama
      student_kelas: selectedStudent.kelas, // from kelas
      payment_for_month: new Date(paymentForMonth + '-02'),
      days_late: calculation.daysLate,
      fee_amount: calculation.feeAmount,
      recorded_by: currentUser.username,
      status: 'Belum Bayar', // Set default status
    };

    onSave(record);
    alert(`Denda sebesar Rp ${calculation.feeAmount.toLocaleString()} untuk ${selectedStudent.nama} berhasil disimpan.`);
    // Reset form
    setSelectedStudent(null);
    setNisInput('');
    setPaymentForMonth('');
    setPaymentDate('');
  };

  return React.createElement('div', { className: 'space-y-8' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto' },
      React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
        React.createElement(DollarSign, { size: 28, className: 'text-red-600' }),
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Kalkulator & Rekap Denda')
      ),
      React.createElement('div', { className: 'space-y-4' },
        React.createElement('div', { className: 'space-y-2' },
          React.createElement('label', { htmlFor: 'nis-input', className: 'block text-sm font-semibold text-gray-700' }, 'Masukkan NIS Siswa'),
          React.createElement('div', { className: 'flex gap-2' },
            React.createElement('input', {
              id: 'nis-input',
              type: 'text',
              placeholder: 'Contoh: 252024',
              value: nisInput,
              onChange: e => setNisInput(e.target.value),
              onKeyPress: e => { if (e.key === 'Enter') { e.preventDefault(); const student = students.find(s => String(s.noSiswa) === nisInput); if (student) { setSelectedStudent(student); } else { alert('Siswa tidak ditemukan!'); setSelectedStudent(null); } } }, // prettier-ignore
              className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-lg'
            }),
            React.createElement('button', { onClick: () => { const student = students.find(s => String(s.noSiswa) === nisInput); if (student) { setSelectedStudent(student); } else { alert('Siswa tidak ditemukan!'); setSelectedStudent(null); } }, className: 'px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600' }, React.createElement(Search, { size: 24 }))
          )
        ),
        selectedStudent && React.createElement('div', { className: 'p-4 bg-green-50 border border-green-200 rounded-lg' },
          React.createElement('div', { className: 'font-semibold text-green-800' }, selectedStudent.nama),
          React.createElement('div', { className: 'text-sm text-green-700' }, `Kelas: ${selectedStudent.kelas}`)
        ),
        !selectedStudent && nisInput && React.createElement('div', { className: 'p-4 bg-yellow-50 border border-yellow-200 rounded-lg' },
          React.createElement('p', { className: 'text-sm text-yellow-800' }, 'Siswa tidak ditemukan. Silakan periksa kembali NIS yang dimasukkan.')
        ),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'payment-for-month', className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Pembayaran Untuk Bulan'),
            React.createElement('input', { type: 'month', id: 'payment-for-month', value: paymentForMonth, onChange: e => setPaymentForMonth(e.target.value), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-lg' })
          ),
          React.createElement('div', null,
            React.createElement('label', { htmlFor: 'payment-date', className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tanggal Pembayaran Denda'),
            React.createElement('input', { type: 'date', id: 'payment-date', value: paymentDate, onChange: e => setPaymentDate(e.target.value), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-lg' })
          )
        ),
        calculation.dueDate && React.createElement('div', { className: 'text-sm text-center text-gray-600' },
          'Jatuh tempo pembayaran untuk bulan ini adalah tanggal ',
          React.createElement('strong', null, `${DUE_DATE_DAY} ${calculation.dueDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`)
        ),
        calculation.daysLate > 0 && React.createElement('div', { className: 'mt-6 p-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg' },
          React.createElement('h3', { className: 'text-lg font-bold text-red-800' }, 'Hasil Perhitungan Denda'),
          React.createElement('div', { className: 'mt-4 grid grid-cols-2 gap-4 text-center' },
            React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow-sm' },
              React.createElement('div', { className: 'text-sm text-gray-500' }, 'Keterlambatan'),
            React.createElement('div', { className: 'text-3xl font-bold text-red-700' }, `${calculation.daysLate} Hari`)
            ),
            React.createElement('div', { className: 'bg-white p-4 rounded-lg shadow-sm' },
              React.createElement('div', { className: 'text-sm text-gray-500' }, 'Total Denda'),
              React.createElement('div', { className: 'text-3xl font-bold text-red-700' }, `Rp ${calculation.feeAmount.toLocaleString()}`)
            )
        )
        ),
        (currentUser.role === 'admin' || currentUser.permissions?.denda?.input) && React.createElement('button', {
          onClick: handleSaveDenda,
        disabled: !selectedStudent || !paymentForMonth || calculation.daysLate <= 0,
          className: 'w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-500 text-white py-4 rounded-xl hover:from-red-700 hover:to-orange-600 transition-all text-lg font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6'
        },
          React.createElement(Save, { size: 20 }),
          'Simpan Rekap Denda'
        )
      )
    ),
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8' },
      React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, '10 Rekap Denda Terakhir'),
      React.createElement('div', { className: 'overflow-x-auto' },
        React.createElement('table', { className: 'w-full table-auto text-sm' },
          React.createElement('thead', { className: 'bg-gray-50' },
            React.createElement('tr', null,
              React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Tgl Dicatat'),
              React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Nama Siswa'),
              React.createElement('th', { className: 'px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase' }, 'Pembayaran Bulan'),
              React.createElement('th', { className: 'px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase' }, 'Jumlah Denda'),
              React.createElement('th', { className: 'px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase' }, 'Status')
            )
          ),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            (dendaRecords || []).slice(0, 10).map(record => React.createElement('tr', { key: record.id, className: 'hover:bg-gray-50' },
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, new Date(record.created_at).toLocaleDateString('id-ID')),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900' }, record.student_name),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-gray-700' }, new Date(record.payment_for_month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-sm text-right font-bold text-red-800' }, `Rp ${record.fee_amount.toLocaleString()}`),
              React.createElement('td', { className: 'px-4 py-4 whitespace-nowrap text-center' },
                record.status === 'Sudah Bayar'
                  ? React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800' }, 'Sudah di setor') : record.status === 'Dibayar oleh Siswa'
                  ? React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800' }, 'Dibayar Siswa')
                  : React.createElement('span', { className: 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800' }, 'Belum Bayar')
              )
            )),
            (!dendaRecords || dendaRecords.length === 0) && React.createElement('tr', null, React.createElement('td', { colSpan: '5', className: 'px-4 py-8 text-center text-gray-500' }, 'Belum ada data denda yang direkap.'))
          )
        )
      )
    )
  );
}
