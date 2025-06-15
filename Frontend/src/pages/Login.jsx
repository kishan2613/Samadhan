import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import LoginMock from "../WebData/Login.json";

const LoginCache = {};
 
const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [LoginData, setLoginData] = useState(LoginMock);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    if (LoginCache[preferredLanguage]) {
      setLoginData(LoginCache[preferredLanguage]);
      return;
    }

    (async () => {
      try {
        const res = await fetch("https://samadhan-zq8e.onrender.com/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: LoginMock, targetLang: preferredLanguage }),
        });

        const data = await res.json();
        const outputs = data.pipelineResponse?.[0]?.output || [];
        const map = {};
        outputs.forEach(({ source, target }) => { map[source] = target; });

        const translateJSON = (obj) => {
          if (typeof obj === "string") return map[obj] || obj;
          if (Array.isArray(obj)) return obj.map(translateJSON);
          if (obj && typeof obj === "object") {
            return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, translateJSON(v)]));
          }
          return obj;
        };

        const translated = translateJSON(LoginMock);
        LoginCache[preferredLanguage] = translated;
        setLoginData(translated);
      } catch (err) {
        console.error("Translation error:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://samadhan-zq8e.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        if (data.user.role === 'party') {
          navigate('/mediator-connect');
        } else if (data.user.role === 'mediator') {
          navigate('/mediator-details');
        } else {
          navigate('/');
        }
        window.location.reload();
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
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#f4ede4] via-[#efe2d3] to-[#e3d3c2] text-[#2f2f2f]">

      {/* Video + Content Section */}
      <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center relative">
        <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-[#c97e5a] ">
          <video
            src="/assets/images/Samadhan_video.mp4" // Update the path as per your file location
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-md object-cover"
          />
        </div>
        <div className="mt-6 text-left px-4 max-w-2xl bg-white/70 backdrop-blur-md p-4 rounded-xl border border-[#d9a376] shadow-lg">
          <h2 className="text-3xl font-bold font-serif mb-4 text-[#2f2f2f]"> {LoginData.titlemain}</h2>
          <p className="text-sm leading-relaxed text-[#3c3c3c]">
            {LoginData.para}
          </p>
        </div>
      </div>

      {/* Login Section with Background Image */}
      <div
        className="w-full md:w-1/2 bg-cover bg-center flex items-center justify-center p-8"
        style={{ backgroundImage: 'url(/assets/images/LanguageSelectBG.png)' }}
      >
        <div className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#d4a373]">
          <h2 className="text-2xl font-bold text-center mb-6 text-[#2f2f2f]">
            {LoginData.title}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              name="email"
              placeholder={LoginData.fields.email.placeholder}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder={LoginData.fields.password.placeholder}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md pr-10"
              />
              <div
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 cursor-pointer text-gray-600"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c97e5a] hover:bg-[#b86745] text-white font-semibold py-2 rounded-md"
            >
              {loading ? LoginData.buttons.loggingIn : LoginData.buttons.login}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            {LoginData.link.prefix}{' '}
            <Link to="/SignUp" className="text-[#b86538] hover:underline">
              {LoginData.link.text}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
