import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const UI_TEXT = {
  loading: "Loading...",
  error: "Something went wrong",
  location: "Location",
  languagesKnown: "Languages Known",
  qualification: "Qualification",
  areasOfExpertise: "Areas of Expertise",
  affiliatedOrganisation: "Affiliated Organisation",
  yearsOfExperience: "Years of Experience",
  chronicles: "Chronicles",
};

const MediatorDetails = () => {
  const { id } = useParams();
  const [mediator, setMediator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uiText, setUiText] = useState(UI_TEXT);

  // Translate UI Labels
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");
    if (!lang) return;

    const translateLabels = async () => {
      try {
        const res = await fetch("http://localhost:5000/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: UI_TEXT, targetLang: lang }),
        });

        const data = await res.json();
        const translatedMap = {};
        (data?.pipelineResponse?.[0]?.output || []).forEach(
          ({ source, target }) => (translatedMap[source] = target)
        );

        const translated = Object.fromEntries(
          Object.entries(UI_TEXT).map(([key, val]) => [key, translatedMap[val] || val])
        );

        setUiText(translated);
      } catch (err) {
        console.error("Label translation error:", err);
      }
    };

    translateLabels();
  }, []);

  // Fetch and Translate Mediator Data
  useEffect(() => {
    const lang = localStorage.getItem("preferredLanguage");

    const fetchMediatorDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/get-mediator-by-id", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        });

        if (!res.ok) throw new Error("Failed to fetch mediator data");

        const data = await res.json();
        let mediatorData = data.mediator;

        // Translate response content if language is set
        if (lang) {
          const valuesToTranslate = {
            name: mediatorData.name,
            lastHeldPosition: mediatorData.lastHeldPosition,
            email: mediatorData.email,
            location: mediatorData.location,
            languagesKnown: mediatorData.languagesKnown,
            qualification: mediatorData.qualification,
            areasOfExpertise: mediatorData.areasOfExpertise,
            affiliatedOrganisation: mediatorData.affiliatedOrganisation,
            chronicles: mediatorData.chronicles,
          };

          const translationRes = await fetch("http://localhost:5000/translate/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonObject: valuesToTranslate, targetLang: lang }),
          });

          const translationData = await translationRes.json();
          const translatedMap = {};
          (translationData?.pipelineResponse?.[0]?.output || []).forEach(
            ({ source, target }) => (translatedMap[source] = target)
          );

          // Replace mediatorData values with translations
          for (let key in valuesToTranslate) {
            mediatorData[key] = translatedMap[valuesToTranslate[key]] || valuesToTranslate[key];
          }
        }

        setMediator(mediatorData);
      } catch (err) {
        console.error(err);
        setError(uiText.error);
      } finally {
        setLoading(false);
      }
    };

    fetchMediatorDetails();
  }, [id, uiText.error]);

  if (loading)
    return <div className="text-center mt-20 text-lg">{uiText.loading}</div>;
  if (error)
    return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="w-full mx-auto mt-15 p-5 bg-white rounded-2xl shadow-lg font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row rounded-t-lg p-4 bg-orange-50 items-center gap-10 md:gap-14">
        <img
          src={mediator.image || "/assets/images/default-avatar.png"}
          alt={mediator.name}
          className="w-40 h-40 rounded-full object-cover border-4 border-orange-400 shadow-md"
        />
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">{mediator.name}</h1>
          <p className="text-gray-600 mt-2">{mediator.lastHeldPosition}</p>
          <p className="text-sm text-gray-500">{mediator.email}</p>
        </div>
      </div>

      <div className="my-6 border-t border-gray-200" />

      {/* Translated Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Detail label={uiText.location} value={mediator.location} />
        <Detail label={uiText.languagesKnown} value={mediator.languagesKnown} />
        <Detail label={uiText.qualification} value={mediator.qualification} />
        <Detail label={uiText.areasOfExpertise} value={mediator.areasOfExpertise} />
        <Detail label={uiText.affiliatedOrganisation} value={mediator.affiliatedOrganisation} />
        <Detail
          label={uiText.yearsOfExperience}
          value={`${mediator.yearsOfExperience} years`}
        />
        <Detail
          label={uiText.chronicles}
          value={`"${mediator.chronicles}"`}
          italic
        />
      </div>
    </div>
  );
};

const Detail = ({ label, value, italic }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-700">{label}:</h2>
    <p className={`text-gray-900 mt-1 ${italic ? "italic text-gray-800" : ""}`}>{value}</p>
  </div>
);

export default MediatorDetails;
