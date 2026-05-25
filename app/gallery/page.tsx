"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const C = {
  charcoal: "#1a1a2e",
  cream: "#fdf6ec",
  saffron: "#FF6B00",
  green: "#2D6A4F",
  white: "#ffffff",
  black: "#000000",
};

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex]);

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Simple Header */}
      <nav className="w-full py-6 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <img 
              src="/website/human%20trust%20logo.jpg.jpeg" 
              alt="Human Pray Trust Logo" 
              className="h-10 w-10 object-cover rounded-full shadow-sm border border-gray-200"
            />
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700 }} className="hidden sm:block">
              <span style={{ color: C.saffron }}>human</span>{" "}
              <span style={{ color: C.black }}>pray</span>{" "}
              <span style={{ color: C.green }}>trust</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${C.saffron}15` }}>
                <ImageIcon className="w-8 h-8" style={{ color: C.saffron }} />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl mb-6 font-bold tracking-tight" style={{ color: C.charcoal, fontFamily: "'Playfair Display', serif" }}>
              Moments of Change
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Every frame is a story of dignity restored. Explore the impact of your contributions through these powerful moments captured on the ground.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B00] rounded-full animate-spin"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 max-w-3xl mx-auto">
              <p className="text-xl text-gray-500">No images found in the gallery at this moment.</p>
            </div>
          ) : (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {images.map((img, i) => (
                <motion.div 
                  key={img.id || i} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: (i % 8) * 0.1, duration: 0.5 }} 
                  onClick={() => setSelectedIndex(i)}
                  className={`w-full ${img.aspect || "aspect-square"} rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden relative group shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer`}
                >
                  <motion.img
                    src={img.src}
                    alt={`Gallery image ${i + 1}`}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <span className="bg-white/90 text-black px-6 py-2 rounded-full font-bold text-xs tracking-widest uppercase shadow-lg backdrop-blur-sm">
                        View Full
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-black/50 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full bg-black/50 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}

            {/* Image Container */}
            <div 
              className="w-full h-full p-4 md:p-16 flex items-center justify-center"
              onClick={() => setSelectedIndex(null)}
            >
              <motion.img
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                src={images[selectedIndex].src}
                alt={`Gallery image ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-sm font-medium tracking-widest uppercase">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
