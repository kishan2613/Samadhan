import React, { useEffect, useState } from "react";
import FooterDataMock from "../../WebData/footer.json";

const Footer = () => {
  const [FooterData, setFooterData] = useState(FooterDataMock);

  useEffect(() => {
    const preferredLanguage = localStorage.getItem("preferredLanguage");

    const translateContent = async () => {
      try {
        const response = await fetch("http://localhost:5000/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonObject: FooterDataMock,
            targetLang: preferredLanguage,
          }),
        });

        const data = await response.json();

        if (data?.pipelineResponse?.[0]?.output) {
          const translations = data.pipelineResponse[0].output;
          const translationMap = {};

          translations.forEach(({ source, target }) => {
            translationMap[source] = target;
          });

          const translateJSON = (obj) => {
            if (typeof obj === "string") return translationMap[obj] || obj;
            if (Array.isArray(obj)) return obj.map(translateJSON);
            if (typeof obj === "object" && obj !== null) {
              const newObj = {};
              for (let key in obj) {
                newObj[key] = translateJSON(obj[key]);
              }
              return newObj;
            }
            return obj;
          };

          const translatedContent = translateJSON(FooterDataMock);
          setFooterData(translatedContent);
        }
      } catch (err) {
        console.error("Translation API error:", err);
      }
    };

    if (preferredLanguage) {
      translateContent();
    }
  }, []);

  // Prevent scroll to bottom
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [FooterData]);

  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] px-[4vw] md:px-[6vw] pt-[8vh] relative overflow-hidden z-0">
      <img
        src="/assets/images/lady-justice..png"
        alt={FooterData.altText}
        className="hidden md:block absolute top-[9vh] bottom-0 right-[-3vw] h-[55vh] object-contain z-10 pointer-events-none"
      />

      <footer className="bg-[#0f0f0f] text-white rounded-t-2xl py-[6vh] px-[4vw] relative overflow-hidden z-0">
        <div className="max-w-[90vw] mx-auto grid grid-cols-1 md:grid-cols-4 gap-y-[4vh] md:gap-8 relative z-10">

          {/* Branding */}
          <div>
            <h2 className="text-[6vw] md:text-2xl font-bold mb-[2vh]">Samadhan</h2>
            <p className="text-[3.5vw] md:text-sm text-gray-300 leading-relaxed">
              {FooterData.branding.description}
            </p>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">{FooterData.solutions.heading}</h4>
            <ul className="space-y-[1vh] text-[3.5vw] md:text-sm text-gray-300">
              <li><a href="/chatbot" className="hover:text-white hover:underline">{FooterData.solutions.items.chatbot}</a></li>
              <li><a href="/interactive-guides" className="hover:text-white hover:underline">{FooterData.solutions.items.guides}</a></li>
              <li><a href="/virtual-assistant" className="hover:text-white hover:underline">{FooterData.solutions.items.assistant}</a></li>
              <li><a href="/case-studies" className="hover:text-white hover:underline">{FooterData.solutions.items.caseStudies}</a></li>
              <li><a href="/regional-guides" className="hover:text-white hover:underline">{FooterData.solutions.items.regionalGuides}</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">{FooterData.resources.heading}</h4>
            <ul className="space-y-[1vh] text-[3.5vw] md:text-sm text-gray-300">
              <li><a href="/about-mediation" className="hover:text-white hover:underline">{FooterData.resources.items.about}</a></li>
              <li><a href="/misconceptions" className="hover:text-white hover:underline">{FooterData.resources.items.misconceptions}</a></li>
              <li><a href="/connect-mediators" className="hover:text-white hover:underline">{FooterData.resources.items.connect}</a></li>
              <li><a href="/downloads" className="hover:text-white hover:underline">{FooterData.resources.items.downloads}</a></li>
              <li><a href="/gamification" className="hover:text-white hover:underline">{FooterData.resources.items.gamification}</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[4.5vw] md:text-lg font-semibold mb-[1.5vh]">{FooterData.contact.heading}</h4>
            <p className="text-[3.5vw] md:text-sm text-gray-300 leading-relaxed">
              {FooterData.contact.lines.initiative}<br />
              {FooterData.contact.lines.location}<br />
              {FooterData.contact.lines.phone}<br />
              {FooterData.contact.lines.emailPrefix}: <a href="mailto:info@samadhan.in" className="underline hover:text-white">{FooterData.contact.lines.emailAddress}</a>
            </p>
          </div>
        </div>

        <div className="text-center text-[3vw] md:text-xs text-gray-400 mt-[4vh]">
          © {new Date().getFullYear()} {FooterData?.copyright?.text}
        </div>
      </footer>
    </div>
  );
};

export default Footer;
