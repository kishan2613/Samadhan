import React from "react";
import businessIcon from "/assets/images/business.png"; // Add the correct path
import criminalIcon from "/assets/images/criminal.png";
import familyIcon from "/assets/images/business.png";

export default function Categories(){
    const laws = [
    {
      title: "Business Law",
      description:
        "There are various forms of legal business entities ranging from the sole trader.",
      icon: businessIcon,
    },
    {
      title: "Criminal Law",
      description:
        "Criminal law is the body of law that relates to crime. Conduct perceived as threatening, harmful.",
      icon: criminalIcon,
    },
    {
      title: "Family Law",
      description:
        "Family law is a legal practice area that focuses on issues involving family relationships",
      icon: familyIcon,
    },
  ];

  return (
    <div className="bg-gradient-to-r from-[#f5f0eb] via-[#e8dfd6] to-[#d6c6b8] py-16 px-4 md:px-20 text-center">
      <div className="rounded-[20px] p-[10px] bg-white">
      <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-12">
        The virtue of justice consists in <br className="hidden md:block" />
        moderation as regulated by wisdom
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {laws.map((law, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center space-y-4"
          >
            <img src={law.icon} alt={law.title} className="w-16 h-18" />
            <h3 className="font-bold font-serif text-lg">{law.title}</h3>
            <p className="text-gray-600 max-w-xs">{law.description}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
    )
}