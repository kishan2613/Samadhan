import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Proposal = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { proposalId } = location.state || {};

  const [summary, setSummary] = useState('');
  const [documentLink, setDocumentLink] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!summary.trim()) {
      alert('Please enter a case summary.');
      return;
    }

    if (!proposalId) {
      alert('Proposal ID is missing. Please navigate properly.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;

    if (!userId) {
      alert('User not found. Please log in again.');
      return;
    }

    const summaryText = `${summary.trim()}\n\nSupportive links submitted by user:\n${documentLink}`;

    try {
      const res = await fetch(`http://localhost:5000/api/proposals/${proposalId}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryText,
          userId,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage(
          'Your proposal is submitted. Please wait for the mediator to accept it. You will be automatically added to the room along with the mediator and your opponent.'
        );
        setTimeout(() => navigate('/'), 2000);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 flex justify-center items-start">
      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-3xl">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
          Submit Your Proposal
        </h2>

        {proposalId ? (
          <>
            <p className="text-sm text-gray-600 mb-4">
              Proposal ID: <span className="font-medium">{proposalId}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Case Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your case in detail..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Supporting Documents Link (Google Drive, etc.)
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paste your document link here"
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Please upload your documents to Google Drive and paste the shared link here.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Submit Proposal
              </button>

              {submitted && (
                <p className="text-green-600 text-center font-medium mt-4">
                  {message}
                </p>
              )}
            </form>
          </>
        ) : (
          <p className="text-red-600 font-medium text-center">
            Proposal ID is missing. Please return to the previous step.
          </p>
        )}
      </div>
    </div>
  );
};

export default Proposal;
