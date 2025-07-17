import StaffForms from '../../pages/staff/forms';

export default function FormsCard() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-pink-600 flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Forms
        </h2>
      </div>
      <div className="overflow-y-auto max-h-[400px]">
        <div className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-100">
          <StaffForms />
        </div>
      </div>
    </div>
  );
} 