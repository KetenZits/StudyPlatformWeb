"use client";
import React from 'react';
import Sidebar from '../../../components/Sidebar';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ShoppingBag, Coins, Check } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useToast } from "../../../components/Toast";

const StorePage = () => {
  const toast = useToast();
  const currentUser = useQuery(api.users.getCurrentUser);
  const storeItems = useQuery(api.store.getStoreItems);
  const myItems = useQuery(api.store.getUserItems, currentUser ? { userId: currentUser._id } : "skip");
  const buyItem = useMutation(api.store.buyItem);

  const hasItem = (itemId: string) => myItems?.some((item) => item.itemId === itemId);

  const handleBuy = async (itemId: Id<"storeItems">, price: number) => {
    if (!currentUser) return;
    if (currentUser.coins < price) { toast.warning("เงินไม่พอ 💸", "ไปตอบคำถามเพื่อรับ coins กันก่อนนะ!"); return; }
    try { await buyItem({ itemId }); } catch (error) { console.error(error); toast.error("ซื้อไม่สำเร็จ", "เกิดข้อผิดพลาด กรุณาลองใหม่"); }
  };

  return (<><Sidebar /><div className="min-h-screen bg-[var(--nm-bg)] pt-20 lg:pt-10 px-5 pb-10 lg:pl-[300px]">
    <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-4xl font-black text-gray-800 flex items-center gap-3"><ShoppingBag className="text-purple-500" size={40} />Item Store</h1>
        <p className="text-gray-500 mt-2">Customise your profile with unique items!</p>
      </div>
      {currentUser && (
        <div className="nm-raised px-6 py-3 flex items-center gap-3">
          <div className="p-2 rounded-full" style={{ background: 'linear-gradient(135deg, #facc15, #f59e0b)', boxShadow: '3px 3px 6px var(--nm-shadow-dark), -3px -3px 6px var(--nm-shadow-light)' }}><Coins className="text-white" size={24} /></div>
          <div><p className="text-xs text-gray-500 font-bold uppercase">My Balance</p><p className="text-2xl font-black text-gray-800">{currentUser.coins} Coins</p></div>
        </div>
      )}
    </div>

    <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {storeItems === undefined ? <p className="text-gray-500">Loading items...</p> : storeItems.length === 0 ? <p className="text-gray-500">No items available right now.</p> : (
        storeItems.map((item) => {
          const owned = hasItem(item._id);
          return (
            <motion.div key={item._id} whileHover={{ y: -5 }} className="nm-raised p-6 flex flex-col justify-between h-full relative overflow-hidden">
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider nm-inset-xs text-gray-500">{item.type}</span>
              <div>
                <div className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center text-3xl overflow-hidden nm-raised-sm">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : (item.type === 'badge' ? '🎖️' : item.type === 'frame' ? '🖼️' : item.type === 'theme' ? '🎨' : item.type === 'effect' ? '✨' : '📦')}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-6">{item.description}</p>
              </div>
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1"><Coins size={18} className="text-yellow-500" /><span className="text-xl font-bold text-gray-800">{item.price}</span></div>
                <button disabled={owned} onClick={() => handleBuy(item._id, item.price)}
                  className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${owned ? "nm-inset-xs text-green-600 cursor-default" : "nm-gradient-btn active:scale-95"}`}>
                  {owned ? <><Check size={18} /> Owned</> : "Buy Now"}
                </button>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  </div></>);
};

export default StorePage;