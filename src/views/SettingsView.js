'use strict';

import { Save, CheckCircle, UserPlus, Trash2, RefreshCw, ChevronDown, Lock, Edit, TrendingUp, DollarSign, Printer, Mail, Box, Clipboard, Settings as SettingsIcon, Users as UsersIcon, FileText } from '/src/utils/icons.js';
import { permissionDefinitions, createDefaultRolePermissions, flattenPermissions } from '/src/utils/utils.js';
import { menuConfig } from '/src/components/Sidebar.js';


const { useState, useEffect } = React;

/**
 * Manages all application settings, including user roles, permissions, user management, and trash recovery.
 * @param {object} props - The component props.
 * @param {object} props.initialPermissions - The initial nested permission object for all roles.
 * @param {function} props.onSave - Callback to save the updated permissions to the backend.
 * @param {Array<object>} props.users - The list of all users.
 * @param {function} props.onAddUser - Callback to add a new user.
 * @param {function} props.onDeleteUser - Callback to delete a user.
 * @param {object} props.currentUser - The currently logged-in user object.
 * @param {Array<object>} props.trash - The list of deleted records.
 * @param {function} props.onRestore - Callback to restore a record from the trash.
 * @param {Array<object>} props.teachers - The list of all teachers.
 * @param {function} props.onSaveTeacher - Callback to add/update a teacher.
 * @param {function} props.onDeleteTeacher - Callback to delete a teacher.
 * @returns {React.ReactElement} The settings view component.
 */
