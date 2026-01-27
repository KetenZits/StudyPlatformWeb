"use client";
import React from 'react';
import Navbar from '../../../components/Navbar';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ShoppingBag, Coins, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";

const StorePage = () => {
  const { user } = useUser();
  
  // Fetch ข้อมูล
  const currentUser = useQuery(api.users.getCurrentUser);
  const storeItems = useQuery(api.store.getStoreItems);
  const myItems = useQuery(api.store.getUserItems, 
    currentUser ? { userId: currentUser._id } : "skip"
  );
  
  const buyItem = useMutation(api.store.buyItem);

  // เช็คว่าเรามีของชิ้นนี้หรือยัง
  const hasItem = (itemId: string) => {
    return myItems?.some((item) => item.itemId === itemId);
  };

  const handleBuy = async (itemId: any, price: number) => {
    if (!currentUser) return;
    if (currentUser.coins < price) {
      alert("เงินไม่พอจ้า! ไปตอบคำถามก่อนนะ 💸");
      return;
    }
    try {
      await buyItem({ itemId });
      // อาจจะใส่ Toast notification ตรงนี้
    } catch (error) {
      console.error(error);
      alert("ซื้อไม่สำเร็จ เกิดข้อผิดพลาด");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-28 px-5 pb-10 mt-15">
        
        {/* Header ส่วนแสดงเงิน */}
        <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
              <ShoppingBag className="text-purple-600" size={40} />
              Item Store
            </h1>
            <p className="text-gray-500 mt-2">Customise your profile with unique items!</p>
          </div>

          {currentUser && (
            <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-purple-100 flex items-center gap-3">
              <div className="bg-yellow-400 p-2 rounded-full">
                <Coins className="text-white" size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">My Balance</p>
                <p className="text-2xl font-black text-gray-900">{currentUser.coins} Coins</p>
              </div>
            </div>
          )}
        </div>

        {/* Grid สินค้า */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storeItems === undefined ? (
             <p>Loading items...</p>
          ) : storeItems.length === 0 ? (
             <p>No items available right now.</p>
          ) : (
            storeItems.map((item) => {
              const owned = hasItem(item._id);
              
              return (
                <motion.div 
                  key={item._id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 flex flex-col justify-between h-full relative overflow-hidden"
                >
                  {/* Badge ประเภทสินค้า */}
                  <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.type}
                  </span>

                  <div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 mb-4 flex items-center justify-center text-3xl">
                       {/* ถ้ามีรูปใช้รูป ถ้าไม่มีใช้ icon ตาม type */}
                       {item.type === 'badge' ? '🎖️' : item.type === 'color' ? '🎨' : '🎁'}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-500 text-sm mb-6">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <Coins size={18} className="text-yellow-500" />
                      <span className="text-xl font-bold text-gray-900">{item.price}</span>
                    </div>

                    <button
                      disabled={owned}
                      onClick={() => handleBuy(item._id, item.price)}
                      className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                        owned
                          ? "bg-green-100 text-green-700 cursor-default"
                          : "bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl active:scale-95"
                      }`}
                    >
                      {owned ? (
                        <>
                          <Check size={18} /> Owned
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default StorePage;