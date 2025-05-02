import React from "react";
import Navbar from "../components/common/Navbar";
import Herosection from "../components/Herosection";
import Categories from "../components/Categories";
import Learning from "../components/Learning";


const Home = () => {
  return (
    <div>
       
      <Herosection/>
      <Categories/>
      <Learning/>
    </div>
  );
};

export default Home;
