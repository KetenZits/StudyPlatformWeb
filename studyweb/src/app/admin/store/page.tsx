"use client";
import React, { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, ImagePlus, ShoppingBag, Coins, Package, ArrowLeft } from "lucide-react";
import type { Id } from "../../../../convex/_generated/dataModel";
import Sidebar from "../../../../components/Sidebar";
import Footer from "../../../../components/Footer";
import Link from "next/link";
import { useToast } from "../../../../components/Toast";

const ITEM_TYPES = [
    { value: "badge", label: "Badge", emoji: "🏅" },
    { value: "frame", label: "Frame", emoji: "🖼️" },
    { value: "theme", label: "Theme", emoji: "🎨" },
    { value: "effect", label: "Effect", emoji: "✨" },
    { value: "other", label: "Other", emoji: "📦" },
];

export default function AdminStorePage() {
    const items = useQuery(api.store.getStoreItems);
    const createItem = useMutation(api.store.createStoreItem);
    const updateItem = useMutation(api.store.updateStoreItem);
    const deleteItem = useMutation(api.store.deleteStoreItem);
    const generateUploadUrl = useMutation(api.store.generateStoreUploadUrl);
    const toast = useToast();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<Id<"storeItems"> | null>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<Id<"storeItems"> | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [type, setType] = useState("badge");
    const [imageStorageId, setImageStorageId] = useState<Id<"_storage"> | undefined>(undefined);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setName("");
        setDescription("");
        setPrice(0);
        setType("badge");
        setImageStorageId(undefined);
        setPreviewUrl(null);
        setExistingImageUrl(null);
        setEditingId(null);
        setShowForm(false);
    };

    const openCreateForm = () => {
        resetForm();
        setShowForm(true);
    };

    const openEditForm = (item: any) => {
        setEditingId(item._id);
        setName(item.name);
        setDescription(item.description);
        setPrice(item.price);
        setType(item.type);
        setImageStorageId(item.imageStorageId);
        setExistingImageUrl(item.imageUrl || null);
        setPreviewUrl(null);
        setShowForm(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.warning("File Too Large", "Max 5MB image size");
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.warning("Invalid File", "Please upload an image");
            return;
        }

        setUploading(true);
        try {
            const url = await generateUploadUrl();
            const res = await fetch(url, { method: "POST", headers: { "Content-Type": file.type }, body: file });
            const { storageId } = await res.json();
            setImageStorageId(storageId);
            setPreviewUrl(URL.createObjectURL(file));
            setExistingImageUrl(null);
        } catch (err) {
            toast.error("Upload Failed", "Could not upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !description.trim() || price < 0) {
            toast.warning("Missing Info", "Fill in all fields with valid values");
            return;
        }
        setUploading(true);
        try {
            if (editingId) {
                await updateItem({ id: editingId, name, description, price, type, imageStorageId });
                toast.success("Updated!", "Store item has been updated");
            } else {
                await createItem({ name, description, price, type, imageStorageId });
                toast.success("Created!", "New store item added");
            }
            resetForm();
        } catch (err: any) {
            toast.error("Error", err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: Id<"storeItems">) => {
        try {
            await deleteItem({ id });
            setDeleteConfirmId(null);
            toast.success("Deleted", "Item removed from store");
        } catch (err: any) {
            toast.error("Delete Failed", err.message || "Could not delete");
        }
    };

    const getTypeInfo = (t: string) => ITEM_TYPES.find((it) => it.value === t) || ITEM_TYPES[4];

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 lg:pl-[280px]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-300/20 to-purple-300/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-5 md:px-8 pt-20 md:pt-12 pb-16">

                    {/* Header */}
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <Link href="/store" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold mb-2 transition-colors">
                                <ArrowLeft size={18} /> Back to Store
                            </Link>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                                    <ShoppingBag size={24} className="text-white" />
                                </div>
                                Store Manager
                            </h1>
                            <p className="text-gray-500 mt-1 ml-15">Manage store items and pricing</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openCreateForm}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus size={20} /> Add Item
                        </motion.button>
                    </motion.div>

                    {/* Create/Edit Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, height: 0 }}
                                animate={{ opacity: 1, y: 0, height: "auto" }}
                                exit={{ opacity: 0, y: -20, height: 0 }}
                                className="mb-8 overflow-hidden"
                            >
                                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 md:p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {editingId ? "Edit Item" : "New Item"}
                                        </h2>
                                        <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                                            <X size={20} className="text-gray-500" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Image */}
                                        <div className="flex flex-col items-center gap-4">
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-40 h-40 rounded-2xl border-2 border-dashed border-purple-300 bg-purple-50/50 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all overflow-hidden"
                                            >
                                                {previewUrl || existingImageUrl ? (
                                                    <img src={previewUrl || existingImageUrl!} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <ImagePlus size={32} className="text-purple-400 mb-2" />
                                                        <span className="text-sm text-purple-500 font-medium">Upload Image</span>
                                                    </>
                                                )}
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                            {(previewUrl || existingImageUrl) && (
                                                <button
                                                    onClick={() => { setPreviewUrl(null); setExistingImageUrl(null); setImageStorageId(undefined); }}
                                                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                                                >
                                                    Remove Image
                                                </button>
                                            )}
                                        </div>

                                        {/* Fields */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                                <input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none text-gray-900"
                                                    placeholder="Item name..."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    rows={3}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none resize-none text-gray-900"
                                                    placeholder="What does this item do?"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (Coins)</label>
                                                    <input
                                                        type="number"
                                                        value={price}
                                                        onChange={(e) => setPrice(Number(e.target.value))}
                                                        min={0}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-gray-700 mb-1">Type</label>
                                                    <select
                                                        value={type}
                                                        onChange={(e) => setType(e.target.value)}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-400 outline-none text-gray-900"
                                                    >
                                                        {ITEM_TYPES.map((t) => (
                                                            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={resetForm} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all">
                                            Cancel
                                        </button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            disabled={uploading}
                                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
                                        >
                                            {uploading ? "Saving..." : editingId ? "Update" : "Create"}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Items List */}
                    {items === undefined ? (
                        <div className="text-center py-20">
                            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading items...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
                            <Package size={64} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-500 mb-2">No items in store</h3>
                            <p className="text-gray-400">Click &quot;Add Item&quot; to create your first item</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item, i) => {
                                const typeInfo = getTypeInfo(item.type);
                                return (
                                    <motion.div
                                        key={item._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all group"
                                    >
                                        {/* Image */}
                                        <div className="h-40 bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center overflow-hidden relative">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-5xl">{typeInfo.emoji}</span>
                                            )}
                                            <div className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-bold text-purple-700 shadow-sm">
                                                {typeInfo.emoji} {typeInfo.label}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
                                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
                                                    <Coins size={16} className="text-amber-600" />
                                                    <span className="text-sm font-bold text-amber-700">{item.price}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditForm(item)}
                                                        className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-600 transition-all"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    {deleteConfirmId === item._id ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setDeleteConfirmId(item._id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
