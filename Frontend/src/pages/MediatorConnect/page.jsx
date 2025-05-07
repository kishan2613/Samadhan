import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MediatorConnect = () => {
  const [mediators, setMediators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediatorId, setSelectedMediatorId] = useState(null);
  const [opponentEmail, setOpponentEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMediators = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/get-mediators');
        const data = await response.json();
        setMediators(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch mediator data');
      } finally {
        setLoading(false);
      }
    };
    fetchMediators();
  }, []);

  const openSuggestModal = (mediatorId) => {
    setSelectedMediatorId(mediatorId);
    setOpponentEmail('');
    setStatusMessage('');
    setIsModalOpen(true);
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const fromPartyId = user._id;
    if (!fromPartyId) {
      setStatusMessage('You must be logged in to suggest');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromParty: fromPartyId,
          toPartyEmail: opponentEmail,
          mediatorId: selectedMediatorId,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success !== false) {
        setStatusMessage('✅ Suggestion Sent Successfully');
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      } else {
        setStatusMessage(result.message || 'Failed to send suggestion');
      }
    } catch (err) {
      console.error(err);
      setStatusMessage('Network error, please try again');
    }
  };

  const filteredMediators = mediators.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return <div className="text-center mt-16 text-lg font-medium text-gray-600">Loading mediators...</div>;

  if (error)
    return <div className="text-center mt-16 text-red-600 text-lg">{error}</div>;

  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] min-h-screen bg-gray-50 pt-20 px-4 md:px-8">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-gray-800 mb-6">
        Connect with Mediators
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder="Search by mediator name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-lg px-4 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>


      {/* Mediator Cards */}
      <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-8">
  {filteredMediators.length > 0 ? filteredMediators.map((mediator) => (
    <div
      key={mediator._id}
      className="bg-white rounded-xl shadow-md hover:shadow-2g transition-shadow duration-300 flex flex-col h-full"
    >
      <img
        src={mediator.image || "/assets/images/default-avatar.png"}
        alt={mediator.name}
        className="w-full p-2 h-56 object-cover rounded-t-xl"
      />
      <div className="flex flex-col flex-grow">
        <div className="flex-grow p-3">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{mediator.name}</h2>
          <p className="text-xs text-gray-600 mb-1"><strong>Location:</strong> {mediator.location}</p>
          <p className="text-xs text-gray-600 mb-1"><strong>Languages:</strong> {mediator.languagesKnown}</p>
          <p className="text-xs text-gray-600 mb-1"><strong>Expertise:</strong> {mediator.areasOfExpertise}</p>
          <p className="text-xs text-gray-600 mb-1"><strong>Qualification:</strong> {mediator.qualification}</p>
          <p className="text-xs text-gray-600"><strong>Experience:</strong> {mediator.yearsOfExperience} yrs</p>
          <p className="text-xs text-gray-500 italic mt-3">"{mediator.chronicles}"</p>
        </div>
        <div className=" flex mt-[14px] justify-between">
          <button
            onClick={() => navigate(`/mediator/${mediator._id}`)}
            className="w-1/2 py-2 rounded-bl-xl bg-[#d1a76e] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 text-white text-sm hover:bg-blue-700 transition"
          >
            Contact
          </button>
          <button
            onClick={() => openSuggestModal(mediator._id)}
            className="w-1/2 py-2 rounded-br-xl bg-black text-white text-sm  transition"
          >
            Suggest
          </button>
        </div>
      </div>
    </div>
  )) : (
    <p>No mediators found.</p>
  )}
</div>


      {/* Suggest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Suggest this Mediator</h2>
            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Opponent's Email</label>
                <input
                  type="email"
                  required
                  value={opponentEmail}
                  onChange={(e) => setOpponentEmail(e.target.value)}
                  placeholder="opponent@example.com"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {statusMessage && (
                <p className="text-center text-sm text-green-600">{statusMessage}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediatorConnect;
