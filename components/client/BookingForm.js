import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from '../../lib/firebase';
import { doc, collection, addDoc, getDoc, getDocs } from 'firebase/firestore';
import { format, parseISO, eachDayOfInterval } from 'date-fns';

export default function BookingForm({ clientId, closeModal }) {
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
    
    if (clientId) {
      fetchShows();
    }
  }, [clientId]);

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
      const clientDocRef = doc(db, 'clients', clientId);
      const clientDoc = await getDoc(clientDocRef);
      const clientData = clientDoc.exists() ? clientDoc.data() : {};
      
      // Calculate total staff needed
      const totalStaffNeeded = bookingData.datesNeeded.reduce((sum, date) => sum + date.staffCount, 0);
      
      // Create booking in Firestore
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId: clientId,
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
        
        // Close modal if provided
        if (typeof closeModal === 'function') {
          closeModal();
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

  return (
    <div className="animate-fadeIn">
      {submitSuccess ? (
        <div className="bg-green-50 border-2 border-green-100 rounded-xl p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="mt-3 text-lg font-medium text-green-800">Booking Successful!</h3>
          <p className="mt-2 text-sm text-green-600">
            Your booking has been submitted. We'll notify you when staff are assigned.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Show Selection */}
            <div>
              <label htmlFor="showId" className="block text-sm font-medium text-gray-700">Select Show</label>
              <select
                id="showId"
                name="showId"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                onChange={handleShowSelect}
                value={bookingData.showId}
              >
                <option value="">-- Select a Show --</option>
                {shows.map((show) => (
                  <option key={show.id} value={show.id}>
                    {show.name} ({format(parseISO(show.startDate), 'MMM dd')} - {format(parseISO(show.endDate), 'MMM dd, yyyy')})
                  </option>
                ))}
              </select>
              {errors.showId && <p className="mt-1 text-sm text-red-600">{errors.showId}</p>}
            </div>
            
            {/* Show Details */}
            {selectedShow && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-lg font-medium text-gray-900">{selectedShow.name}</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p><span className="font-medium">Location:</span> {selectedShow.location}</p>
                  <p className="mt-1">
                    <span className="font-medium">Dates:</span> {format(parseISO(selectedShow.startDate), 'MMM dd')} - {format(parseISO(selectedShow.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
            
            {/* Staff Needs */}
            {selectedShow && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Staff Requirements</h3>
                
                <div className="mb-2 text-sm text-gray-500">
                  Enter the number of staff needed for each day of the show:
                </div>
                
                {errors.datesNeeded && (
                  <p className="mb-3 text-sm text-red-600">{errors.datesNeeded}</p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {bookingData.datesNeeded.map((dateNeeded, index) => (
                    <div key={dateNeeded.date} className="flex flex-col p-3 border border-gray-200 rounded-md">
                      <label className="block text-sm font-medium text-gray-700">
                        {format(parseISO(dateNeeded.date), 'EEE, MMM d')}
                      </label>
                      <select
                        className="mt-1 block w-full py-1.5 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        value={dateNeeded.staffCount}
                        onChange={(e) => handleStaffCountChange(index, e.target.value)}
                      >
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  className="shadow-sm focus:ring-pink-500 focus:border-pink-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Any specific requirements or details about your staff needs..."
                  value={bookingData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                  </div>
                </div>
              </div>
            )}
            
            {/* Buttons */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pink-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Submit Booking"
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
} 