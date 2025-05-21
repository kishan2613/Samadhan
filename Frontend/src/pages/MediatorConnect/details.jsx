import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MediatorDetails = () => {
  const { id } = useParams();
  const [mediator, setMediator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMediatorDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/get-mediator-by-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: id }),
        });

        if (!res.ok) throw new Error("Failed to fetch mediator data");

        const data = await res.json();
        setMediator(data.mediator);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchMediatorDetails();
  }, [id]);

  if (loading) return <div className="text-center mt-20 text-lg">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
    <div className="w-full mx-auto mt-20 p-5 bg-white rounded-2xl shadow-lg font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row rounded-t-lg p-4 bg-orange-50 items-center gap-10 md:gap-14">
        {/* Profile Image */}
        <img
          src={mediator.image || "/assets/images/default-avatar.png"}
          alt={mediator.name}
          className="w-40 h-40 rounded-full object-cover border-4 border-orange-400 shadow-md"
        />

        {/* Basic Info */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800">{mediator.name}</h1>
          <p className="text-gray-600 mt-2">{mediator.lastHeldPosition}</p>
          <p className="text-sm text-gray-500">{mediator.email}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-6 border-t border-gray-200" />

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Detail label="Location" value={mediator.location} />
        <Detail label="Languages Known" value={mediator.languagesKnown} />
        <Detail label="Qualification" value={mediator.qualification} />
        <Detail label="Areas of Expertise" value={mediator.areasOfExpertise} />
        <Detail label="Affiliated Organisation" value={mediator.affiliatedOrganisation} />
        <Detail label="Years of Experience" value={`${mediator.yearsOfExperience} years`} />
        <Detail label="Chronicles" value={`"${mediator.chronicles}"`} italic />
      </div>
    </div>
  );
};

// Reusable component for cleaner code
const Detail = ({ label, value, italic }) => (
  <div>
    <h2 className="text-lg font-semibold text-gray-700">{label}:</h2>
    <p className={`text-gray-900 mt-1 ${italic ? "italic text-gray-800" : ""}`}>{value}</p>
  </div>
);

export default MediatorDetails;
