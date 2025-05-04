import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MediatorConnect = () => {
  const [mediators, setMediators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
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
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          fromParty: fromPartyId,
          toPartyEmail: opponentEmail,
          mediatorId: selectedMediatorId,
        }),
      });
      const result = await res.json();

      if (res.ok && result.success !== false) {
        setStatusMessage('Suggestion Sent Successfully');
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

  const filteredMediators = mediators.filter(mediator =>
    mediator.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-10 text-xl font-semibold">Loading mediators...</div>;
  if (error)   return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
    <h1 className="text-4xl font-bold text-center mb-4 text-blue-800">Connect with Mediators</h1>

    {/* Search Bar */}
    <div className="flex justify-center mb-8">
      <input
        type="text"
        placeholder="Search mediator by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredMediators.length > 0 ? filteredMediators.map((mediator) => (
          <div key={mediator._id} className="bg-white shadow-xl rounded-2xl overflow-hidden transition-transform hover:scale-105">
            <img
              src={mediator.image || "/assets/images/default-avatar.png"}
              alt={mediator.name}
              className="w-full h-60 object-cover"
            />
            <div className="p-5">
              <h2 className="text-2xl font-semibold text-blue-700">{mediator.name}</h2>
              <p className="text-gray-600 mb-2"><strong>Location:</strong> {mediator.location}</p>
              <p className="text-gray-600 mb-2"><strong>Languages:</strong> {mediator.languagesKnown}</p>
              <p className="text-gray-600 mb-2"><strong>Expertise:</strong> {mediator.areasOfExpertise}</p>
              <p className="text-gray-600 mb-2"><strong>Qualification:</strong> {mediator.qualification}</p>
              <p className="text-gray-600 mb-2"><strong>Experience:</strong> {mediator.yearsOfExperience} years</p>
              <p className="text-sm text-gray-500 mt-3 italic">"{mediator.chronicles}"</p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => navigate(`/mediator/${mediator._id}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Contact
                </button>
                <button
                  onClick={() => openSuggestModal(mediator._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Suggest
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center text-gray-500 text-lg">No mediators match your search.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">Suggest this mediator</h2>
            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">Opponent's Email</label>
                <input
                  type="email"
                  required
                  value={opponentEmail}
                  onChange={(e) => setOpponentEmail(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring"
                  placeholder="opponent@example.com"
                />
              </div>
              {statusMessage && (
                <p className="text-center text-sm text-green-600">{statusMessage}</p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
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
