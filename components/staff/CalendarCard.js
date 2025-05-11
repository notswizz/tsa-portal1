import AvailabilityCalendar from './AvailabilityCalendar';

export default function CalendarCard({ staffDocRef }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-300 hover:border-pink-500 transition-all duration-300 flex flex-col">
      <div className="px-3 py-2 border-b border-pink-100 bg-gradient-to-r from-pink-500 to-pink-600 sticky top-0 z-10">
        <h2 className="text-base font-bold text-white flex items-center">
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Calendar
        </h2>
      </div>
      
      <div className="p-2 flex-grow overflow-y-auto bg-gradient-to-b from-white to-pink-50">
        <AvailabilityCalendar staffDocRef={staffDocRef} />
      </div>
    </div>
  );
} 