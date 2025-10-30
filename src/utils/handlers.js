'use strict';

import { apiSaveInventory, apiSaveNomorSurat, apiSaveInventoryLog } from '/src/services/api.js';
import { getNextNomorUrut, generateNomorSurat } from '/src/utils/utils.js';


/**
 * Factory function to create all primary event handlers for the application.
 * This pattern is used to encapsulate the logic and dependencies for form submissions
 * and other key events, keeping the main `App` component cleaner.
 * @param {...any} args - All necessary state setters and data from the main App component.
 * @returns {object} An object containing all the handler functions.
 */
export function createHandlers(setRecords, setSalesRecords, setNomorSuratRecords, setFormData, setSalesFormData, nomorSuratForm, setNomorSuratForm, setInventory, setShowSuccess, nameInputRef, customerInputRef, inventory, nomorSuratRecords, nomorSuratSettings, saveToSheetsBackground, setIsBatchSaving, editingSaleRecord, setEditingSaleRecord, currentUser, setInventoryLogRecords) {
  /**
   * Handles the submission of the paper usage form.
   */
  const handleSubmit = async (formData) => {
    if (!formData.name || !formData.purpose || !formData.quantity) {
      alert('Semua field harus diisi!');
      return;
    }

    const newRecord = {
      id: Date.now(),
      name: formData.name,
      purpose: formData.purpose,
      quantity: parseInt(formData.quantity),
      date: new Date().toISOString(),
      dateDisplay: new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically update the UI, then save to the backend.
    setRecords(prev => [newRecord, ...prev]);
    setFormData({ name: '', purpose: '', quantity: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    nameInputRef.current?.focus();
    saveToSheetsBackground(newRecord);
  };

  /**
   * Handles the submission of the sales form, for both creating new sales and updating existing ones.
   * @param {object} salesFormData - The data from the sales form.
   * @param {object|null} [originalRecord=null] - The original record if in edit mode.
   */
  const handleSalesSubmit = async (salesFormData, originalRecord = null) => {
    if (!salesFormData.item || !salesFormData.quantity || !salesFormData.price) {
      alert('Semua field harus diisi!');
      return;
    }

    const quantity = parseInt(salesFormData.quantity);
    // Calculate the difference in quantity to correctly adjust inventory.
    const originalQuantity = originalRecord ? originalRecord.quantity : 0;
    const quantityDifference = quantity - originalQuantity;

    const itemInInventory = inventory.find(item => item.nama === salesFormData.item);

    if (itemInInventory && quantityDifference > itemInInventory.stok) {
      alert(`Stok tidak cukup! Stok tersedia: ${itemInInventory.stok}. Anda mencoba mengambil ${quantityDifference} lebih banyak.`);
      return;
    }

    if (originalRecord) {
      // --- UPDATE MODE ---
      const updatedRecord = {
        ...originalRecord, // Start with all original fields
        item: salesFormData.item,
        quantity: quantity,
        price: parseFloat(salesFormData.price),
        total: quantity * parseFloat(salesFormData.price),
      };
      // Optimistically update UI and save to backend.
      setSalesRecords(prev => prev.map(r => r.id === originalRecord.id ? updatedRecord : r));
      saveToSheetsBackground({ ...updatedRecord, action: 'update' }, 'sales');
      setEditingSaleRecord(null);
    } else {
      // --- CREATE NEW MODE ---
      const newRecord = {
        id: Date.now(),
        item: salesFormData.item,
        quantity: quantity,
        price: parseFloat(salesFormData.price),
        total: quantity * parseFloat(salesFormData.price),
        date: new Date().toISOString(),
        dateDisplay: new Date().toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'pending' // Tambahkan status default untuk penjualan baru
      };
      // Optimistically update UI and save to backend.
      setSalesRecords(prev => [newRecord, ...prev]);
      saveToSheetsBackground(newRecord, 'sales');
    }

    // --- INVENTORY UPDATE LOGIC (for both create and update) ---
    if (itemInInventory) {
      // Optimistically update the inventory UI.
      const updatedItem = { ...itemInInventory, stok: itemInInventory.stok - quantityDifference };
      setInventory(prev => prev.map(item => item.nama === salesFormData.item ? updatedItem : item));

      // Create and save a log of the inventory change.
      const logRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        item: salesFormData.item,
        change: (quantityDifference > 0 ? '-' : '+') + Math.abs(quantityDifference),
        reason: originalRecord ? 'Edit Penjualan' : 'Penjualan',
        user: currentUser.username
      };
      apiSaveInventoryLog(logRecord);

      // Send the inventory update to the backend.
      apiSaveInventory(updatedItem);
    }
    
    setSalesFormData({ item: '', quantity: '', price: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    customerInputRef.current?.focus();
  };

  /**
   * Handles the submission for generating new letter numbers ('Nomor Surat').
   * Supports both single and multiple (batch) generation.
   */
  const handleSuratSubmit = async () => {
    if (!nomorSuratForm.kode || !nomorSuratForm.tingkat) {
      alert('Kode surat dan tingkat harus diisi!');
      return;
    }

    const bulan = nomorSuratForm.bulan || new Date().getMonth() + 1;
    const tahun = nomorSuratForm.tahun || new Date().getFullYear();

    const existingNomorUrut = getNextNomorUrut(nomorSuratRecords, nomorSuratForm.kode, nomorSuratForm.tingkat, bulan, tahun);
    const baseNomor = nomorSuratSettings[nomorSuratForm.tingkat] || 0;
    const nomorUrut = Math.max(existingNomorUrut, baseNomor + 1);

    if (nomorSuratForm.isMultiple && nomorSuratForm.quantity > 1) {
      // --- Multiple Surat Generation ---
      const newRecords = [];
      const parentId = Date.now(); // A common ID to group the batch.
      for (let i = 1; i <= nomorSuratForm.quantity; i++) {
        const nomor = generateNomorSurat(nomorSuratForm.kode, nomorSuratForm.tingkat, bulan, tahun, nomorUrut, i);
        const newRecord = {
          id: parentId + i,
          nomor: nomor,
          kode: nomorSuratForm.kode,
          tingkat: nomorSuratForm.tingkat,
          bulan: bulan,
          tahun: tahun,
          catatan: nomorSuratForm.catatan || `(Bagian dari ${nomorSuratForm.quantity} surat)`,
          parent_id: parentId, // Fix: Use snake_case for database column
          tanggal_dibuat: new Date().toISOString() // Fix: Use snake_case for database column
        };
        newRecords.push(newRecord);
      }
      
      setIsBatchSaving(true);
      // Save each record individually with a slight delay to avoid overwhelming the backend.
      newRecords.forEach((record, index) => {
        // Create a UI-compatible version of the record
        const uiRecord = { ...record, parentId: record.parent_id, tanggalDibuat: record.tanggal_dibuat };
        setNomorSuratRecords(prev => [uiRecord, ...prev]);
        const isLast = index === newRecords.length - 1;
        setTimeout(() => {
          apiSaveNomorSurat(record);
          if (isLast) setIsBatchSaving(false);
        }, index * 450);
      });
      setNomorSuratRecords(prev => [...newRecords, ...prev]);
    } else {
      // --- Single Surat Generation ---
      const nomor = generateNomorSurat(nomorSuratForm.kode, nomorSuratForm.tingkat, bulan, tahun, nomorUrut);
      const newRecord = {
        id: Date.now(), // Unique ID
        nomor: nomor,
        kode: nomorSuratForm.kode,
        tingkat: nomorSuratForm.tingkat,
        bulan: bulan,
        tahun: tahun,
        catatan: nomorSuratForm.catatan || '',
        tanggal_dibuat: new Date().toISOString() // Fix: Use snake_case for database column
      };
      // Create a UI-compatible version of the record
      const uiRecord = { ...newRecord, tanggalDibuat: newRecord.tanggal_dibuat };
      setNomorSuratRecords(prev => [uiRecord, ...prev]);
      apiSaveNomorSurat(newRecord);
    }

    setNomorSuratForm({ kode: '', tingkat: '', bulan: '', tahun: '', catatan: '', isMultiple: false, quantity: 2 });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  /**
   * Key press handlers to allow form submission with the "Enter" key.
   */
  const handleSuratKeyPress = (e) => { if (e.key === 'Enter') handleSuratSubmit(); };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleSubmit(); };
  const handleSalesKeyPress = (e) => { if (e.key === 'Enter') handleSalesSubmit(); };

  return {
    handleSubmit,
    handleSalesSubmit,
    handleSuratSubmit,
    handleKeyPress,
    handleSalesKeyPress,
    handleSuratKeyPress
  };
}
