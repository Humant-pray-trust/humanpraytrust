"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import {
  ChevronDown, Heart, Search, Gift, Users,
  PawPrint, Bird, Activity, BookOpen,
  Droplets, MapPin, Mail, Phone, ArrowRight,
  Stethoscope, Home as HomeIcon, Leaf,
  Check, HeartHandshake, Lock, Menu, X, Award
} from "lucide-react";

/* ─── Theme ─────────────────────────────────────────────── */
const C = {
  charcoal: "#1a1a2e",
  cream: "#fdf6ec",
  saffron: "#FF6B00",
  green: "#2D6A4F",
  white: "#ffffff",
  black: "#000000",
};

/* ─── Animation variants ────────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

/* ─── Count-up helper ───────────────────────────────────── */
function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;
    let t0: number | null = null;
    const tick = (ts: number) => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / (duration * 1000), 1);
      setCount(Math.floor(p * (to - from) + from));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, from, to, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── SVG Doodles ───────────────────────────────────────── */
const DoodleHeart = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 54" fill="none">
    <path d="M30 50 C30 50 4 34 4 18 C4 10 10 4 18 4 C23 4 27.5 7 30 11 C32.5 7 37 4 42 4 C50 4 56 10 56 18 C56 34 30 50 30 50Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M22 20 C22 17 24 14 27 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const DoodleHand = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 70 90" fill="none">
    <path d="M35 80 C20 80 10 70 10 55 L10 35 C10 31 13 28 17 28 C21 28 24 31 24 35 L24 20 C24 16 27 13 31 13 C35 13 38 16 38 20 L38 22 C38 18 41 15 45 15 C49 15 52 18 52 22 L52 26 C52 22 55 19 59 20 C63 21 64 25 64 29 L64 52 C64 67 51 80 35 80Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const DoodleLeaf = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 50 70" fill="none">
    <path d="M25 65 C25 65 5 45 8 25 C10 12 18 5 25 5 C32 5 40 12 42 25 C45 45 25 65 25 65Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M25 65 L25 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M25 40 C18 35 14 28 15 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M25 50 C32 45 36 38 35 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const DoodleStar = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 50 50" fill="none">
    <path d="M25 5 L28.5 18 L42 18 L31 26.5 L34.5 40 L25 32 L15.5 40 L19 26.5 L8 18 L21.5 18Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);
const DoodleDots = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 30" fill="none">
    <circle cx="10" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="30" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="50" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
    <circle cx="70" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const DoodleBird = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 80 50" fill="none">
    <path d="M10 30 C15 20 25 15 35 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M35 18 C45 15 55 20 60 30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M5 28 C8 22 12 26 15 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M65 28 C62 22 58 26 55 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const DoodleCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 60" fill="none">
    <path d="M30 5 C44 5 55 16 55 30 C55 44 44 55 30 55 C16 55 5 44 5 30 C5 16 16 5 30 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3" />
  </svg>
);


/* ─── Navigation ────────────────────────────────────────── */
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navItems = ["Home", "About", "Our Work", "Live Cases", "Successful Stories", "Gallery", "Contact"];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between relative">
        <a href="#home" className="flex items-center gap-3 z-50">
          <img 
            src="/website/human%20trust%20logo.jpg.jpeg" 
            alt="Human Pray Trust Logo" 
            className={`transition-all duration-300 object-cover rounded-full shadow-md ${scrolled ? "h-11 w-11 border border-gray-200" : "h-14 w-14 border-2 border-white/20"}`}
          />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.35rem", fontWeight: 700 }} className="hidden sm:block transition-colors duration-300">
            <span style={{ color: C.saffron }}>HUMAN</span>{" "}
            <span style={{ color: scrolled ? C.black : C.white }}>PRAY</span>{" "}
            <span style={{ color: C.green }}>TRUST</span>
          </div>
        </a>

        <div className="hidden lg:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item}
              href={item === "About" ? "/about" : (item === "Live Cases" ? "/live-cases" : (item === "Gallery" ? "/gallery" : `/#${item.toLowerCase().replace(" ", "-")}`))}
              className={`transition-colors ${scrolled ? "text-gray-800 hover:text-black" : "text-white/90 hover:text-white"}`}
            >
              {item}
            </Link>
          ))}
        </div>
        
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center z-50">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 transition-colors ${scrolled || mobileMenuOpen ? "text-gray-800" : "text-white"}`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <div className="hidden lg:block">
          <a
            href="/donate"
            style={{ backgroundColor: C.saffron }}
            className="text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity inline-block"
          >
            Donate Now
          </a>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-0 left-0 w-full bg-white shadow-xl flex flex-col pt-24 pb-6 px-6 gap-4 border-b border-gray-100">
          {navItems.map((item) => (
            <Link
              key={item}
              href={item === "About" ? "/about" : (item === "Live Cases" ? "/live-cases" : (item === "Gallery" ? "/gallery" : `/#${item.toLowerCase().replace(" ", "-")}`))}
              className="text-gray-800 font-medium hover:text-[#FF6B00] py-2 border-b border-gray-50 last:border-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <a
            href="/donate"
            style={{ backgroundColor: C.saffron }}
            className="text-white px-6 py-3 rounded-full text-sm font-semibold text-center mt-2"
            onClick={() => setMobileMenuOpen(false)}
          >
            Donate Now
          </a>
        </div>
      )}
    </motion.nav>
  );
}

