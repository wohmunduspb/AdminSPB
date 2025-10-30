'use strict';

// Import API functions for backend communication.
import { apiLoadInitialData, apiSaveToSheetsBackground, apiDeleteRecord, apiLogin, apiSavePermissions, apiAddUser, apiDeleteUser, apiRestoreRecord, apiSaveSimk, apiCloseSalesBatch, apiSaveSpRecord, apiClearCache, apiSaveInventoryLog, apiSaveInventory, apiSaveTeacher, apiDeleteTeacher, apiUpdatePassword, apiSaveNomorSurat, apiSaveDenda, apiUpdateDendaStatus, apiDeleteDenda } from '/src/services/api.js';


import { getNextNomorUrut, generateNomorSurat, imageToBase64, hashPassword, ROMAN_MONTHS } from '/src/utils/utils.js';

import { Printer, FileText, Users, Plus, Mail, Cloud, RefreshCw, CheckCircle, Menu, AlertTriangle, FileWarning, Settings } from '/src/utils/icons.js';

import { Dashboard } from '/src/views/dashboard.js';

import { PaperView } from '/src/views/paperview.js';

import { SalesView } from '/src/views/salesview.js';

import { InventoryView } from '/src/views/inventoryview.js';

import { GenerateSuratView } from '/src/views/simkview.js';

import { LoginView } from '/src/views/loginview.js';

import { ReportView } from '/src/views/reportview.js';

import { SuratView } from '/src/views/suratview.js';

import { SettingsView } from '/src/views/SettingsView.js';

import { TeachersView } from '/src/views/TeachersView.js';

import { StudentsView } from '/src/views/StudentsView.js';

import { ChangePasswordView } from '/src/components/changepasswordview.js';

import { Modal } from '/src/components/Modal.js';

import { DendaView } from '/src/views/DendaView.js';

import { Sidebar } from '/src/components/Sidebar.js';

import { createHandlers } from '/src/utils/handlers.js';


const { useState, useEffect, useRef } = React;

/**
 * The main root component of the application.
 * It manages global state, routing, and data fetching for all sub-components.
 */
