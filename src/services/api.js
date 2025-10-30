'use strict';

import { supabase } from '/src/services/supabaseClient.js';
import { permissionDefinitions, createDefaultRolePermissions } from '/src/utils/utils.js';

/**
 * Loads all essential initial data (users, permissions, settings, etc.) in a single, optimized API call.
 * @returns {Promise<Object>} A promise that resolves with all initial data.
 */
export async function apiLoadInitialData() {
  try {
    // Jalankan semua query secara paralel untuk efisiensi
    const [
      { data: users, error: usersError },
      { data: permissions, error: permissionsError },
      { data: inventory, error: inventoryError },
      { data: teachers, error: teachersError },
      { data: students, error: studentsError },
      { data: sales, error: salesError },
      { data: paper, error: paperError },
      { data: nomorSurat, error: nomorSuratError },
      { data: inventory_log, error: inventoryLogError },
      // { data: appSettings, error: settingsError }, // Pengaturan nomor surat sekarang di-handle di frontend
      { data: trash, error: trashError },
      { data: simk_records, error: simkError },
      { data: sp_records, error: spError },
      { data: denda, error: dendaError },
    ] = await Promise.all([
      supabase.from('users').select('username, role'), // Hanya ambil username dan role
      supabase.from('permissions').select('*'),
      supabase.from('inventory').select('*'),
      supabase.from('teachers').select('*'),
      supabase.from('students').select('*'),
      supabase.from('sales').select('*').order('date', { ascending: false }),
      supabase.from('paper_logs').select('*').order('date', { ascending: false }),
      supabase.from('nomor_surat').select('*').order('tanggal_dibuat', { ascending: false }),
      supabase.from('inventory_log').select('*').order('date', { ascending: false }),
      // supabase.from('app_settings').select('*'), // Tidak perlu lagi
      supabase.from('trash').select('*').order('deleted_at', { ascending: false }),
      supabase.from('simk_records').select('*').order('generated_at', { ascending: false }),
      supabase.from('sp_records').select('*').order('generated_at', { ascending: false }),
      supabase.from('denda').select('*').order('created_at', { ascending: false }),
    ]);

    // Cek jika ada error pada salah satu query
    if (usersError || permissionsError || inventoryError || teachersError || studentsError || salesError || paperError || nomorSuratError || inventoryLogError || trashError || simkError || spError || dendaError) {
      // Buat pesan error yang lebih deskriptif untuk debugging
      const errorDetails = [
        usersError && `users: ${usersError.message}`,
        permissionsError && `permissions: ${permissionsError.message}`,
        inventoryError && `inventory: ${inventoryError.message}`,
        teachersError && `teachers: ${teachersError.message}`,
        studentsError && `students: ${studentsError.message}`,
        salesError && `sales: ${salesError.message}`,
        paperError && `paper_logs: ${paperError.message}`,
        nomorSuratError && `nomor_surat: ${nomorSuratError.message}`,
        inventoryLogError && `inventory_log: ${inventoryLogError.message}`,
        // settingsError && `app_settings: ${settingsError.message}`,
        trashError && `trash: ${trashError.message}`,
        simkError && `simk_records: ${simkError.message}`,
        spError && `sp_records: ${spError.message}`,
        dendaError && `denda: ${dendaError.message}`,
      ].filter(Boolean).join('; '); // Saring nilai null dan gabungkan pesan
      throw new Error(`Failed to fetch initial data. Details: ${errorDetails}`);
    }
    
    // Proses 'permissions' menjadi format nested object yang diharapkan UI
    const nestedPermissions = permissions.reduce((acc, p) => { // p.rules already contains the nested structure
      acc[p.role] = p.rules || createDefaultRolePermissions(p.role === 'admin');
      return acc;
    }, {});

    // Kembalikan objek dengan struktur yang sama seperti yang diharapkan oleh app.js
    return {
      users,
      permissions: nestedPermissions,
      inventory,
      teachers,
      siswa: students, // Ganti nama 'students' menjadi 'siswa' agar cocok
      sales,
      paper,
      nomorSurat,
      inventory_log,
      settings: { SPB: 30, I: 26, II: 29, V: 22 }, // Hardcode settings untuk sementara
      trash,
      simk_records,
      sp_records,
      denda,
    };

  } catch (error) {
    console.error('Error in apiLoadInitialData:', error);
    throw error;
  }
}

