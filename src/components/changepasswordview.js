'use strict';

import { Save, Eye, EyeOff } from '../utils/icons.js';

const { useState } = React;

export function ChangePasswordView({ onChangePassword }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(''); // Reset error on new submission

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal harus 6 karakter.');
      return;
    }

    onChangePassword(oldPassword, newPassword);

    // Reset fields after successful submission
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl p-6' },
    React.createElement('h2', { className: 'text-2xl font-bold text-gray-800 mb-6' }, 'Ubah Password'),
    React.createElement('form', { onSubmit: handleSubmit, className: 'space-y-4 max-w-sm' },
      React.createElement('div', { className: 'relative' },
        React.createElement('input', { id: 'old-password', name: 'oldPassword', type: showOld ? 'text' : 'password', placeholder: 'Password Lama', value: oldPassword, onChange: e => setOldPassword(e.target.value), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
        React.createElement('button', { type: 'button', onClick: () => setShowOld(!showOld), className: 'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600' },
          showOld ? React.createElement(EyeOff, { size: 24 }) : React.createElement(Eye, { size: 24 })
        )
      ),
      React.createElement('div', { className: 'relative' },
        React.createElement('input', { id: 'new-password', name: 'newPassword', type: showNew ? 'text' : 'password', placeholder: 'Password Baru', value: newPassword, onChange: e => setNewPassword(e.target.value), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
        React.createElement('button', { type: 'button', onClick: () => setShowNew(!showNew), className: 'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600' },
          showNew ? React.createElement(EyeOff, { size: 24 }) : React.createElement(Eye, { size: 24 })
        )
      ),
      React.createElement('div', { className: 'relative' },
        React.createElement('input', { id: 'confirm-password', name: 'confirmPassword', type: showConfirm ? 'text' : 'password', placeholder: 'Konfirmasi Password Baru', value: confirmPassword, onChange: e => setConfirmPassword(e.target.value), required: true, className: 'w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg' }),
        React.createElement('button', { type: 'button', onClick: () => setShowConfirm(!showConfirm), className: 'absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600' },
          showConfirm ? React.createElement(EyeOff, { size: 24 }) : React.createElement(Eye, { size: 24 })
        )
      ),
      error && React.createElement('p', { className: 'text-red-500 text-sm' }, error),
      React.createElement('button', { type: 'submit', className: 'w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg' },
        React.createElement(Save, { size: 20 }),
        'Ubah Password'
      )
    )
  );
}