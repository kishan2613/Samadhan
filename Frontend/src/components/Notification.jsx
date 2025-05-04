import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Notification = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch suggestions for current user
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

  // Open the modal with full suggestion data
  const handleViewDetails = (suggestion) => {
    setSelectedSuggestion(suggestion);
    setModalOpen(true);
  };

  // Accept or decline the suggestion
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
          setSuggestions((prev) =>
            prev.filter((s) => s._id !== suggestionId)
          );
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
      <div className="text-center py-10 text-xl text-gray-600">
        Loading Notifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
        Notifications
      </h1>

      {suggestions.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">
          No suggestions at the moment.
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {suggestions.map((s) => (
            <div
              key={s._id}
              className="bg-white shadow-md rounded-xl flex items-center justify-between p-5 hover:shadow-lg transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={s.mediator.image}
                  alt={s.mediator.name}
                  className="w-16 h-16 rounded-full border-2 border-blue-500 object-cover"
                />
                <div>
                  <p className="text-gray-800 font-semibold">
                    {s.fromParty?.name || 'Someone'} suggested{' '}
                    <span className="text-blue-700">{s.mediator.name}</span> to you.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please review and respond.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleViewDetails(s)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedSuggestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-xl">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl"
              onClick={() => setModalOpen(false)}
            >
              &times;
            </button>

            {/* Mediator Full Details */}
            <div className="text-center">
              <img
                src={selectedSuggestion.mediator.image}
                alt={selectedSuggestion.mediator.name}
                className="w-24 h-24 mx-auto rounded-full border-2 border-blue-600 mb-4 object-cover"
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {selectedSuggestion.mediator.name}
              </h2>
              <p className="text-gray-500 mb-4">{selectedSuggestion.mediator.email}</p>

              <div className="text-left space-y-2 mb-4">
                <p><strong>Location:</strong> {selectedSuggestion.mediator.location}</p>
                <p><strong>Qualification:</strong> {selectedSuggestion.mediator.qualification}</p>
                <p><strong>Experience:</strong> {selectedSuggestion.mediator.yearsOfExperience} years</p>
                <p><strong>Expertise:</strong> {selectedSuggestion.mediator.areasOfExpertise}</p>
                <p><strong>Languages Known:</strong> {selectedSuggestion.mediator.languagesKnown}</p>
                <p><strong>Last Position:</strong> {selectedSuggestion.mediator.lastHeldPosition}</p>
                <p className="italic">"{selectedSuggestion.mediator.chronicles}"</p>
              </div>

              <p className="text-gray-700 mb-6">
                If you agree with this suggestion, accept to create a proposal so the recruiter can view your case.
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAction('accepted')}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                >
                  Accept & Create Proposal
                </button>
                <button
                  onClick={() => handleAction('declined')}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
