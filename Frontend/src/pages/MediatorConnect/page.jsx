import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Pagination from "@mui/material/Pagination";
import Mediatorcont from "../../WebData/MediConnect.json"

const fixedcache = {}

const MediatorConnect = () => {
  const [mediators, setMediators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [MediatorPag, setMediatorPag] = useState(Mediatorcont);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMediatorId, setSelectedMediatorId] = useState(null);
  const [opponentEmail, setOpponentEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
        const preferredLanguage = localStorage.getItem("preferredLanguage");

        if (!preferredLanguage) return;

        // if we already did this language, pull from cache
        if (fixedcache[preferredLanguage]) {
          setMediatorPag(fixedcache[preferredLanguage]);
          return;
        }

        
        if (preferredLanguage) {
          const translateContent = async () => {
            try {
              const response = await fetch(
                "http://localhost:5000/translate/translate",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    jsonObject: Mediatorcont,
                    targetLang: preferredLanguage,
                  }),
                }
              );
    
              const data = await response.json();
    
              if (data?.pipelineResponse?.[0]?.output) {
                const translations = data.pipelineResponse[0].output;
                const translationMap = {};
    
                // Map all source -> target pairs
                translations.forEach(({ source, target }) => {
                  translationMap[source] = target;
                });
    
                // Recursively replace matching strings in content
                const translateJSON = (obj) => {
                  if (typeof obj === "string") {
                    return translationMap[obj] || obj;
                  } else if (Array.isArray(obj)) {
                    return obj.map(translateJSON);
                  } else if (typeof obj === "object" && obj !== null) {
                    const newObj = {};
                    for (let key in obj) {
                      newObj[key] = translateJSON(obj[key]);
                    }
                    return newObj;
                  }
                  return obj;
                };
    
                const newTranslatedContent = translateJSON(Mediatorcont);
                fixedcache[preferredLanguage] = newTranslatedContent;
                setMediatorPag(newTranslatedContent);
              }
            } catch (err) {
              console.error("Translation API error:", err);
            }
          };
    
          translateContent();
        }
      }, []);

  useEffect(() => {
    const fetchMediators = async () => {
      setLoading(true);
      const lang = localStorage.getItem("preferredLanguage");
      try {
        const response = await fetch(
          `http://localhost:5000/api/auth/get-mediators?page_no=${page}&targetLang=${lang}`
        );
        const data = await response.json();
        setMediators(data.mediators);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch mediator data");
      } finally {
        setLoading(false);
      }
    };
    fetchMediators();
   }, [page]);

  const openSuggestModal = (mediatorId) => {
    setSelectedMediatorId(mediatorId);
    setOpponentEmail("");
    setStatusMessage("");
    setIsModalOpen(true);
  };

  const handleSuggestSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const fromPartyId = user._id;
    if (!fromPartyId) {
      setStatusMessage(MediatorPag.status.notLoggedIn);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromParty: fromPartyId,
          toPartyEmail: opponentEmail,
          mediatorId: selectedMediatorId,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success !== false) {
        setStatusMessage(MediatorPag.status.success);
        setTimeout(() => {
          setIsModalOpen(false);
        }, 2000);
      } else {
        setStatusMessage(MediatorPag.status.failed);
      }
    } catch (err) {
      console.error(err);
      setStatusMessage(MediatorPag.status.networkError);
    }
  };

  const filteredMediators = mediators.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="text-center mt-16 text-lg font-medium text-gray-600">
        {MediatorPag.loadingMessage}
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-16 text-red-600 text-lg">{MediatorPag.errorMessage}</div>
    );

  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] min-h-screen bg-gray-50 pt-20 px-4 md:px-8">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-gray-800 mb-6">
        {MediatorPag.pageTitle}
      </h1>

      {/* Search */}
      <div className="flex justify-center mb-10">
        <input
          type="text"
          placeholder={MediatorPag.searchPlaceholder}
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
          {filteredMediators.length > 0 ? (
            filteredMediators.map((mediator) => (
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
                  <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-1">
                    {mediator.name}
                  </h2>
                  <p className="text-xs text-gray-600">
                    <strong>{MediatorPag.labels.location}:</strong> {mediator.location}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong>{MediatorPag.labels.languages}:</strong> {mediator.languagesKnown}
                  </p>
                  {/* <p className="text-xs text-gray-600"><strong>Qualification:</strong> {mediator.qualification}</p> */}
                  <p className="text-xs text-gray-600">
                    <strong>{MediatorPag.labels.experience}:</strong> {mediator.yearsOfExperience}{" "}
                    {MediatorPag.labels.yearsSuffix}
                  </p>
                  &nbsp;
                  <p className="text-xs text-gray-600 bg-[#f5f0eb] rounded-sm border border-gray-200 p-1">
                    <strong>{mediator.areasOfExpertise}</strong>
                  </p>
                  {/* <p className="text-[0.7rem] italic text-gray-500 mt-1">"{mediator.chronicles}"</p> */}
                  {/* Buttons */}
                  <div className="flex mt-[2vw] md:mt-4 space-x-2">
                    <button
                      onClick={() => navigate(`/mediator/${mediator._id}`)}
                      className="w-1/2 py-[1.8vw] md:py-2 rounded-lg bg-[#d1a76e] hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 text-white text-xs md:text-sm transition"
                    >
                      {MediatorPag.buttons.contact}
                    </button>
                    <button
                      onClick={() => openSuggestModal(mediator._id)}
                      className="w-1/2 py-[1.8vw] md:py-2 rounded-lg bg-black text-white text-xs md:text-sm transition"
                    >
                      {MediatorPag.buttons.suggest}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p>{MediatorPag.noResults}</p>
          )}
        </div>
      </motion.div>

      {/* Pagination */}
      <div className="flex justify-center my-8">
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
        />
      </div>

      {/* Suggest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {MediatorPag.suggestmediator}
            </h2>
            <form onSubmit={handleSuggestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {MediatorPag.opponentEmailLabel}
                </label>
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
                <p className="text-center text-sm text-green-600">
                  {statusMessage}
                </p>
              )}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full bg-gray-300 text-gray-800 hover:bg-gray-400 transition"
                >
                  {MediatorPag.buttons.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                >
                  {MediatorPag.buttons.submit}
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
