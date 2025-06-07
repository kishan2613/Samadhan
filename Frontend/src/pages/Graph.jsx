import React, { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { motion } from "framer-motion";
import graphData from "../WebData/Graph.json";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const CaseStats = ({datacontent}) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(graphData);
  }, []);

  if (!data)
    return (
      <p className="text-center mt-10 text-lg text-[#bb5b45]">
        Loading graph data...
      </p>
    );

  const labels = data.yearlyData.map((d) => d.year);

  const barChartData = {
    labels,
    datasets: [
      {
        label: "Received",
        data: data.yearlyData.map((d) => d.received),
        backgroundColor: "#4a90e2" // changed to blue
      },
      {
        label: "Settled",
        data: data.yearlyData.map((d) => d.settled),
        backgroundColor: "#bb5b45" // your brown
      },
      {
        label: "Unsettled",
        data: data.yearlyData.map((d) => d.unsettled),
        backgroundColor: "#e67e22" // orange
      }
    ]
  };

  const pieChartData = {
    labels: ["Settled Cases", "Unsettled Cases"],
    datasets: [
      {
        data: [data.summary.settledCases, data.summary.unsettledCases],
        backgroundColor: ["#bb5b45", "#e7c994"],
        borderColor: ["#fff", "#fff"],
        borderWidth: 2
      }
    ]
  };

  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-[#e2d8cd] p-6 flex flex-col items-center">
      <motion.h2
        className="text-3xl sm:text-4xl font-bold text-[#bb5b45] mb-10 text-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={variants}
      >
        {datacontent.Title}
      </motion.h2>
 
      {/* Flex container for charts */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        {/* Bar chart container - scrollable horizontally */}
        <motion.div
          className="flex-1 overflow-x-auto p-4 rounded-xl bg-gradient-to-r from-[#d1a76e] to-[#e2d8cd] shadow-lg"
          style={{ minWidth: "600px" }} // minimum width to trigger scroll on smaller screens
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Bar
            data={barChartData}
            options={{
              responsive: false, // disable auto responsiveness to keep width control
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom"
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
            height={300}
            width={1000} // force wider width for scroll
          />
        </motion.div>

        {/* Pie chart container */}
        <motion.div
          className="w-full max-w-sm p-6 rounded-xl bg-gradient-to-l from-[#d1a76e] to-[#e2d8cd] shadow-xl flex flex-col items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          <h3 className="text-xl font-semibold text-white text-center mb-4">
             {datacontent.subone}
          </h3>
          <Pie data={pieChartData} />
          <div className="text-center mt-4 text-white font-medium">
            <p> {datacontent.subtwo}: {data.summary.totalCases}</p>
            <p> {datacontent.subthree}: {data.summary.settledCases}</p>
            <p> {datacontent.subfour}: {data.summary.unsettledCases}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CaseStats;