function PaperTrackerApp() {
  // --- STATE MANAGEMENT ---
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [users, setUsers] = useState([]);
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [records, setRecords] = useState([]);
  const [salesRecords, setSalesRecords] = useState([]);
  const [nomorSuratRecords, setNomorSuratRecords] = useState([]);
  const [inventoryLogRecords, setInventoryLogRecords] = useState([]);
  const [spRecords, setSpRecords] = useState([]);
  const [simkRecords, setSimkRecords] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [dendaRecords, setDendaRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ name: '', purpose: '', quantity: '' });
  const [salesFormData, setSalesFormData] = useState({ item: '', quantity: '', price: '' });
  const [nomorSuratForm, setNomorSuratForm] = useState({ kode: '', tingkat: '', bulan: '', tahun: '', catatan: '', isMultiple: false, quantity: 2 });
  const [inventory, setInventory] = useState([]); // Holds the list of all inventory items.
  const [inventoryForm, setInventoryForm] = useState({ nama: '', stok: '', harga: '' });
  const [addStock, setAddStock] = useState('');
  const [editingSaleRecord, setEditingSaleRecord] = useState(null);
  const [correctionRecord, setCorrectionRecord] = useState(null); // For stock correction modal
  const [correctionForm, setCorrectionForm] = useState({ newItemName: '', newQuantity: '', reason: '' });
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [filter, setFilter] = useState({ startDate: '', endDate: '', name: '', purpose: '' });
  
  // Initialize sales filter to default to today's date.
  const getTodayString = () => {
    const today = new Date();
    // Adjust for timezone to get the correct local date in YYYY-MM-DD format.
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    return today.toISOString().split('T')[0];
  };
  const [salesFilter, setSalesFilter] = useState({ startDate: getTodayString(), endDate: getTodayString(), item: '' });
  const [suratFilter, setSuratFilter] = useState({ startDate: '', endDate: '', kode: '', tingkat: '' });
  const [simkFilter, setSimkFilter] = useState({ startDate: '', endDate: '', nama: '' });
  const [dendaFilter, setDendaFilter] = useState({ startDate: '', endDate: '', student_name: '', status: '' });
  const [inventoryLogFilter, setInventoryLogFilter] = useState({ startDate: '', endDate: '', item: '', reason: '' });
  const [reportType, setReportType] = useState(null); // Determines which report to show in ReportView.
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // For 'settings' or 'change-password'
  const [nomorSuratSettings, setNomorSuratSettings] = useState({});
  // Refs for focusing input fields automatically.
  const nameInputRef = useRef(null);
  const customerInputRef = useRef(null);

  /**
   * Loads essential initial data like users, permissions, and settings.
   * This is called once after a successful login.
   */
  const loadInitialData = async () => {
    setLoading(true);
    setSyncing(true);
    try {
      // This single API call now fetches ALL necessary data for the app.
      const allData = await apiLoadInitialData();

      // Destructure and set state from the single data bundle.
      const { users, permissions, settings, inventory, teachers, inventory_log, paper, sales, nomorSurat, trash, simk_records, sp_records, siswa, denda } = allData;

      setUsers(users);
      setPermissions(permissions);
      setNomorSuratSettings(settings);
      setInventory(inventory);
  
      // Calculate student counts per class
      const studentCountByClass = (siswa || []).reduce((acc, student) => {
        if (student.kelas) {
          acc[student.kelas] = (acc[student.kelas] || 0) + 1;
        }
        return acc;
      }, {});
  
      // Process teacher data to ensure correct types and add dynamic student count
      const processedTeachers = (teachers || []).map((teacher, index) => {
        const waliKelas = teacher.wali_kelas || teacher.waliKelas; // Fallback for wali_kelas
        const studentCount = waliKelas ? studentCountByClass[waliKelas] || 0 : (teacher.total_siswa || teacher.totalSiswa);
        return { ...teacher,
          no: index + 1, // Add sequential number for display
          kode_guru: String(teacher.kode_guru || teacher.kodeGuru || teacher.kode || ''), // Ensure snake_case
          kodeGuru: String(teacher.kode_guru || teacher.kodeGuru || teacher.kode || ''), // Add camelCase for UI consistency
          namaGuru: teacher.nama_guru || teacher.namaGuru || teacher.nama || 'Nama Tidak Ditemukan', // Use camelCase for UI consistency
          waliKelas: waliKelas, // Ensure waliKelas is correctly mapped
          totalSiswa: studentCount // Update totalSiswa based on calculation
        };
      });
      setTeachers(processedTeachers);
  
      setInventoryLogRecords(inventory_log);
      // Process student data to ensure correct types and handle special property keys from the backend.
      const processedStudents = (siswa || []).map((student, index) => ({
        no: index + 1, // Add sequential number for display
        noSiswa: String(student.no_siswa || student.noSiswa || ''), // from no_siswa
        nama: student.nama, // from nama
        kelas: student.kelas, // from kelas
        jk: student.jenis_kelamin || student.jenisKelamin, // from jenis_kelamin
        agama: student.agama, // from agama
        tahunAjaran: student.tahun_ajaran || student.tahunAjaran, // from tahun_ajaran
        status: student.status // from status
      }));
      setStudents(processedStudents);
      setRecords(paper || []); 
  
      // Process sales records to add 'total' and 'dateDisplay' properties.
      const processedSales = (sales || []).map(record => {
        const price = Number(record.price) || 0;
        const quantity = Number(record.quantity) || 0;
        return { ...record, price, quantity, total: price * quantity, dateDisplay: record.date ? new Date(record.date).toLocaleString('id-ID') : 'Invalid Date' };
      });
      setSalesRecords(processedSales); 
  
      setNomorSuratRecords(nomorSurat || []);
      setTrash(trash || []);
      setSimkRecords(simk_records || []);
      setSpRecords(sp_records || []);
      setDendaRecords(denda || []);

    } catch (error) { 
      console.error('Error loading initial data:', error);
      alert('Gagal memuat data awal. Cek koneksi internet dan coba lagi.');
    } finally {
      setLoading(false);
      setSyncing(false);
      setLastSync(new Date());
    }
  };

  /**
   * Saves a new record to the backend and then silently refreshes data.
   * @param {object} newRecord - The record to save.
   * @param {string} [type='paper'] - The sheet name (e.g., 'paper', 'sales').
   */
  const saveToSheetsBackground = async (newRecord, type = 'paper') => {
    await apiSaveToSheetsBackground(newRecord, type);
    await loadInitialData(); // Reload all data efficiently after a save.
  };

  /**
   * Effect to check for a logged-in user in sessionStorage on app start.
   * If found, it sets the user state and loads all necessary data.
   */
  useEffect(() => {
    const loggedInUserJSON = sessionStorage.getItem('currentUser');
    if (loggedInUserJSON) {
      const user = JSON.parse(loggedInUserJSON);

      // --- NEW: Environment Enforcement ---
      // If the user is not an admin, force the production environment.
      if (user.role !== 'admin' && localStorage.getItem('supabaseEnv') !== 'prod') {
        localStorage.setItem('supabaseEnv', 'prod');
        // Reload the page to connect to the correct Supabase instance.
        window.location.reload();
        return; // Stop further execution until the page reloads.
      }
      // --- END: Environment Enforcement ---

      setCurrentUser(user);
      loadInitialData(); // Proceed with loading data now that the environment is correct.
    }
  }, []);

  useEffect(() => {
    // Auto-focus the primary input field when switching views.
    if (currentView === 'paper' && nameInputRef.current) {
      setTimeout(() => nameInputRef.current.focus(), 100);
    } else if (currentView === 'sales' && customerInputRef.current) {
      customerInputRef.current.focus();
    }
  }, [currentView]);

  /**
   * Handles the user login process.
   * @param {string} username - The entered username.
   * @param {string} password - The entered password.
   */
  const handleLogin = async (username, password) => {
    setLoading(true);
    setAuthError('');

    try {
      // Dengan Supabase, kirim email (sebagai username) dan password mentah.
      // Hashing tidak lagi dilakukan di frontend.
      const user = await apiLogin(username, password);

      // --- NEW: Environment Enforcement on Login ---
      // If the logged-in user is not an admin, force the production environment.
      if (user && user.role !== 'admin' && localStorage.getItem('supabaseEnv') !== 'prod') {
        localStorage.setItem('supabaseEnv', 'prod');
        window.location.reload(); // Reload to apply the new environment.
        return;
      }

      if (user) {
        const permissionsFromApi = user.permissions;
        setCurrentUser({
          ...user,
          permissions: permissionsFromApi
        });
        // Update the global permissions state.
        setPermissions(prev => ({ ...prev, [user.role]: permissionsFromApi }));
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        await loadInitialData();
      } else {
        setAuthError('Username atau password salah.');
        setLoading(false);
      }
    } catch (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  /**
   * Logs the user out by clearing state and sessionStorage.
   */
  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    setCurrentView('dashboard'); // Reset view to dashboard on logout
    setReportType(null); // Reset selected report type
  };

  /**
   * Handles the password change request from the ChangePasswordView.
   * @param {string} oldPassword - The user's current password.
   * @param {string} newPassword - The desired new password.
   */
  const handleChangePassword = async (oldPassword, newPassword) => {
    if (currentUser.role !== 'admin' && !currentUser.permissions?.change_password?.view) {
      alert('Anda tidak memiliki izin untuk mengubah password.'); return;
    }
    // Verifikasi password lama dengan mencoba login kembali
    await apiLogin(currentUser.username, oldPassword);

    // Jika berhasil, update password user yang sedang login menggunakan username-nya
    await apiUpdatePassword(currentUser.username, newPassword);

    setActiveModal(null);
    alert('Password berhasil diubah! Silakan login kembali.');
    handleLogout();
  };

  /**
   * Performs a hard refresh by clearing the server-side cache and reloading all data.
   * This is useful if data on the sheet is manually changed and not reflecting in the app.
   */
  const handleHardRefresh = async () => {
    setSyncing(true);
    try {
      await apiClearCache(); // Clear server cache first
      await loadInitialData(); // Reload all initial data
    } catch (error) {
      console.error('Error during hard refresh:', error);
      alert('Gagal melakukan refresh data.');
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Saves the updated permission settings.
   * @param {Array<object>} newPermissions - A flattened array of permission objects.
   */
  const handleSavePermissions = async (newPermissions) => {
    if (!currentUser.permissions?.settings?.permissions) {
      alert('Anda tidak memiliki izin untuk menyimpan pengaturan hak akses.'); return;
    }
    await apiSavePermissions(newPermissions);
  };

  /**
   * Adds a new user to the system.
   * @param {object} newUser - The new user's details { username, password, role }.
   */
  const handleAddUser = async (newUser) => {
    if (!currentUser.permissions?.settings?.users) { alert('Anda tidak memiliki izin untuk menambah pengguna.'); return; }
    if (users.some(u => u.username === newUser.username)) {
      alert(`Pengguna dengan username "${newUser.username}" sudah ada.`);
      return;
    }
    // Di Supabase, kita perlu email. Kita bisa gunakan username + domain dummy.
    const userToCreate = { ...newUser, email: `${newUser.username}@gunakertas.local` };

    // Hash the password before sending it to the API
    const hashedPassword = await hashPassword(userToCreate.password);

    await apiAddUser({ ...userToCreate, password: hashedPassword });

    // Optimistically update the UI to show the new user immediately.
    setUsers(prev => [...prev, { username: userToCreate.username, role: userToCreate.role }].sort((a, b) => a.username.localeCompare(b.username)));
  };

  /**
   * Deletes a user from the system.
   * @param {string} username - The username of the user to delete.
   */
  const handleDeleteUser = async (username) => {
    if (!currentUser.permissions?.settings?.users) { alert('Anda tidak memiliki izin untuk menghapus pengguna.'); return; }
    await apiDeleteUser(username);
    // Optimistically update the UI.
    setUsers(prev => prev.filter(u => u.username !== username));
  };

  /**
   * Adds a new teacher or updates an existing one.
   * @param {object} teacherData - The teacher's data.
   * @param {object|null} originalTeacher - The original teacher object if in edit mode.
   */
  const handleSaveTeacher = async (teacherData, originalTeacher) => {
    if (currentUser.role !== 'admin' && !currentUser.permissions?.settings?.guru) { alert('Anda tidak memiliki izin untuk mengelola data guru.'); return; }
    
    if (originalTeacher) {
      // Update mode
      setTeachers(prev => prev.map(t => t.kodeGuru === originalTeacher.kodeGuru ? teacherData : t));
    } else {
      // Add new mode
      if (teachers.some(t => t.kodeGuru === teacherData.kodeGuru)) {
        alert(`Guru dengan Kode Guru "${teacherData.kodeGuru}" sudah ada.`);
        return;
      }
      const newNo = teachers.length > 0 ? Math.max(...teachers.map(t => t.no)) + 1 : 1;
      const newTeacher = { ...teacherData, no: newNo, totalSiswa: teacherData.totalSiswa || 0 };
      setTeachers(prev => [...prev, newTeacher].sort((a, b) => a.no - b.no));
    }
    await apiSaveTeacher(teacherData);
  };

  /**
   * Deletes a teacher from the system.
   * @param {string} kodeGuru - The unique code of the teacher to delete.
   */
  const handleDeleteTeacher = async (kodeGuru) => {
    if (currentUser.role !== 'admin' && !currentUser.permissions?.settings?.guru) { alert('Anda tidak memiliki izin untuk menghapus data guru.'); return; }
    setTeachers(prev => prev.filter(t => t.kodeGuru !== kodeGuru));
    await apiDeleteTeacher(kodeGuru);
  };

  /**
   * Saves a new late fee record.
   * @param {object} dendaData - The late fee data to save.
   */
  const handleSaveDenda = async (dendaData) => {
    if (currentUser.role !== 'admin' && !currentUser.permissions?.denda?.input) {
      alert('Anda tidak memiliki izin untuk mencatat denda.');
      return;
    }
    setDendaRecords(prev => [dendaData, ...prev].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    await apiSaveDenda(dendaData);
  };

  /**
   * Updates the status of a late fee record.
   * @param {number} dendaId - The ID of the fee record to update.
   * @param {string} newStatus - The new status (e.g., 'Sudah Bayar').
   */
  const handleUpdateDendaStatus = async (dendaId, newStatus) => {
    setDendaRecords(prev => prev.map(d => d.id === dendaId ? { ...d, status: newStatus } : d));
    await apiUpdateDendaStatus(dendaId, newStatus);
  };

  /**
   * Deletes a late fee record.
   * @param {number} dendaId - The ID of the fee record to delete.
   */
  const handleDeleteDenda = async (dendaId) => {
    const canDelete = currentUser.role === 'admin' || currentUser.permissions?.denda?.hapus;
    if (!canDelete) {
      alert('Anda tidak memiliki izin untuk menghapus data denda.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus catatan denda ini? Aksi ini tidak dapat dibatalkan.')) {
      setDendaRecords(prev => prev.filter(d => d.id !== dendaId));
      await apiDeleteDenda(dendaId);
    }
  };


  const handleEditSale = (saleRecord) => {
    setEditingSaleRecord(saleRecord);
    setSalesFormData({ ...saleRecord });
  };

  /**
   * Deletes a sales record, moves it to the trash, and restores the item stock.
   * @param {string|number} id - The ID of the sales record to delete.
   * @param {string} item - The name of the item sold.
   * @param {number} quantity - The quantity of the item sold.
   */
  const handleDeleteSale = async (id, item, quantity) => {
    if (!currentUser.permissions?.sales?.delete) { alert('Anda tidak memiliki izin untuk menghapus transaksi penjualan.'); return; }
    if (!confirm(`Apakah Anda yakin ingin menghapus transaksi penjualan ${item} (ID: ${id})?`)) {
      return;
    }

    const recordToDelete = salesRecords.find(record => record.id === id);
    if (!recordToDelete) return;

    // Optimistically update the UI by moving the record to the trash state.
    const recordToTrash = { ...recordToDelete, deletedFrom: 'sales', deletedBy: currentUser.username, deletedAt: new Date().toISOString() };
    setSalesRecords(prev => prev.filter(r => r.id !== id));
    setTrash(prev => [recordToTrash, ...prev]);
    
    // --- INVENTORY RESTORE LOGIC ---
    const itemToRestore = inventory.find(invItem => invItem.nama === item);
    if (itemToRestore) {
      const updatedItem = { ...itemToRestore, stok: itemToRestore.stok + quantity };
      setInventory(prev => prev.map(invItem => invItem.nama === item ? updatedItem : invItem));
      apiSaveInventory(updatedItem); // Save the updated stock to the backend
    }

    const logRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      item: item,
      change: `+${quantity}`, // Use template literal for clarity
      reason: `Hapus Penjualan (ID: ${id})`,
      user: currentUser.username
    };
    apiSaveInventoryLog(logRecord);
    // Call the backend API to perform the actual deletion and inventory update.
    await apiDeleteRecord(id, 'sales', item, quantity, currentUser.username);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  /**
   * Restores a sales record from the trash and deducts the item stock accordingly.
   * @param {object} record - The record object to restore from the trash.
   */
  const handleRestoreSale = async (record) => {
    if (!currentUser.permissions?.settings?.trash) { alert('Anda tidak memiliki izin untuk memulihkan data dari tong sampah.'); return; }
    // Optimistically update the UI.
    setTrash(prev => prev.filter(r => r.id !== record.id));
    setSalesRecords(prev => [record, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

    const logRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      item: record.item,
      change: `-${record.quantity}`, // Use template literal for clarity
      reason: 'Pulihkan Penjualan',
      user: currentUser.username
    };
    apiSaveInventoryLog(logRecord);

    // Call the backend API to perform the restoration.
    await apiRestoreRecord(record);
    await loadInitialData();
  };

  /**
   * Handles the submission of a stock correction. It creates reversing and correcting entries
   * to maintain a clear audit trail, rather than editing old records.
   * @param {object} originalRecord - The original inventory log record being corrected.
   * @param {object} correctionData - The correction data { newItemName, newQuantity, reason }.
   */
  const handleStockCorrection = async (originalRecord, correctionData) => {
    const originalChange = parseFloat(originalRecord.change);
    const newQuantity = parseInt(correctionData.newQuantity);
    const newItemName = correctionData.newItemName || originalRecord.item;

    if (isNaN(originalChange) || isNaN(newQuantity)) {
      alert('Jumlah tidak valid.');
      return;
    }

    // --- 1. Reversing Entry: Cancel the original change on the old item ---
    const reversingChange = -originalChange;
    const oldItem = inventory.find(item => item.nama === originalRecord.item);
    if (!oldItem) { alert(`Barang lama "${originalRecord.item}" tidak ditemukan.`); return; }

    const reversingLog = {
      id: Date.now(),
      date: new Date().toISOString(),
      item: oldItem.nama,
      change: (reversingChange > 0 ? '+' : '') + reversingChange,
      reason: `Koreksi (Batal): ${correctionData.reason} (Ref ID: ${originalRecord.id})`,
      user: currentUser.username,
    };
    const updatedOldItem = { ...oldItem, stok: oldItem.stok + reversingChange };

    // --- 2. Correcting Entry: Apply the new quantity to the (potentially new) item ---
    const newItem = inventory.find(item => item.nama === newItemName);
    if (!newItem) { alert(`Barang baru "${newItemName}" tidak ditemukan.`); return; }

    const correctingLog = {
      id: reversingLog.id + 1, // Ensure unique ID
      date: new Date().toISOString(),
      item: newItem.nama,
      change: (newQuantity > 0 ? '+' : '') + newQuantity,
      reason: `Koreksi (Benar): ${correctionData.reason} (Ref ID: ${originalRecord.id})`,
      user: currentUser.username,
    };

    // Calculate the final stock for the new item. If it's the same item, start from the updatedOldItem stock.
    const finalNewStock = (newItem.nama === oldItem.nama)
      ? updatedOldItem.stok + newQuantity
      : newItem.stok + newQuantity;
    const updatedNewItem = { ...newItem, stok: finalNewStock };

    // --- 3. Update State and API ---
    setInventory(prev => prev.map(item => {
      if (item.nama === updatedOldItem.nama) return updatedOldItem;
      if (item.nama === updatedNewItem.nama) return updatedNewItem;
      return item;
    }));
    // If the item is the same, we only need to update it once in the inventory state.
    if (updatedOldItem.nama === updatedNewItem.nama) {
      setInventory(prev => prev.map(item => item.nama === updatedNewItem.nama ? updatedNewItem : item));
    }

    setInventoryLogRecords(prev => [correctingLog, reversingLog, ...prev]);
    await Promise.all([apiSaveInventory(updatedOldItem), apiSaveInventory(updatedNewItem), apiSaveInventoryLog(reversingLog), apiSaveInventoryLog(correctingLog)]);
  };

  /**
   * Generates a SIMK (Surat Izin Mengikuti Kegiatan) letter.
   * This involves generating a new letter number, saving it, and then creating the printable HTML.
   * @param {object} simkFormData - The form data for the SIMK letter.
   */
  const handleSimkGenerate = async (simkFormData) => {
    if (!currentUser.permissions?.generate_surat?.simk) { alert('Anda tidak memiliki izin untuk generate SIMK.'); return; }
    const bulan = new Date().getMonth() + 1;
    const tahun = new Date().getFullYear();
    const kode = 'I'; // Kode 'I' untuk Surat Izin
    const tingkat = 'SPB'; // Force 'SPB' (Umum) for all SIMK letters

    const existingNomorUrut = getNextNomorUrut(nomorSuratRecords, kode, tingkat, bulan, tahun);
    const baseNomor = nomorSuratSettings[tingkat] || 0;
    const nomorUrut = Math.max(existingNomorUrut, baseNomor + 1);
    const nomorSuratBaru = generateNomorSurat(kode, tingkat, bulan, tahun, nomorUrut);

    const catatan = simkFormData.teachers.length > 1 ? `SIMK untuk ${simkFormData.teachers.length} guru` : `SIMK untuk ${simkFormData.teachers[0].namaGuru}`;

    // Create and save the new letter number record.
    const newNomorSuratRecord = {
      id: Date.now(),
      nomor: nomorSuratBaru,
      kode,
      tingkat,
      bulan,
      tahun,
      catatan: catatan,
      tanggal_dibuat: new Date().toISOString() // Fix: Use snake_case for database column
    };
    await apiSaveNomorSurat(newNomorSuratRecord); // Save to DB
    setNomorSuratRecords(prev => [newNomorSuratRecord, ...prev]); // Update UI after successful save
    // Fetch the HTML template for the letter.
    const response = await fetch('../assets/templates/SIMK.html');
    let template = await response.text();

    const logoBase64 = await imageToBase64('../assets/templates/logo.png');


    let daftarGuruHtml = '';
    simkFormData.teachers.forEach((teacher, index) => {
      daftarGuruHtml += `
        <tr>
            <td colspan="2" style="width: 30%; vertical-align: top;">
                &nbsp;&nbsp;&nbsp;${index + 1}. Nama<br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Jabatan
            </td>
            <td style="width: 2%;" valign="top">:</td>
            <td>
                ${teacher.namaGuru || teacher.nama}<br>
                ${teacher.jabatan || '-'}
            </td>
        </tr>`;
    });

    // Format the date string based on whether it's a single or multi-day event.
    let tanggalKegiatan;
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const tanggalMulai = new Date(simkFormData.hariTanggal);

    if (simkFormData.isMultiDay && simkFormData.hariTanggalSelesai) {
      const tanggalSelesai = new Date(simkFormData.hariTanggalSelesai);
      tanggalKegiatan = `${tanggalMulai.toLocaleDateString('id-ID', options)} s.d. ${tanggalSelesai.toLocaleDateString('id-ID', options)}`;
    } else {
      tanggalKegiatan = tanggalMulai.toLocaleDateString('id-ID', options);
    }

    // Replace placeholders in the HTML template with actual data.
    let placeholders = {
      '«Logo_Image»': logoBase64,
      '«No_Surat»': nomorSuratBaru,
      '«Daftar_Guru»': daftarGuruHtml, // Sisipkan blok HTML guru
      '«Acara»': simkFormData.acara,
      '«Penyelenggara»': simkFormData.penyelenggara,
      '«Tempat»': simkFormData.tempat,
      '«HariTanggal»': tanggalKegiatan,
      '«Jam»': simkFormData.jam,
      '«Tanggal_TTD»': new Date(simkFormData.tanggalTtd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      '«yg_TTD»': simkFormData.ygTtd
    };

    Object.keys(placeholders).forEach(key => {
      template = template.replace(new RegExp(key, 'g'), placeholders[key]);
    });

    // --- NEW LOGIC: Combine dates for multi-day events ---
    let hariTanggalUntukDB;
    if (simkFormData.isMultiDay && simkFormData.hariTanggalSelesai) {
      // Format: "YYYY-MM-DD s.d. YYYY-MM-DD"
      hariTanggalUntukDB = `${simkFormData.hariTanggal} s.d. ${simkFormData.hariTanggalSelesai}`;
    } else {
      hariTanggalUntukDB = simkFormData.hariTanggal;
    }

    // Map frontend data (camelCase) to backend schema (snake_case)
    const recordToSave = {
      acara: simkFormData.acara,
      penyelenggara: simkFormData.penyelenggara,
      tempat: simkFormData.tempat,
      hari_tanggal: hariTanggalUntukDB, // Use the combined date string
      jam: simkFormData.jam,
      tanggal_ttd: simkFormData.tanggalTtd,
      yg_ttd: simkFormData.ygTtd,
      nama: simkFormData.teachers.map(t => t.namaGuru).join(', '),
      teacher_code: simkFormData.teachers.map(t => t.kode_guru).join(', '), // Fix: Use snake_case property
      teachers: JSON.stringify(simkFormData.teachers.map(({ no, totalSiswa, ...rest }) => rest)), // Remove UI-only properties before saving
      jabatan: simkFormData.teachers.map(t => t.jabatan).join(', '),
      tingkat: tingkat,
      nomor_surat: nomorSuratBaru, // Fix: snake_case
      generated_at: new Date().toISOString() // Fix: snake_case
    };
    // Update local state with a structure that matches the data from the database for consistency in reports.
    // The UI/Report component expects camelCase properties.
    const recordForUI = {
      ...simkFormData, // Start with original form data
      nama: recordToSave.nama, // Overwrite with joined names
      nomor_surat: nomorSuratBaru,
      nomorSurat: nomorSuratBaru, // Add camelCase version for UI
      generated_at: recordToSave.generated_at,
      generatedAt: recordToSave.generated_at, // Add camelCase version for UI
      teachers: recordToSave.teachers, // Keep the JSON string
    };
    setSimkRecords(prev => [recordForUI, ...prev]);

    // Send the snake_case object to the database
    await apiSaveSimk(recordToSave);

    const printWindow = window.open('', '_blank');
    printWindow.document.write(template);
    printWindow.document.close();
    printWindow.focus();
    // Optional: printWindow.print();
  };

  /**
   * Generates a batch of SP (Surat Peringatan) letters from uploaded Excel data.
   * @param {object} payload - The data payload, including batch data and form options.
   * @param {boolean} [previewOnly=false] - If true, returns the HTML string for preview instead of printing.
   * @returns {Promise<string>} The generated HTML if `previewOnly` is true.
   */
  const handleSpBatchGenerate = async (payload, previewOnly = false) => {
    if (!currentUser.permissions?.generate_surat?.sp) { alert('Anda tidak memiliki izin untuk generate SP.'); return; }
    const { batchData, suratPeringatan, tanggalSurat } = payload;

    if (!batchData || batchData.length === 0 || !suratPeringatan || !tanggalSurat) {
      alert("Tidak ada data untuk diproses.");
      return '';
    }
    
    setSyncing(true);
    try {
      const templateResponse = await fetch('../assets/templates/SP.html');

      const fullTemplateHtml = await templateResponse.text();

      // Extract styles and body content to build a valid multi-page HTML document.
      const styleRegex = /<style[^>]*>([\s\S]*)<\/style>/i;
      const bodyRegex = /<body[^>]*>([\s\S]*)<\/body>/i;
      const styleMatch = fullTemplateHtml.match(styleRegex);
      const bodyMatch = fullTemplateHtml.match(bodyRegex);

      const styles = styleMatch ? styleMatch[0] : ''; // The full <style>...</style> block
      const template = bodyMatch ? bodyMatch[1] : ''; // The content inside <body>

      const logoBase64 = await imageToBase64('../assets/templates/logo.png');
      const ttdBase64 = await imageToBase64('../assets/templates/ttd_valeryan.png');


      const selectedDate = new Date(tanggalSurat);
      const formattedDate = selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', 'year': 'numeric' });
      const monthForNomorSurat = selectedDate.getMonth() + 1;
      const bulanRomawi = ROMAN_MONTHS[monthForNomorSurat] || 'I';

      let allLettersHtml = '';

      for (const [index, spFormData] of batchData.entries()) {
        // "Surat Peringatan Pertama" -> "1"
        const spNumberText = suratPeringatan.match(/\d+/g) || ['1'];
        const fullLetterNumber = `${spFormData.no}/SPB/${spNumberText[0]}/${bulanRomawi}/2025`;

        const placeholders = {
          '«Logo_Image»': logoBase64,
          '«ttdVale»': ttdBase64,
          // Use the number from the Excel file
          '«suratperingatan»': suratPeringatan,
          '«tanggal_surat»': formattedDate,
          '«No_Surat»': fullLetterNumber,
          '«Jenjang»': spFormData.jenjang,
          '«Nama»': spFormData.nama,
          '«kelas»': spFormData.kelas,
          '«bulan»': spFormData.bulan,
          '«NILAI»': spFormData.nilai.endsWith(',-') ? spFormData.nilai.slice(0, -2) : spFormData.nilai,
          '«Kelas»': spFormData.kelas,
        };

        let letterHtml = (' ' + template).slice(1);
        Object.keys(placeholders).forEach(key => {
          letterHtml = letterHtml.replace(new RegExp(key, 'g'), placeholders[key]);
        });

        // Use a wrapper div to ensure correct page breaks when printing.
        allLettersHtml += `<div style="page-break-after: always;">${letterHtml}</div>`;
      }

      if (previewOnly) {
        setSyncing(false);
        return `<html><head><meta charset="UTF-8">${styles}</head><body>${allLettersHtml}</body></html>`;
      }

    } catch (error) {
      console.error("Error during batch SP generation:", error);
      alert("Terjadi kesalahan saat membuat surat massal.");
    } finally {
      setSyncing(false);
    }
  };

  /**
   * Re-generates and opens a print dialog for a previously created SIMK letter.
   * @param {object} record - The SIMK record to reprint.
   */
  const handleReprintSimk = async (record) => {
    let teachersList = [];
    try {
      teachersList = JSON.parse(record.teachers);
    } catch (e) {
      // Fallback for older records that might not have the 'teachers' JSON string.
      teachersList = [{ nama: record.nama, jabatan: record.jabatan || '-' }];
    }

    const response = await fetch('../assets/templates/SIMK.html');

    let template = await response.text();

    const logoBase64 = await imageToBase64('../assets/templates/logo.png');


    // Re-generate the teacher list HTML block.
    let daftarGuruHtml = '';
    teachersList.forEach((teacher, index) => {
      daftarGuruHtml += `
        <tr>
            <td colspan="2" style="width: 30%; vertical-align: top;">&nbsp;&nbsp;&nbsp;${index + 1}. Nama<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Jabatan</td>
            <td style="width: 2%;" valign="top">:</td><td>${teacher.nama}<br>${teacher.jabatan}</td>
        </tr>`;
    });

    // --- NEW LOGIC for reprinting date ---
    let tanggalKegiatan;
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    // Check if the date string contains 's.d.' which indicates a range
    if (record.hari_tanggal && record.hari_tanggal.includes(' s.d. ')) {
        const [mulai, selesai] = record.hari_tanggal.split(' s.d. ');
        const tanggalMulai = new Date(mulai);
        const tanggalSelesai = new Date(selesai);
        tanggalKegiatan = `${tanggalMulai.toLocaleDateString('id-ID', options)} s.d. ${tanggalSelesai.toLocaleDateString('id-ID', options)}`;
    } else {
        const tanggalMulai = new Date(record.hari_tanggal || record.hariTanggal);
        tanggalKegiatan = tanggalMulai.toLocaleDateString('id-ID', options);
    }

    // Replace all placeholders with the record's data.
    const placeholders = { '«Logo_Image»': logoBase64, '«No_Surat»': record.nomor_surat || record.nomorSurat, '«Daftar_Guru»': daftarGuruHtml, '«Acara»': record.acara, '«Penyelenggara»': record.penyelenggara, '«Tempat»': record.tempat, '«HariTanggal»': tanggalKegiatan, '«Jam»': record.jam, '«Tanggal_TTD»': new Date(record.tanggal_ttd || record.tanggalTtd).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), '«yg_TTD»': record.yg_ttd || record.ygTtd };
    Object.keys(placeholders).forEach(key => { template = template.replace(new RegExp(key, 'g'), placeholders[key]); });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(template);
    printWindow.document.close();
    printWindow.focus();
  };

  const { handleSubmit, handleSalesSubmit, handleSuratSubmit, handleKeyPress, handleSalesKeyPress, handleSuratKeyPress } = createHandlers(setRecords, setSalesRecords, setNomorSuratRecords, setFormData, setSalesFormData, nomorSuratForm, setNomorSuratForm, setInventory, setShowSuccess, nameInputRef, customerInputRef, inventory, nomorSuratRecords, nomorSuratSettings, saveToSheetsBackground, setIsBatchSaving, editingSaleRecord, setEditingSaleRecord, currentUser, setInventoryLogRecords);
  // --- RENDER LOGIC ---

  // If no user is logged in, render the LoginView.
  if (!currentUser) {
    return React.createElement(LoginView, { handleLogin, authError, loading });
  }

  return (
    React.createElement('div', { className: 'flex h-screen bg-gray-100' },
      // Global "Syncing..." overlay.
      syncing && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'flex flex-col items-center gap-4' },
          React.createElement(RefreshCw, { size: 48, className: 'text-white animate-spin' }),
          React.createElement('span', { className: 'text-white text-lg font-semibold' }, 'Memproses...')
        )
      ),
      React.createElement(Sidebar, { currentView, setCurrentView, reportType, setReportType, isOpen: isSidebarOpen, setIsOpen: setIsSidebarOpen, isCollapsed: isSidebarCollapsed, setIsCollapsed: setIsSidebarCollapsed, user: currentUser, handleLogout, onHardRefresh: handleHardRefresh, openModal: setActiveModal }),
      // Global success notification pop-up.
      showSuccess && (
        React.createElement('div', { className: 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce z-50' },
          React.createElement(CheckCircle, { size: 24 }),
          React.createElement('span', { className: 'font-semibold' }, 'Data berhasil disimpan! ✓')
        )
      ),
      activeModal === 'change-password' && React.createElement(Modal, { title: "Ubah Password", onClose: () => setActiveModal(null) },
        React.createElement(ChangePasswordView, { onChangePassword: handleChangePassword })
      ),

      // Modal for stock correction
      correctionRecord && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg' },
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-4' }, 'Koreksi Stok'),
          React.createElement('div', { className: 'bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm mb-6' },
            React.createElement('p', null, 'Barang: ', React.createElement('strong', null, correctionRecord.item)),
            React.createElement('p', null, 'Perubahan Awal: ', React.createElement('strong', null, correctionRecord.change)),
            React.createElement('p', null, 'Alasan Awal: ', React.createElement('strong', null, correctionRecord.reason))
          ),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('select', { id: 'correction-item-name', name: 'correctionItemName', value: correctionForm.newItemName || correctionRecord.item, onChange: e => setCorrectionForm(prev => ({ ...prev, newItemName: e.target.value })), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-600 focus:outline-none text-lg' },
              inventory.map(item => React.createElement('option', { key: item.nama, value: item.nama }, item.nama))
            ),
            React.createElement('input', { id: 'correction-quantity', name: 'correctionQuantity', type: 'number', placeholder: 'Jumlah Seharusnya', value: correctionForm.newQuantity, onChange: e => setCorrectionForm(prev => ({ ...prev, newQuantity: e.target.value })), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-600 focus:outline-none text-lg' }),
            React.createElement('input', { id: 'correction-reason', name: 'correctionReason', type: 'text', placeholder: 'Alasan Koreksi (Wajib diisi)', value: correctionForm.reason, onChange: e => setCorrectionForm(prev => ({ ...prev, reason: e.target.value })), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-yellow-600 focus:outline-none text-lg' }), // prettier-ignore
            React.createElement('div', { className: 'flex gap-4 mt-6' },
              React.createElement('button', { onClick: () => { setCorrectionRecord(null); setCorrectionForm({ newItemName: '', newQuantity: '', reason: '' }); }, className: 'w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold' }, 'Batal'),
              React.createElement('button', {
                onClick: () => {
                  if (!correctionForm.reason) { alert('Alasan koreksi harus diisi.'); return; }
                  handleStockCorrection(correctionRecord, correctionForm);
                  setCorrectionRecord(null);
                  setCorrectionForm({ newItemName: '', newQuantity: '', reason: '' });
                },
                className: 'w-full bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 transition-all font-semibold'
              }, 'Simpan Koreksi')
            ),
          )
        )
      ),
      // Modal for editing a sales record.
      editingSaleRecord && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6 w-full max-w-md' },
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Edit Transaksi Penjualan'),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', null, // prettier-ignore
              React.createElement('label', { htmlFor: 'edit-sale-item', className: 'block text-sm font-semibold text-gray-700 mb-2' }, 'Nama Barang'),
              React.createElement('input', { id: 'edit-sale-item', name: 'editSaleItem', type: 'text', value: salesFormData.item, readOnly: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100 text-lg' })
            ),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' }, // prettier-ignore
              React.createElement('input', { id: 'edit-sale-quantity', name: 'editSaleQuantity', type: 'number', value: salesFormData.quantity, onChange: e => setSalesFormData({ ...salesFormData, quantity: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Jumlah', min: '1' }),
              React.createElement('input', { id: 'edit-sale-price', name: 'editSalePrice', type: 'number', value: salesFormData.price, onChange: e => setSalesFormData({ ...salesFormData, price: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg', placeholder: 'Harga per Unit (Rp)', min: '0', step: '0.01' })
            ),
            React.createElement('div', { className: 'flex gap-4 mt-6' },
              React.createElement('button', { onClick: () => setEditingSaleRecord(null), className: 'w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold' }, 'Batal'),
              React.createElement('button', { onClick: () => {
                handleSalesSubmit(salesFormData, editingSaleRecord);
                setEditingSaleRecord(null);
              }, className: 'w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold' }, 'Simpan Perubahan')
            )
          )
        )
      ),
      React.createElement('div', { className: 'flex-1 flex flex-col overflow-hidden' },
        React.createElement('header', { className: 'bg-white shadow-md' },
          React.createElement('div', { className: 'flex items-center justify-between p-4' },
            React.createElement('div', { className: 'flex items-center' },
              React.createElement('button', {
                onClick: () => setIsSidebarOpen(true),
                className: 'text-gray-500 focus:outline-none lg:hidden' // Hanya tampil di layar kecil
              }, React.createElement(Menu, { size: 24 })),
              React.createElement('h1', { className: 'text-xl font-semibold text-gray-800 ml-4' },
                currentView.charAt(0).toUpperCase() + currentView.slice(1)
              )
            ),
            React.createElement('div', { className: 'flex items-center gap-4 text-sm text-gray-600' }, React.createElement(Cloud, { size: 16, className: 'text-green-600' }), React.createElement('span', { className: 'hidden md:inline' }, 'Auto-sync'), lastSync && React.createElement('span', { className: 'text-gray-400 hidden md:inline' }, ` • ${lastSync.toLocaleTimeString('id-ID')}`))
          )
        ),
        React.createElement('main', { className: 'flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6' },
          (currentUser.role === 'admin' || currentUser.permissions?.dashboard?.view) && currentView === 'dashboard' && React.createElement(Dashboard, { records, salesRecords, inventory, setCurrentView, currentUser, teachers, students, inventoryLogRecords }),
          (currentUser.role === 'admin' || currentUser.permissions?.paper?.view) && currentView === 'paper' && React.createElement(PaperView, { records, formData, setFormData, nameInputRef, handleSubmit, handleKeyPress, currentUser }),
          (currentUser.role === 'admin' || currentUser.permissions?.sales?.view) && currentView === 'sales' && React.createElement(SalesView, { salesRecords, salesFormData, setSalesFormData, customerInputRef, handleSalesSubmit, handleSalesKeyPress, inventory, handleEditSale, handleDeleteSale, currentUser, loadFromSheets: loadInitialData }), // prettier-ignore
          (currentUser.role === 'admin' || currentUser.permissions?.inventory?.view) && currentView === 'inventory' && React.createElement(InventoryView, { inventory, setInventory, inventoryForm, setInventoryForm, addStock, setAddStock, showNewItemForm, setShowNewItemForm, currentUser, setInventoryLogRecords }),
          (currentUser.role === 'admin' || currentUser.permissions?.surat?.view) && currentView === 'surat' && React.createElement(SuratView, { nomorSuratRecords, setNomorSuratRecords, nomorSuratForm, setNomorSuratForm, handleSuratSubmit, handleSuratKeyPress, setShowSuccess, nomorSuratSettings, setNomorSuratSettings, currentUser }), // prettier-ignore
          (currentUser.role === 'admin' || currentUser.permissions?.report?.view) && currentView === 'report' && React.createElement(ReportView, { reportType, records, salesRecords, nomorSuratRecords, simkRecords, inventoryLogRecords, dendaRecords, teachers, filter, setFilter, salesFilter, setSalesFilter, suratFilter, setSuratFilter, simkFilter, setSimkFilter, inventoryLogFilter, setInventoryLogFilter, dendaFilter, setDendaFilter, handleEditSale, handleDeleteSale, currentUser, onReprint: handleReprintSimk, onCorrectStock: setCorrectionRecord, onUpdateDendaStatus: handleUpdateDendaStatus, onDeleteDenda: handleDeleteDenda }),
          (currentUser.role === 'admin' || currentUser.permissions?.teachers?.view) && currentView === 'teachers' && React.createElement(TeachersView, { teachers }),
          (currentUser.role === 'admin' || currentUser.permissions?.students?.view) && currentView === 'students' && React.createElement(StudentsView, { students }),
          (currentUser.role === 'admin' || currentUser.permissions?.generate_surat?.view) && currentView === 'generate_surat' && React.createElement(GenerateSuratView, { teachers, onGenerateSimk: handleSimkGenerate, onGenerateSpBatch: handleSpBatchGenerate, nomorSuratRecords, nomorSuratSettings, currentUser }),
          (currentUser.role === 'admin' || currentUser.permissions?.denda?.view) && currentView === 'denda' && React.createElement(DendaView, { students, dendaRecords, onSave: handleSaveDenda, currentUser }),
          (currentUser.role === 'admin' || currentUser.permissions?.settings?.view) && currentView === 'settings' && React.createElement(SettingsView, { initialPermissions: permissions, onSave: handleSavePermissions, users, onAddUser: handleAddUser, onDeleteUser: handleDeleteUser, currentUser, trash, onRestore: handleRestoreSale, teachers, onSaveTeacher: handleSaveTeacher, onDeleteTeacher: handleDeleteTeacher })
        )
      )
    )
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(PaperTrackerApp));
