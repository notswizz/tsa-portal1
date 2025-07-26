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
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-3">
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <svg className="h-3 w-3 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      
      {shows.length === 0 ? (
        <div className="text-center py-6">
          <svg className="mx-auto h-8 w-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-sm font-semibold text-slate-700 mb-1">No upcoming shows</p>
          <p className="text-xs text-slate-500">Check back later for new shows</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col space-y-3 min-h-0">
          <div>
            <label htmlFor="show-select" className="block text-xs font-semibold text-slate-800 mb-1">
              Select a Show
            </label>
            <select
              id="show-select"
              className="block w-full px-3 py-2 text-xs border border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 rounded-lg transition-all bg-white hover:bg-purple-50"
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
          
          {selectedShow && (
            <div className="flex-1 min-h-0">
              {availabilitySubmitted ? (
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 h-full overflow-y-auto">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Your Submitted Availability</h4>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {availableDates.map(date => (
                      <span key={date} className="inline-flex items-center px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200">
                        {format(parseISO(date), 'MMM d')}
                      </span>
                    ))}
                  </div>
                  
                  {/* Compact Contact Information */}
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center mb-2">
                      <svg className="h-3 w-3 text-purple-500 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h5 className="text-xs font-semibold text-slate-800">Need to change your availability?</h5>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <p className="text-xs font-medium text-slate-800">
                        Email: <span className="text-purple-600 font-semibold">lillian@smithagency.com</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">Include your name and specific changes needed</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200 h-full flex flex-col">
                  <div className="text-center mb-3">
                    <h4 className="text-sm font-bold text-slate-800 mb-1">Select Your Available Dates</h4>
                    <p className="text-xs text-slate-600">Choose all dates you're available</p>
                  </div>
                  
                  <div className="flex-1 min-h-0 overflow-y-auto mb-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      {showDates.map((date) => {
                        const isAvailable = availableDates.includes(date);
                        return (
                          <button
                            type="button"
                            key={date}
                            className={`flex items-center justify-center px-2 py-1.5 rounded-lg border transition-all duration-200 font-medium text-xs focus:outline-none focus:ring-1 focus:ring-purple-300 ${
                              isAvailable 
                                ? 'bg-purple-500 border-purple-500 text-white hover:bg-purple-600' 
                                : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300'
                            }`}
                            onClick={() => handleDateToggle(date)}
                          >
                            <svg className={`h-3 w-3 mr-1 ${isAvailable ? 'text-white' : 'text-purple-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAvailable ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                            </svg>
                            {format(parseISO(date), 'MMM d')}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-500 hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 disabled:opacity-50"
                    onClick={saveAvailability}
                    disabled={savingAvailability}
                  >
                    {savingAvailability ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Availability
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 