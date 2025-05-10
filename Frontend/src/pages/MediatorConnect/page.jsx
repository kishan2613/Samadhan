  import React, { useEffect, useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { motion } from "framer-motion";

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
     <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-1 max-w space-y-6 z-10"
        >
    <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredMediators.length > 0 ? filteredMediators.map((mediator) => (
          <div
      key={mediator._id}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-row items-center p-[2vw] md:p-4 border border-gray-200"
    >
      {/* Profile Image */}
      <div className="flex-shrink-0 mb-8 mr-[4vw] md:mr-6">
        <img
          src={mediator.image || "/assets/images/default-avatar.png"}
          alt={mediator.name}
          className="w-[25vw] h-[25vw] md:w-[6vw] md:h-[6vw] object-cover rounded-full border-4 border-gray-300 shadow-sm"
        />
      </div>

      {/* Mediator Info */}
      <div className="flex flex-col justify-between w-full">
        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">{mediator.name}</h2>
        <p className="text-xs text-gray-600"><strong>Location:</strong> {mediator.location}</p>
        <p className="text-xs text-gray-600"><strong>Languages:</strong> {mediator.languagesKnown}</p>
        {/* <p className="text-xs text-gray-600"><strong>Qualification:</strong> {mediator.qualification}</p> */}
        <p className="text-xs text-gray-600"><strong>Experience:</strong> {mediator.yearsOfExperience} yrs</p>
        &nbsp;
        <p className="text-xs text-gray-600 bg-[#f5f0eb] rounded-sm border border-gray-200 p-1"><strong>{mediator.areasOfExpertise}</strong></p>
        {/* <p className="text-[0.7rem] italic text-gray-500 mt-1">"{mediator.chronicles}"</p> */}

        {/* Buttons */}
        <div className="flex mt-[2vw] md:mt-4 space-x-2">
          <button
            onClick={() => navigate(`/mediator/${mediator._id}`)}
            className="w-1/2 py-[1.8vw] md:py-2 rounded-lg bg-[#d1a76e] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 text-white text-xs md:text-sm transition"
          >
            Contact
          </button>
          <button
            onClick={() => openSuggestModal(mediator._id)}
            className="w-1/2 py-[1.8vw] md:py-2 rounded-lg bg-black text-white text-xs md:text-sm transition"
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

  </motion.div>


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
