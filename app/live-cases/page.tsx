"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";

const C = {
  charcoal: "#1a1a2e",
  cream: "#fdf6ec",
  saffron: "#FF6B00",
  green: "#2D6A4F",
  white: "#ffffff",
  black: "#000000",
};

export default function LiveCasesPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCases, setExpandedCases] = useState<number[]>([]);

  const toggleCase = (index: number) => {
    setExpandedCases(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  useEffect(() => {
    fetch("/api/cases")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter to show active cases only, latest first
          const active = data.filter((c: any) => c.isActive).reverse();
          setCases(active);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Simple Header */}
      <nav className="w-full py-6 bg-white border-b border-gray-100 sticky top-0 z-50">
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
              <span style={{ color: C.saffron }}>HUMAN</span>{" "}
              <span style={{ color: C.black }}>PRAY</span>{" "}
              <span style={{ color: C.green }}>TRUST</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
                <Activity className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl mb-6 font-bold tracking-tight" style={{ color: C.charcoal, fontFamily: "'DM Sans', sans-serif" }}>
              All Live Cases
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              These fundraisers are currently active and urgently need your support. Every contribution brings hope to those struggling.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B00] rounded-full animate-spin"></div>
            </div>
          ) : cases.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
              <p className="text-xl text-gray-500">No active cases found at this moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {cases.map((c, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 30 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }} 
                  className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 flex flex-col transition-transform duration-300 hover:-translate-y-2"
                >
                  <div className="relative h-72 overflow-hidden group bg-gray-50 flex items-center justify-center border-b border-gray-100">
                    <motion.img 
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                      src={c.imageUrl} 
                      alt={c.title} 
                      className="w-full h-full object-contain p-4" 
                    />
                    <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-white font-semibold text-xs tracking-wide backdrop-blur-md bg-teal-600/90 shadow-sm border border-teal-400/50">
                      Live Case
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <h3 className="text-2xl font-bold mb-4" style={{ color: C.charcoal }}>{c.title}</h3>
                    <div className="flex-1 mb-8">
                      <p 
                        className="text-gray-500 text-sm leading-relaxed transition-all duration-300" 
                        style={expandedCases.includes(i) ? undefined : { display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                      >
                        {c.description}
                      </p>
                      {c.description && c.description.length > 120 && (
                        <button 
                          onClick={() => toggleCase(i)}
                          className="mt-3 text-[#FF6B00] text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-opacity"
                        >
                          {expandedCases.includes(i) ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                      <a 
                        href={`/donate?case=${encodeURIComponent(c.title)}`} 
                        className="py-3.5 rounded-full text-white font-bold text-xs tracking-widest shadow-md hover:opacity-90 transition-opacity flex justify-center items-center" 
                        style={{ backgroundColor: "#E65A00", textDecoration: "none" }}
                      >
                        DONATE
                      </a>
                      {c.documentUrl ? (
                        <button 
                          onClick={() => {
                            const url = c.documentUrl;
                            if (!url) return;
                            if (url.startsWith("data:")) {
                              try {
                                const parts = url.split(",");
                                const mime = parts[0].match(/:(.*?);/)?.[1] || "";
                                const bstr = atob(parts[1]);
                                let n = bstr.length;
                                const u8arr = new Uint8Array(n);
                                while (n--) {
                                  u8arr[n] = bstr.charCodeAt(n);
                                }
                                const blob = new Blob([u8arr], { type: mime });
                                const blobUrl = URL.createObjectURL(blob);
                                window.open(blobUrl, "_blank");
                              } catch (e) {
                                window.open(url, "_blank");
                              }
                            } else {
                              window.open(url, "_blank");
                            }
                          }}
                          className="py-3.5 rounded-full text-white font-bold text-xs tracking-widest shadow-md hover:opacity-90 transition-opacity flex justify-center items-center cursor-pointer border-0" 
                          style={{ backgroundColor: "#E65A00" }}
                        >
                          DOCUMENTS
                        </button>
                      ) : (
                        <button disabled className="py-3.5 rounded-full text-white font-bold text-xs tracking-widest shadow-md" style={{ backgroundColor: "#E65A00", opacity: 0.5, cursor: "not-allowed" }}>
                          DOCUMENTS
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
