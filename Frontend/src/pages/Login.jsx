import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import LoginMock from "../WebData/Login.json"

const LoginCache = {};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [LoginData, setLoginData] = useState(LoginMock);

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    // If cached, use it
    if (LoginCache[preferredLanguage]) {
      setLoginData(LoginCache[preferredLanguage]);
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
              jsonObject: LoginMock,
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

        const translated = translateJSON(LoginMock);
        LoginCache[preferredLanguage] = translated;
        setLoginData(translated);
      } catch (err) {
        console.error("Navbar translation error:", err);
      }
    })();
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user (assuming login returns both)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'party') {
          navigate('/mediator-connect');
        } else if (data.user.role === 'mediator') {
          navigate('/mediator-details');
        } else {
          navigate('/');
        }
      } else {
        alert(LoginData.alerts.invalid);
      }
    } catch (err) {
      console.error(err);
      alert(LoginData.alerts.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">{LoginData.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder={LoginData.fields.email.placeholder}
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder={LoginData.fields.password.placeholder}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded pr-10"
            />
            <div
              className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? LoginData.buttons.loggingIn : LoginData.buttons.login}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
         {LoginData.link.prefix}{' '}
          <Link to="/SignUp" className="text-blue-600 hover:underline">
          {LoginData.link.text}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
