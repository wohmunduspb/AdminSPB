import { Plus, FileText, ChevronDown, Calendar, Download, Settings, TrendingUp } from '/src/utils/icons.js';
import { KODE_SURAT_OPTIONS, TINGKAT_OPTIONS, ROMAN_MONTHS, getSuratFilteredRecords, exportSuratToCSV } from '/src/utils/utils.js';
import { apiSaveSettings } from '/src/services/api.js';


export function SuratView({ nomorSuratRecords, setNomorSuratRecords, nomorSuratForm, setNomorSuratForm, handleSuratSubmit, handleSuratKeyPress, setShowSuccess, nomorSuratSettings, setNomorSuratSettings, currentUser }) {
  const [expandedRecords, setExpandedRecords] = React.useState(new Set());
  const [isSettingsEditing, setIsSettingsEditing] = React.useState(false);
  const [tempNomorSuratSettings, setTempNomorSuratSettings] = React.useState({});

  // Group multiple records
  const groupedRecords = React.useMemo(() => {
    const singleRecords = [];
    const parentRecords = {};

    nomorSuratRecords.forEach(r => {
      const hasSubNumber = typeof r.nomor === 'string' && r.nomor.includes('.');
      if (r.parentId || hasSubNumber) {
        const groupId = r.parentId || r.nomor.split('.')[0];
        if (!parentRecords[groupId]) {
          // Use the first record of the group as the representative parent
          parentRecords[groupId] = { ...r, parentId: groupId, isParent: true, children: [] };
        }
        parentRecords[groupId].children.push(r);
      } else {
        singleRecords.push(r);
      }
    });

    return [...Object.values(parentRecords), ...singleRecords].sort((a, b) => new Date(b.tanggalDibuat) - new Date(a.tanggalDibuat));
  }, [nomorSuratRecords]);

  // Calculate the last used number for each tingkat
  const lastUsedNumbers = React.useMemo(() => {
    const lasts = {};
    TINGKAT_OPTIONS.forEach(tingkatOpt => {
      const recordsForTingkat = nomorSuratRecords.filter(r => r.tingkat === tingkatOpt.value);
      if (recordsForTingkat.length > 0) {
        const maxNomor = Math.max(...recordsForTingkat.map(r => parseInt(r.nomor.split('/')[0].split('.')[0])));
        lasts[tingkatOpt.value] = maxNomor;
      }
    });
    return lasts;
  }, [nomorSuratRecords]);

  const toggleExpanded = (recordId) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(recordId)) {
      newExpanded.delete(recordId);
    } else {
      newExpanded.add(recordId);
    }
    setExpandedRecords(newExpanded);
  };

  const handleSubmit = () => {
    handleSuratSubmit();
  };

  return React.createElement('div', { className: 'space-y-6' },
    React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-3 gap-6' },
      React.createElement('div', { className: 'lg:col-span-2' },
        currentUser.permissions?.surat?.generate && React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Generate Nomor Surat'),
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', null,
                React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-3' }, 'Kode Surat & Tingkat'),
                React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-6' },
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-xs font-semibold text-gray-600 mb-2' }, 'Kode Surat'),
                    React.createElement('div', { className: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2' },
                      KODE_SURAT_OPTIONS.map(kode => (
                        React.createElement('button', {
                          key: kode.value,
                          onClick: () => setNomorSuratForm({ ...nomorSuratForm, kode: kode.value }),
                          className: `p-2 rounded-lg border-2 text-center transition-all ${
                            nomorSuratForm.kode === kode.value
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-700'
                          }`
                        },
                          React.createElement('div', { className: 'font-semibold text-xs' }, kode.value),
                          React.createElement('div', { className: 'text-xs mt-1 opacity-75' }, kode.label.split(' - ')[1])
                        )
                      ))
                    )
                  ),
                  React.createElement('div', null,
                    React.createElement('div', { className: 'text-xs font-semibold text-gray-600 mb-2' }, 'Tingkat'),
                    React.createElement('div', { className: 'grid grid-cols-2 gap-2' },
                      TINGKAT_OPTIONS.map(tingkat => (
                        React.createElement('button', {
                          key: tingkat.value,
                          onClick: () => setNomorSuratForm({ ...nomorSuratForm, tingkat: tingkat.value }),
                          className: `p-3 rounded-lg border-2 text-center transition-all ${
                            nomorSuratForm.tingkat === tingkat.value
                              ? 'border-purple-600 bg-purple-50 text-purple-700'
                              : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 text-gray-700'
                          }`
                        },
                          React.createElement('div', { className: 'font-semibold text-sm' }, tingkat.label.split(' - ')[0]),
                          React.createElement('div', { className: 'text-xs mt-1 opacity-75' }, tingkat.label.split(' - ')[1])
                        )
                      ))
                    ),
                    React.createElement('div', { className: 'mt-4 space-y-2' },
                      React.createElement('label', { className: 'flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer ' + (nomorSuratForm.isMultiple ? 'border-purple-600 bg-purple-50' : 'border-gray-300') },
                        React.createElement('input', { type: 'checkbox', checked: nomorSuratForm.isMultiple, onChange: e => setNomorSuratForm({ ...nomorSuratForm, isMultiple: e.target.checked }), className: 'h-5 w-5 rounded text-purple-600 focus:ring-purple-500' }),
                        React.createElement('span', { className: 'font-semibold text-gray-800' }, 'Buat Surat Sekaligus?')
                      ),
                      nomorSuratForm.isMultiple && React.createElement('div', null,
                        React.createElement('div', { className: 'mt-2' },
                          React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Jumlah Surat'),
                          React.createElement('input', {
                            type: 'number',
                            value: nomorSuratForm.quantity,
                            onChange: e => setNomorSuratForm({ ...nomorSuratForm, quantity: parseInt(e.target.value) || 1 }),
                            className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg',
                            min: '2'
                          })
                        )
                      )
                    ),
                    React.createElement('div', { className: 'mt-4' },
                      React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Periode Surat'),
                      React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
                        React.createElement('select', { value: nomorSuratForm.bulan, onChange: e => setNomorSuratForm({ ...nomorSuratForm, bulan: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' },
                          React.createElement('option', { value: '' }, 'Bulan Ini'),
                          Object.entries(ROMAN_MONTHS).map(([num, roman]) => 
                            React.createElement('option', { key: num, value: num }, `${num} - ${roman}`)
                          )
                        ),
                        React.createElement('input', { type: 'number', placeholder: 'Tahun Ini', value: nomorSuratForm.tahun, onChange: e => setNomorSuratForm({ ...nomorSuratForm, tahun: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' })
                      ),
                      React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, 'Kosongkan untuk menggunakan bulan & tahun saat ini.')
                    ),
                    React.createElement('div', { className: 'mt-8' },
                      React.createElement('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Catatan (Opsional)'),
                      React.createElement('input', { type: 'text', value: nomorSuratForm.catatan, onChange: e => setNomorSuratForm({ ...nomorSuratForm, catatan: e.target.value }), onKeyPress: handleSuratKeyPress, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Contoh: Surat Undangan Rapat' })
                    )
                  )
                )
              ),
              React.createElement('button', { onClick: handleSubmit, className: 'w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all text-lg font-semibold shadow-lg' }, 'Generate Nomor Surat (Enter) ⚡'),
              currentUser.permissions?.surat?.generate && React.createElement('div', { className: 'text-center text-sm text-gray-500 mt-2' }, '💡 Nomor surat otomatis generate berdasarkan tingkat, sync ke Google Sheets otomatis di background')
            )
          ),
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6 mt-6' },
          React.createElement('h3', { className: 'text-xl font-bold text-gray-800 mb-4' }, '10 Nomor Surat Terakhir'),
            React.createElement('div', { className: 'space-y-2 max-h-96 overflow-y-auto' },
              groupedRecords.slice(0, 10).map(record => {
                const isParent = record.isParent;
                const parentId = isParent ? record.parentId : record.id;
                const isExpanded = expandedRecords.has(parentId);

                return React.createElement('div', { key: parentId, className: 'p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all' },
                  React.createElement('div', { className: 'cursor-pointer', onClick: () => toggleExpanded(parentId) },
                    React.createElement('div', { className: 'flex items-center justify-between' },
                      React.createElement('div', { className: 'flex-1' },
                        isParent ? (
                          React.createElement('div', { className: 'font-semibold text-gray-800' }, (() => {
                            const baseNomor = record.nomor.split('.')[0];
                            const namaSurat = KODE_SURAT_OPTIONS.find(opt => opt.value === record.kode)?.label.split(' - ')[1] || '';
                            const catatan = record.catatan;
                            return `${baseNomor}.x - ${namaSurat}${catatan ? ` - ${catatan}` : ''}`;
                          })())
                        ) : (
                          React.createElement('div', { className: 'flex items-center gap-3 flex-wrap' },
                            React.createElement('span', { className: 'font-semibold text-gray-800' }, record.nomor),
                            React.createElement('span', { className: 'text-gray-600' }, '•'),
                            React.createElement('span', { className: 'text-gray-600' }, record.kode)
                          )
                        ),
                        React.createElement('div', { className: 'text-sm text-gray-500 mt-1' }, new Date(record.tanggalDibuat).toLocaleString('id-ID'))
                      ),
                      React.createElement('div', { className: 'flex items-center gap-2' },
                        isParent && React.createElement('span', { className: 'bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-bold text-xs' }, `${record.children.length} surat`),
                        React.createElement('span', { className: 'bg-purple-100 text-purple-700 px-3 py-1 rounded-lg font-bold text-sm' }, record.tingkat),
                        React.createElement(ChevronDown, { size: 16, className: `text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}` })
                      )
                    )
                  ),
                  isExpanded && React.createElement('div', { className: 'mt-3 pt-3 border-t border-gray-200 space-y-2' },
                    isParent ? (
                      record.children.map(child =>
                        React.createElement('div', { key: child.id, className: 'flex justify-between text-sm p-2 bg-white rounded' },
                          React.createElement('span', { className: 'font-mono text-gray-700' }, child.nomor),
                          React.createElement('span', { className: 'text-gray-500 truncate' }, child.catatan)
                        )
                      )
                    ) : (
                      React.createElement(React.Fragment, null,
                        React.createElement('div', { className: 'grid grid-cols-2 gap-4 text-sm' },
                          React.createElement('div', null,
                            React.createElement('span', { className: 'font-semibold text-gray-600' }, 'Bulan: '),
                            React.createElement('span', { className: 'text-gray-800' }, `${record.bulan} (${ROMAN_MONTHS[record.bulan]})`)
                          ),
                          React.createElement('div', null,
                            React.createElement('span', { className: 'font-semibold text-gray-600' }, 'Tahun: '),
                            React.createElement('span', { className: 'text-gray-800' }, record.tahun)
                          )
                        ),
                        record.catatan && React.createElement('div', { className: 'text-sm' },
                          React.createElement('span', { className: 'font-semibold text-gray-600' }, 'Catatan: '),
                          React.createElement('span', { className: 'text-gray-800' }, record.catatan)
                        )
                      )
                    )
                  )
                );
              }),
              groupedRecords.length === 0 && React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Belum ada data nomor surat')
            )
          )
        ),
      React.createElement('div', { className: 'space-y-6' },
        React.createElement('div', { className: 'bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white' },
          React.createElement('h3', { className: 'text-lg font-semibold' }, 'Surat Hari Ini'),
          React.createElement('div', { className: 'text-4xl font-bold mt-2' }, nomorSuratRecords.filter(r => new Date(r.tanggalDibuat).toDateString() === new Date().toDateString()).length),
          React.createElement('div', { className: 'text-purple-200 mt-1' }, 'surat dibuat')
        ),
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-800' }, 'Total Keseluruhan'),
          React.createElement('div', { className: 'text-4xl font-bold text-gray-800' }, nomorSuratRecords.length),
          React.createElement('div', { className: 'text-gray-600 mt-1' }, 'surat dibuat')
        ),
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-800' }, 'Statistik per Tingkat'),
          React.createElement('div', { className: 'space-y-3' },
            TINGKAT_OPTIONS.map(tingkat => {
              const count = nomorSuratRecords.filter(r => r.tingkat === tingkat.value).length;
              return React.createElement('div', { key: tingkat.value, className: 'flex justify-between items-center' },
                React.createElement('span', { className: 'text-sm font-semibold text-gray-700' }, tingkat.label),
                React.createElement('span', { className: 'bg-green-100 text-green-700 px-3 py-1 rounded-lg font-bold' }, count)
              );
            })
          )
        ),
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
          React.createElement('div', { className: 'flex items-center justify-between mb-4' },
            currentUser.permissions?.surat?.settings && React.createElement('h3', { className: 'text-lg font-semibold text-gray-800' }, 'Pengaturan Nomor Surat'),
            !isSettingsEditing ? (
              React.createElement('button', {
                onClick: () => {
                  const initialEditState = {};
                  TINGKAT_OPTIONS.forEach(tingkat => {
                    initialEditState[tingkat.value] = lastUsedNumbers[tingkat.value] ?? nomorSuratSettings[tingkat.value] ?? 0;
                  });
                  setTempNomorSuratSettings(initialEditState);
                  setIsSettingsEditing(true);
                },
                className: 'bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-all'
              }, 'Edit Pengaturan') // Only show edit button if user has permission
            ) : (
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', { onClick: () => { apiSaveSettings(tempNomorSuratSettings); setNomorSuratSettings(tempNomorSuratSettings); setIsSettingsEditing(false); }, className: 'bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-all' }, 'Simpan'),
                React.createElement('button', { onClick: () => { setIsSettingsEditing(false); setTempNomorSuratSettings(nomorSuratSettings); }, className: 'bg-gray-300 text-gray-800 px-3 py-1 rounded-lg text-sm hover:bg-gray-400 transition-all' }, 'Batal')
              )
            )
          ),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', { className: 'text-sm text-gray-600 mb-3' }, 'Atur nomor terakhir untuk setiap tingkat:'),
            TINGKAT_OPTIONS.map(tingkat => (
              React.createElement('div', { key: tingkat.value, className: 'flex items-center justify-between' },
                React.createElement('span', { className: 'text-sm font-semibold text-gray-700' }, tingkat.label),
                React.createElement('input', {
                  type: 'number',
                  value: tempNomorSuratSettings[tingkat.value] ?? lastUsedNumbers[tingkat.value] ?? 0,
                  onChange: e => setTempNomorSuratSettings({ ...tempNomorSuratSettings, [tingkat.value]: parseInt(e.target.value) || 0 }),
                  className: `w-20 px-2 py-1 border-2 rounded-lg focus:outline-none text-center ${isSettingsEditing ? 'border-blue-300 focus:border-blue-600' : 'border-gray-300 bg-gray-100'}`,
                  min: '0',
                  disabled: !isSettingsEditing
                })
              )
            )),
            React.createElement('div', { className: 'text-xs text-gray-500 mt-2' }, 'Nomor berikutnya akan dimulai dari angka ini + 1')
          )
        )
      )
    )
  );
}
