"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const AskCard = () => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, type: "spring" }}
      className="p-8 rounded-2xl shadow-lg shadow-[#C9984E]/40 bg-gradient-to-r from-[#D4A574] via-[#C9984E] to-[#B8873D]"
    >
      <div className="flex flex-col gap-3">
        {/* หัวข้อ */}
        <h2 className="text-2xl font-bold text-white tracking-[-0.3px] leading-[30px]">
          Have a Question? 💡
        </h2>

        {/* คำอธิบาย */}
        <p className="text-[15px] text-white/90 font-normal tracking-[0.2px] mb-1">
          Ask the community and get answers fast
        </p>

        {/* ปุ่ม */}
        <button className="flex items-center justify-center gap-2 px-5 py-3 mt-2 rounded-xl bg-white shadow-md hover:shadow-lg transition">
          <span className="text-[15px] font-semibold text-[#C9984E] tracking-[0.3px]">
            Ask Now
          </span>
          <ArrowRight size={18} className="text-[#C9984E] ml-1" />
        </button>
      </div>
    </motion.div>
  );
};

export default AskCard;
