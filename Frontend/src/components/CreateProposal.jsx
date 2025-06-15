import React, { useState , useEffect} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
const UI_TEXT = {
  op1: "Submit Your Proposal",
  op2: "Case Summary",
  op3: "Supporting Documents Link (Google Drive, etc.)",
  op4: "Please upload your documents to Google Drive and paste the shared link here.",
  op5: "Submit Proposal",
  op6: "Proposal ID is missing. Please return to the previous step.",
  op7: "Your proposal is submitted. Please wait for the mediator to accept it. You will be automatically added to the room along with the mediator and your opponent.",
 
};

const Proposal = () => {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { proposalId } = location.state || {};

  const [summary, setSummary] = useState('');
  const [documentLink, setDocumentLink] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');


    const [uiText, setUiText] = useState(UI_TEXT);
    // const [moddata,setModdata] = useState(moduleData);
    useEffect(() => {
      const lang = localStorage.getItem("preferredLanguage");
      if (!lang) return;
  
      const translateText = async () => {
        try {
          const res = await fetch("https://samadhan-zq8e.onrender.com/translate/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonObject: UI_TEXT, targetLang: lang }),
          });
  
          const data = await res.json();
          const map = {};
          (data?.pipelineResponse?.[0]?.output || []).forEach(
            ({ source, target }) => (map[source] = target)
          );
  
          const translated = Object.fromEntries(
            Object.entries(UI_TEXT).map(([key, val]) => [key, map[val] || val])
          );
  
          setUiText(translated);
        } catch (err) {
          console.error("Translation error:", err);
        }
      };
  
      translateText();
    }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!summary.trim()) {
      alert('Please enter a case summary.');
      return;
    }

    if (!proposalId) {
      alert('Proposal ID is missing. Please navigate properly.');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?._id;

    if (!userId) {
      alert('User not found. Please log in again.');
      return;
    }

    const summaryText = `${summary.trim()}\n\nSupportive links submitted by user:\n${documentLink}`;

    try {
      const res = await fetch(`https://samadhan-zq8e.onrender.com/api/proposals/${proposalId}/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summaryText,
          userId,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setMessage(
          uiText.op7
        );
        setTimeout(() => navigate('/'), 2000);
      } else {
        alert('Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-[url('/assets/images/Assistant-Bg.png')] bg-cover py-10 px-4 flex justify-center items-start">
      <div className="bg-white shadow-xl rounded-xl p-4 w-full ">
        <h2 className="text-2xl font-bold text-center text-[#bb5b45] ">
          {uiText.op1}
        </h2>

        {proposalId ? (
          <>
            {/* <p className="text-sm text-gray-600 mb-4">
              Proposal ID: <span className="font-medium">{proposalId}</span>
            </p> */}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  {uiText.op2}<span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#bb5b45]"
                  placeholder="Describe your case in detail..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                 {uiText.op3}
                </label>
                <input
                  type="url"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#bb5b45]"
                  placeholder="Paste your document link here"
                  value={documentLink}
                  onChange={(e) => setDocumentLink(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                 {uiText.op4}
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#d1a76e] text-white py-2 rounded-lg shadow-lg  hover:shadow-xl transition"
              >
                {uiText.op5}
              </button>

              {submitted && (
                <p className="text-green-600 text-center font-medium mt-4">
                  {message}
                </p>
              )}
            </form>
          </>
        ) : (
          <p className="text-red-600 font-medium text-center">
           {uiText.op6}
          </p>
        )}
      </div>
    </div>
  );
};

export default Proposal;
