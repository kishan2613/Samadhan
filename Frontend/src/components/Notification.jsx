import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UI_TEXT = {
  loading: 'Loading Notifications...',
  viewDetails: 'View Details',
  reviewRespond: 'Please review and respond.',
  suggested: 'have suggest',
  quote: 'In the middle of every conflict lies an opportunity — mediation turns that opportunity into resolution.',
  suggestedto: 'to you.',
};

const Notification = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uiText, setUiText] = useState(UI_TEXT);

  const navigate = useNavigate();

  // Translate UI text
  useEffect(() => {
    const lang = localStorage.getItem('preferredLanguage');
    if (!lang) return;

    const translateText = async () => {
      try {
        const res = await fetch('http://localhost:5000/translate/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonObject: UI_TEXT, targetLang: lang }),
        });

        const data = await res.json();
        const map = {};
        (data?.pipelineResponse?.[0]?.output || []).forEach(
          ({ source, target }) => (map[source] = target)
        );

        const translated = Object.fromEntries(
          Object.entries(UI_TEXT).map(([key, val]) => [key, map[val] || val])
        );

        setUiText(translated);
      } catch (err) {
        console.error('Translation error:', err);
      }
    };

    translateText();
  }, []);

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
      <div className="text-center py-10 text-xl text-gray-600">
        {uiText.loading}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl h-[100vh] mx-auto bg-white rounded-xl shadow-md flex relative">
      {/* Left side with fixed width */}
      <div className="w-1/2 bg-[#f5f0eb] flex flex-col hidden md:block">
        <img
          src="/assets/images/Notification.png"
          alt="Notifications"
          className="w-45 h-45 object-contain"
        />
        <p className="italic text-center text-[#bb5b45] p-2 mt-4">
          "{uiText.quote}"
        </p>
      </div>

      {/* Right side with internal scrolling */}
      <div className="flex-1 bg-[#bb5b45] h-full overflow-y-auto p-6 space-y-6">
        {suggestions.map((s) => (
          <div
            key={s._id}
            className="bg-white shadow-md rounded-xl flex items-center justify-between p-4 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <img
                src={s.mediator.image}
                alt={s.mediator.name}
                className="w-14 h-14 rounded-full border-2 border-blue-500 object-cover"
              />
              <div>
                <p className="text-gray-800 font-semibold">
                  {s.fromParty?.name || 'Someone'} {uiText.suggested}{' '}
                  <span className="text-blue-700">{s.mediator.name}</span> {uiText.suggestedto}
                </p>
                <p className="text-sm text-gray-500">{uiText.reviewRespond}</p>
              </div>
            </div>
            <button
              onClick={() => handleViewDetails(s)}
              className="bg-[#d1a76e] text-black px-2 py-2 rounded-lg hover:bg-blue-700"
            >
              {uiText.viewDetails}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full relative shadow-lg">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-lg"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-2 text-gray-800">
              Mediator: {selectedSuggestion.mediator.name}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedSuggestion.description || 'No additional details provided.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleAction('rejected')}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Reject
              </button>
              <button
                onClick={() => handleAction('accepted')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
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
