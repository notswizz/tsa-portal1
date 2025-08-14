import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { updateDoc, Timestamp, getDoc } from 'firebase/firestore';

export default function FormsCard({ completedForms = [], onFormComplete, staffDocRef, session, staffData }) {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    college: '',
    size: '',
    instagram: '',
    referral: '',
    interviewDate: '',
    interviewTime: '',
    interviewFormat: '',
    motivation: '',
    experience: '',
    questions: '',
    phone: '',
    address: '',
    shoeSize: '',
    dressSize: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  // Form type mappings to display data
  const formConfig = {
    'application': {
      title: 'Agency Application',
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      description: 'Complete your staff application form',
      content: 'Staff application form content would go here...'
    },
    'interview': {
      title: 'Interview Form',
      icon: '🎤',
      color: 'from-green-500 to-green-600',
      description: 'Interview documentation and notes',
      content: 'Interview form content would go here...'
    },
    'availability': {
      title: 'Availability Form',
      icon: '📅',
      color: 'from-purple-500 to-purple-600',
      description: 'Set your availability schedule',
      content: 'Availability form content would go here...'
    },
    'w9': {
      title: 'W-9 Tax Form',
      icon: '📋',
      color: 'from-orange-500 to-orange-600',
      description: 'Tax information and documentation',
      content: 'W-9 tax form content would go here...'
    },
    'direct-deposit': {
      title: 'Direct Deposit',
      icon: '💳',
      color: 'from-teal-500 to-teal-600',
      description: 'Set up payment information',
      content: 'Direct deposit setup form would go here...'
    },
    'emergency': {
      title: 'Emergency Contact',
      icon: '🚨',
      color: 'from-red-500 to-red-600',
      description: 'Emergency contact details',
      content: 'Emergency contact form would go here...'
    }
  };

  // Define the sequential order of forms (removed availability from sequence)
  const formSequence = ['application', 'interview'];
  
  // Find the next form to show based on sequential completion
  const getNextForm = () => {
    for (let i = 0; i < formSequence.length; i++) {
      const formType = formSequence[i];
      const form = completedForms.find(f => f.formType === formType);
      
      // If form exists, is enabled, but not completed, show it
      if (form && form.enabled && !form.completed) {
        return form;
      }
    }
    return null; // All forms completed or none available
  };
  
  // Get the single next form to display
  const nextForm = getNextForm();
  const enabledForms = nextForm ? [{
    id: nextForm.formType,
    formData: nextForm,
    ...(formConfig[nextForm.formType] || {
      title: nextForm.formType.charAt(0).toUpperCase() + nextForm.formType.slice(1),
      icon: '📝',
      color: 'from-gray-500 to-gray-600',
      description: `${nextForm.formType} form`,
      content: `${nextForm.formType} form content would go here...`
    })
  }] : [];

  // Check if application is completed but interview not yet enabled
  const applicationForm = completedForms.find(f => f.formType === 'application');
  const interviewForm = completedForms.find(f => f.formType === 'interview');
  const showApplicationSuccessMessage = applicationForm && applicationForm.completed && 
                                       interviewForm && !interviewForm.enabled;

  // Check if interview is completed AND approved by admin (no more forms needed)
  const showNoFormsMessage = interviewForm && interviewForm.completed && staffData?.interviewFormApproved;
  
  // Check if interview is completed but not yet approved (waiting for admin approval)
  const showInterviewWaitingMessage = interviewForm && interviewForm.completed && !staffData?.interviewFormApproved;

  // Get submitted application data from Firebase
  const getApplicationData = async () => {
    if (staffDocRef) {
      try {
        const staffDoc = await getDoc(staffDocRef);
        if (staffDoc.exists()) {
          const data = staffDoc.data();
          return data.applicationFormData || null;
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
      }
    }
    return null;
  };

  const openModal = (form) => {
    setSelectedForm(form);
    // Reset form data when opening
    setFormData({
      name: '',
      location: '',
      college: '',
      size: '',
      instagram: '',
      referral: '',
      interviewDate: '',
      interviewTime: '',
      interviewFormat: '',
      motivation: '',
      experience: '',
      questions: '',
      phone: '',
      address: '',
      shoeSize: '',
      dressSize: ''
    });
  };

  const closeModal = () => {
    setSelectedForm(null);
    setIsSubmitting(false);
    setShowSuccess(false);
  };

  const handleViewApplication = async () => {
    const appData = await getApplicationData();
    if (appData) {
      setFormData(appData);
      setShowApplicationModal(true);
    }
  };

  const closeApplicationModal = () => {
    setShowApplicationModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formType = selectedForm.formData.formType;
      
      // Save form data to Firebase staff profile
      if (staffDocRef) {
        // First get the current document to read existing completedForms
        const docSnap = await getDoc(staffDocRef);
        let currentCompletedForms = [];
        
        if (docSnap.exists()) {
          const docData = docSnap.data();
          currentCompletedForms = docData.completedForms || [];
        }
        
        // Update the completedForms array or create it if empty
        let updatedCompletedForms;
        
        if (currentCompletedForms.length === 0) {
          // Create initial completedForms array
          updatedCompletedForms = [
            {
              completed: formType === 'application' ? true : false,
              dateCompleted: formType === 'application' ? Timestamp.now() : null,
              dateEnabled: "2025-07-27T02:48:43.018Z",
              enabled: true,
              formType: 'application'
            },
            {
              completed: formType === 'interview' ? true : false,
              dateCompleted: formType === 'interview' ? Timestamp.now() : null,
              dateEnabled: null,
              enabled: false,
              formType: 'interview'
            }
          ];
        } else {
          // Update existing completedForms array
          updatedCompletedForms = currentCompletedForms.map(form => {
            if (form.formType === formType) {
              return {
                ...form,
                completed: true,
                dateCompleted: Timestamp.now()
              };
            }
            return form;
          });
        }
        
        const updateData = {
          [`${formType}FormData`]: formData,
          [`${formType}FormCompleted`]: true,
          [`${formType}FormCompletedDate`]: Timestamp.now(),
          completedForms: updatedCompletedForms,
          updatedAt: Timestamp.now(),
          // Map application data into profile fields for convenience
          ...(formType === 'application' ? {
            name: formData.name,
            college: formData.college,
            phone: formData.phone,
            address: formData.address,
            shoeSize: formData.shoeSize,
            dressSize: formData.dressSize
          } : {})
        };
        
        await updateDoc(staffDocRef, updateData);
        console.log(`${formType} form saved to Firebase`);
      }
      
      // Call the completion handler if provided
      if (onFormComplete) {
        onFormComplete(formType, formData);
      }
      
      // Close modal immediately after submission
      closeModal();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-pink-200 overflow-hidden h-full flex flex-col">
        {/* Header - Fixed height to prevent cutoff */}
        <div className="px-4 py-2.5 bg-blue-500 relative overflow-hidden flex-shrink-0">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-sm font-bold text-white">Forms</h2>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1.5 h-1.5 bg-blue-300 rounded-full"></div>
              <span className="text-white/80 text-xs font-medium">Required</span>
            </div>
          </div>
          
          {/* Simple decorative element */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-white/10 rounded-full -translate-y-6 translate-x-6"></div>
        </div>

        {/* Form Content - Scrollable if needed */}
        <div className="flex-1 p-3 bg-gradient-to-br from-white to-blue-50/30 overflow-y-auto">
          {showNoFormsMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center shadow-lg">
                <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-emerald-700 text-lg">All Forms Complete!</h3>
              </div>
            </div>
          ) : showInterviewWaitingMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-orange-700 text-sm">Interview Submitted!</h3>
                <p className="text-slate-600 text-xs px-2">
                  Your interview form has been submitted successfully. Please wait for admin approval before proceeding to the next step.
                </p>
                <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-2 mt-2">
                  ✅ Application Approved<br/>
                  ⏳ Interview Under Review<br/>
                  ⏸️ Waiting for Approval
                </div>
              </div>
            </div>
          ) : showApplicationSuccessMessage ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-green-700 text-sm">Application Submitted!</h3>
                <p className="text-slate-600 text-xs px-2">
                  Thank you for applying to The Smith Agency. You will hear back within a week regarding your application status.
                </p>
                <button
                  onClick={handleViewApplication}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors duration-200"
                >
                  View Application
                </button>
              </div>
            </div>
          ) : enabledForms.length > 0 ? (
            <div className="flex items-center justify-center min-h-full">
              {enabledForms.map((form, index) => (
                <button
                  key={form.id}
                  onClick={() => openModal(form)}
                  className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] flex flex-col items-center justify-center text-center w-full max-w-32 h-24"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${form.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <span className="text-lg">{form.icon}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 text-xs leading-tight">{form.title}</h3>
                </button>
              ))}
            </div>
          ) : (
            // Check if we're waiting for next form to be enabled by admin
            (() => {
              const allCompleted = formSequence.every(formType => {
                const form = completedForms.find(f => f.formType === formType);
                return form && form.completed;
              });
              
              if (allCompleted) {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-700 text-sm">All Forms Complete</h3>
                      <p className="text-xs text-slate-500">You've completed all required forms!</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-700 text-sm">Waiting for Next Step</h3>
                      <p className="text-xs text-slate-500">Your next form will be available once processed by our team.</p>
                    </div>
                  </div>
                );
              }
            })()
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${selectedForm.color} relative overflow-hidden`}>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{selectedForm.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedForm.title}</h3>
                    <p className="text-white/80 text-sm">{selectedForm.description}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              {selectedForm.id === 'application' ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="City, State"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">College *</label>
                    <input
                      type="text"
                      name="college"
                      value={formData.college}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="University or College name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="e.g. +15551234567 or 555-123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="Street, City, State"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Shoe Size *</label>
                      <input
                        type="text"
                        name="shoeSize"
                        value={formData.shoeSize}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        placeholder="e.g. 8, 9.5, 10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Dress Size *</label>
                      <input
                        type="text"
                        name="dressSize"
                        value={formData.dressSize}
                        onChange={handleInputChange}
                        required
                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                        placeholder="e.g. S, M, 4, 6"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Size *</label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select your size</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram Handle</label>
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                      placeholder="@username (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">How did you hear about us?</label>
                    <textarea
                      name="referral"
                      value={formData.referral}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white resize-none"
                      placeholder="Friend, social media, website, etc. (optional)"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedForm.color} hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : selectedForm.id === 'interview' ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Interview Date *</label>
                    <input
                      type="date"
                      name="interviewDate"
                      value={formData.interviewDate || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Preferred Time *</label>
                    <select
                      name="interviewTime"
                      value={formData.interviewTime || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select preferred time</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Interview Format Preference *</label>
                    <select
                      name="interviewFormat"
                      value={formData.interviewFormat || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white"
                    >
                      <option value="">Select format</option>
                      <option value="In-Person">In-Person</option>
                      <option value="Video Call">Video Call (Zoom)</option>
                      <option value="Phone Call">Phone Call</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Why do you want to work with The Smith Agency? *</label>
                    <textarea
                      name="motivation"
                      value={formData.motivation || ''}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white resize-none"
                      placeholder="Tell us about your interest in working with our agency..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Previous Experience</label>
                    <textarea
                      name="experience"
                      value={formData.experience || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white resize-none"
                      placeholder="Describe any relevant work or volunteer experience (optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Questions for Us</label>
                    <textarea
                      name="questions"
                      value={formData.questions || ''}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white resize-none"
                      placeholder="Any questions you'd like to ask during the interview? (optional)"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 flex space-x-3">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedForm.color} hover:opacity-90 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {isSubmitting ? 'Submitting...' : 'Schedule Interview'}
                    </button>
                    <button 
                      type="button"
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="text-slate-700 mb-6">
                    {selectedForm.content}
                  </div>
                  
                  {/* Action Buttons for other forms */}
                  <div className="flex space-x-3">
                    <button className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedForm.color} hover:opacity-90 transition-opacity duration-200`}>
                      Fill Out Form
                    </button>
                    <button 
                      onClick={closeModal}
                      className="px-4 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Display Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Your Application</h3>
                    <p className="text-white/80 text-sm">Submitted application details</p>
                  </div>
                </div>
                <button
                  onClick={closeApplicationModal}
                  className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"></div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.name || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.location || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">College</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.college || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Size</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.size || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.instagram || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">How did you hear about us?</label>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg">{formData.referral || 'Not provided'}</p>
                </div>
              </div>
              
              {/* Close Button */}
              <div className="mt-6">
                <button 
                  onClick={closeApplicationModal}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 