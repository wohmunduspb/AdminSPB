'use strict';

// Utility functions for data processing and export

export function getTodayTotal(records) {
  const today = new Date().toDateString();
  return records
    .filter(r => new Date(r.date).toDateString() === today)
    .reduce((sum, r) => sum + r.quantity, 0);
}

/**
 * Calculates the total sales amount for the current day.
 * @param {Array<object>} records - The sales records.
 * @returns {number} The total sales amount for today.
 */
export function getTodaySalesTotal(records) {
  const today = new Date().toDateString();
  return records
    .filter(r => new Date(r.date).toDateString() === today)
    .reduce((sum, r) => sum + r.total, 0);
}
export function getFilteredRecords(records, filter) {
  return records.filter(record => {
    if (!record.date) return false; // Skip records with no date
    const recordDate = new Date(record.date);
    if (isNaN(recordDate.getTime())) return false; // Skip records with invalid date

    const matchName = !filter.name || record.name.toLowerCase().includes(filter.name.toLowerCase());
    const matchPurpose = !filter.purpose || record.purpose.toLowerCase().includes(filter.purpose.toLowerCase());
    
    const startDateObj = filter.startDate ? new Date(filter.startDate + 'T00:00:00') : null;
    const endDateObj = filter.endDate ? new Date(filter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    return matchName && matchPurpose && matchStartDate && matchEndDate;
  });
}

export function exportToCSV(filteredRecords, filename) {
  const headers = ['Tanggal', 'Nama', 'Kegunaan', 'Jumlah'];
  const csvData = filteredRecords.map(r => [r.dateDisplay, r.name, r.purpose, r.quantity]);
  let csv = headers.join(',') + '\n';
  csvData.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Aggregates paper usage statistics per user.
 * @param {Array<object>} filteredRecords - The records to analyze.
 * @returns {Array<[string, number]>} An array of [userName, totalQuantity] tuples, sorted descending.
 */
export function getUserStats(filteredRecords) {
  const stats = {};
  filteredRecords.forEach(record => { stats[record.name] = (stats[record.name] || 0) + record.quantity; });
  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

/**
 * Filters sales records based on a filter object.
 * @param {Array<object>} salesRecords - The array of sales records to filter.
 * @param {object} filter - The filter criteria { item, startDate, endDate }.
 * @returns {Array<object>} The filtered array of sales records.
 */
export function getSalesFilteredRecords(salesRecords, salesFilter) {
  return salesRecords.filter(record => {
    if (!record.date) return false;
    const recordDate = new Date(record.date);
    if (isNaN(recordDate.getTime())) return false;

    const matchItem = !salesFilter.item || record.item.toLowerCase().includes(salesFilter.item.toLowerCase());
    
    const startDateObj = salesFilter.startDate ? new Date(salesFilter.startDate + 'T00:00:00') : null;
    const endDateObj = salesFilter.endDate ? new Date(salesFilter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    return matchItem && matchStartDate && matchEndDate;
  });
}

/**
 * Exports an array of sales records to a CSV file.
 * @param {Array<object>} filteredRecords - The sales records to export.
 * @param {string} filename - The desired name for the CSV file.
 */
export function exportSalesToCSV(filteredRecords, filename) {
  const headers = ['Tanggal', 'Barang', 'Jumlah', 'Harga', 'Total'];
  const csvData = filteredRecords.map(r => [r.dateDisplay, r.item, r.quantity, r.price, r.total]);
  let csv = headers.join(',') + '\n';
  csvData.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Aggregates sales statistics per item.
 * @param {Array<object>} filteredRecords - The sales records to analyze.
 * @returns {Array<[string, number]>} An array of [itemName, totalSales] tuples, sorted descending.
 */
export function getSalesStats(filteredRecords) {
  const stats = {};
  filteredRecords.forEach(record => { stats[record.item] = (stats[record.item] || 0) + record.total; });
  return Object.entries(stats).sort((a, b) => b[1] - a[1]);
}

/**
 * Calculates the total sales for each of the last N days.
 * @param {Array<object>} salesRecords - The full list of sales records.
 * @param {number} [days=7] - The number of past days to include in the trend.
 * @returns {Array<{date: Date, total: number}>} An array of objects, each with a date and the total sales for that day.
 */
export function getSalesTrend(salesRecords, days = 7) {
  const trendData = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const salesOnDay = salesRecords
      .filter(r => {
        const recordDateStr = new Date(r.date).toISOString().split('T')[0];
        const targetDateStr = date.toISOString().split('T')[0];
        return recordDateStr === targetDateStr;
      })
      .reduce((sum, r) => sum + r.total, 0);

    trendData.push({ date, total: salesOnDay });
  }

  return trendData;
}

// --- Surat (Letter Number) Utilities ---
export const KODE_SURAT_OPTIONS = [
  { value: 'A.1', label: 'A.1 - Laporan Bulanan' },
  { value: 'A.2', label: 'A.2 - Laporan Kegiatan Sekolah' },
  { value: 'B', label: 'B - Surat Keterangan' },
  { value: 'C', label: 'C - Surat Pemberitahuan' },
  { value: 'D', label: 'D - Surat Pindah' },
  { value: 'E', label: 'E - Surat Keputusan' },
  { value: 'F', label: 'F - Surat Permohonan' },
  { value: 'G', label: 'G - Surat Izin' },
  { value: 'H', label: 'H - Surat Kesepakatan Kerja (MOU)' },
  { value: 'I', label: 'I - Surat Tugas' },
  { value: 'J', label: 'J - Surat Penghargaan' },
  { value: 'K', label: 'K - Surat Undangan' },
  { value: 'L', label: 'L - Surat Peringatan' },
  { value: 'M', label: 'M - Laporan Pertanggung Jawaban' },
  { value: 'N', label: 'N - Legalisir' },
  { value: 'O', label: 'O - Pernyataan' },
  { value: 'P', label: 'P - Surat Pengantar PKL' },
  { value: 'Q', label: 'Q - Surat Penjemputan PKL' },
  { value: 'R', label: 'R - Surat Penerimaan Pegawai Baru' },
  { value: 'T', label: 'T - Transkrip Nilai' }
];

export const TINGKAT_OPTIONS = [
  { value: 'I', label: 'I - SD' },
  { value: 'II', label: 'II - SMP' },
  { value: 'V', label: 'V - SMA' },
  { value: 'SPB', label: 'SPB - Umum' }
];

/**
 * Formats the 'tingkat' value for inclusion in a letter number.
 * @param {string} tingkat - The tingkat code (e.g., 'I', 'SPB').
 * @returns {string} The formatted tingkat string (e.g., 'I.PB', 'SPB').
 */
export function formatTingkatForNomor(tingkat) {
  const tingkatMap = {
    'I': 'I.PB',
    'II': 'II.PB',
    'V': 'V.PB',
    'SPB': 'SPB'
  };
  return tingkatMap[tingkat] || tingkat;
}

export const ROMAN_MONTHS = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
  7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
};

/**
 * Generates a complete letter number string based on the provided parts.
 * Format: <<NOMOR>>/<<TINGKAT>>.1/<<KODE>>/<<BULAN_ROMAWI>>/<<TAHUN>>
 * @param {string} kode - The letter code (e.g., 'A.1').
 * @param {string} tingkat - The level code (e.g., 'I').
 * @param {string|number} bulan - The month number.
 * @param {string|number} tahun - The year.
 * @param {number} nomorUrut - The sequential number for the letter.
 * @param {number|null} [subNomor=null] - An optional sub-number for batch-generated letters.
 * @returns {string} The fully formatted letter number.
 */
export function generateNomorSurat(kode, tingkat, bulan, tahun, nomorUrut, subNomor = null) {
  const bulanRomawi = ROMAN_MONTHS[parseInt(bulan)];
  const tingkatFormatted = formatTingkatForNomor(tingkat);
  let nomorFormatted = nomorUrut.toString().padStart(3, '0');
  if (subNomor) nomorFormatted += `.${subNomor}`;
  return `${nomorFormatted}/${tingkatFormatted}.1/${kode}/${bulanRomawi}/${tahun}`;
}

/**
 * Filters letter number records based on a filter object.
 * @param {Array<object>} nomorSuratRecords - The array of letter number records to filter.
 * @param {object} suratFilter - The filter criteria { kode, tingkat, startDate, endDate }.
 * @returns {Array<object>} The filtered array of records.
 */
export function getSuratFilteredRecords(nomorSuratRecords, suratFilter) {
  return nomorSuratRecords.filter(record => {
    // Handle both snake_case from DB and camelCase from UI state
    const dateValue = record.tanggal_dibuat || record.tanggalDibuat;
    if (!dateValue) return false;
    const recordDate = new Date(dateValue);
    if (isNaN(recordDate.getTime())) return false;

    const matchKode = !suratFilter.kode || record.kode === suratFilter.kode;
    const matchTingkat = !suratFilter.tingkat || record.tingkat === suratFilter.tingkat;
    
    const startDateObj = suratFilter.startDate ? new Date(suratFilter.startDate + 'T00:00:00') : null;
    const endDateObj = suratFilter.endDate ? new Date(suratFilter.endDate + 'T23:59:59') : null;

    const matchStartDate = !startDateObj || recordDate >= startDateObj;
    const matchEndDate = !endDateObj || recordDate <= endDateObj;

    return matchKode && matchTingkat && matchStartDate && matchEndDate;
  });
}

/**
 * Exports an array of letter number records to a CSV file.
 * @param {Array<object>} filteredRecords - The records to export.
 * @param {string} filename - The desired name for the CSV file.
 */
export function exportSuratToCSV(filteredRecords, filename) {
  const headers = ['Tanggal Dibuat', 'Kode', 'Tingkat', 'Nomor', 'Bulan', 'Tahun', 'Catatan'];
  const csvData = filteredRecords.map(r => [
    new Date(r.tanggalDibuat).toLocaleDateString('id-ID'),
    r.kode,
    r.tingkat,
    r.nomor,
    r.bulan,
    r.tahun,
    r.catatan || ''
  ]);
  let csv = headers.join(',') + '\n';
  csvData.forEach(row => { csv += row.map(cell => `"${cell}"`).join(',') + '\n'; });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

/**
 * Calculates the next sequential number for a new letter.
 * It finds the highest number used for the same tingkat, month, and year.
 * @param {Array<object>} nomorSuratRecords - The list of all existing letter number records.
 * @param {string} kode - The letter code.
 * @param {string} tingkat - The level code.
 * @param {string|number} bulan - The month number.
 * @param {string|number} tahun - The year.
 * @returns {number} The next available sequential number.
 */
export function getNextNomorUrut(nomorSuratRecords, kode, tingkat, bulan, tahun) {
  const filtered = nomorSuratRecords.filter(record =>
    record.tingkat === tingkat &&
    record.bulan === bulan &&
    record.tahun === tahun
  );
  if (filtered.length === 0) return 1;
  const maxNomor = Math.max(...filtered.map(r => parseInt(r.nomor.split('/')[0].split('.')[0])));
  return maxNomor + 1;
}

/**
 * Fetches an image from a URL and converts it to a Base64 data string.
 * @param {string} url - The URL of the image to convert.
 * @returns {Promise<string>} A promise that resolves with the Base64 string.
 */
export async function imageToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to Base64:', error);
    return '';
  }
}

/**
 * Hashes a password using the SHA-256 algorithm.
 * @param {string} password - The plain-text password to hash.
 * @returns {Promise<string>} A promise that resolves with the hexadecimal hash string.
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * The master definition of all permissions in the application.
 * This object is the single source of truth for what permissions exist.
 * The UI for settings is dynamically generated from this object.
 */
export const permissionDefinitions = {
  dashboard: {
    label: 'Dashboard',
    subPermissions: {
      view: 'Lihat Dashboard',
    },
  },
  transaksi: {
    label: 'Transaksi',
    subPermissions: {
      view: 'Lihat Menu Transaksi',
    },
    children: {
      sales: {
        label: 'Penjualan',
        subPermissions: {
          view: 'Lihat Penjualan',
          input: 'Input Penjualan',
          edit: 'Edit Transaksi',
          'delete': 'Hapus Transaksi',
          close_batch: 'Setor Penjualan',
        },
      },
      paper: {
        label: 'Kertas',
        subPermissions: {
          view: 'Lihat Kertas',
          input: 'Input Kertas',
        },
      },
      denda: {
        label: 'Denda',
        subPermissions: {
          view: 'Lihat Halaman Denda',
          input: 'Input & Simpan Denda',
          hapus: 'Hapus Data Denda',
        },
      },
    },
  },
  masterData: {
    label: 'Master Data',
    subPermissions: {
      view: 'Lihat Menu Master Data',
    },
    children: {
      teachers: {
        label: 'Daftar Guru',
        subPermissions: {
          view: 'Lihat Daftar Guru',
        },
      },
      students: {
        label: 'Daftar Siswa',
        subPermissions: {
          view: 'Lihat Daftar Siswa',
        },
      },
    }
  },
  persuratan: {
    label: 'Persuratan',
    subPermissions: {
      view: 'Lihat Menu Persuratan',
    },
    children: {
      surat: {
        label: 'Nomor Surat',
        subPermissions: {
          view: 'Lihat Nomor Surat',
          generate: 'Generate Nomor Surat',
          settings: 'Atur Nomor Surat',
        },
      },
      'generate_surat': {
        label: 'Generate Surat',
        subPermissions: {
          view: 'Lihat Pilihan Template',
          simk: 'Generate SIMK',
          sp: 'Generate SP',
        },
      },
    }
  },
  inventory: {
    label: 'Stok Barang',
    subPermissions: {
      view: 'Lihat Stok',
      add_stock: 'Tambah Stok',
      add_new_item: 'Tambah Barang Baru',
      correct_stock: 'Koreksi Stok'
    },
  },
  report: {
    label: 'Laporan',
    subPermissions: {
      view: 'Lihat Modul Laporan',
      paper: 'Laporan Kertas',
      sales: 'Laporan Penjualan',
      surat: 'Laporan Nomor Surat',
      denda: 'Laporan Denda',
      tunggakan_denda: 'Laporan Tunggakan Denda',
      simk: 'Laporan SIMK',
      inventory_log: 'Laporan Stok',
    },
  },
  settings: {
    label: 'Pengaturan',
    subPermissions: {
      view: 'Lihat Pengaturan',
      permissions: 'Atur Hak Akses',
      users: 'Manajemen Pengguna',
      trash: 'Lihat Tong Sampah',
      guru: 'Manajemen Guru',
    },
  },
  change_password: {
    label: 'Ubah Password',
    subPermissions: {
      view: 'Lihat Ubah Password',
    },
  },
};

/**
 * Generates a flat array of all granular permission keys (e.g., 'sales_view').
 * This is used to create headers for the permissions sheet.
 * @returns {string[]} An array of permission keys.
 */
export const getAllGranularPermissionKeys = () => {
  const keys = ['role'];
  for (const featureKey in permissionDefinitions) {
    for (const subPermKey in permissionDefinitions[featureKey].subPermissions) {
      keys.push(`${featureKey}_${subPermKey}`);
    }
  }
  return keys;
};
/**
 * Creates a default nested permission object for a new role.
 * @param {boolean} [allTrue=false] - If true, all permissions will be set to true. Otherwise, all will be false.
 * @returns {object} A nested permission object.
 */
export const createDefaultRolePermissions = (allTrue = false) => {
  const defaultPerms = {};
  Object.entries(permissionDefinitions).forEach(([featureKey, featureDef]) => {
    defaultPerms[featureKey] = {};
    for (const subPermKey in featureDef.subPermissions) {
      defaultPerms[featureKey][subPermKey] = allTrue;
    }
    if (featureDef.children) {
      Object.entries(featureDef.children).forEach(([childKey, childDef]) => {
        defaultPerms[childKey] = {};
        for (const subPermKey in childDef.subPermissions) {
          defaultPerms[childKey][subPermKey] = allTrue;
        }
      });
    }
  });
  return defaultPerms;
};

/**
 * Transforms a flat array of permission objects (from Google Sheets) into a nested object.
 * e.g., `[{ role: 'staff', sales_view: 'TRUE' }]` -> `{ staff: { sales: { view: true } } }`
 * @param {Array<object>} flatPermissionsArray - The array of flat permission objects.
 * @returns {object} A nested permission object, keyed by role.
 */
export const unflattenPermissions = (flatPermissionsArray) => {
  const nestedPermissions = {};
  flatPermissionsArray.forEach(flatPerm => {
    nestedPermissions[flatPerm.role] = {};
    for (const featureKey in permissionDefinitions) {
      nestedPermissions[flatPerm.role][featureKey] = {};
      for (const subPermKey in permissionDefinitions[featureKey].subPermissions) {
        const granularKey = `${featureKey}_${subPermKey}`;
        nestedPermissions[flatPerm.role][featureKey][subPermKey] = flatPerm[granularKey] === true || flatPerm[granularKey] === 'TRUE';
      }
    }
  });
  return nestedPermissions;
};

/**
 * Transforms a nested permission object into an array of objects suitable for saving to the database.
 * The permissions themselves are kept as a nested JSON object in the 'rules' property.
 * e.g., `{ staff: { sales: { view: true } } }` -> `[{ role: 'staff', rules: { sales: { view: true } } }]`
 * @param {object} nestedPermissions - The nested permission object.
 * @returns {Array<object>} An array of objects, each with a 'role' and a 'rules' (JSON) property.
 */
export const flattenPermissions = (nestedPermissions) => {
  return Object.entries(nestedPermissions).map(([role, rules]) => ({
    role: role,
    rules: rules,
  }));
};
