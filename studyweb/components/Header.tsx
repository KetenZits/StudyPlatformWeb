"use client";

import { motion } from "framer-motion";

const Header = () => {
  const userName = "Thanapon";

  return (
    <div className="mb-3">
      {/* Hello Section */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className="flex items-center mb-2"
      >
        <span className="text-[18px] font-normal text-gray-500 tracking-[0.3px]">
          👋 Hello,{" "}
          <span className="font-semibold text-[#D4A574] tracking-[0.3px]">
            {userName}
          </span>
        </span>
      </motion.div>

      {/* Welcome Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mt-1"
      >
        <h1 className="text-[32px] font-bold text-gray-800 leading-10 tracking-[-0.5px]">
          Welcome To <br />
          <span className="text-[#C9984E]">Study Platform</span>
        </h1>

        <p className="text-[15px] font-normal text-gray-400 mt-2 tracking-[0.2px]">
          Let&apos;s continue your learning journey
          <br /> Or Ask anything You want to know
        </p>
      </motion.div>
    </div>
  );
};

export default Header;