/**
 * Authenticates a user against the backend.
 * @param {string} email - The user's email (digunakan sebagai username).
 * @param {string} password - The user's plain password. (Username dari form login)
 * @returns {Promise<Object|null>} The user object with nested permissions, or null if login fails.
 */
export async function apiLogin(username, plainPassword) {
  // 1. Cari user di tabel 'users' kita
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  const { hashPassword } = await import('../utils/utils.js');
  const hashedPassword = await hashPassword(plainPassword);

  if (userError || !user) {
    throw new Error('Username atau password salah.');
  }

  // 2. Bandingkan password (ini adalah cara sederhana, di production harus menggunakan hashing yang aman)
  if (user.password !== hashedPassword) {
    throw new Error('Username atau password salah.');
  }

  let nestedPermissions;

  if (user.role === 'admin') {
    // Jika role adalah 'admin', berikan semua hak akses secara otomatis.
    nestedPermissions = createDefaultRolePermissions(true);
  } else {
    // Untuk role lain, ambil hak akses dari database.
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from('permissions')
      .select('*')
      .eq('role', user.role)
      .single();

    if (permissionsError) throw permissionsError; // rolePermissions.rules already contains the nested structure
    nestedPermissions = rolePermissions.rules || createDefaultRolePermissions(false);
  }

  // Kembalikan objek user yang kompatibel dengan UI
  return {
    username: user.username,
    role: user.role,
    permissions: nestedPermissions
  };
}

// --- FUNGSI WRITE BARU ---

export async function apiSaveToSheetsBackground(record, sheet) {
  // Map sheet name to table name if different
  const tableName = sheet === 'paper' ? 'paper_logs' : sheet;

  // Hapus properti yang hanya ada di frontend sebelum mengirim ke DB
  const { dateDisplay, total, ...recordToInsert } = record;

  // Kirim data yang sudah bersih
  const { error } = await supabase.from(tableName).insert([recordToInsert]);

  if (error) console.error(`Error saving to ${tableName}:`, error);
}

export async function apiSavePermissions(permissions) {
  // `permissions` sekarang adalah array of objects { role: 'staff', rules: { sales: { view: true } } }
  const { error } = await supabase.from('permissions').upsert(permissions, { onConflict: 'role' });
  if (error) {
    console.error('Error saving permissions:', error);
    // Lemparkan error agar bisa ditangkap oleh UI jika perlu
    throw error;
  }
}

/**
 * Saves application settings to the 'app_settings' table.
 * @param {object} settings - The settings object to save.
 */
export async function apiSaveSettings(settings) {
  // Fungsi ini tidak lagi relevan karena settings di-handle di frontend
  console.warn('apiSaveSettings is deprecated. Settings are managed client-side.');
  if (error) console.error('Error saving settings:', error);
}

export async function apiSaveTeacher(teacherData) {
  const { error } = await supabase.from('teachers').upsert(teacherData, { onConflict: 'kode_guru' });
  if (error) console.error('Error saving teacher:', error);
}

export async function apiDeleteTeacher(kodeGuru) {
  const { error } = await supabase.from('teachers').delete().eq('kode_guru', kodeGuru);
  if (error) console.error('Error deleting teacher:', error);
}

export async function apiAddUser(newUser) {
  // Cukup insert ke tabel 'users' kita
  const { error } = await supabase.from('users').insert({
    username: newUser.username,
    password: newUser.password, // Password sudah di-hash di app.js
    role: newUser.role,
  });
  if (error) throw error;
}

export async function apiDeleteUser(username) {
  const { error } = await supabase.from('users').delete().eq('username', username);
  if (error) console.error('Error deleting user profile:', error);
}

