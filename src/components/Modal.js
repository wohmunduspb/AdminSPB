'use strict';

import { XCircle } from '/src/utils/icons.js';

/**
 * A generic modal component.
 * @param {object} props - The component props.
 * @param {string} props.title - The title of the modal.
 * @param {function} props.onClose - Callback function to close the modal.
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @returns {React.ReactElement} The modal component.
 */
export function Modal({ title, onClose, children }) {
  return React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4' },
    React.createElement('div', { className: 'bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col' },
      React.createElement('div', { className: 'flex justify-between items-center p-4 border-b' },
        React.createElement('h2', { className: 'text-xl font-bold text-gray-800' }, title),
        React.createElement('button', { onClick: onClose, className: 'p-2 text-gray-500 hover:bg-gray-200 rounded-full' },
          React.createElement(XCircle, { size: 24 })
        )
      ),
      React.createElement('div', { className: 'flex-grow overflow-y-auto' }, children)
    )
  );
}