import React, { useState,useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate
import SignUp from "../WebData/Signup.json"

const SignUpCache = {};

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const [SignupData, setSignupData] = useState(SignUp);

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    // If cached, use it
    if (SignUpCache[preferredLanguage]) {
      setSignupData(SignUpCache[preferredLanguage]);
      return;
    }

    // Otherwise fetch & translate
    (async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/translate/translate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonObject: SignUp,
              targetLang: preferredLanguage,
            }),
          }
        );
        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => {
          map[source] = target;
        });

        const translateJSON = (obj) => {
          if (typeof obj === "string") return map[obj] || obj;
          if (Array.isArray(obj)) return obj.map(translateJSON);
          if (obj && typeof obj === "object") {
            return Object.fromEntries(
              Object.entries(obj).map(([k, v]) => [k, translateJSON(v)])
            );
          }
          return obj;
        };

        const translated = translateJSON(SignUp);
        SignUpCache[preferredLanguage] = translated;
        setSignupData(translated);
      } catch (err) {
        console.error("Navbar translation error:", err);
      }
    })();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 👈 Initialize navigate

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(SignupData.alerts.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        alert(SignupData.alerts.success);

        // ✅ Redirect based on role
        if (data.user.role === 'party') {
          navigate('/mediator-connect');
        } else if (data.user.role === 'mediator') {
          navigate('/mediator-details');
        }
      } else {
        alert(SignupData.alerts.registrationFailed);
      }
    } catch (err) {
      console.error(err);
      alert(SignupData.alerts.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{SignupData.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder={SignupData.fields.name}
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder={SignupData.fields.email}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={SignupData.fields.password}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded pr-10"
            />
            <div
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder={SignupData.fields.confirmPassword}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded pr-10"
            />
            <div
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </div>
          </div>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">{SignupData.fields.role.placeholder}</option>
            <option value="party">{SignupData.fields.role.options[0].label}</option>
            <option value="mediator">{SignupData.fields.role.options[1].label}</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? SignupData.buttons.submitting : SignupData.buttons.submit}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