export async function apiUpdatePassword(username, newPassword) {
    // Tabel 'users' menggunakan 'username' sebagai primary key.
    // Kita juga perlu mengirimkan password yang sudah di-hash jika implementasi hashing sudah ada.
    const { hashPassword } = await import('../utils/utils.js');
    const hashedPassword = await hashPassword(newPassword);
    const { error } = await supabase.from('users').update({ password: hashedPassword }).eq('username', username);
    if (error) throw error;
}

// Ganti fungsi-fungsi lain dengan pola yang sama
export const apiSaveNomorSurat = async (record) => {
  const { error } = await supabase.from('nomor_surat').insert([record]);
  if (error) console.error('Error saving letter number:', error);
};

export const apiSaveInventory = async (item) => {
  const { error } = await supabase.from('inventory').upsert(item, { onConflict: 'nama' });
  if (error) console.error('Error saving inventory:', error);
};

export const apiSaveInventoryLog = async (log) => {
    // Ganti nama properti 'user' menjadi 'username' agar cocok dengan tabel DB
    const { user, ...restOfLog } = log;
    const logToInsert = { ...restOfLog, username: user };

    const { error } = await supabase.from('inventory_log').insert([logToInsert]);
    if (error) console.error('Error saving inventory log:', error);
};

// Fungsi yang belum diimplementasikan (memerlukan tabel atau logika tambahan)
export const apiSaveSimk = async (record) => {
  const { error } = await supabase.from('simk_records').insert([record]);
  if (error) console.error('Error saving SIMK record:', error);
};

export const apiSaveSpRecord = async (record) => {
  const { error } = await supabase.from('sp_records').insert([record]);
  if (error) console.error('Error saving SP record:', error);
};

export const apiSaveDenda = async (record) => {
  const { error } = await supabase.from('denda').insert([record]);
  if (error) console.error('Error saving denda record:', error);
};

export const apiUpdateDendaStatus = async (id, status) => {
  const { error } = await supabase.from('denda').update({ status }).eq('id', id);
  if (error) console.error('Error updating denda status:', error);
};

export const apiDeleteDenda = async (id) => {
  const { error } = await supabase.from('denda').delete().eq('id', id);
  if (error) console.error('Error deleting denda record:', error);
};

export const apiDeleteRecord = async (id, sheet, item, quantity, deletedBy) => {
  // 1. Hapus dari tabel asli (misal: 'sales')
  const { data: recordToDelete, error: deleteError } = await supabase.from(sheet).delete().eq('id', id).select().single();
  if (deleteError) {
    console.error(`Error deleting record from ${sheet}:`, deleteError);
    return;
  }

  // 2. Masukkan ke tabel 'trash'
  const trashRecord = { ...recordToDelete, deleted_from: sheet, deleted_by: deletedBy, deleted_at: new Date().toISOString() };
  const { error: trashError } = await supabase.from('trash').insert(trashRecord);
  if (trashError) console.error('Error moving record to trash:', trashError);
};

export const apiRestoreRecord = async (record) => {
  // 1. Hapus dari 'trash'
  const { error: trashError } = await supabase.from('trash').delete().eq('id', record.id);
  if (trashError) {
    console.error('Error removing record from trash:', trashError);
    return;
  }

  // 2. Masukkan kembali ke tabel aslinya
  const { deleted_from, deleted_by, deleted_at, ...originalRecord } = record;
  const { error: restoreError } = await supabase.from(deleted_from).insert(originalRecord);
  if (restoreError) console.error(`Error restoring record to ${deleted_from}:`, restoreError);
};

export const apiCloseSalesBatch = async () => {
    const { error } = await supabase.from('sales').update({ status: 'disetor' }).eq('status', 'pending');
    if (error) console.error('Error closing sales batch:', error);
};

/**
 * Sends a request to the backend to clear the Google Apps Script server-side cache.
 * @returns {Promise<Object>}
 */
export const apiClearCache = () => {
  // Cache di-handle oleh Supabase, fungsi ini tidak relevan lagi.
  return Promise.resolve();
};
