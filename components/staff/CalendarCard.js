import AvailabilityCalendar from './AvailabilityCalendar';

export default function CalendarCard({ staffDocRef }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
      {/* Header - Made smaller and more refined */}
      <div className="px-4 py-3 bg-pink-500 relative overflow-hidden">
        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-base font-bold text-white">Calendar Overview</h2>
          </div>
          <div className="flex items-center space-x-2 text-white/90 text-xs">
            <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
            <span>Available</span>
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full ml-2"></div>
            <span>Unavailable</span>
          </div>
        </div>
        
        {/* Subtle decorative element */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto bg-gradient-to-br from-white to-pink-50/30">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-pink-100/50 h-full">
          <AvailabilityCalendar staffDocRef={staffDocRef} />
        </div>
      </div>
    </div>
  );
} 