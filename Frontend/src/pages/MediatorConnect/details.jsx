import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const MediatorDetails = () => {
  const { id } = useParams(); // This is the email in your case
  const [mediator, setMediator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMediatorDetails = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/get-mediator-by-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId: id }) // using id as email
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
    <div className="max-w-5xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-md font-sans">
  <h1 className="text-3xl font-bold text-center mb-8 text-[#1C1C1C]">Mediator Profile</h1>

  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
    {/* Profile Image */}
    <div className="flex-shrink-0">
      <img
        src={mediator.image || "/assets/images/default-avatar.png"}
        alt={mediator.name}
        className="w-48 h-48 object-cover rounded-full border-4 border-[#C1440E] shadow-md"
      />
    </div>

    {/* Mediator Details */}
    <div className="flex-1 text-left space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Name:</h2>
        <p className="text-gray-900">{mediator.name}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Email:</h2>
        <p className="text-gray-900">{mediator.email}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Location:</h2>
        <p className="text-gray-900">{mediator.location}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Languages Known:</h2>
        <p className="text-gray-900">{mediator.languagesKnown}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Qualification:</h2>
        <p className="text-gray-900">{mediator.qualification}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Areas of Expertise:</h2>
        <p className="text-gray-900">{mediator.areasOfExpertise}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Last Held Position:</h2>
        <p className="text-gray-900">{mediator.lastHeldPosition}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Affiliated Organisation:</h2>
        <p className="text-gray-900">{mediator.affiliatedOrganisation}</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Years of Experience:</h2>
        <p className="text-gray-900">{mediator.yearsOfExperience} years</p>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-gray-700">Chronicles:</h2>
        <p className="text-gray-800 italic">"{mediator.chronicles}"</p>
      </div>
    </div>
  </div>
</div>

  );
};

export default MediatorDetails;
