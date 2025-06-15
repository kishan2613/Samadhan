import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate

const MediatorDetailsForm = () => {
  const [formData, setFormData] = useState({
    image: '',
    category: '',
    location: '',
    chronicles: '',
    qualification: '',
    languagesKnown: '',
    otherInterests: '',
    areasOfExpertise: '',
    lastHeldPosition: '',
    yearsOfExperience: '',
    affiliatedOrganisation: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize the hook

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://samadhan-zq8e.onrender.com/api/auth/update-mediator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Mediator profile updated successfully!');
        console.log(data);
        localStorage.setItem('user', JSON.stringify(data));
        navigate('/'); // ✅ Redirect to home page
      } else {
        alert(data.msg || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Mediator Additional Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'image', label: 'Image URL' },
            { name: 'location', label: 'Location' },
            { name: 'chronicles', label: 'Chronicles' },
            { name: 'qualification', label: 'Qualification' },
            { name: 'languagesKnown', label: 'Languages Known' },
            { name: 'otherInterests', label: 'Other Interests' },
            { name: 'areasOfExpertise', label: 'Areas of Expertise' },
            { name: 'lastHeldPosition', label: 'Last Held Position' },
            { name: 'yearsOfExperience', label: 'Years of Experience' },
            { name: 'affiliatedOrganisation', label: 'Affiliated Organisation' },
          ].map(({ name, label }) => (
            <input
              key={name}
              type="text"
              name={name}
              placeholder={label}
              value={formData[name]}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MediatorDetailsForm;
