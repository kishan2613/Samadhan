import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SignUp from "../WebData/Signup.json"; 

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");
    if (!preferredLanguage) return;

    if (SignUpCache[preferredLanguage]) {
      setSignupData(SignUpCache[preferredLanguage]);
      return;
    }

    (async () => {
      try {
        const res = await fetch("https://samadhan-zq8e.onrender.com/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: SignUp, targetLang: preferredLanguage }),
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

        const translated = translateJSON(SignUp);
        SignUpCache[preferredLanguage] = translated;
        setSignupData(translated);
      } catch (err) {
        console.error("Navbar translation error:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePasswordVisibility = () => setShowPassword(prev => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert(SignupData.alerts.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://samadhan-zq8e.onrender.com/api/auth/register', {
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

        if (data.user.role === 'party') navigate('/mediator-connect');
        else if (data.user.role === 'mediator') navigate('/mediator-details');
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
    <div className="flex flex-col md:flex-row min-h-screen text-[#2f2f2f]">
      
  {/* Left Video + Content
<div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-gradient-to-b from-[#f4ede4] via-[#efe2d3] to-[#e3d3c2] relative">
  <div className="relative w-full max-w-2xl aspect-video rounded-xl overflow-hidden shadow-lg border-4 border-[#c97e5a] ">
    <video
      className="w-full h-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      src="/assets/images/Samadhan_video.mp4" // path
    />
  </div>
   <div className="mt-6 text-left px-4 max-w-2xl bg-white/70 backdrop-blur-md p-4 rounded-xl border border-[#d9a376] shadow-lg">
          <h2 className="text-3xl font-bold font-serif mb-4 text-[#2f2f2f]">Welcome to SamaDhan</h2>
          <p className="text-sm leading-relaxed text-[#3c3c3c]">
            SamaDhan is your trusted digital mediation platform. We help resolve conflicts peacefully,
            confidentially, and legally — without going to court. Whether it's a family matter, a business
            dispute, or a civil disagreement, our trained mediators are here to assist you through dialogue and
            understanding.
          </p>
   </div>
</div> */}


      {/* Right Signup Form */}
      <div
        className="w-full md:w-full relative bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/images/LanguageSelectBG.png')" }}
      >
        <div className="h-full w-full flex items-center justify-center p-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#d4a373]">
            <h2 className="text-2xl font-bold text-center mb-6 text-[#2f2f2f]">
              {SignupData.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder={SignupData.fields.name.placeholder}
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <input
                type="email"
                name="email"
                placeholder={SignupData.fields.email.placeholder}
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder={SignupData.fields.password.placeholder}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md pr-10"
                />
                <div onClick={togglePasswordVisibility} className="absolute right-3 top-3 cursor-pointer text-gray-600">
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder={SignupData.fields.confirmPassword.placeholder}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md pr-10"
                />
                <div onClick={togglePasswordVisibility} className="absolute right-3 top-3 cursor-pointer text-gray-600">
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </div>
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">{SignupData.fields.role.placeholder}</option>
                <option value="party">{SignupData.fields.role.options[0].label}</option>
                <option value="mediator">{SignupData.fields.role.options[1].label}</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#c97e5a] hover:bg-[#b86745] text-white font-semibold py-2 rounded-md"
              >
                {loading ? SignupData.buttons.submitting : SignupData.buttons.submit}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