export function SettingsView({ initialPermissions, onSave, users, onAddUser, onDeleteUser, currentUser, trash, onRestore, teachers, onSaveTeacher, onDeleteTeacher }) {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [activeTab, setActiveTab] = useState('permissions');
  const [selectedRole, setSelectedRole] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: '' });
  const [teacherForm, setTeacherForm] = useState({ no: '', kodeGuru: '', namaGuru: '', pendidikan: '', jabatan: '', waliKelas: '', ruang: '', totalSiswa: '' });
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  // Flatten the menu config to create a map of feature IDs to their corresponding icons.
  const featureIconMap = menuConfig.flatMap(item => item.children ? [item, ...item.children] : [item])
  .reduce((acc, item) => {
    // Use the 'permission' key if available, otherwise fallback to 'id'.
    const key = item.permission || item.id;
    if (key && item.icon) {
      acc[key] = item.icon;
    }
    return acc;
  }, {});


  /**
   * Effect to merge initial permissions with the master permission definitions.
   * This ensures that any newly added permissions in the code are reflected in the UI,
   * even if they don't exist in the saved data yet. It also sets default selected roles.
   */
  useEffect(() => {
    // The initialPermissions from the API are now guaranteed to be complete.
    // No complex merging is needed here anymore.
    setPermissions(initialPermissions);

    // Set a default role for the "Add User" form to prevent an empty selection.
    const availableRoles = Object.keys(initialPermissions).filter(role => role !== 'admin');
    if (availableRoles.length > 0 && !newUser.role) {
      setNewUser(prev => ({ ...prev, role: availableRoles[0] }));
    }
    if (availableRoles.length > 0 && !selectedRole) {
      setSelectedRole(availableRoles[0]);
    }
  }, [initialPermissions]);

  /**
   * Handles changes to a permission checkbox.
   * Updates the local `permissions` state for a specific role, feature, and sub-permission.
   * @param {string} roleKey - The role being modified (e.g., 'staff').
   * @param {string} featureKey - The main feature key (e.g., 'sales').
   * @param {string} subPermKey - The specific permission key (e.g., 'view').
   * @param {boolean} value - The new value of the checkbox (true or false).
   */
  const handlePermissionChange = (roleKey, featureKey, subPermKey, value) => {
    setPermissions(prev => ({
      ...prev,
      [roleKey]: {
        ...prev[roleKey],
        [featureKey]: {
          ...prev[roleKey][featureKey],
          [subPermKey]: value,
        },
      },
    }));
  };

  const handleSelectAllForGroup = (roleKey, parentFeatureKey, childFeatureKey = null) => {
    let definitionPath;
    let targetKeyInState;

    if (childFeatureKey) {
      definitionPath = permissionDefinitions[parentFeatureKey]?.children?.[childFeatureKey];
      targetKeyInState = childFeatureKey;
    } else {
      definitionPath = permissionDefinitions[parentFeatureKey];
      targetKeyInState = parentFeatureKey;
    }

    if (!definitionPath || !definitionPath.subPermissions) return;

    const subPerms = definitionPath.subPermissions;
    const statePath = permissions[roleKey]?.[targetKeyInState];
    const allChecked = Object.keys(subPerms).every(subPermKey => statePath?.[subPermKey]);
    const newCheckedState = !allChecked;

    setPermissions(prev => {
      const newRolePerms = { ...prev[roleKey] };
      if (!newRolePerms[targetKeyInState]) newRolePerms[targetKeyInState] = {};
      const updatedTargetStateObject = { ...newRolePerms[targetKeyInState] };
      for (const subPermKey in subPerms) {
        updatedTargetStateObject[subPermKey] = newCheckedState;
      }
      newRolePerms[targetKeyInState] = updatedTargetStateObject;
      return { ...prev, [roleKey]: newRolePerms };
    });
  };

  const renderPermissionCard = (roleKey, currentFeatureKey, featureDefinition) => {
    const Icon = featureIconMap[currentFeatureKey] || Lock;
    const allSubPermsChecked = Object.keys(featureDefinition.subPermissions).every(subPermKey => permissions[roleKey]?.[currentFeatureKey]?.[subPermKey]);

    return React.createElement('div', { key: currentFeatureKey, className: 'bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col' },
      React.createElement('div', { className: 'flex items-center justify-between gap-2 mb-3 border-b pb-3' },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', { className: 'flex items-center gap-3' },
            React.createElement(Icon, { size: 20, className: 'text-indigo-600' }),
            React.createElement('h3', { className: 'text-base font-bold text-gray-800' }, featureDefinition.label)
          )
        )
      ),
      React.createElement('div', { className: 'flex flex-col space-y-3 flex-grow' },
        React.createElement('label', { className: 'flex items-center cursor-pointer p-1 rounded-md hover:bg-gray-100' },
          React.createElement('input', { type: 'checkbox', checked: allSubPermsChecked, onChange: () => handleSelectAllForGroup(roleKey, currentFeatureKey), className: 'h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500' }),
          React.createElement('span', { className: 'ml-2 text-xs font-bold text-gray-700' }, 'Pilih Semua')
        ),
        Object.entries(featureDefinition.subPermissions).map(([subPermKey, subPermLabel]) =>
          React.createElement('label', { key: `${roleKey}-${currentFeatureKey}-${subPermKey}`, className: 'flex items-center cursor-pointer p-1 rounded-md hover:bg-gray-50' },
            React.createElement('input', { type: 'checkbox', checked: permissions[roleKey]?.[currentFeatureKey]?.[subPermKey] || false, onChange: e => handlePermissionChange(roleKey, currentFeatureKey, subPermKey, e.target.checked), className: 'h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500' }),
            React.createElement('span', { className: 'ml-2 text-xs font-medium text-gray-600' }, subPermLabel)
          )
        )
      )
    );
  };
  /**
   * Saves the current permission state to the backend.
   * It flattens the nested permission object into an array suitable for the API.
   */
  const handleSave = () => {
    const flatPermissionsArray = flattenPermissions(permissions);
    onSave(flatPermissionsArray);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };
  /**
   * Handles the creation of a new user role.
   * It adds the new role to the state with default (false) permissions and triggers a save.
   */
  const handleAddNewRole = () => {
    const roleKey = newRoleName.trim().toLowerCase();
    if (!roleKey || permissions[roleKey]) {
      alert('Nama role tidak valid atau sudah ada.');
      return;
    }

    const defaultPermsForNewRole = createDefaultRolePermissions();
    const newPermissionsState = { ...permissions, [roleKey]: defaultPermsForNewRole };

    // Update local state to reflect the new role.
    setPermissions(newPermissionsState);

    // Immediately save the new role structure to the backend.
    onSave(flattenPermissions(newPermissionsState));

    setNewRoleName('');
    setShowAddRoleModal(false);
    alert(`Role "${roleKey}" berhasil ditambahkan. Silakan atur hak aksesnya dan simpan.`);
  };
  /**
   * Handles the submission of the "Add User" form.
   */
  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.role) {
      alert('Semua field harus diisi untuk menambah pengguna baru.');
      return;
    }
    onAddUser({ username: newUser.username, password: newUser.password, role: newUser.role });
    setNewUser({ username: '', password: '', role: newUser.role }); // Reset form fields but keep the selected role.
  };

  /**
   * Handles the submission of the teacher form for both adding and editing.
   */
  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    if (!teacherForm.kodeGuru || !teacherForm.namaGuru) {
      alert('Kode Guru dan Nama Guru harus diisi.');
      return;
    }
    onSaveTeacher(teacherForm, editingTeacher);
    setTeacherForm({ no: '', kodeGuru: '', namaGuru: '', pendidikan: '', jabatan: '', waliKelas: '', ruang: '', totalSiswa: '' });
    setEditingTeacher(null); // Explicitly reset editing state
  };

  /**
   * Sets up the form for editing an existing teacher.
   * @param {object} teacher - The teacher object to edit.
   */
  const handleEditTeacher = (teacher) => {
    setShowTeacherModal(true);
    setEditingTeacher(teacher);
    setTeacherForm(teacher);
  };

  // Get a list of roles that can be managed (excluding 'admin').
  const roles = Object.keys(permissions).filter(role => role !== 'admin');

  // Define the tabs for the settings view.
  let tabs = [
    { id: 'permissions', label: 'Hak Akses' },
    { id: 'users', label: 'Manajemen Pengguna' },
  ];
  // Conditionally add the "Manajemen Guru" tab if the user has permission.
  if (currentUser.permissions?.settings?.guru) {
    tabs.push({ id: 'teachers', label: 'Manajemen Guru' });
  }
  tabs.push(
    { id: 'trash', label: 'Tong Sampah' },
  );

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl' },
    React.createElement('div', { className: 'border-b border-gray-200' },
      // Tab navigation
      React.createElement('nav', { className: '-mb-px flex space-x-6 px-6' },
        tabs.map(tab => (
          React.createElement('button', {
            key: tab.id,
            onClick: () => setActiveTab(tab.id),
            className: `whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`
          }, tab.label)
        ))
      )
    ),
    // Tab content
    React.createElement('div', { className: 'p-6' },
      activeTab === 'permissions' && React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' }, // prettier-ignore
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Pengaturan Hak Akses Pengguna'),
          currentUser.role === 'admin' && React.createElement('button', { onClick: () => setShowAddRoleModal(true), className: 'flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold' },
            React.createElement(UserPlus, { size: 18 }), 'Tambah Role Baru')
        ),
        roles.length > 0 ? React.createElement('div', null,
          // Role selection tabs
          React.createElement('div', { className: 'mb-6 border-b border-gray-200' },
            React.createElement('div', { className: 'flex flex-wrap -mb-px' },
              roles.map(role =>
                React.createElement('button', {
                  key: role,
                  onClick: () => setSelectedRole(role),
                  className: `capitalize whitespace-nowrap py-3 px-5 font-semibold text-base border-b-4 transition-colors duration-200 ${
                    selectedRole === role
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`
                }, role)
              )
            )
          ),
          // Permission cards for the selected role
          selectedRole && React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' },
            Object.entries(permissionDefinitions).flatMap(([featureKey, featureDef]) => {
              const parentCard = renderPermissionCard(selectedRole, featureKey, featureDef);
              let childCards = [];
              if (featureDef.children) {
                childCards = Object.entries(featureDef.children).map(([childKey, childDef]) => 
                  renderPermissionCard(selectedRole, childKey, childDef)
                );
              }
              // Return an array containing the parent card and all its child cards
              return [parentCard, ...childCards];
            })
          )
        ) :
        // Message shown when no configurable roles are found.
        (
          React.createElement('div', { className: 'text-center text-gray-500 py-8' },
            React.createElement('p', null, 'Tidak ada peran (role) yang dapat diatur.'),
            React.createElement('p', { className: 'text-sm mt-2' }, 'Pastikan sheet "permissions" di Google Sheets Anda sudah terisi dengan benar (contoh: role "staff").')
          )
        ),
        React.createElement('div', { className: 'mt-8 flex justify-end items-center gap-4' },
          // Success indicator shown after saving
          showSuccess && React.createElement('div', { className: 'flex items-center gap-2 text-green-600' }, React.createElement(CheckCircle, { size: 20 }), React.createElement('span', null, 'Pengaturan disimpan!')),
          React.createElement('button', { onClick: handleSave, className: 'flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg' }, React.createElement(Save, { size: 20 }), 'Simpan Pengaturan')
        )
      ),
      showAddRoleModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' },
        // Modal for adding a new role
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-md' },
          React.createElement('h3', { className: 'text-2xl font-bold text-gray-800 mb-4' }, 'Tambah Role Baru'),
          React.createElement('p', { className: 'text-gray-600 mb-6' }, 'Masukkan nama untuk role baru (contoh: keuangan, akademik).'),
          React.createElement('input', { type: 'text', placeholder: 'Nama Role', value: newRoleName, onChange: e => setNewRoleName(e.target.value), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
          React.createElement('div', { className: 'flex justify-end gap-4 mt-6' },
            React.createElement('button', { onClick: () => { setShowAddRoleModal(false); setNewRoleName(''); }, className: 'px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold' }, 'Batal'),
            React.createElement('button', { onClick: handleAddNewRole, className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold' }, 'Tambah Role')
          )
        )
      ),
      // "User Management" tab content
      activeTab === 'users' && React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-8' },
          React.createElement('div', null,
            // Form to add a new user
            React.createElement('h3', { className: 'text-xl font-semibold text-gray-700 mb-4' }, 'Tambah Pengguna Baru'),
            React.createElement('form', { onSubmit: handleAddUser, className: 'space-y-4' },
              React.createElement('input', { type: 'text', placeholder: 'Username', value: newUser.username, onChange: e => setNewUser({ ...newUser, username: e.target.value }), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
              React.createElement('input', { type: 'password', placeholder: 'Password (min. 6 karakter)', value: newUser.password, onChange: e => setNewUser({ ...newUser, password: e.target.value }), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
              React.createElement('select', { value: newUser.role, onChange: e => setNewUser({ ...newUser, role: e.target.value }), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' },
                roles.length > 0
                  ? roles.map(role => React.createElement('option', { key: role, value: role, className: 'capitalize' }, role))
                  : React.createElement('option', { value: '', disabled: true }, 'Tidak ada role tersedia')
              ),
              React.createElement('button', { type: 'submit', className: 'w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg' }, React.createElement(UserPlus, { size: 20 }), 'Tambah Pengguna')
            )
          ),
          React.createElement('div', null,
            // List of existing users
            React.createElement('h3', { className: 'text-xl font-semibold text-gray-700 mb-4' }, 'Daftar Pengguna'),
            React.createElement('div', { className: 'space-y-2 max-h-96 overflow-y-auto' },
              users.map(user => (
                React.createElement('div', { key: user.username, className: 'flex items-center justify-between p-3 bg-gray-50 rounded-lg' },
                  React.createElement('div', null,
                    React.createElement('div', { className: 'font-semibold text-gray-800' }, user.username),
                    React.createElement('div', { className: 'text-sm text-gray-500 capitalize' }, user.role)
                  ),
                  // Prevent deleting the currently logged-in user
                  user.username !== currentUser.username && React.createElement('button', {
                    onClick: () => {
                      if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.username}"?`)) {
                        onDeleteUser(user.username);
                      }
                    },
                    className: 'p-2 text-red-500 hover:bg-red-100 rounded-full transition-all'
                  }, React.createElement(Trash2, { size: 18 }))
                )
              ))
            )
          )
      ),
      // "Teacher Management" tab content
      activeTab === 'teachers' && React.createElement('div', null,
        React.createElement('div', { className: 'flex justify-between items-center mb-6' },
          React.createElement('h2', { className: 'text-2xl font-bold text-gray-800' }, 'Manajemen Data Guru'),
          React.createElement('button', { onClick: () => { setEditingTeacher(null); setTeacherForm({ no: '', kodeGuru: '', namaGuru: '', pendidikan: '', jabatan: '', waliKelas: '', ruang: '', totalSiswa: '' }); setShowTeacherModal(true); }, className: 'flex items-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all font-semibold' },
            React.createElement(UserPlus, { size: 18 }), 'Tambah Guru Baru')
        ),
        React.createElement('div', { className: 'space-y-3 max-h-[65vh] overflow-y-auto' },
          (teachers || []).map(teacher => (
            React.createElement('div', { key: teacher.kodeGuru, className: 'flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200' },
              React.createElement('div', null,
                React.createElement('div', { className: 'font-semibold text-gray-800' }, teacher.namaGuru),
                React.createElement('div', { className: 'flex items-center gap-2 text-sm text-gray-500' },
                  React.createElement('span', null, `${teacher.kodeGuru} - ${teacher.jabatan || 'N/A'}`),
                  teacher.waliKelas && React.createElement('span', { className: 'text-slate-800 text-xs font-semibold' }, `(Wali Kelas ${teacher.waliKelas})`)
                )
              ),
              React.createElement('div', { className: 'flex gap-1' },
                React.createElement('button', {
                  onClick: () => handleEditTeacher(teacher),
                  className: 'p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-all'
                }, React.createElement(Edit, { size: 16 })),
                React.createElement('button', {
                  onClick: () => { if (confirm(`Yakin ingin menghapus guru "${teacher.namaGuru}"?`)) { onDeleteTeacher(teacher.kodeGuru); } },
                  className: 'p-2 text-red-500 hover:bg-red-100 rounded-full transition-all'
                }, React.createElement(Trash2, { size: 16 }))
              )
            )
          ))
        )
      ),
      // Modal for adding/editing a teacher
      showTeacherModal && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg' },
          React.createElement('h3', { className: 'text-2xl font-bold text-gray-800 mb-6' }, editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'),
          React.createElement('form', { onSubmit: (e) => { handleTeacherSubmit(e); setShowTeacherModal(false); }, className: 'space-y-4' },
            React.createElement('input', { id: 'teacher-kodeGuru', name: 'kodeGuru', type: 'text', placeholder: 'Kode Guru', value: teacherForm.kodeGuru, onChange: e => setTeacherForm({ ...teacherForm, kodeGuru: e.target.value }), required: true, disabled: !!editingTeacher, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg disabled:bg-gray-100' }),
            React.createElement('input', { id: 'teacher-namaGuru', name: 'namaGuru', type: 'text', placeholder: 'Nama Guru', value: teacherForm.namaGuru, onChange: e => setTeacherForm({ ...teacherForm, namaGuru: e.target.value }), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
            React.createElement('input', { id: 'teacher-pendidikan', name: 'pendidikan', type: 'text', placeholder: 'Pendidikan', value: teacherForm.pendidikan, onChange: e => setTeacherForm({ ...teacherForm, pendidikan: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
            React.createElement('input', { id: 'teacher-jabatan', name: 'jabatan', type: 'text', placeholder: 'Jabatan', value: teacherForm.jabatan, onChange: e => setTeacherForm({ ...teacherForm, jabatan: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
            React.createElement('input', { id: 'teacher-waliKelas', name: 'waliKelas', type: 'text', placeholder: 'Wali Kelas (contoh: 7A), kosongkan jika bukan', value: teacherForm.waliKelas, onChange: e => setTeacherForm({ ...teacherForm, waliKelas: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
            React.createElement('input', { id: 'teacher-ruang', name: 'ruang', type: 'text', placeholder: 'Ruang', value: teacherForm.ruang, onChange: e => setTeacherForm({ ...teacherForm, ruang: e.target.value }), className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
            React.createElement('div', { className: 'flex justify-end gap-4 mt-6' },
              React.createElement('button', { type: 'button', onClick: () => setShowTeacherModal(false), className: 'px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold' }, 'Batal'),
              React.createElement('button', { type: 'submit', className: 'px-6 py-2 flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold' }, React.createElement(Save, { size: 18 }), editingTeacher ? 'Simpan Perubahan' : 'Tambah Guru')
            )
          )
        )
      ),
      // "Trash" tab content
      activeTab === 'trash' && React.createElement('div', null,
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Data Dihapus'),
        // List of deleted records
        React.createElement('div', { className: 'space-y-2 max-h-[60vh] overflow-y-auto' },
          trash.length > 0 ? trash.map(record => (
            React.createElement('div', { key: record.id, className: 'flex items-center justify-between p-3 bg-red-50 rounded-lg' },
              React.createElement('div', null,
                React.createElement('div', { className: 'font-semibold text-gray-800' }, `${record.quantity} x ${record.item} - Rp ${record.total.toLocaleString()}`),
                React.createElement('div', { className: 'text-sm text-gray-500' }, `Dihapus oleh ${record.deletedBy} pada ${new Date(record.deletedAt).toLocaleString('id-ID')}`)
              ),
              React.createElement('button', {
                onClick: () => onRestore(record),
                className: 'flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all text-sm font-semibold'
              }, React.createElement(RefreshCw, { size: 16 }), 'Pulihkan')
            )
          )) : React.createElement('div', { className: 'text-center text-gray-500 py-8' }, 'Tong sampah kosong.')
        )
      ),
    )
  );
}
