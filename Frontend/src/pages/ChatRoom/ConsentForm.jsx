import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ConsentForm = ({ roomId, currentUserId }) => {
  const [chatData, setChatData] = useState(null);
  const [signatures, setSignatures] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittedSignatures, setSubmittedSignatures] = useState({});

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await axios.get(
          `https://samadhan-zq8e.onrender.com/api/chat/consent/${roomId}`
        );
        setChatData(res.data);
        console.log("Fetched chat data:", res.data.members[0]);
        const userId = "681ad68e55842468277d3e3a"; // the ID you're looking for

        const user = res.data.members.find((m) => m._id === userId);

        console.log(user);

        const initialSigs = {};
        if (Array.isArray(res.data.members)) {
          res.data.members.forEach((m) => {
            initialSigs[m._id] = m.signature || "";
          });
        } else {
          console.warn(
            "Expected 'members' to be an array but got:",
            res.data.members
          );
        }

        setSignatures(initialSigs);
        setLoading(false);
      } catch (err) {
        console.error(err);
      }
    };

    fetchChat();
  }, [roomId]);

  const handleSignatureChange = async (userId, value) => {
    if (userId !== currentUserId) return;

    // Update local state
    setSignatures((prev) => ({ ...prev, [userId]: value }));

    try {
      await axios.post(`https://samadhan-zq8e.onrender.com/api/chat/${userId}/signature`, {
        signatureUrl: value,
      });
      console.log("Signature saved successfully for user:", userId);
      setSubmittedSignatures((prev) => ({
        ...prev,
        [userId]: true,
      }));
    } catch (error) {
      console.error("Failed to save signature:", error);
    }
  };

  const allSigned = Object.values(signatures).every((sig) => sig.trim() !== "");

  const downloadPDF = async () => {
    const input = document.getElementById("consent-form");

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    while (heightLeft > 0) {
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);

      heightLeft -= pageHeight;

      if (heightLeft > 0) {
        pdf.addPage();
        position -= pageHeight;
      }
    }

    pdf.save("mediation_consent_form.pdf");
  };

  if (loading) return <div>Loading...</div>;

  const { proposal } = chatData;
  const suggestion = proposal?.suggestion;

  const mediator = suggestion?.mediator;
  const [partyA, partyB] = chatData.members || [];

  return (
    <div
      className="p-8 max-w-4xl mx-auto bg-white shadow-md"
      id="consent-form"
      style={{
        backgroundImage: `url('/assets/images/bg.png')`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
        width: "800px",
        minHeight: "1123px",
        padding: "520px 40px 80px",
        boxSizing: "border-box",
        margin: "0 auto",
        pageBreakAfter: "always",
        backgroundColor: "#fff",
      }}
    >
      <h2 className="text-xl font-bold text-center mb-4">
        PRIVATE MEDIATION CONSENT FORM
      </h2>

      <div className="space-y-4">
        <div>
          <strong>Case Reference Number:</strong> {chatData._id}
        </div>

        <div>
          <strong>Mediation Type:</strong> Private Mediation
        </div>

        <div>
          <strong>Venue/Platform:</strong> Virtual Sammadhan
        </div>

        <div>
          <strong>Parties Involved:</strong>
          <br />
          Party A (Claimant/Complainant): {partyA?.name || "__________"}
          <br />
          Party B (Respondent/Defendant): {partyB?.name || "__________"}
        </div>

        <div>
          <strong>Mediation Details:</strong>
          <br />
          Mediator’s Name: {mediator?.name || "__________"}
          <br />
          Email: {mediator?.email || "_______________________"}
        </div>

        <div>
          <strong>Consent of Parties:</strong>
          <br />
          We, the undersigned parties, hereby consent to participate in a
          voluntary private mediation facilitated by the above-named mediator.
          We understand that mediation is a non-adversarial, confidential
          process aimed at enabling parties to reach a mutually acceptable
          resolution of the dispute without engaging in litigation. <br />{" "}
          <br />
          <strong>Impartiality of Mediator:</strong>
          <br />
          We acknowledge that the appointed mediator has no personal interest or
          bias in the matter and agrees to maintain strict neutrality. Should
          the mediator become aware of any actual or perceived conflict of
          interest, they shall disclose it and, if necessary, withdraw from the
          mediation.
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <strong>Rights and Responsibilities:</strong>
          <ul>
            <li>
              <strong>Confidentiality:</strong> All discussions, documents, and
              communications during the mediation will remain confidential and
              may not be used as evidence in any judicial or quasi-judicial
              proceeding.
            </li>
            <li>
              <strong>Voluntary Participation:</strong> Participation in this
              mediation is completely voluntary. Either party may choose to
              withdraw from the process at any time before a settlement is
              finalized.
            </li>
            <li>
              <strong>Non-Binding Nature:</strong> The mediation process itself
              is non-binding. A binding agreement shall only arise if a written
              settlement is agreed upon and signed by both parties.
            </li>
          </ul>
          <strong>Consent and Acknowledgment:</strong>
          <p>
            By signing below, all parties affirm their willing participation in
            the private mediation process and agree to the terms stated in this
            document.
          </p>
        </div>

        <div>
          <strong>Signatures:</strong>
          <br />

          {/* From Party */}
          <div className="mt-4">
            <div>
              <strong>Name (From Party):</strong>{" "}
              {chatData.proposal.suggestion.fromParty.name}
            </div>
            <div className="flex items-center gap-2">
              <strong>Signature:</strong>{" "}
              {(() => {
                const fromPartyId = chatData.proposal.suggestion.fromParty._id;
                const signature = signatures[fromPartyId];

                return currentUserId === fromPartyId ? (
                  <>
                    {!signature && (
                      <input
                        type="text"
                        placeholder="Enter signature URL"
                        value={signature || ""}
                        onChange={(e) =>
                          setSignatures((prev) => ({
                            ...prev,
                            [fromPartyId]: e.target.value,
                          }))
                        }
                        className="border p-1"
                      />
                    )}
                    <button
                      onClick={() =>
                        handleSignatureChange(
                          fromPartyId,
                          signatures[fromPartyId]
                        )
                      }
                      disabled={submittedSignatures[fromPartyId]}
                      className={`px-2 py-1 rounded text-white ${
                        submittedSignatures[fromPartyId]
                          ? "bg-white-900 cursor-not-allowed"
                          : "bg-blue-500"
                      }`}
                    >
                      Submit Signature
                    </button>
                  </>
                ) : signatures[fromPartyId] ? (
                  <img
                    src={signatures[fromPartyId]}
                    alt="Signature"
                    className="h-8"
                  />
                ) : (
                  "Pending"
                );
              })()}
            </div>

            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>

          <div className="mt-4">
            <div>
              <strong>Name (To Party):</strong>{" "}
              {
                chatData.members.find(
                  (m) => m.email === chatData.proposal.suggestion.toPartyEmail
                )?.name
              }
            </div>
            <div>
              <strong>Signature:</strong>{" "}
              {(() => {
                const toParty = chatData.members.find(
                  (m) => m.email === chatData.proposal.suggestion.toPartyEmail
                );
                if (!toParty) return "Not found";

                const toPartyId = chatData.proposal.acceptedBy[1];
                const signature = signatures[toPartyId];

                return currentUserId === toPartyId ? (
                  <>
                    {!signature && (
                      <input
                        type="text"
                        placeholder="Enter signature URL"
                        value={signature || ""}
                        onChange={(e) =>
                          setSignatures((prev) => ({
                            ...prev,
                            [toPartyId]: e.target.value,
                          }))
                        }
                        className="border p-1"
                      />
                    )}
                    <button
                      onClick={() =>
                        handleSignatureChange(toPartyId, signatures[toPartyId])
                      }
                      disabled={submittedSignatures[toPartyId]}
                      className={`px-2 py-1 rounded text-white ${
                        submittedSignatures[toPartyId]
                          ? "bg-white-900 cursor-not-allowed"
                          : "bg-blue-500"
                      }`}
                    >
                      Submit Signature
                    </button>
                  </>
                ) : signature ? (
                  <img src={signature} alt="Signature" className="h-8" />
                ) : (
                  "Pending"
                );
              })()}
            </div>

            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* Mediator */}
          <div className="mt-6">
            <strong>Name (Mediator):</strong>{" "}
            {chatData.proposal.suggestion.mediator?.name || "__________"}
            <br />
            <strong>Signature:</strong>{" "}
            {(() => {
              const mediatorId = chatData.proposal.suggestion.mediator?._id;
              const signature =
                chatData.proposal.suggestion.mediator?.signature ||
                signatures[mediatorId];

              return currentUserId === mediatorId ? (
                <>
                  {!signature && (
                    <input
                      type="text"
                      placeholder="Enter signature URL"
                      value={signatures[mediatorId] || ""}
                      onChange={(e) =>
                        setSignatures((prev) => ({
                          ...prev,
                          [mediatorId]: e.target.value,
                        }))
                      }
                      className="border p-1"
                    />
                  )}
                  <button
                    onClick={() =>
                      handleSignatureChange(mediatorId, signatures[mediatorId])
                    }
                    disabled={submittedSignatures[mediatorId]}
                    className={`px-2 py-1 rounded text-white ${
                      submittedSignatures[mediatorId]
                        ? "bg-white-900 cursor-not-allowed"
                        : "bg-blue-500"
                    }`}
                  >
                    Submit Signature
                  </button>
                </>
              ) : signature ? (
                <img src={signature} alt="Mediator signature" className="h-8" />
              ) : (
                "Pending"
              );
            })()}
            <br />
            <strong>Date:</strong> {new Date().toLocaleDateString()}
          </div>
        </div>

        {allSigned && (
          <div className="mt-6">
            <button
              onClick={downloadPDF}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Download PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentForm;
