import { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function StaffForms() {
  const [activeForm, setActiveForm] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Smith Agency Application state
  const [appForm, setAppForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
  });

  // Direct Deposit state
  const [depositForm, setDepositForm] = useState({
    name: '',
    bank: '',
    account: '',
    routing: '',
    email: '',
  });

  const handleAppChange = e => {
    setAppForm({ ...appForm, [e.target.name]: e.target.value });
  };

  const handleDepositChange = e => {
    setDepositForm({ ...depositForm, [e.target.name]: e.target.value });
  };

  const handleAppSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await addDoc(collection(db, 'staffApplications'), {
        ...appForm,
        submittedAt: Timestamp.now(),
      });
      setSuccessMsg('Application submitted successfully!');
      setAppForm({ name: '', email: '', phone: '', position: '' });
    } catch (err) {
      setSuccessMsg('Error submitting application.');
    }
    setLoading(false);
  };

  const handleDepositSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    try {
      await addDoc(collection(db, 'directDeposits'), {
        ...depositForm,
        submittedAt: Timestamp.now(),
      });
      setSuccessMsg('Direct deposit form submitted successfully!');
      setDepositForm({ name: '', bank: '', account: '', routing: '', email: '' });
    } catch (err) {
      setSuccessMsg('Error submitting direct deposit form.');
    }
    setLoading(false);
  };

  const renderForm = () => {
    const alert = successMsg && (
      <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow text-sm font-medium ${successMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        {successMsg.includes('success') ? (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        )}
        <span>{successMsg}</span>
      </div>
    );

    switch (activeForm) {
      case 'application':
        return (
          <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-lg border border-pink-200">
            <h2 className="text-2xl font-bold mb-2 text-pink-700">The Smith Agency Application</h2>
            <p className="mb-6 text-gray-500">Please fill out your application below.</p>
            <form onSubmit={handleAppSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input name="name" value={appForm.name} onChange={handleAppChange} required placeholder="Full Name" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input name="email" value={appForm.email} onChange={handleAppChange} required placeholder="Email" type="email" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <input name="phone" value={appForm.phone} onChange={handleAppChange} required placeholder="Phone" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Position Applying For</label>
                <input name="position" value={appForm.position} onChange={handleAppChange} required placeholder="Position Applying For" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow transition-all duration-150" disabled={loading}>{loading ? 'Submitting...' : 'Submit Application'}</button>
            </form>
            {alert}
            <button className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-150" onClick={() => { setActiveForm(null); setSuccessMsg(''); }}>Back</button>
          </div>
        );
      case 'directDeposit':
        return (
          <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-lg border border-pink-200">
            <h2 className="text-2xl font-bold mb-2 text-pink-700">Direct Deposit Form</h2>
            <p className="mb-6 text-gray-500">Enter your direct deposit information below.</p>
            <form onSubmit={handleDepositSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <input name="name" value={depositForm.name} onChange={handleDepositChange} required placeholder="Full Name" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input name="email" value={depositForm.email} onChange={handleDepositChange} required placeholder="Email" type="email" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                <input name="bank" value={depositForm.bank} onChange={handleDepositChange} required placeholder="Bank Name" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                <input name="account" value={depositForm.account} onChange={handleDepositChange} required placeholder="Account Number" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Routing Number</label>
                <input name="routing" value={depositForm.routing} onChange={handleDepositChange} required placeholder="Routing Number" className="w-full p-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-400 bg-white" />
              </div>
              <button type="submit" className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg shadow transition-all duration-150" disabled={loading}>{loading ? 'Submitting...' : 'Submit Direct Deposit'}</button>
            </form>
            {alert}
            <button className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-150" onClick={() => { setActiveForm(null); setSuccessMsg(''); }}>Back</button>
          </div>
        );
      case 'w9':
        return (
          <div className="mt-6 p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow-lg border border-pink-200">
            <h2 className="text-2xl font-bold mb-2 text-pink-700">W-9 Form</h2>
            <p className="mb-6 text-gray-500">W-9 online fillable form coming soon.</p>
            <button className="mt-6 w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-150" onClick={() => setActiveForm(null)}>Back</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-2">
     
      {!activeForm ? (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow border border-pink-200 flex justify-between items-center">
            <span className="font-semibold text-pink-700">The Smith Agency Application</span>
            <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow transition-all duration-150" onClick={() => setActiveForm('application')}>Fill Out</button>
          </div>
          <div className="border-t border-pink-100"></div>
          <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow border border-pink-200 flex justify-between items-center">
            <span className="font-semibold text-pink-700">Direct Deposit Form</span>
            <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow transition-all duration-150" onClick={() => setActiveForm('directDeposit')}>Fill Out</button>
          </div>
          <div className="border-t border-pink-100"></div>
          <div className="p-6 bg-gradient-to-br from-pink-50 to-white rounded-xl shadow border border-pink-200 flex justify-between items-center">
            <span className="font-semibold text-pink-700">W-9 Form</span>
            <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg shadow transition-all duration-150" onClick={() => setActiveForm('w9')}>Fill Out</button>
          </div>
        </div>
      ) : (
        renderForm()
      )}
    </div>
  );
} 