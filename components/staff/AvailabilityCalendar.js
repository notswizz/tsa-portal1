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
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200">
      <div className="rounded-lg p-2">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 text-pink-500 transition-all shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 text-pink-500 transition-all shadow-sm"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-50">
          {/* Calendar day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={day + index} className="py-2 text-center text-xs font-semibold text-gray-500 bg-white">
              {day}
            </div>
          ))}
          {/* Empty cells for the start of the month */}
          {Array.from({ length: calendarDays[0]?.getDay() || 0 }).map((_, index) => (
            <div key={`empty-start-${index}`} className="bg-gray-50 h-14"></div>
          ))}
          {/* Calendar days */}
          {calendarDays.map((day) => {
            const showsOnDay = getShowsForDate(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div 
                key={day.toISOString()} 
                className={`relative bg-white border-b border-r border-gray-100 h-14 p-1 hover:bg-pink-50 transition-all rounded-lg ${
                  isToday ? 'ring-2 ring-pink-400' : ''
                }`}
              >
                <div className={`font-medium text-xs ${isToday ? 'text-pink-500 font-bold' : 'text-gray-700'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-12">
                  {showsOnDay.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {showsOnDay.map((show) => {
                        const isAvailable = isAvailableForShow(show.id, day);
                        return (
                          <span 
                            key={show.id} 
                            className={`text-xs px-2 py-0.5 rounded-full border ${
                              isAvailable 
                                ? 'bg-pink-100 border-pink-400 text-pink-600' 
                                : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}
                            title={`${show.name} - ${isAvailable ? 'Available' : 'Not Available'}`}
                          >
                            {show.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 