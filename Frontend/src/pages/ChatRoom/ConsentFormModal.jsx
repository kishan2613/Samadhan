import React from 'react';
import ConsentForm from './ConsentForm';

export default function ConsentFormModal({ isOpen, onClose, roomId, userId }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl p-6 rounded shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-4 text-gray-600 hover:text-black text-xl font-bold"
        >
          &times;
        </button>
        <ConsentForm roomId={roomId} currentUserId={userId} />
      </div>
    </div>
  );
}
