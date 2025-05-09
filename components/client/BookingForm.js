import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, collection, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function BookingForm({ session, onSuccess }) {
  const router = useRouter();
  const [shows, setShows] = useState([]);
  const [selectedShow, setSelectedShow] = useState(null);
  const [bookingData, setBookingData] = useState({
    showId: '',
    notes: '',
    datesNeeded: [] // Will hold staffing data for each date
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch shows from Firestore
  useEffect(() => {
    async function fetchShows() {
      try {
        const showsSnapshot = await getDocs(collection(db, 'shows'));
        const showsList = showsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort shows by start date (newest first)
        showsList.sort((a, b) => {
          return new Date(b.startDate) - new Date(a.startDate);
        });
        
        setShows(showsList);
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
    }
    
    if (session) {
      fetchShows();
    }
  }, [session]);

  // Update datesNeeded array when a show is selected
  useEffect(() => {
    if (selectedShow) {
      const startDate = parseISO(selectedShow.startDate);
      const endDate = parseISO(selectedShow.endDate);
      
      // Generate an array of all dates between start and end (inclusive)
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Create default staffing data for each date
      const defaultDatesNeeded = dateRange.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        staffCount: 0
      }));
      
      setBookingData(prev => ({
        ...prev,
        showId: selectedShow.id,
        datesNeeded: defaultDatesNeeded
      }));
    }
  }, [selectedShow]);

  const handleShowSelect = (e) => {
    const showId = e.target.value;
    if (!showId) {
      setSelectedShow(null);
      return;
    }
    
    const show = shows.find(s => s.id === showId);
    setSelectedShow(show);
    
    // Clear error if any
    if (errors.showId) {
      setErrors(prev => ({ ...prev, showId: null }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user is typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleStaffCountChange = (dateIndex, value) => {
    setBookingData(prev => {
      const updatedDatesNeeded = [...prev.datesNeeded];
      updatedDatesNeeded[dateIndex] = {
        ...updatedDatesNeeded[dateIndex],
        staffCount: parseInt(value, 10)
      };
      
      return {
        ...prev,
        datesNeeded: updatedDatesNeeded
      };
    });

    // Clear dates error if any staff count is greater than 0
    if (errors.datesNeeded && parseInt(value, 10) > 0) {
      setErrors(prev => ({ ...prev, datesNeeded: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!bookingData.showId) {
      newErrors.showId = 'Please select a show';
    }
    
    // Check if at least one day has staff assigned
    const hasStaff = bookingData.datesNeeded.some(day => day.staffCount > 0);
    if (!hasStaff) {
      newErrors.datesNeeded = 'Please assign staff to at least one day';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get client data
      const clientDocRef = doc(db, 'clients', session.user.id);
      const clientDoc = await getDoc(clientDocRef);
      const clientData = clientDoc.exists() ? clientDoc.data() : {};
      
      // Calculate total staff needed
      const totalStaffNeeded = bookingData.datesNeeded.reduce((sum, date) => sum + date.staffCount, 0);
      
      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId: session.user.id,
        createdAt: new Date().toISOString(),
        datesNeeded: bookingData.datesNeeded,
        notes: bookingData.notes,
        showId: bookingData.showId,
        showName: selectedShow.name,
        totalStaffNeeded,
        status: 'pending',
        showData: {
          location: selectedShow.location,
          startDate: selectedShow.startDate,
          endDate: selectedShow.endDate
        }
      });
      
      // Reset form and show success message
      setSubmitSuccess(true);
      
      // Reset form after showing success
      setTimeout(() => {
        setBookingData({
          showId: '',
          notes: '',
          datesNeeded: []
        });
        setSelectedShow(null);
        setSubmitSuccess(false);
        
        // Call onSuccess callback if provided
        if (typeof onSuccess === 'function') {
          onSuccess();
        } else {
          router.push('/client/dashboard');
        }
      }, 2000);
    } catch (error) {
      console.error("Error creating booking:", error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create booking. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-bold text-green-800 mt-4">Booking Successfully Submitted</h3>
        <p className="text-green-700 mt-2">Your booking request has been received and is being processed.</p>
        <p className="text-sm text-green-600 mt-1">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="showId" className="block text-sm font-medium text-gray-700">
          Select Show
        </label>
        <select
          id="showId"
          name="showId"
          value={bookingData.showId}
          onChange={handleShowSelect}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm rounded-md"
        >
          <option value="">-- Select a show --</option>
          {shows.map(show => (
            <option key={show.id} value={show.id}>
              {show.name} ({format(parseISO(show.startDate), 'MMM dd')} - {format(parseISO(show.endDate), 'MMM dd, yyyy')})
            </option>
          ))}
        </select>
        {errors.showId && (
          <p className="mt-1 text-sm text-red-600">{errors.showId}</p>
        )}
      </div>
      
      {selectedShow && (
        <>
          <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
            <h3 className="text-lg font-medium text-pink-800">{selectedShow.name}</h3>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-gray-800">{selectedShow.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Dates</p>
                <p className="text-gray-800">
                  {format(parseISO(selectedShow.startDate), 'MMM dd')} - {format(parseISO(selectedShow.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Staffing Requirements</h3>
            <p className="text-sm text-gray-500 mb-4">
              Indicate how many staff members you need for each day of the show.
            </p>
            
            {errors.datesNeeded && (
              <p className="mb-2 text-sm text-red-600">{errors.datesNeeded}</p>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-300">
              <ul className="divide-y divide-gray-200">
                {bookingData.datesNeeded.map((dateNeeded, index) => {
                  const dateObj = parseISO(dateNeeded.date);
                  return (
                    <li key={dateNeeded.date} className="px-4 py-3 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="w-1/2 sm:w-auto">
                          <p className="text-sm font-medium text-pink-600">
                            {format(dateObj, 'EEEE')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(dateObj, 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label htmlFor={`staff-${index}`} className="text-sm font-medium text-gray-700 sr-only">
                            Staff Count
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              type="button"
                              className="px-3 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                              onClick={() => {
                                if (dateNeeded.staffCount > 0) {
                                  handleStaffCountChange(index, dateNeeded.staffCount - 1);
                                }
                              }}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              id={`staff-${index}`}
                              min="0"
                              value={dateNeeded.staffCount}
                              onChange={(e) => handleStaffCountChange(index, e.target.value)}
                              className="w-12 border-0 text-center focus:ring-0 p-0 text-gray-900"
                            />
                            <button
                              type="button"
                              className="px-3 py-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                              onClick={() => handleStaffCountChange(index, dateNeeded.staffCount + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm text-gray-500">staff</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={bookingData.notes}
              onChange={handleChange}
              className="shadow-sm focus:ring-pink-500 focus:border-pink-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
              placeholder="Any specific requirements or details we should know"
            ></textarea>
          </div>
        </>
      )}
      
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : 'Submit Booking Request'}
          </button>
        </div>
      </div>
    </form>
  );
} 