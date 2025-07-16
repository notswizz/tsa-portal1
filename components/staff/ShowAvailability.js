import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format, parseISO, differenceInCalendarDays, isAfter } from 'date-fns';

export default function ShowAvailability({ session, staffDocRef }) {
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [showDates, setShowDates] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [availabilitySubmitted, setAvailabilitySubmitted] = useState(false);

  // Fetch all shows from Firestore
  useEffect(() => {
    async function fetchShows() {
      try {
        setLoading(true);
        const showsCollection = collection(db, 'shows');
        const showSnapshot = await getDocs(showsCollection);
        const showsList = showSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setShows(showsList);
        // Auto-select soonest upcoming show
        const now = new Date();
        const upcoming = showsList
          .filter(show => isAfter(parseISO(show.endDate), now))
          .sort((a, b) => parseISO(a.startDate) - parseISO(b.startDate));
        if (upcoming.length > 0) {
          setSelectedShow(upcoming[0]);
        }
      } catch (error) {
        console.error("Error fetching shows:", error);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchShows();
    }
  }, [session]);

  // Fetch staff availability for selected show
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedShow || !session?.user?.email) return;
      try {
        setLoading(true);
        const availabilityCollection = collection(db, 'availability');
        const availabilityQuery = query(
          availabilityCollection, 
          where('staffId', '==', staffDocRef.id),
          where('showId', '==', selectedShow.id)
        );
        const availabilitySnapshot = await getDocs(availabilityQuery);
        const availableDateList = [];
        let alreadySubmitted = false;
        availabilitySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.availableDates && Array.isArray(data.availableDates)) {
            availableDateList.push(...data.availableDates);
            alreadySubmitted = true;
          }
        });
        setAvailableDates(availableDateList);
        setAvailabilitySubmitted(alreadySubmitted && availableDateList.length > 0);
      } catch (error) {
        console.error("Error fetching availability:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [selectedShow, session, staffDocRef]);

  // Generate dates between startDate and endDate
  useEffect(() => {
    if (selectedShow) {
      const start = parseISO(selectedShow.startDate);
      const end = parseISO(selectedShow.endDate);
      const dayCount = differenceInCalendarDays(end, start) + 1;
      
      const dates = [];
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(start);
        date.setDate(date.getDate() + i);
        dates.push(format(date, 'yyyy-MM-dd'));
      }
      
      setShowDates(dates);
    }
  }, [selectedShow]);

  const handleShowSelect = (showId) => {
    const show = shows.find(s => s.id === showId);
    setSelectedShow(show || null);
  };

  const handleDateToggle = (date) => {
    if (!selectedShow) return;
    
    setAvailableDates(prev => {
      if (prev.includes(date)) {
        return prev.filter(d => d !== date);
      } else {
        return [...prev, date];
      }
    });
  };

  const saveAvailability = async () => {
    if (!staffDocRef || !selectedShow || !session?.user?.email) return;
    
    try {
      setSavingAvailability(true);
      
      // Query existing availability document for this staff and show
      const availabilityCollection = collection(db, 'availability');
      const availabilityQuery = query(
        availabilityCollection, 
        where('staffId', '==', staffDocRef.id),
        where('showId', '==', selectedShow.id)
      );
      
      const availabilitySnapshot = await getDocs(availabilityQuery);
      
      // Update or create the availability document
      if (!availabilitySnapshot.empty) {
        // Update existing document
        const availabilityDoc = availabilitySnapshot.docs[0];
        await updateDoc(doc(db, 'availability', availabilityDoc.id), {
          availableDates,
          updatedAt: new Date(),
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'availability'), {
          staffId: staffDocRef.id,
          staffName: session.user.name,
          showId: selectedShow.id,
          availableDates,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      setSuccessMsg("Availability saved successfully!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to save availability. Please try again.");
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow-md rounded-xl overflow-hidden border-2 border-primary">
      
        <div className="border-t border-primary-100">
          <div className="px-4 py-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden border-2 border-pink-400">
      <div className="border-t border-pink-100">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          {successMsg && (
            <div className="mb-4 flex items-center justify-center">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-full flex items-center gap-2 animate-fadeIn">
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {successMsg}
              </div>
            </div>
          )}
          {shows.length === 0 ? (
            <div className="p-4 sm:p-8 text-center">
              <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-gray-700">No upcoming shows found</p>
              <p className="mt-1 sm:mt-2 text-sm text-gray-500">Check back later for new show listings</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="show-select" className="block text-sm font-semibold text-pink-700">Select a Show</label>
                <div className="mt-1.5 sm:mt-2 relative rounded-md shadow-sm">
                  <select
                    id="show-select"
                    className="block w-full pl-3 pr-10 py-2.5 sm:py-3 text-base border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 rounded-lg transition-all bg-pink-50 hover:bg-pink-100"
                    value={selectedShow?.id || ""}
                    onChange={(e) => handleShowSelect(e.target.value)}
                  >
                    <option value="">-- Select a show --</option>
                    {shows.map((show) => (
                      <option key={show.id} value={show.id}>
                        {show.name} ({format(parseISO(show.startDate), 'MMM d')} - {format(parseISO(show.endDate), 'MMM d, yyyy')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedShow && (
                <div className="mt-4 sm:mt-6 bg-gradient-to-br from-pink-100/80 to-white rounded-3xl p-5 shadow-2xl border border-pink-200">
                  {availabilitySubmitted ? (
                    <div className="text-center">
                      <h4 className="text-base font-bold text-pink-700 mb-3">Your submitted availability:</h4>
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {availableDates.map(date => (
                          <span key={date} className="inline-flex items-center px-3 py-1 rounded-full border border-pink-300 bg-pink-100 text-pink-700 text-xs font-semibold shadow-sm">
                            {format(parseISO(date), 'EEE, MMM d')}
                          </span>
                        ))}
                      </div>
                     
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-5">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full shadow text-base font-bold text-white bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-300 border-2 border-white px-6 py-2 transition-all duration-150 gap-2"
                          style={{ boxShadow: '0 2px 8px 0 rgba(236, 72, 153, 0.12)' }}
                          onClick={saveAvailability}
                          disabled={savingAvailability}
                        >
                          {savingAvailability ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Save Availability
                            </>
                          )}
                        </button>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-base font-bold text-pink-700 mb-3 text-center">Please check the dates you're available:</h4>
                        <div className="h-40 overflow-y-auto pr-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2">
                            {showDates.map((date) => {
                              const isAvailable = availableDates.includes(date);
                              return (
                                <button
                                  type="button"
                                  key={date}
                                  className={`flex items-center w-full px-3 py-1.5 rounded-full border-2 transition-all duration-150 font-semibold text-xs shadow focus:outline-none focus:ring-2 focus:ring-pink-200 mb-1
                                    ${isAvailable ? 'bg-pink-500 border-pink-500 text-white hover:bg-pink-600 scale-105' : 'bg-white border-pink-200 text-pink-400 hover:bg-pink-50 hover:scale-105'}`}
                                  style={{ boxShadow: isAvailable ? '0 1px 6px 0 rgba(236, 72, 153, 0.12)' : '0 1px 2px 0 rgba(236, 72, 153, 0.06)' }}
                                  onClick={() => handleDateToggle(date)}
                                >
                                  <svg className={`h-4 w-4 mr-1 ${isAvailable ? 'text-white' : 'text-pink-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <rect x="4" y="4" width="16" height="16" rx="8" fill={isAvailable ? '#fff' : 'none'} stroke="currentColor" strokeWidth="2" />
                                    {isAvailable && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 13l3 3 7-7" />}
                                  </svg>
                                  {format(parseISO(date), 'EEE, MMM d')}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 