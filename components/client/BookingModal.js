import React from 'react';
import BookingForm from './BookingForm';

export default function BookingModal({ showBookingModal, closeBookingModal, clientId }) {
  if (!showBookingModal) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-neutral-800 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={closeBookingModal}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="flex justify-between items-center bg-neutral-50 px-6 py-4 border-b border-neutral-100">
            <h3 className="text-lg font-display font-semibold text-neutral-800" id="modal-title">
              Book Staff for Your Event
            </h3>
            <button 
              type="button" 
              className="bg-white rounded-full p-1 hover:bg-neutral-100"
              onClick={closeBookingModal}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="p-6">
            <BookingForm 
              clientId={clientId} 
              closeModal={closeBookingModal} 
            />
          </div>
        </div>
      </div>
    </div>
  );
} 