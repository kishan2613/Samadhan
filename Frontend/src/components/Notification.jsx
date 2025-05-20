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
<div className="max-w-screen-xl h-[100vh] mt-16 md:0  mx-auto bg-white rounded-xl shadow-md flex ">
  {/* Left side with fixed width */}
  <div className="w-1/2 bg-[#f5f0eb]  flex flex-col hidden md:block">
    <img
      src="/assets/images/Notification.png"
      alt="Notifications"
      className="w-45 h-45 object-contain "
    />
    <p className="italic text-center text-[#bb5b45] p-2 mt-4">
      "In the middle of every conflict lies an opportunity — mediation turns that opportunity into resolution."
    </p>
  </div>

  {/* Right side with internal scrolling */}
  <div className="flex-1 bg-[#bb5b45]  h-full overflow-y-auto p-6 space-y-6">
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
              {s.fromParty?.name || 'Someone'} suggested{' '}
              <span className="text-blue-700">{s.mediator.name}</span> to you.
            </p>
            <p className="text-sm text-gray-500">Please review and respond.</p>
          </div>
        </div>
        <button
          onClick={() => handleViewDetails(s)}
          className="bg-[#d1a76e] text-black px-2 py-2 rounded-lg hover:bg-blue-700"
        >
          View Details
        </button>
      </div>
    ))}
  </div>
</div>

  );
};

export default Notification;
