'use strict';

import { Clipboard, Eye, User, Users, ChevronRight, FileWarning } from '/src/utils/icons.js';
import { imageToBase64 } from '/src/utils/utils.js';


const { useState, useEffect } = React;

function SimkForm({ teachers = [], onGenerate, onBack, nomorSuratRecords, nomorSuratSettings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacherCodes, setSelectedTeacherCodes] = useState(new Set());
  const [selectedGroup, setSelectedGroup] = useState(null); // State baru untuk grup
  const [eventData, setEventData] = useState({
    acara: '',
    penyelenggara: '',
    tempat: '',
    hariTanggal: '',
    isMultiDay: false,
    hariTanggalSelesai: '',
    jam: '',
    tanggalTtd: new Date().toISOString().split('T')[0], // Format YYYY-MM-DD for date input
    ygTtd: 'Kiki Sumanti, S.SI., M.M.'
  });

  const handleTeacherSelect = (teacher) => {
    setSelectedGroup(null); // Hapus pilihan grup jika memilih individu
    setSelectedTeacherCodes(prevCodes => {
      const newCodes = new Set(prevCodes);
      if (newCodes.has(teacher.kode_guru)) {
        newCodes.delete(teacher.kode_guru); // Deselect if already selected
      } else {
        newCodes.add(teacher.kode_guru); // Select if not selected, using kode_guru
      }
      return newCodes;
    });
  };

  const handleGroupSelect = (group) => {
    if (group === 'none') {
      setSelectedGroup(null);
      setSelectedTeacherCodes(new Set());
    } else {
      setSelectedGroup(group); // Set grup yang dipilih
      setSelectedTeacherCodes(new Set()); // Kosongkan pilihan individu
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Reset end date if multi-day is unchecked
      ...(name === 'isMultiDay' && !checked && { hariTanggalSelesai: '' })
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let selectedTeachers = [];
    if (selectedGroup) {
      // Jika grup dipilih, filter guru berdasarkan grup
      switch (selectedGroup) {
        case 'sds':
          selectedTeachers = [{ nama: 'Seluruh Guru SDS Putra Batam', jabatan: '-' }];
          break;
        case 'smp':
          selectedTeachers = [{ nama: 'Seluruh Guru SMP Putra Batam', jabatan: '-' }];
          break;
        case 'sma':
          selectedTeachers = [{ nama: 'Seluruh Guru SMA Putra Batam', jabatan: '-' }];
          break;
        case 'all':
          selectedTeachers = [{ nama: 'Seluruh Guru Putra Batam', jabatan: '-' }];
          break;
      }
    } else {
      // Jika tidak ada grup, gunakan pilihan individu
      selectedTeachers = teachers.filter(t => selectedTeacherCodes.has(t.kode_guru));
    }

    if (selectedTeachers.length === 0 || !eventData.acara || !eventData.hariTanggal) {
        alert('Pilih minimal satu Guru, lalu isi Acara, dan Hari/Tanggal.');
        return;
    }
    onGenerate({ ...eventData, teachers: selectedTeachers });
  };

  // 1. Sort teachers: Kepala Sekolah first, then alphabetically by name.
  const sortedTeachers = [...teachers].sort((a, b) => {
    const isAKepsek = a.jabatan && a.jabatan.toLowerCase().includes('kepala sekolah');
    const isBKepsek = b.jabatan && b.jabatan.toLowerCase().includes('kepala sekolah');

    if (isAKepsek && !isBKepsek) return -1; // a comes first
    if (!isAKepsek && isBKepsek) return 1;  // b comes first

    // If both are/aren't Kepsek, sort by name
    return String(a.namaGuru || '').localeCompare(String(b.namaGuru || ''));
  });

  // 2. Filter the already sorted list based on the search term, using the consistent 'namaGuru' property.
  const filteredAndSortedTeachers = sortedTeachers.filter(teacher =>
    (teacher.namaGuru || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8' },
    React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
      React.createElement('button', {
        onClick: onBack,
        className: 'text-sm text-gray-500 hover:text-gray-800 hover:underline'
      }, '← Kembali ke Pilihan Template'),
      React.createElement(Clipboard, { size: 28, className: 'text-teal-600' }),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Generate Surat Izin Mengikuti Kegiatan (SIMK)')
    ),
    React.createElement('form', { onSubmit: handleSubmit },
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-8' },
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'col-span-1 md:col-span-2' },
            React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Pilih Guru'),
            React.createElement('input', {
              type: 'text',
              placeholder: 'Cari nama guru...',
              value: searchTerm,
              onChange: e => setSearchTerm(e.target.value),
              className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg mb-4'
            }),
            React.createElement('div', { className: 'flex flex-wrap gap-2 mb-4' },
              React.createElement('button', { type: 'button', onClick: () => handleGroupSelect('sds'), className: 'px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full hover:bg-blue-200' }, 'Seluruh Guru SDS'),
              React.createElement('button', { type: 'button', onClick: () => handleGroupSelect('smp'), className: 'px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full hover:bg-green-200' }, 'Seluruh Guru SMP'),
              React.createElement('button', { type: 'button', onClick: () => handleGroupSelect('sma'), className: 'px-3 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full hover:bg-purple-200' }, 'Seluruh Guru SMA'),
              React.createElement('button', { type: 'button', onClick: () => handleGroupSelect('all'), className: 'px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full hover:bg-gray-300' }, 'Seluruh Guru Putra Batam'),
              React.createElement('button', { type: 'button', onClick: () => handleGroupSelect('none'), className: 'px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full hover:bg-red-200' }, 'Kosongkan Pilihan')
            ),
            selectedGroup ? (
              React.createElement('div', { className: 'border-2 border-dashed border-teal-400 bg-teal-50 text-teal-800 rounded-xl p-6 text-center' },
                React.createElement(Users, { size: 48, className: 'mx-auto mb-4' }),
                React.createElement('h3', { className: 'text-xl font-bold' },
                  selectedGroup === 'sds' ? 'Seluruh Guru SDS' :
                  selectedGroup === 'smp' ? 'Seluruh Guru SMP' :
                  selectedGroup === 'sma' ? 'Seluruh Guru SMA' :
                  'Seluruh Guru Putra Batam'
                ),
                React.createElement('p', { className: 'text-sm mt-1' }, 'Telah dipilih untuk surat ini.'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setSelectedGroup(null),
                  className: 'mt-4 text-xs text-teal-700 hover:underline font-semibold'
                }, 'Batal dan pilih guru secara manual')
              )
            ) : (
            React.createElement('div', { className: 'grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2 bg-gray-50 rounded-lg' },
                filteredAndSortedTeachers.map(teacher => React.createElement('button', {
                  key: teacher.kode_guru,
                  type: 'button',
                  onClick: () => handleTeacherSelect(teacher),
                  className: `p-3 rounded-xl border-2 text-center transition-all duration-200 flex flex-col items-center justify-center gap-2 aspect-square ${selectedTeacherCodes.has(teacher.kode_guru) ? 'border-teal-500 bg-teal-50 text-teal-800 shadow-lg scale-105 ring-2 ring-teal-500 ring-offset-2' : 'border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/50 hover:shadow-sm'}`
                },
                  React.createElement('div', { className: 'flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center' }, React.createElement(User, { size: 24, className: 'text-gray-500' })), // prettier-ignore
                  React.createElement('div', null,
                    React.createElement('div', { className: 'font-semibold' }, teacher.namaGuru),
                    React.createElement('div', { className: 'text-xs opacity-75 mt-1' }, teacher.jabatan)
                  )
                ))
              )
            )
          )
        ),
        React.createElement('div', { className: 'space-y-4' },
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Acara'),
              React.createElement('input', { type: 'text', name: 'acara', value: eventData.acara, onChange: handleInputChange, required: true, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg', placeholder: 'Contoh: Pelatihan Kurikulum Merdeka' })
            ),
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Penyelenggara'),
              React.createElement('input', { type: 'text', name: 'penyelenggara', value: eventData.penyelenggara, onChange: handleInputChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg', placeholder: 'Contoh: Dinas Pendidikan' })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tempat'),
            React.createElement('input', { type: 'text', name: 'tempat', value: eventData.tempat, onChange: handleInputChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg', placeholder: 'Contoh: Hotel Harmoni One' })
          ),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', { className: 'space-y-2' },
              React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tanggal Mulai'),
              React.createElement('input', { type: 'date', name: 'hariTanggal', value: eventData.hariTanggal, onChange: handleInputChange, required: true, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg' })
            ),
            eventData.isMultiDay && React.createElement('div', { className: 'space-y-2' },
              React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tanggal Selesai'),
              React.createElement('input', { type: 'date', name: 'hariTanggalSelesai', value: eventData.hariTanggalSelesai, onChange: handleInputChange, required: eventData.isMultiDay, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg' })
            )
          ),
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('input', { type: 'checkbox', id: 'isMultiDay', name: 'isMultiDay', checked: eventData.isMultiDay, onChange: handleInputChange, className: 'h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500' }),
            React.createElement('label', { htmlFor: 'isMultiDay', className: 'ml-2 block text-sm text-gray-900' }, 'Kegiatan lebih dari 1 hari?')
          ),
          React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
            React.createElement('div', null,
              React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Jam'),
              React.createElement('input', { type: 'text', name: 'jam', value: eventData.jam, onChange: handleInputChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg', placeholder: 'Contoh: 08.00 - Selesai' })
            )
          ),
          React.createElement('div', null,
            React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tanggal Tanda Tangan'),
            React.createElement('input', { type: 'date', name: 'tanggalTtd', value: eventData.tanggalTtd, onChange: handleInputChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-teal-500 focus:outline-none text-lg' })
          ),
          React.createElement('button', { type: 'submit', className: 'w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all text-lg font-semibold shadow-lg mt-6' }, 'Generate & Print Surat')
        )
      ),
    )
  );
}

function SpForm({ onGenerateBatch, onBack }) {
  const [batchData, setBatchData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [formOptions, setFormOptions] = useState({
    suratPeringatan: 'Surat Peringatan Pertama',
    tanggalSurat: new Date().toISOString().split('T')[0] // Default to today
  });
  const [generatedHtml, setGeneratedHtml] = useState('');
  const iframeRef = React.useRef(null);

  const handleOptionsChange = (e) => {
    const { name, value } = e.target;
    setFormOptions(prev => ({ ...prev, [name]: value }));
  };

  const handleShowPreview = async (data) => {
    const payload = {
      ...formOptions, // Include dropdown and date picker values
      batchData: data
    };
    const html = await onGenerateBatch(payload, true); // Pass a flag to indicate preview-only
    setGeneratedHtml(html);
    setShowConfirmation(false); // Close confirmation modal
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel columns to our form data structure
        const mappedData = jsonData.map(row => ({
          no: row['NO'],
          nama: row['NAMA SISWA'],
          kelas: row['KELAS'],
          // Extract month name from "Ke-XX (MonthName)"
          bulan: (row['BULAN'] && row['BULAN'].includes('(')) ? row['BULAN'].match(/\(([^)]+)\)/)[1] : row['BULAN'],
          // Use the value as is, converting to string to preserve formatting
          nilai: String(row['NILAI']),
          jenjang: 'SMP', // Default, can be adjusted if needed
          tingkat: 'SPB.1' // Default, can be adjusted if needed
        }));

        setBatchData(mappedData);
        setShowConfirmation(true);

      } catch (error) {
        console.error("Error processing Excel file:", error);
        alert("Gagal memproses file Excel. Pastikan formatnya benar.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = null; // Reset file input
  };

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8' },
    React.createElement('div', { className: 'flex items-center gap-3 mb-6' },
      React.createElement('button', {
        onClick: onBack,
        className: 'text-sm text-gray-500 hover:text-gray-800 hover:underline'
      }, '← Kembali ke Pilihan Template'),
      React.createElement(FileWarning, { size: 28, className: 'text-red-600' }),
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Generate Surat Peringatan (SP)')
    ),
    generatedHtml && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50' },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col' },
        React.createElement('div', { className: 'flex justify-between items-center mb-4' },
          React.createElement('h3', { className: 'text-2xl font-bold text-gray-800' }, 'Pratinjau Surat'),
          React.createElement('div', { className: 'flex gap-4' },
            React.createElement('button', { onClick: handlePrint, className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold' }, 'Cetak Semua'),
            React.createElement('button', { onClick: () => setGeneratedHtml(''), className: 'px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold' }, 'Tutup')
          )
        ),
        React.createElement('iframe', {
          ref: iframeRef,
          srcDoc: `<html><head><style>@media print { body { margin: 0; } .page-break { page-break-after: always; } }</style></head><body>${generatedHtml}</body></html>`,
          className: 'w-full h-full border rounded-lg'
        })
      )
    ),
    showConfirmation && batchData && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40' },
      React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl' },
        React.createElement('h3', { className: 'text-2xl font-bold text-gray-800 mb-4' }, 'Konfirmasi Data'),
        React.createElement('p', { className: 'text-gray-600 mb-6' }, `Anda akan membuat ${batchData.length} surat peringatan. Mohon periksa data di bawah sebelum melanjutkan.`),
        React.createElement('div', { className: 'max-h-64 overflow-y-auto border rounded-lg p-2 bg-gray-50 mb-6' },
          React.createElement('table', { className: 'w-full text-sm' },
            React.createElement('thead', null,
              React.createElement('tr', { className: 'text-left' },
                React.createElement('th', { className: 'p-2 font-semibold' }, 'No Surat'),
                React.createElement('th', { className: 'p-2 font-semibold' }, 'Nama Siswa'),
                React.createElement('th', { className: 'p-2 font-semibold' }, 'Kelas'),
                React.createElement('th', { className: 'p-2 font-semibold' }, 'Bulan'),
                React.createElement('th', { className: 'p-2 font-semibold' }, 'Nilai')
              )
            ),
            React.createElement('tbody', null,
              batchData.slice(0, 10).map((row, index) => React.createElement('tr', { key: index, className: 'border-t' },
                React.createElement('td', { className: 'p-2' }, row.no),
                React.createElement('td', { className: 'p-2' }, row.nama),
                React.createElement('td', { className: 'p-2' }, row.kelas),
                React.createElement('td', { className: 'p-2' }, row.bulan),
                React.createElement('td', { className: 'p-2' }, `Rp ${row.nilai}`)
              ))
            )
          ),
          batchData.length > 10 && React.createElement('p', { className: 'text-center text-xs text-gray-500 mt-2' }, `...dan ${batchData.length - 10} data lainnya.`)
        ),
        React.createElement('div', { className: 'flex justify-end gap-4' },
          React.createElement('button', { onClick: () => setShowConfirmation(false), className: 'px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold' }, 'Batal'),
          React.createElement('button', { onClick: () => handleShowPreview(batchData), className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold' }, `Tampilkan Pratinjau ${batchData.length} Surat`)
        )
      )
    ),
    React.createElement('div', { className: 'p-6 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg' },
      React.createElement('h3', { className: 'font-bold text-blue-800' }, 'Generate Massal dari Excel'),
      React.createElement('p', { className: 'text-sm text-blue-700 mt-1' }, 'Untuk membuat banyak surat sekaligus, siapkan file Excel dengan kolom: NAMA SISWA, KELAS, BULAN, dan NILAI. Lalu upload di sini.'),
      React.createElement('div', { className: 'mt-4 grid grid-cols-1 md:grid-cols-2 gap-4' },
        React.createElement('div', null,
          React.createElement('label', { htmlFor: 'suratPeringatan', className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Jenis Surat Peringatan'),
          React.createElement('select', { id: 'suratPeringatan', name: 'suratPeringatan', value: formOptions.suratPeringatan, onChange: handleOptionsChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-base' },
            React.createElement('option', null, 'Surat Peringatan Pertama'),
            React.createElement('option', null, 'Surat Peringatan Kedua'),
            React.createElement('option', null, 'Surat Peringatan Ketiga')
          )
        ),
        React.createElement('div', null,
          React.createElement('label', { htmlFor: 'tanggalSurat', className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Tanggal Surat'),
          React.createElement('input', { type: 'date', id: 'tanggalSurat', name: 'tanggalSurat', value: formOptions.tanggalSurat, onChange: handleOptionsChange, className: 'w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-500 focus:outline-none text-base' })
        )
      ),
      React.createElement('div', { className: 'mt-6' },
      React.createElement('input', {
        type: 'file',
        id: 'excel-upload',
        className: 'hidden',
        accept: '.xlsx, .xls',
        onChange: handleFileChange
      }),
      React.createElement('label', { htmlFor: 'excel-upload', className: 'inline-block bg-blue-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-700 transition-all text-base font-semibold shadow-md' }, 'Pilih & Upload File Excel')
      )
    )
  );
}

export function GenerateSuratView({ teachers, onGenerateSimk, onGenerateSp, onGenerateSpBatch, nomorSuratRecords, nomorSuratSettings, currentUser }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateThumbnails, setTemplateThumbnails] = useState({});
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const templates = [
    { id: 'simk', title: 'Surat Izin Mengikuti Kegiatan', description: 'Buat surat tugas untuk guru yang akan mengikuti kegiatan di luar sekolah.', thumbnailPath: './Template Surat/thumbnail/SIMK.jpg' },
    { id: 'sp', title: 'Surat Peringatan (SP)', description: 'Buat surat peringatan tunggakan pembayaran untuk siswa.', thumbnailPath: './Template Surat/thumbnail/SP.jpg' }
  ];

  useEffect(() => {
    const loadThumbnails = async () => {
      const thumbnails = {};
      for (const template of templates) {
        if (template.thumbnailPath) {
          thumbnails[template.id] = await imageToBase64(template.thumbnailPath);
        }
      }
      setTemplateThumbnails(thumbnails);
    };
    loadThumbnails();
  }, []);

  if (selectedTemplate === 'simk' && (currentUser.role === 'admin' || currentUser.permissions?.generate_surat?.simk)) {
    return React.createElement(SimkForm, { teachers, onGenerate: onGenerateSimk, onBack: () => setSelectedTemplate(null), nomorSuratRecords, nomorSuratSettings });
  }

  if (selectedTemplate === 'sp' && (currentUser.role === 'admin' || currentUser.permissions?.generate_surat?.sp)) {
    return React.createElement(SpForm, { onGenerateBatch: onGenerateSpBatch, onBack: () => setSelectedTemplate(null) });
  }

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('h1', { className: 'text-3xl font-bold text-gray-800' }, 'Pilih Template Surat'),
    fullscreenImage && React.createElement('div', { // prettier-ignore
      className: 'fixed inset-0 bg-black bg-opacity-80 flex justify-center z-50 pt-8',
      onClick: () => setFullscreenImage(null)
    },
      React.createElement('img', {
        src: fullscreenImage,
        alt: 'Pratinjau Layar Penuh',
        className: 'max-w-[100vw] max-h-[90vh] object-contain'
      }),
      React.createElement('button', {
        className: 'absolute top-4 right-4 text-white text-3xl font-bold'
      }, '×')
    ),
    React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
      templates.map(template => {
        const hasPermission = currentUser.role === 'admin' ||
          (template.id === 'simk' && currentUser.permissions?.generate_surat?.simk) ||
          (template.id === 'sp' && currentUser.permissions?.generate_surat?.sp);

        if (!hasPermission) return null;

        return React.createElement('div', { // This div is the clickable card for each template
          key: template.id,
          onClick: () => setSelectedTemplate(template.id),
          className: 'group relative bg-white rounded-2xl shadow-lg text-left transition-all duration-300 hover:shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-1 cursor-pointer flex flex-col border border-gray-200/80 overflow-hidden'
        },
          React.createElement('div', { className: 'relative' },
            React.createElement('img', {
              src: templateThumbnails[template.id] || '',
              alt: `Pratinjau ${template.title}`,
              className: 'w-full h-56 object-contain bg-gray-50 transition-transform duration-300 group-hover:scale-105'
            }),
            React.createElement('div', {
              onClick: e => { e.stopPropagation(); setFullscreenImage(templateThumbnails[template.id]); },
              className: 'absolute top-3 right-3 bg-white/70 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300'
            }, React.createElement(Eye, { size: 20, className: 'text-gray-700' }))
          ),
          React.createElement('div', { className: 'p-6 flex-grow flex flex-col' },
            React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, template.title),
            React.createElement('p', { className: 'text-sm text-gray-500 mt-2 flex-grow' }, template.description)
          ),
          React.createElement('div', {
            className: 'absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6'
          },
            React.createElement('div', { className: 'text-white text-lg font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300' }, 'Pilih Template', React.createElement(ChevronRight, { size: 20 }))
          )
        )
      })
    )
  );
}