/* ─── Hero ──────────────────────────────────────────────── */
function Hero() {
  return (
    <section id="home" className="relative h-screen min-h-[800px] w-full overflow-hidden" style={{ backgroundColor: "#0d0d1a" }}>
      {/* Background image */}
      <div className="absolute inset-0 z-0" style={{ opacity: 0.85, overflow: "hidden" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/website/Gemini_Generated_Image_psb4eapsb4eapsb4.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      </div>
      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, rgba(13,13,26,0.95) 0%, rgba(13,13,26,0.88) 20%, rgba(13,13,26,0.70) 38%, rgba(13,13,26,0.45) 52%, rgba(13,13,26,0.18) 68%, rgba(13,13,26,0.05) 82%, transparent 100%)",
        }}
      />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-10" style={{ background: "linear-gradient(to top, #1a1a2e, transparent)" }} />

      {/* Doodles */}
      <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 1 }} className="absolute top-24 left-8 z-20" style={{ color: "rgba(255,255,255,0.18)" }}>
        <DoodleStar className="w-8 h-8" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6, duration: 1.2 }} className="absolute bottom-28 left-8 z-20" style={{ color: "rgba(255,255,255,0.18)" }}>
        <DoodleDots className="w-20 h-8" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -15 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: 1.4, duration: 1 }} className="absolute bottom-16 left-10 z-20" style={{ color: `${C.saffron}55` }}>
        <DoodleHeart className="w-10 h-10" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 1 }} className="absolute top-20 right-14 z-20" style={{ color: `${C.green}70` }}>
        <DoodleLeaf className="w-10 h-14" />
      </motion.div>
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.8, duration: 1 }} className="absolute top-36 right-6 z-20" style={{ color: `${C.saffron}45` }}>
        <DoodleBird className="w-16 h-10" />
      </motion.div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute top-1/2 right-6 -translate-y-1/2 z-20" style={{ color: `${C.green}50` }}>
        <DoodleCircle className="w-14 h-14" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 1 }} className="absolute bottom-20 right-14 z-20" style={{ color: `${C.saffron}30` }}>
        <DoodleHand className="w-12 h-16" />
      </motion.div>

      {/* Text */}
      <div className="relative z-30 h-full flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12">
          <div className="w-full max-w-lg lg:max-w-xl pt-20 xl:-ml-8">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex items-center gap-3 mb-6">
              <div className="h-px w-10" style={{ backgroundColor: C.saffron }} />
              <span className="text-xs tracking-[0.25em] uppercase" style={{ color: C.saffron }}>Since 2025 · India</span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="font-medium leading-[1.1] mb-6"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 5.5vw, 5rem)", color: C.white }}
            >
              {["Where", "every", "life"].map((word, i) => (
                <motion.span key={i} variants={fadeInUp} className="inline-block mr-3">{word}</motion.span>
              ))}
              <br className="hidden sm:block" />
              <motion.span variants={fadeInUp} className="inline-block mr-3">finds</motion.span>
              <br />
              <motion.span variants={fadeInUp} className="inline-block" style={{ color: C.saffron, fontStyle: "italic" }}>dignity</motion.span>
              <motion.span variants={fadeInUp} className="inline-block mx-3">&amp;</motion.span>
              <motion.span variants={fadeInUp} className="inline-block" style={{ color: "#4CAF7D" }}>grace.</motion.span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.9 }} className="font-light leading-relaxed mb-10" style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.75)", maxWidth: "34ch" }}>
              A quiet force for human dignity across India — celebrating lives, healing animals, and restoring hope one act at a time.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="flex flex-wrap gap-4 items-center">
              <a href="/donate" style={{ backgroundColor: C.saffron, textDecoration: "none" }} className="text-white px-8 py-3.5 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity tracking-wide inline-block">
                Make an Impact
              </a>
              <a href="#our-work" className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: "rgba(255,255,255,0.85)", textDecoration: "none" }}>
                <span>See Our Work</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center" style={{ color: "rgba(255,255,255,0.5)" }}>
        <span className="text-xs tracking-[0.2em] uppercase mb-3">Scroll</span>
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── About Us ──────────────────────────────────────────── */
function AboutUs() {
  return (
    <section id="about" className="py-32 relative overflow-hidden bg-white">
      {/* Decorative logo watermark */}
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
        <img 
          src="/website/human%20trust%20logo.jpg.jpeg" 
          alt="Watermark" 
          className="w-[800px] h-[800px] object-cover rounded-full grayscale"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-[#FF6B00]/20 to-[#2D6A4F]/20 rounded-[3rem] transform -rotate-3" />
            <img 
              src="/website/human%20trust%20logo.jpg.jpeg" 
              alt="About Human Pray Trust" 
              className="relative w-full aspect-square object-cover rounded-[2.5rem] shadow-2xl border-8 border-white"
            />
            <div className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-xl">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold" style={{ color: C.saffron }}>10+</div>
                <div className="text-sm text-gray-500 uppercase tracking-widest font-bold">Years of<br/>Impact</div>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.saffron }} />
              <span className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: C.saffron }}>Who We Are</span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-8 leading-tight font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Restoring Faith in <span style={{ color: C.green, fontStyle: 'italic' }}>Humanity</span>
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Founded on the belief that every life holds intrinsic value, <strong style={{ color: C.charcoal }}>Human Pray Trust</strong> is a relentless force for dignity across India. We don't just provide charity; we build bridges of compassion that empower the marginalized, heal the voiceless, and uplift entire communities.
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              From rescuing abandoned animals on unforgiving streets to ensuring no child's special day goes uncelebrated, our approach is holistic, transparent, and driven purely by the heart.
            </p>
            
            <div className="grid grid-cols-2 gap-8 mb-10">
              <div className="border-l-4 pl-4" style={{ borderColor: C.green }}>
                <h4 className="text-2xl font-bold mb-1" style={{ color: C.charcoal }}>1M+</h4>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Lives Touched</p>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: C.saffron }}>
                <h4 className="text-2xl font-bold mb-1" style={{ color: C.charcoal }}>50+</h4>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Cities Reached</p>
              </div>
            </div>

            <Link 
              href="/about"
              className="inline-block px-8 py-4 rounded-full text-white font-bold tracking-widest hover:scale-105 transition-transform shadow-lg" 
              style={{ backgroundColor: C.charcoal }}
            >
              READ OUR FULL STORY
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Impact Counters ───────────────────────────────────── */
function ImpactCounters() {
  const stats = [
    { value: 12450, label: "Lives Touched", suffix: "+" },
    { value: 847, label: "Special Day Celebrations", suffix: "" },
    { value: 3200, label: "Animals Helped", suffix: "+" },
    { value: 156, label: "Villages Reached", suffix: "" },
  ];
  return (
    <section className="py-24" style={{ backgroundColor: C.charcoal }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 divide-x divide-white/10">
          {stats.map((s, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="text-center px-4">
              <div className="text-4xl md:text-6xl text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                <Counter from={0} to={s.value} />
                <span style={{ color: C.saffron }}>{s.suffix}</span>
              </div>
              <div className="text-sm md:text-base text-white/60 uppercase tracking-wider">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Action Cards ──────────────────────────────────────── */
function ActionCards() {
  const cards = [
    {
      title: "Join us & become\na volunteer",
      icon: HeartHandshake,
      desc: "Volunteering offers a unique opportunity to make a real difference in your community.",
      bullets: [
        "Make a Meaningful Impact.",
        "Develop New Skills and Experience.",
        "Build Connections and Community."
      ],
      color: "#007A5E", // Rich green
      whatsappUrl: `https://wa.me/918510804149?text=${encodeURIComponent("Hi HUMAN PRAY TRUST! I'm interested in becoming a volunteer and making a meaningful impact in my community. Please share more details on how I can join your mission.")}`,
    },
    {
      title: "Send a gift for\nchildrens",
      icon: Gift,
      desc: "Spread joy and support children with thoughtful, meaningful gift donations.",
      bullets: [
        "Brighten a Child's Day Today.",
        "Send Joyful Gifts for Kids.",
        "Share Smiles with Children's Presents."
      ],
      color: "#00B4D8", // Cyan blue
      whatsappUrl: `https://wa.me/918510804149?text=${encodeURIComponent("Hi HUMAN PRAY TRUST! I would love to send a gift for the children and spread joy. Please let me know how I can send or sponsor gifts for kids.")}`,
    }
  ];

  return (
    <section className="py-24 bg-white relative z-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {cards.map((card, i) => (
            <a 
              key={i} 
              href={card.whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block no-underline select-none cursor-pointer group/card"
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className="relative overflow-hidden rounded-3xl p-10 lg:p-12 text-white shadow-xl hover:shadow-2xl transition-all duration-300"
                style={{ backgroundColor: "#25312E" }}
              >
                {/* Organic blobs to mimic the brush strokes at bottom right */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 transition-transform duration-500 group-hover/card:scale-105" style={{ backgroundColor: card.color, borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", transform: "rotate(-15deg)" }} />
                <div className="absolute -bottom-24 -right-4 w-80 h-80 transition-transform duration-500 group-hover/card:scale-105" style={{ backgroundColor: card.color, borderRadius: "60% 40% 30% 70% / 50% 40% 60% 50%", transform: "rotate(25deg)", opacity: 0.8 }} />
                <div className="absolute -bottom-16 right-20 w-48 h-48 transition-transform duration-500 group-hover/card:scale-105" style={{ backgroundColor: card.color, borderRadius: "40% 60% 50% 50% / 40% 50% 50% 60%", transform: "rotate(60deg)", opacity: 0.9 }} />
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-10">
                    <div className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 border-4 border-[#25312E]" style={{ backgroundColor: card.color }}>
                      <card.icon className="w-12 h-12 text-white" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold leading-tight whitespace-pre-line tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {card.title}
                    </h3>
                  </div>

                  <p className="text-xl text-gray-300 mb-10" style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", letterSpacing: "0.5px" }}>
                    {card.desc}
                  </p>

                  <ul className="space-y-4 mb-12">
                    {card.bullets.map((bullet, j) => (
                      <li key={j} className="flex items-center gap-4">
                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" style={{ color: "#25312E" }} strokeWidth={4} />
                        </div>
                        <span className="font-medium text-[1.05rem] text-gray-100">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform tracking-widest shadow-md">
                    VIEW DETAILS
                  </button>
                </div>
              </motion.div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Live Cases ────────────────────────────────────────── */
function LiveCases() {
  const [cases, setCases] = useState<any[]>([]);
  const [expandedCases, setExpandedCases] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

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
          const active = data.filter((c: any) => c.isActive).reverse().slice(0, 3);
          setCases(active);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="live-cases" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h3 className="text-2xl md:text-3xl mb-4" style={{ color: C.green, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 600 }}>
            Help & donate us now
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold" style={{ color: C.charcoal, fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" }}>
            View the fundraisers that are most active right now
          </h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#FF6B00] rounded-full animate-spin"></div>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-100">
            <p className="text-xl text-gray-500">No active cases found at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cases.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 flex flex-col transition-transform duration-300 hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden group bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    src={c.imageUrl} 
                    alt={c.title} 
                    className="w-full h-full object-contain p-2" 
                  />
                  <div className="absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-white font-semibold text-xs tracking-wide backdrop-blur-md bg-teal-600/90 shadow-sm border border-teal-400/50">
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
                    <a href={`/donate?case=${encodeURIComponent(c.title)}`} className="py-3.5 rounded-full text-white font-bold text-xs tracking-widest shadow-md hover:opacity-90 transition-opacity flex justify-center items-center" style={{ backgroundColor: "#E65A00", textDecoration: "none" }}>
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

        <div className="mt-16 flex justify-center">
          <Link 
            href="/live-cases" 
            className="px-10 py-4 border-2 rounded-full font-bold tracking-widest text-sm hover:bg-gray-50 transition-colors uppercase" 
            style={{ borderColor: C.charcoal, color: C.charcoal }}
          >
            VIEW ALL LIVE CASES
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─── Special Day Mission ───────────────────────────────── */
function SpecialDayMission() {
  const steps = [
    { icon: Search, title: "Find a Child", desc: "Identifying underprivileged children who have never celebrated their existence." },
    { icon: Gift, title: "Plan the Day", desc: "Curating a personalized day of joy, new clothes, and favourite meals." },
    { icon: Users, title: "Celebrate Together", desc: "Gathering community to show them they are seen, valued, and loved." },
  ];
  return (
    <section id="special-day-mission" className="py-32" style={{ backgroundColor: C.cream }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.saffron }} />
              <span className="text-sm tracking-[0.2em] uppercase" style={{ color: C.saffron }}>Core Mission</span>
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl mb-8" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
              The Special Day<br />Mission
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-gray-600 mb-12 leading-relaxed">
              For millions of children, a special day is just another day of survival. We believe every life deserves to be celebrated. A cake, a new dress, a day of feeling special — these small acts rebuild fractured self-worth.
            </motion.p>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.saffron}15`, color: C.saffron }}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="mt-12">
              <a href="#contact" className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-medium hover:scale-105 transition-transform shadow-lg shadow-[#FF6B00]/20" style={{ backgroundColor: C.saffron }}>
                <span>Contact to Celebrate</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50, scale: 0.95 }} whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative h-[600px] rounded-2xl overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/20 to-transparent z-10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
            <motion.div
              className="absolute inset-0 w-full h-full"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                backgroundImage: "url('/NGO%20IMAGES/WhatsApp%20Image%202026-05-12%20at%2015.22.19.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "grayscale(10%)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Animal Welfare ────────────────────────────────────── */
function AnimalWelfare() {
  const items = [
    { icon: PawPrint, title: "Street Dog Rescue", desc: "Medical aid and shelters for injured strays." },
    { icon: Leaf, title: "Cow Sanctuary", desc: "Safe havens for abandoned and aging cattle." },
    { icon: Bird, title: "Bird Stations", desc: "Water and feeding outposts during extreme summers." },
    { icon: Stethoscope, title: "Emergency Vet Care", desc: "24/7 mobile clinics for critical animal injuries." },
  ];
  return (
    <section id="animal-welfare" className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-1/3 h-full" style={{ backgroundColor: `${C.green}08` }} />
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center max-w-3xl mx-auto mb-20">
          <motion.div variants={fadeInUp} className="flex justify-center items-center gap-4 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: C.green }} />
            <span className="text-sm tracking-[0.2em] uppercase" style={{ color: C.green }}>Compassion for All</span>
            <div className="w-8 h-px" style={{ backgroundColor: C.green }} />
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
            Silent Souls, Loud Compassion
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-gray-600">
            Dignity extends beyond human life. Our animal welfare programs ensure that the voiceless receive the care, food, and medical attention they deserve.
          </motion.p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="p-8 border rounded-xl hover:shadow-xl transition-shadow duration-300 bg-white" style={{ borderColor: `${C.green}20` }}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${C.green}10` }}>
                <item.icon className="w-6 h-6" style={{ color: C.green }} />
              </div>
              <h3 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Initiatives Grid ──────────────────────────────────── */
function InitiativesGrid() {
  const items = [
    { emoji: "🌾", title: "Food Distribution", desc: "Providing nutritious meals to communities facing hunger.", span: "col-span-1 md:col-span-2 row-span-2", bg: "bg-gradient-to-br from-[#FF6B00] to-[#E65A00]", href: "/donate?case=Food%20Distribution" },
    { emoji: "🐕", title: "Dog Feeding", desc: "Nourishing street dogs daily with freshly prepared meals.", span: "col-span-1 md:col-span-2 row-span-1", bg: "bg-gradient-to-br from-[#2D6A4F] to-[#1B4332]", href: "/donate?case=Dog%20Feeding" },
    { emoji: "🚰", title: "Clean Water", desc: "Building sustainable pure water sources.", span: "col-span-1 row-span-1", bg: "bg-gradient-to-br from-blue-600 to-blue-800", href: "/donate?case=Clean%20Water%20Access" },
    { emoji: "🎂", title: "Celebration", desc: "Sponsoring beautiful birthdays and special days for underprivileged kids.", span: "col-span-1 row-span-1", bg: "bg-gradient-to-br from-purple-600 to-purple-800", href: "/donate?case=Special%20Day%20Mission" },
  ];
  return (
    <section id="our-work" className="py-32" style={{ backgroundColor: C.charcoal }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="mb-16">
          <h2 className="text-4xl md:text-5xl text-white mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Our Initiatives</h2>
          <p className="text-white/70 max-w-2xl text-lg font-light">Comprehensive approaches to uplift communities across the nation. Every initiative is a stepping stone to a better future.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[220px] gap-6">
          {items.map((item, i) => (
            <Link href={item.href} key={i} className={`${item.span} block`}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`h-full relative group overflow-hidden rounded-[2rem] ${item.bg} shadow-2xl cursor-pointer`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10" />
                {/* Giant Emoji Background */}
                <div className="absolute -bottom-10 -right-6 text-[150px] opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700 z-0 pointer-events-none" style={{ filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.5))' }}>
                  {item.emoji}
                </div>
                <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end z-20">
                  <div className="text-5xl mb-6 transform group-hover:-translate-y-2 transition-transform duration-500">{item.emoji}</div>
                  <h3 className="text-3xl text-white mb-3 font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{item.title}</h3>
                  <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed max-w-[80%]">{item.desc}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Donate Section ────────────────────────────────────── */
function DonateSection() {
  const amounts = [500, 1500, 5000];
  const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(1500);
  const [customVal, setCustomVal] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pan, setPan] = useState("");
  const [showAlternative, setShowAlternative] = useState(false);
  const [altTab, setAltTab] = useState<"qr" | "bank">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const finalVal = selectedAmount === 'custom' ? parseInt(customVal || "0") : selectedAmount;

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalVal < 10) {
      alert("Please enter a valid donation amount (minimum ₹10).");
      return;
    }
    // Redirect to full secure donate page with preset states
    window.location.href = `/donate?amount=${finalVal}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&pan=${encodeURIComponent(pan)}`;
  };

  return (
    <section id="donate" className="py-32 relative overflow-hidden bg-white">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-50 to-white" />
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#FF6B00]/5 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-[#2D6A4F]/5 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Content */}
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.green }} />
              <span className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: C.green }}>Make a Difference</span>
            </div>
            <h2 className="text-4xl md:text-6xl mb-8 leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
              Your Contribution Creates <span style={{ color: C.saffron, fontStyle: 'italic' }}>Miracles</span>.
            </h2>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              We operate with 100% transparency. Every rupee you donate goes directly to the field — funding meals, medical treatments, and education. No hidden administrative fees, just pure impact.
            </p>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-1">
                  <Check className="w-4 h-4 text-green-700" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Tax Deductible</h4>
                  <p className="text-gray-500">All donations are 80G certified for tax exemption.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                  <Heart className="w-4 h-4 text-blue-700" strokeWidth={3} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Direct Impact</h4>
                  <p className="text-gray-500">Track where your money goes with our monthly transparency reports.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="font-bold tracking-wider text-sm uppercase">Secure Payments via</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 object-contain" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5 object-contain" />
            </div>
          </motion.div>

          {/* Right Content: Donation Widget */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-gray-100 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-bl-[100px] rounded-tr-[2.5rem] pointer-events-none" />
            
            {showAlternative ? (
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Alternative Payment</h3>
                  <button 
                    type="button" 
                    onClick={() => setShowAlternative(false)}
                    className="text-xs font-bold hover:underline"
                    style={{ color: C.saffron }}
                  >
                    ← Back to Card
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                  <button
                    type="button"
                    onClick={() => setAltTab("qr")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-0 ${altTab === 'qr' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 bg-transparent'}`}
                  >
                    📱 UPI QR Scan
                  </button>
                  <button
                    type="button"
                    onClick={() => setAltTab("bank")}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border-0 ${altTab === 'bank' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900 bg-transparent'}`}
                  >
                    🏦 Bank Details
                  </button>
                </div>

                {altTab === "qr" ? (
                  <div className="space-y-4 flex flex-col items-center">
                    <div className="relative bg-white p-3 rounded-2xl border border-gray-100 shadow-sm max-w-[200px]">
                      {/* Scanner corner frames */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FF6B00]" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#FF6B00]" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#FF6B00]" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FF6B00]" />
                      <img 
                        src="/website/photo_2026-05-24_12-55-12.jpg" 
                        alt="UPI QR Code" 
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                    <div className="text-center w-full">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Official UPI ID</span>
                      <div className="flex items-center justify-between gap-2 mt-1.5 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 max-w-[245px] mx-auto">
                        <code className="text-[10px] font-bold text-gray-800 font-mono">boim-712201590596@boi</code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("boim-712201590596@boi", "upi")}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded text-white border-0 ${copiedField === 'upi' ? 'bg-emerald-600' : 'bg-gray-800 hover:bg-gray-950'}`}
                        >
                          {copiedField === 'upi' ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 bg-gray-50/50 p-4.5 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Beneficiary Name</span>
                      <strong className="text-gray-800 block text-sm mt-0.5">Human Pray Trust</strong>
                    </div>
                    <div className="h-px bg-gray-200/50" />
                    <div>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Bank & Account Number</span>
                      <div className="flex justify-between items-center gap-2 mt-0.5">
                        <strong className="text-gray-800 block font-mono text-sm">7122 2011 0000 596</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("712220110000596", "acc")}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded text-white border-0 ${copiedField === 'acc' ? 'bg-emerald-600' : 'bg-gray-800'}`}
                        >
                          {copiedField === 'acc' ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold mt-0.5 block">Bank of India · Current Account</span>
                    </div>
                    <div className="h-px bg-gray-200/50" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">IFSC Code</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <strong className="text-gray-800 font-mono text-sm">BKID0007122</strong>
                          <button
                            type="button"
                            onClick={() => copyToClipboard("BKID0007122", "ifsc")}
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded text-white border-0 ${copiedField === 'ifsc' ? 'bg-emerald-600' : 'bg-gray-800'}`}
                          >
                            {copiedField === 'ifsc' ? "Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Branch</span>
                        <strong className="text-gray-800 block text-xs mt-0.5">Sector 62 Noida</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setShowAlternative(false)}
                    className="w-full py-3.5 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-100 transition-colors text-xs uppercase tracking-wider"
                  >
                    ← Pay with online card instead
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDonateSubmit}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Choose Amount</h3>
                <p className="text-gray-500 mb-8">Select or enter an amount to donate securely</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { setSelectedAmount(amt); setCustomVal(""); }}
                      className={`py-4 rounded-2xl font-bold text-lg border-2 transition-all ${selectedAmount === amt ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' : 'border-gray-100 hover:border-gray-300 text-gray-700'}`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setSelectedAmount('custom')}
                    className={`py-4 rounded-2xl font-bold text-lg border-2 transition-all ${selectedAmount === 'custom' ? 'border-[#FF6B00] bg-[#FF6B00]/5 text-[#FF6B00]' : 'border-gray-100 hover:border-gray-300 text-gray-700'}`}
                  >
                    Other
                  </button>
                </div>
                
                {selectedAmount === 'custom' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6">
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-xl font-bold">₹</span>
                      <input 
                        type="number" 
                        placeholder="Enter amount" 
                        value={customVal}
                        onChange={e => setCustomVal(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-gray-50 border-2 border-gray-100 focus:outline-none focus:border-[#FF6B00] text-xl font-bold transition-colors" 
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#FF6B00] outline-none transition-all font-medium" 
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#FF6B00] outline-none transition-all font-medium" 
                      required
                    />
                  </div>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="PAN Number (Optional - for 80G tax receipt)" 
                      value={pan}
                      onChange={e => setPan(e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-[#FF6B00] outline-none transition-all font-medium uppercase" 
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 rounded-2xl text-white font-bold text-lg tracking-wider hover:scale-[1.02] transition-transform shadow-xl shadow-[#FF6B00]/30 flex items-center justify-center gap-3" style={{ backgroundColor: C.saffron }}>
                  <Heart className="w-5 h-5 fill-white" /> DONATE SECURELY
                </button>

                <div className="text-center mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAlternative(true)}
                    className="inline-block text-sm font-bold transition-colors hover:text-[#000000] bg-transparent border-0 cursor-pointer"
                    style={{ color: C.saffron }}
                  >
                    🤝 Pay via direct UPI QR or Bank Transfer
                  </button>
                </div>
              
              <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" /> 256-bit secure SSL encryption
              </p>
            </form>
          )}
        </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Volunteer Journey ─────────────────────────────────── */
function VolunteerJourney() {
  const steps = ["Join the Mission", "Connect with Community", "Take Direct Action", "Witness the Impact"];
  return (
    <section id="volunteer" className="py-32" style={{ backgroundColor: C.cream }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>The Volunteer Journey</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">Your time is the most valuable donation. Step into the field and be the change.</p>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 left-0 w-full h-[2px] -translate-y-1/2 hidden md:block" style={{ backgroundColor: `${C.charcoal}20` }} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
            {steps.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.2 }} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white border-4 shadow-lg mb-6" style={{ borderColor: C.cream }}>
                  <span className="text-2xl" style={{ fontFamily: "'Playfair Display', serif", color: C.saffron }}>{i + 1}</span>
                </div>
                <h3 className="text-xl mb-3" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>{step}</h3>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-20 text-center">
          <button style={{ backgroundColor: C.charcoal }} className="text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity inline-flex items-center gap-3">
            Become a Volunteer <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────── */
function Testimonials() {
  const quotes = [
    { quote: "For the first time in 12 years, my daughter wore a new dress. I saw her smile in a way I had forgotten was possible.", name: "Sunita Devi", role: "Mother & Beneficiary" },
    { quote: "I came to volunteer for a day. I stayed because I realized healing others was the only way to heal myself.", name: "Rahul S.", role: "Lead Volunteer" },
  ];
  return (
    <section className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div variants={fadeInUp} className="md:col-span-1 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>Voices of Dignity</h2>
            <p className="text-gray-600 mb-8">True impact is not measured in numbers, but in the quiet restoration of hope in an individual&apos;s eyes.</p>
          </motion.div>
          {quotes.map((q, i) => (
            <motion.div key={i} variants={fadeInUp} className="p-10 rounded-2xl relative" style={{ backgroundColor: C.cream }}>
              <div className="text-6xl absolute top-6 left-6 opacity-10" style={{ fontFamily: "'Playfair Display', serif", color: C.saffron }}>&quot;</div>
              <p className="text-xl italic leading-relaxed mb-8 relative z-10" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>{q.quote}</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-300" />
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.charcoal }}>{q.name}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{q.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Gallery ───────────────────────────────────────────── */
function Gallery() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/gallery")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setImages(data);
        }
      })
      .catch(console.error);
  }, []);

  const visibleImages = images.slice(0, 3);

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <h2 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>Moments of Change</h2>
        <p className="text-gray-500 text-lg">Every frame is a story of dignity restored.</p>
      </div>
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
          {visibleImages.map((img, i) => (
            <motion.div 
              key={img.id || i} 
              initial={{ opacity: 0, y: 40, scale: 0.95 }} 
              whileInView={{ opacity: 1, y: 0, scale: 1 }} 
              viewport={{ once: true, margin: "-50px" }} 
              transition={{ duration: 0.6, ease: "easeOut" }} 
              className={`w-full ${img.aspect || "aspect-square"} rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden relative group shadow-md hover:shadow-2xl transition-shadow duration-500`}
            >
              <motion.img
                src={img.src}
                alt={`Gallery image ${i + 1}`}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1, rotate: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
            </motion.div>
          ))}
        </div>

        {images.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link 
              href="/gallery" 
              className="px-10 py-4 border-2 rounded-full font-bold tracking-widest text-sm hover:bg-gray-50 transition-colors uppercase" 
              style={{ borderColor: C.charcoal, color: C.charcoal }}
            >
              VIEW FULL GALLERY
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

/* ─── Contact Section ───────────────────────────────────── */
function ContactSection() {
  return (
    <section id="contact" className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Info */}
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.saffron }} />
              <span className="text-sm tracking-[0.2em] uppercase" style={{ color: C.saffron }}>Get In Touch</span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-6" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>Let's Start a Conversation</h2>
            <p className="text-lg text-gray-600 mb-10">
              Whether you want to celebrate a special day, volunteer your time, or just say hello, we'd love to hear from you. Fill out the form and our team will get back to you promptly.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-50 text-[#FF6B00]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Email Us</h4>
                  <p className="text-gray-600">contact@humanpraytrust.org</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-50 text-[#2D6A4F]">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Call Us / WhatsApp</h4>
                  <p className="text-gray-600">+91 85108 04149</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Visit Us</h4>
                  <p className="text-gray-600">Noida sector 60, Uttar Pradesh</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Form */}
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B00]/10 to-transparent rounded-bl-[100px] rounded-tr-3xl" />
            <form className="relative z-10 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input type="text" placeholder="John" className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input type="text" placeholder="Doe" className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" placeholder="john@example.com" className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 transition-all text-gray-600 appearance-none">
                  <option>Special Day Mission Inquiry</option>
                  <option>Volunteer Application</option>
                  <option>General Support</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows={4} placeholder="How can we help you?" className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 transition-all resize-none"></textarea>
              </div>
              <button type="button" className="w-full mt-2 py-4 rounded-xl text-white font-bold tracking-widest hover:scale-[1.02] transition-transform shadow-lg shadow-[#FF6B00]/30" style={{ backgroundColor: C.saffron }}>
                SEND MESSAGE
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ───────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden flex items-center justify-center min-h-[600px]" style={{ backgroundColor: C.charcoal }}>
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-5xl md:text-7xl text-white mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
          One small act.<br />
          <span style={{ color: C.saffron }}>Infinite ripples.</span>
        </motion.h2>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
          <button style={{ backgroundColor: C.saffron }} className="w-full sm:w-auto text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform">
            Celebrate a Special Day
          </button>
          <button style={{ backgroundColor: C.green }} className="w-full sm:w-auto text-white px-8 py-4 rounded-full text-sm font-semibold tracking-wide hover:scale-105 transition-transform">
            Rescue an Animal
          </button>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-white pt-24 pb-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold tracking-tight mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span style={{ color: C.saffron }}>HUMAN</span>{" "}
              <span style={{ color: C.black }}>PRAY</span>{" "}
              <span style={{ color: C.green }}>TRUST</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">An NGO dedicated to demonstrating human dignity through quiet, powerful action across India.</p>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-6" style={{ color: C.charcoal }}>Explore</h4>
            <ul className="space-y-4 text-gray-500">
              {["Our Work", "Special Day Mission", "Animal Welfare", "Volunteer"].map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase().replace(" ", "-")}`} className="hover:text-black transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-6" style={{ color: C.charcoal }}>Contact</h4>
            <ul className="space-y-4 text-gray-500">
              <li className="flex items-center gap-3"><MapPin className="w-4 h-4 shrink-0" /> Noida sector 60, Uttar Pradesh</li>
              <li className="flex items-center gap-3"><Mail className="w-4 h-4 shrink-0" /> contact@humanpraytrust.org</li>
              <li className="flex items-center gap-3"><Phone className="w-4 h-4 shrink-0" /> +91 85108 04149</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Human Pray Trust. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
          </div>
        </div>
      </div>
      {/* Indian tricolor bottom border */}
      <div className="h-2 w-full flex mt-8">
        <div className="h-full flex-1" style={{ backgroundColor: C.saffron }} />
        <div className="h-full flex-1 bg-gray-200" />
        <div className="h-full flex-1" style={{ backgroundColor: C.green }} />
      </div>
    </footer>
  );
}

/* ─── Dog Feeding Mission ───────────────────────────────── */
function DogFeedingMission() {
  const steps = [
    { icon: Search, title: "Locate Stray Packs", desc: "Finding stray canine populations in Noida and surrounding areas who survive on garbage." },
    { icon: Gift, title: "Prepare Fresh Meals", desc: "Cooking nutritious, high-protein food (freshly cooked rice, eggs, healthy supplements) daily in our kitchens." },
    { icon: Users, title: "Feeding Drives", desc: "Mobilizing our compassionate volunteer groups to feed hundreds of strays systematically every day." },
  ];
  return (
    <section id="dog-feeding-mission" className="py-32" style={{ backgroundColor: C.cream }}>
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Symmetrical Left Image Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50, scale: 0.95 }} 
            whileInView={{ opacity: 1, x: 0, scale: 1 }} 
            viewport={{ once: true, margin: "-100px" }} 
            transition={{ duration: 1.2, ease: "easeOut" }} 
            className="relative h-[600px] rounded-2xl overflow-hidden group shadow-2xl order-last lg:order-first"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2D6A4F]/20 to-transparent z-10 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
            <motion.div
              className="absolute inset-0 w-full h-full"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                backgroundImage: "url('/NGO IMAGES/dog.jpeg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </motion.div>

          {/* Left/Right Text Column */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeInUp} className="flex items-center gap-4 mb-6">
              <div className="w-12 h-px" style={{ backgroundColor: C.green }} />
              <span className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: C.green }}>Compassion on Streets</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl mb-8 font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
              Dog Feeding<br />Mission
            </h2>
            <p className="text-lg text-gray-600 mb-12 leading-relaxed">
              Thousands of street animals go days without single crumb of nourishment, left to fight hunger in silent despair. Our Dog Feeding Mission is committed to restoring their basic right to food and care. We serve freshly prepared, wholesome meals daily to strays to keep them healthy and loved.
            </p>
            <div className="space-y-10">
              {steps.map((step, i) => (
                <motion.div key={i} variants={fadeInUp} className="flex gap-6 items-start">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${C.green}15`, color: C.green }}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-2" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>{step.title}</h3>
                    <p className="text-gray-600">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div variants={fadeInUp} className="mt-12">
              <a 
                href="/donate?case=Dog%20Feeding" 
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-[#2D6A4F]/20" 
                style={{ backgroundColor: C.green, textDecoration: "none" }}
              >
                <span>Donate for Dog Feeding</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}

/* ─── Successful Stories ────────────────────────────────── */
function SuccessfulStories({ stories }: { stories: any[] }) {
  return (
    <section id="successful-stories" className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#FF6B00]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[#2D6A4F]/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-8 h-px" style={{ backgroundColor: C.saffron }} />
            <span className="text-sm tracking-[0.2em] uppercase font-bold" style={{ color: C.saffron }}>Restoring Smiles · Our Triumphs</span>
            <div className="w-8 h-px" style={{ backgroundColor: C.saffron }} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif", color: C.charcoal }}>
            Successful Stories
          </h2>
          <p className="text-lg text-gray-600">
            Every donation makes a life-changing difference. Here are some of our most beautiful success stories, showing the real impact of your compassion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story, i) => (
            <motion.div 
              key={story.id || i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col group"
            >
              <div className="h-64 overflow-hidden relative bg-slate-100 shrink-0">
                {story.imageUrl ? (
                  <img 
                    src={story.imageUrl} 
                    alt={story.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-100">
                    <Award className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-emerald-600/90 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-emerald-400/30">
                  Dignity Restored
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    🏆 Success Achieved
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {story.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">
                    {story.description}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center text-xs text-slate-400 font-semibold">
                  <span>Verified Triumph</span>
                  <span>{new Date(story.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Page root ─────────────────────────────────────────── */
export default function LandingPage() {
  const [stories, setStories] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/stories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStories(data);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="w-full bg-white antialiased">
      <Navigation />
      <main>
        <Hero />
        <AboutUs />
        <ImpactCounters />
        <SpecialDayMission />
        <LiveCases />
        <AnimalWelfare />
        <DogFeedingMission />
        <ActionCards />
        <InitiativesGrid />
        <DonateSection />
        {stories.length > 0 && <SuccessfulStories stories={stories} />}
        <VolunteerJourney />
        <Testimonials />
        <Gallery />
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
