import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export default function AvailabilityCalendar({ staffDocRef }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState([]);
  const [availabilityMap, setAvailabilityMap] = useState({});

  // Fetch all shows and staff availability from Firestore
  useEffect(() => {
    async function fetchData() {
      if (!staffDocRef) return;
      
      try {
        setLoading(true);
        
        // Fetch shows
        const showsCollection = collection(db, 'shows');
        const showSnapshot = await getDocs(showsCollection);
        const showsList = showSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setShows(showsList);
        
        // Fetch availability for this staff member
        const availabilityCollection = collection(db, 'availability');
        const availabilityQuery = query(
          availabilityCollection,
          where('staffId', '==', staffDocRef.id)
        );
        
        const availabilitySnapshot = await getDocs(availabilityQuery);
        
        // Build map of show ID -> dates
        const availMap = {};
        
        availabilitySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.showId && data.availableDates && Array.isArray(data.availableDates)) {
            availMap[data.showId] = data.availableDates;
          }
        });
        
        setAvailabilityMap(availMap);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [staffDocRef]);

  // Generate calendar days for the current month
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    setCalendarDays(daysInMonth);
  }, [currentDate]);

  // Get the previous month
  const previousMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  // Get the next month
  const nextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // Get all show dates for a specific day
  const getShowsForDate = (date) => {
    return shows.filter(show => {
      // Check if this show has dates that include this calendar day
      const startDate = parseISO(show.startDate);
      const endDate = parseISO(show.endDate);
      
      const currentDateStr = format(date, 'yyyy-MM-dd');
      return (
        currentDateStr >= format(startDate, 'yyyy-MM-dd') && 
        currentDateStr <= format(endDate, 'yyyy-MM-dd')
      );
    });
  };

  // Check if a user is available for a specific show on a specific date
  const isAvailableForShow = (showId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityMap[showId]?.includes(dateStr) || false;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={previousMonth}
          className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-slate-800">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-600 transition-all"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Calendar Grid */}
      <div className="flex-1 bg-pink-50/50 rounded-xl border border-pink-100 p-2">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div key={day + index} className="text-center text-xs font-semibold text-pink-700 py-1">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 flex-1">
          {/* Empty cells for the start of the month */}
          {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-12"></div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day) => {
            const showsOnDay = getShowsForDate(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toISOString()} 
                className={`relative bg-white border border-pink-200/50 rounded-lg h-12 p-1 hover:shadow-sm transition-all text-center ${
                  isToday ? 'ring-1 ring-pink-400 bg-pink-50' : 'hover:bg-pink-25'
                }`}
              >
                <div className={`text-xs font-medium ${
                  isToday ? 'text-pink-600 font-bold' : 'text-slate-700'
                }`}>
                  {format(day, 'd')}
                </div>
                
                {/* Show indicators */}
                {showsOnDay.length > 0 && (
                  <div className="flex justify-center mt-0.5 space-x-0.5">
                    {showsOnDay.slice(0, 2).map((show) => {
                      const isAvailable = isAvailableForShow(show.id, day);
                      return (
                        <div 
                          key={show.id} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            isAvailable ? 'bg-pink-500' : 'bg-slate-300'
                          }`}
                          title={`${show.name} - ${isAvailable ? 'Available' : 'Not Available'}`}
                        ></div>
                      );
                    })}
                    {showsOnDay.length > 2 && (
                      <div className="text-xs text-slate-500">+</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Empty cells for the end of the month */}
          {Array.from({ length: 6 - (calendarDays[calendarDays.length - 1]?.getDay() || 0) }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-12"></div>
          ))}
        </div>
      </div>
    </div>
  );
} 