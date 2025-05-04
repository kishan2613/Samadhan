import React, { useEffect, useState } from "react";
import axios from "axios";

const ActiveProposal = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
          setError("No mediator ID found in localStorage.");
          setLoading(false);
          return;
        }

        const response = await axios.post("http://localhost:5000/api/proposals/by-mediator", {
          mediatorId: storedUser._id,
        });

        if (response.data && Array.isArray(response.data)) {
          // Filter proposals with "pending" mediator decision
          const pendingProposals = response.data.filter(proposal => proposal.mediatorDecision === 'pending');
          setProposals(pendingProposals);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setError("Error fetching proposals.");
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const acceptProposal = async (proposalId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      setError("No mediator ID found in localStorage.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/proposals/accept", {
        proposalId,
        mediatorId: storedUser._id,
      });

      if (response.data.chatRoomId) {
        setSuccessMessage("Successfully accepted the proposal! A common chat room for you and the clients has been created. Kindly check the Chat Room section.");
        setProposals(proposals.filter(proposal => proposal._id !== proposalId)); // Remove accepted proposal from the list
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      setError("Error accepting the proposal.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Active Proposals</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading proposals...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : proposals.length === 0 ? (
        <p className="text-center text-gray-500">No pending proposals available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-all">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Proposal ID: {proposal._id}</h2>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Status:</strong> <span className="text-yellow-500">{proposal.mediatorDecision}</span>
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Summary:</strong> {proposal.summaryText || "No summary available."}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                <strong>Created:</strong> {new Date(proposal.createdAt).toLocaleString()}
              </p>
              <div className="text-center mt-4">
                <button
                  onClick={() => acceptProposal(proposal._id)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Accept Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Display success message if proposal is accepted */}
      {successMessage && (
        <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md shadow-lg">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ActiveProposal;
