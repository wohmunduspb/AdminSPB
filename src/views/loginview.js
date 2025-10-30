'use strict';

import { Printer, Eye, EyeOff } from '/src/utils/icons.js';
const { useState } = React;

export function LoginView({ handleLogin, authError, loading }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = e => {
    e.preventDefault();
    handleLogin(username, password);
  };

  return /*#__PURE__*/React.createElement("div", {
    className: "flex items-center justify-center min-h-screen bg-gray-100"
  }, /*#__PURE__*/React.createElement("div", {
    className: "w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex flex-col items-center"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bg-indigo-600 p-4 rounded-2xl mb-4"
  }, /*#__PURE__*/React.createElement(Printer, {
    className: "text-white",
    size: 40
  })), /*#__PURE__*/React.createElement("h1", {
    className: "text-3xl font-bold text-gray-800"
  }, "Admin Login"), /*#__PURE__*/React.createElement("p", {
    className: "text-gray-600"
  }, "Silakan masuk untuk melanjutkan")), /*#__PURE__*/React.createElement("form", {
    onSubmit: onSubmit,
    className: "space-y-6",
    id: "login-form", name: "login-form"
  }, /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: username,
    onChange: e => setUsername(e.target.value),
    placeholder: "Username",
    required: true, id: "username", name: "username", // prettier-ignore
    className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
  }), /*#__PURE__*/React.createElement("div", { className: "relative" },
    React.createElement("input", {
      type: showPassword ? 'text' : 'password',
      value: password,
      onChange: e => setPassword(e.target.value),
      placeholder: "Password",
      required: true,
      id: "password",
      name: "password",
      className: "w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-indigo-600 focus:outline-none text-lg"
    }),
    React.createElement("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 right-0 pr-4 flex items-center text-gray-600" },
      showPassword ? React.createElement(EyeOff, { size: 24 }) : React.createElement(Eye, { size: 24 })
    )
  ), authError && /*#__PURE__*/React.createElement("p", {
    className: "text-sm text-red-600 text-center" // prettier-ignore
  }, authError), /*#__PURE__*/React.createElement("button", {
    type: "submit",
    disabled: loading,
    className: 'w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all text-lg font-semibold shadow-lg ' + (loading ? 'opacity-50 cursor-not-allowed' : '')
  }, loading ? 'Memuat...' : 'Login'))));
}