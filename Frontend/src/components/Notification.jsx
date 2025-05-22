import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Loaders from './common/Loader';

const Notification = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const userData = localStorage.getItem('user');
        const parsedUser = userData ? JSON.parse(userData) : null;

        if (!parsedUser?.email) {
          console.error('Email not found in localStorage user object');
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/api/suggestions/received', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: parsedUser.email }),
        });

        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch (err) {
        console.error('Failed to fetch suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleViewDetails = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setModalOpen(true);
  };

  const handleAction = async (action) => {
    if (!selectedSuggestion) return;

    const userData = localStorage.getItem('user');
    const parsedUser = userData ? JSON.parse(userData) : null;
    const userId = parsedUser?._id;
    const suggestionId = selectedSuggestion._id;

    try {
      const res = await fetch('http://localhost:5000/api/suggestions/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, suggestionId, action }),
      });

      const result = await res.json();

      if (res.ok) {
        if (action === 'accepted') {
          navigate('/proposal', { state: { proposalId: result._id } });
        } else {
          setSuggestions((prev) => prev.filter((s) => s._id !== suggestionId));
          setModalOpen(false);
        }
      } else {
        alert(result.message || 'Action failed');
      }
    } catch (error) {
      console.error('Error responding to suggestion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-500">
        <Loaders/>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto h-screen flex bg-white shadow-md rounded-xl overflow-hidden">
      {/* Left Panel */}
      <div className="w-1/2 bg-[#f5f0eb] hidden md:flex flex-col  items-center p-0">
        <img
          src="/assets/images/Notification.png"
          alt="Notifications"
          className="w-full h-auto object-contain "
        />
        <p className="italic text-center text-[#bb5b45] mt-6 px-4 text-lg">
          "In the middle of every conflict lies an opportunity — mediation turns that opportunity into resolution."
        </p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-[#bb5b45] overflow-y-auto p-6 space-y-6">
        {suggestions.length === 0 ? (
          <p className="text-white text-center text-lg mt-10">No new notifications at the moment.</p>
        ) : (
          suggestions.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-lg shadow p-4 flex justify-between items-center hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={s.mediator.image}
                  alt={s.mediator.name}
                  className="w-14 h-14 rounded-full border-2 border-[#bb5b45] object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800">
                    {s.fromParty?.name || 'Someone'} recommended{' '}
                    <span className="text-[#bb5b45]">{s.mediator.name}</span>.
                  </p>
                  <p className="text-sm text-gray-500">Click to review and take action.</p>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(s)}
                className="bg-[#d1a76e] hover:bg-[#a6773b] text-white px-4 py-2 rounded-lg font-medium"
              >
                View
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Mediator Suggestion Details</h2>
            <div className="flex items-center gap-4">
              <img
                src={selectedSuggestion.mediator.image}
                alt={selectedSuggestion.mediator.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">{selectedSuggestion.mediator.name}</p>
                <p className="text-sm text-gray-600">{selectedSuggestion.mediator.email}</p>
              </div>
            </div>
            <p><strong>Message:</strong> {selectedSuggestion.message || 'No message provided.'}</p>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => handleAction('declined')}
                className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={() => handleAction('accepted')}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
