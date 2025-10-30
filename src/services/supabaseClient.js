'use strict';

// Impor fungsi createClient dari library Supabase
import {
  createClient
} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// --- Konfigurasi ---
// Ganti nilai di bawah ini dengan kunci dari proyek Supabase PENGEMBANGAN (DEV) Anda
const DEV_CONFIG = {
  url: 'https://lmwupzlczlhacpuccfgc.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtd3VwemxjemxoYWNwdWNjZmdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDcxMDQsImV4cCI6MjA3NzI4MzEwNH0.XeeqSiDVTnXs60IvBy1Sz7U9DMsf457lsi2dQNoKWLg'
};

// Kunci dari proyek Supabase PRODUKSI (ASLI) Anda
const PROD_CONFIG = {
  url: 'https://zggknfjgnyhdkkkqgaik.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnZ2tuZmpnbnloZGtra3FnYWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2OTk0ODcsImV4cCI6MjA3NzI3NTQ4N30.5rjdeF8Pq53IRS-FrEH3xspMdS87RTYqe17D8X2Xla8'
};

// Secara dinamis memilih konfigurasi berdasarkan nilai di localStorage.
// Default ke 'dev' jika tidak ada yang disetel.
const activeEnv = localStorage.getItem('supabaseEnv') || 'dev';

// Pilih konfigurasi yang sesuai.
const CURRENT_CONFIG = activeEnv === 'prod' ? PROD_CONFIG : DEV_CONFIG;

export const supabase = createClient(CURRENT_CONFIG.url, CURRENT_CONFIG.anonKey);