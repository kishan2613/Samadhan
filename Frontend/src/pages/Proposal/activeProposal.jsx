import React, { useEffect, useState } from "react";
import axios from "axios";

const UI_TEXT = {
  heading: "Active Proposals",
  loading: "Loading proposals...",
  noProposals: "No pending proposals available.",
  errorFetching: "Error fetching proposals.",
  errorNoMediator: "No mediator ID found in localStorage.",
  acceptBtn: "Accept Proposal",
  success: "Successfully accepted the proposal! A common chat room has been created. Check the Chat Room section.",
  proposalId: "Proposal ID",
  status: "Status",
  summary: "Summary",
  created: "Created",
  noSummary: "No summary available.",
};

const ActiveProposal = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uiText, setUiText] = useState(UI_TEXT);
  const [translationMap, setTranslationMap] = useState(null);

  const translateJSON = (obj, map) => {
    if (typeof obj === "string") return map[obj] || obj;
    if (Array.isArray(obj)) return obj.map((o) => translateJSON(o, map));
    if (obj && typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, translateJSON(v, map)])
      );
    }
    return obj;
  };

  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    (async () => {
      try {
        const res = await fetch("http://localhost:5000/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: UI_TEXT, targetLang: lang }),
        });
        const data = await res.json();
        const map = {};
        (data?.pipelineResponse?.[0]?.output || []).forEach(
          ({ source, target }) => (map[source] = target)
        );
        setTranslationMap(map);
        setUiText(translateJSON(UI_TEXT, map));
      } catch (err) {
        console.error("Translation error:", err);
      }
    })();
  }, []);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser._id) {
          setError(uiText.errorNoMediator);
          setLoading(false);
          return;
        }

        const response = await axios.post(
          "http://localhost:5000/api/proposals/by-mediator",
          { mediatorId: storedUser._id }
        );

        if (Array.isArray(response.data)) {
          const pending = response.data.filter(
            (proposal) => proposal.mediatorDecision === "pending"
          );

          const translated = translationMap
            ? translateJSON(pending, translationMap)
            : pending;

          setProposals(translated);
        }
      } catch (error) {
        console.error("Error fetching proposals:", error);
        setError(uiText.errorFetching);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [translationMap]);

  const acceptProposal = async (proposalId) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser || !storedUser._id) {
      setError(uiText.errorNoMediator);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/proposals/accept", {
        proposalId,
        mediatorId: storedUser._id,
      });

      if (res.data.chatRoomId) {
        setSuccessMessage(uiText.success);
        setProposals((prev) => prev.filter((p) => p._id !== proposalId));
      }
    } catch (error) {
      console.error("Error accepting proposal:", error);
      setError(uiText.errorFetching);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-[url('/assets/images/Assistant-Bg.png')] bg-cover">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
        {uiText.heading}
      </h1>

      {loading && <p className="text-center text-gray-600">{uiText.loading}</p>}
      {error && <p className="text-center text-red-600 font-semibold">{error}</p>}
      {!loading && !error && proposals.length === 0 && (
        <p className="text-center text-gray-500">{uiText.noProposals}</p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <div
            key={proposal._id}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              {uiText.proposalId}:{" "}
              <span className="text-[#bb5b45] break-words">{proposal._id}</span>
            </h2>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{uiText.status}:</strong>{" "}
              <span className="text-yellow-600 capitalize">
                {proposal.mediatorDecision}
              </span>
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>{uiText.summary}:</strong>{" "}
              <span>{proposal.summaryText || uiText.noSummary}</span>
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <strong>{uiText.created}:</strong>{" "}
              {new Date(proposal.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => acceptProposal(proposal._id)}
              className="w-full bg-[#bb5b45] text-white font-semibold py-2 rounded-md  transition"
            >
              {uiText.acceptBtn}
            </button>
          </div>
        ))}
      </div>

      {successMessage && (
        <div className="mt-6 mx-auto max-w-xl p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg shadow-md animate-fadeIn">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ActiveProposal;
