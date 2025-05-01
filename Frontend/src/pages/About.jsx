function About() {
    return (
      <div className="bg-gradient-to-br from-[#f5f0eb] to-[#f9f6f2] text-[#2b2b2b] min-h-screen">
      {/* Hero Section */}
      <section className="px-6 md:px-20 py-0 flex flex-col md:flex-row items-center gap-12">
        {/* Image Placeholder */}
        <div className="w-full md:w-1/2">
          <img
            src="/assets/images/About-Hero.png"
            alt="Mediation illustration"
            className="rounded-xl w-full object-cover"
          />
        </div>

        {/* Text Content */}
        <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-serif font-bold leading-tight">
            Building Bridges Through Dialogue
          </h1>
          <p className="text-gray-700 text-lg leading-relaxed">
            Samadhan is your trusted platform for resolving conflicts with empathy, expertise, and cultural sensitivity.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-6 md:px-20 py-12 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h2 className="text-3xl font-bold font-serif">Our Mission</h2>
          <p className="text-gray-700 text-base leading-relaxed">
            We believe every conflict deserves a peaceful solution. Our mission is to simplify access to professional mediators, enable multilingual guidance through AI, and provide legal clarity to individuals and organizations across India.
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="px-6 md:px-20 py-0 bg-[#f5f0eb]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold font-serif">What We Do</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Connect users with certified mediators in various fields.</li>
              <li>Offer AI chatbot support in multiple regional languages.</li>
              <li>Provide downloadable legal documents and guides.</li>
              <li>Host community forums for shared stories and support.</li>
            </ul>
          </div>

          {/* Image Placeholder */}
          <div>
            <img
              src="/assets/images/Bhasha-Bandhu.png"
              alt="What we do"
              className="rounded-xl  w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Cards */}
      <section className="px-6 md:px-20 py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif">Why Choose Samadhan?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Confidential & Affordable",
              desc: "Ensuring privacy and affordability for all users.",
            },
            {
              title: "Multilingual Support",
              desc: "Guided mediation available in your language.",
            },
            {
              title: "Human + AI Assistance",
              desc: "Smart AI bots + certified human mediators.",
            },
            {
              title: "Nationwide Network",
              desc: "Reach mediators from every region and specialty.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-[#f9f6f2] p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
    );
  }
  export default About;
  