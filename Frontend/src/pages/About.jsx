import { useState, useEffect } from "react";
import AboutusDataMock from "../WebData/About.json";

// A cache that survives component unmounts/re-mounts:
const aboutCache = {};

function About() {
  const [AboutusData, setAboutusData] = useState(AboutusDataMock);
  const lang = localStorage.getItem("preferredLanguage");

  useEffect(() => {
    if (!lang) return;

    // 1. If we already translated for this lang, re-use it:
    if (aboutCache[lang]) {
      setAboutusData(aboutCache[lang]);
      return;
    }

    // 2. Otherwise, call the API once, then store in the cache:
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: AboutusDataMock, targetLang: lang })
        });
        const { pipelineResponse } = await res.json();
        const map = {};
        pipelineResponse[0].output.forEach(({ source, target }) => {
          map[source] = target;
        });
        function translateJSON(obj) {
          if (typeof obj === "string") return map[obj] || obj;
          if (Array.isArray(obj)) return obj.map(translateJSON);
          if (obj && typeof obj === "object") {
            return Object.fromEntries(
              Object.entries(obj).map(([k, v]) => [k, translateJSON(v)])
            );
          }
          return obj;
        }
        const translated = translateJSON(AboutusDataMock);
        aboutCache[lang] = translated;      // ← store in module cache
        setAboutusData(translated);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [lang]);


  return (
    <div className="bg-gradient-to-br from-[#f5f0eb] to-[#f9f6f2] text-[#2b2b2b] min-h-screen">
      {/* Hero Section */}
      <section className="px-6 md:px-20 py-0 flex flex-col md:flex-row items-center gap-12">
        {/* Image Placeholder */}
        <div className="w-full md:w-1/2">
          <img
            src="/assets/images/About-Hero.png"
            alt={AboutusData.hero.altText}
            className="rounded-xl w-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
            {AboutusData.hero.heading}
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            {AboutusData.hero.description}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 md:px-20 py-12 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold font-serif">
            {AboutusData.mission.heading}
          </h2>
          <p className="text-gray-700 text-base leading-relaxed">
            {AboutusData.mission.description}
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="px-6 md:px-20 py-0 bg-[#f5f0eb]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif">
              {AboutusData.whatWeDo.heading}
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <ul>
                {AboutusData.whatWeDo.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </ul>
          </div>

          {/* Image Placeholder */}
          <div>
            <img
              src="/assets/images/Bhasha-Bandhu.png"
              alt={AboutusData.whatWeDo.altText}
              className="rounded-xl  w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Cards */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif">
            {AboutusData.whyChoose.heading}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {AboutusData.whyChoose.cards.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f9f6f2] p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
export default About;
