import StaffForms from '../../pages/staff/forms';

export default function FormsCard() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300 hover:border-pink-500 transition-all duration-300 h-full">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-400 to-pink-500 sticky top-0 z-10">
        <h2 className="text-base font-bold text-white flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Forms
        </h2>
      </div>
      <div className="p-2 overflow-y-auto max-h-[400px] bg-gradient-to-br from-white to-pink-50">
        <div className="bg-white rounded-lg p-3 shadow-md border border-pink-100">
          <StaffForms />
        </div>
      </div>
    </div>
  );
} 