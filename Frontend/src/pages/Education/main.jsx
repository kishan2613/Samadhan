import { useState, useEffect } from "react";
import TranslateText from "../../WebData/EduText.json";
import { Box, CircularProgress } from "@mui/material";
import ClassroomComponent from "./view";

// A cache that survives component unmounts/re-mounts:
const eduCache = {};

function EducationMain() {
  const [Data, setData] = useState(TranslateText);
  const [loading, setLoading] = useState(false); // <-- Loading state
  const lang = localStorage.getItem("preferredLanguage");

  useEffect(() => {
    if (!lang) return;

    // 1. If we already translated for this lang, re-use it:
    if (eduCache[lang]) {
      setData(eduCache[lang]);
      return;
    }

    // 2. Otherwise, call the API once, then store in the cache:
    (async () => {
      try {
        setLoading(true); // <-- Start loading
        const res = await fetch("http://localhost:5000/translate/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonObject: TranslateText, targetLang: lang })
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

        const translated = translateJSON(TranslateText);
        eduCache[lang] = translated; // store in module cache
        setData(translated);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // <-- Stop loading
      }
    })();
  }, [lang]);

  if (loading) {
    return (
      <Box
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <ClassroomComponent TranslateText={Data} />
    </Box>
  );
}

export default EducationMain;
