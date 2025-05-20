export default function MeditationFact() {
  return (
    <div
      className="w-full h-[870px] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url('/assets/images/Learning.png')` }}
    >
      {/* {" "} */}
      {/* <img src="/assets/images/Learning.png" alt="#" /> */}
      <div className="bg-black bg-opacity-60 p-6 rounded-lg max-w-xl text-center">
        <h2 className="text-white text-2xl font-semibold mb-4">
          Meditation Fact
        </h2>
        <p className="text-white text-lg italic">
          “Regular meditation can reduce stress, enhance concentration, and
          improve overall emotional well-being.”
        </p>
      </div>
    </div>
  );
}
