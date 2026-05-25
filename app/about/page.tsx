"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";

const C = {
  charcoal: "#1a1a2e",
  cream: "#fdf6ec",
  saffron: "#FF6B00",
  green: "#2D6A4F",
  white: "#ffffff",
  black: "#000000",
};

const fullStory = `Human Pray Trust is committed to supporting underprivileged families by providing essential humanitarian assistance with compassion and dignity.

Our organization works to help needy labour-class families through food distribution, clean drinking water support, educational assistance, and urgent medical aid for heart patients who are unable to afford treatment.

During extreme weather conditions and difficult financial situations, many families struggle even for basic necessities. Through our continuous efforts and the support of generous donors, we strive to bring relief, hope, and care to those who need it the most.

At Human Pray Trust, we believe that every contribution can make a meaningful difference in someone’s life.

Together, we can create hope, support vulnerable families, and serve humanity with kindness and responsibility.`;

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
              <span style={{ color: C.saffron }}>human</span>{" "}
              <span style={{ color: C.black }}>pray</span>{" "}
              <span style={{ color: C.green }}>trust</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden" style={{ backgroundColor: C.cream }}>
        <div className="absolute top-0 right-0 w-1/3 h-full" style={{ backgroundColor: `${C.green}08` }} />
        <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.saffron }} />
              <span className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: C.saffron }}>Our Full Story</span>
              <div className="w-12 h-px" style={{ backgroundColor: C.saffron }} />
            </div>
            <h1 className="text-4xl md:text-6xl mb-8 leading-tight font-bold" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
              Serving Humanity with <span style={{ color: C.green, fontStyle: 'italic' }}>Kindness</span> and Responsibility
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-20 relative -mt-10">
        <div className="max-w-6xl mx-auto px-6 md:px-12 relative z-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-10 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-gray-50"
          >
            <div className="text-xl md:text-2xl font-bold text-gray-800">
              {fullStory.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-8 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Certifications Section */}
            <div className="mt-16 pt-16 border-t border-gray-100">
              <div className="text-center mb-10">
                <Heart className="w-8 h-8 mx-auto mb-4" style={{ color: C.saffron }} />
                <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
                  Official Certifications & PAN
                </h2>
                <p className="text-gray-500 mt-2">Transparent and verified</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                <div className="flex flex-col">
                  <h3 className="text-center font-bold text-gray-600 mb-4 uppercase tracking-widest text-sm">Official Certification</h3>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border-4 bg-white p-1.5 hover:-translate-y-2 transition-transform duration-300" style={{ borderColor: C.green }}>
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="/NGO%20IMAGES/documentz/photo_2026-05-25_15-54-43.jpg" 
                        alt="Certification Document" 
                        className="w-full h-auto object-cover"
                      />
                      {/* Watermark Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 select-none">
                        <div className="w-[150%] transform -rotate-[25deg] border-y-2 border-red-500/50 bg-white/10 backdrop-blur-[1px] py-2 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-red-600/80 font-extrabold text-xl md:text-2xl uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-md">
                            Not For Official Purpose
                          </span>
                          <span className="text-red-600/80 font-bold text-sm md:text-base tracking-wider whitespace-nowrap mt-1 drop-shadow-md">
                            Crossed to prevent misuse
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-center font-bold text-gray-600 mb-4 uppercase tracking-widest text-sm">Income Tax PAN</h3>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border-4 bg-white p-1.5 hover:-translate-y-2 transition-transform duration-300" style={{ borderColor: "#1D4ED8" }}> {/* Distinct Blue Border for PAN */}
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="/NGO%20IMAGES/documentz/photo_2026-05-25_15-54-43%20(2).jpg" 
                        alt="PAN Document" 
                        className="w-full h-auto object-cover"
                      />
                      {/* Watermark Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 select-none">
                        <div className="w-[150%] transform -rotate-[25deg] border-y-2 border-red-500/50 bg-white/10 backdrop-blur-[1px] py-2 flex flex-col items-center justify-center shadow-sm">
                          <span className="text-red-600/80 font-extrabold text-xl md:text-2xl uppercase tracking-[0.15em] whitespace-nowrap drop-shadow-md">
                            Not For Official Purpose
                          </span>
                          <span className="text-red-600/80 font-bold text-sm md:text-base tracking-wider whitespace-nowrap mt-1 drop-shadow-md">
                            Crossed to prevent misuse
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 flex justify-center">
              <Link 
                href="/donate" 
                className="px-10 py-4 rounded-full text-white font-bold tracking-widest uppercase hover:scale-105 transition-transform shadow-xl"
                style={{ backgroundColor: C.saffron }}
              >
                Support Our Mission
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
