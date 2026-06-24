"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, Eye, EyeOff, LayoutDashboard, HeartHandshake, Image as ImageIcon, Settings, 
  LogOut, ArrowLeft, UploadCloud, FileText, Plus, Trash2, Play, Pause, Search, 
  DollarSign, Award, AlertCircle, CheckCircle2, Menu, X, ChevronRight, Calendar, 
  MapPin, User, RefreshCw, Layers, ShieldCheck, Heart
} from "lucide-react";
import Link from "next/link";

const ADMIN_PASS_KEY = "ngo_admin_pass";

interface Case {
  id: string;
  title: string;
  patientName: string;
  location: string;
  urgency: string;
  description: string;
  goalAmount: number;
  raisedAmount: number;
  imageUrl: string;
  documentUrl: string;
  documentName: string;
  createdAt: string;
  isActive: boolean;
  showProgress?: boolean;
}

interface Donation {
  id: string;
  name: string;
  email: string;
  phone: string;
  pan: string;
  amount: number;
  cause: string;
  paymentId: string;
  createdAt: string;
}

const C = {
  charcoal: "#1a1a2e",
  cream: "#fdf6ec",
  saffron: "#FF6B00",
  green: "#2D6A4F",
  white: "#ffffff",
  black: "#000000",
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"cases" | "donors" | "gallery" | "stories" | "settings">("cases");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [cases, setCases] = useState<Case[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [storiesForm, setStoriesForm] = useState({ title: "", description: "" });
  const [storyImageName, setStoryImageName] = useState("");
  const storyRef = useRef<HTMLInputElement>(null);
  const [galleryForm, setGalleryForm] = useState({ aspect: "aspect-square" });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ title: "", patientName: "", location: "", urgency: "high", description: "", goalAmount: "", raisedAmount: "", showProgress: "true" });
  const [editingCaseId, setEditingCaseId] = useState<string | null>(null);
  const [editRaisedVal, setEditRaisedVal] = useState<string>("");
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingStory, setEditingStory] = useState<any | null>(null);
  
  const [newPassword, setNewPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Custom states for file picker display names
  const [caseImageName, setCaseImageName] = useState("");
  const [caseDocName, setCaseDocName] = useState("");
  const [galleryImageName, setGalleryImageName] = useState("");

  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const storedPass = typeof window !== "undefined" ? sessionStorage.getItem(ADMIN_PASS_KEY) : null;

  useEffect(() => {
    if (storedPass) {
      fetch("/api/settings", { headers: { "x-admin-password": storedPass } })
        .then(res => {
          if (res.ok) {
            setAuthed(true);
            setPassword(storedPass);
          } else {
            handleLogout();
          }
        })
        .catch(() => handleLogout());
    }
  }, [storedPass]);

  useEffect(() => {
    if (authed) {
      if (activeTab === "cases") fetchCases();
      if (activeTab === "donors") fetchDonations();
      if (activeTab === "gallery") fetchGallery();
      if (activeTab === "stories") fetchStories();
    }
  }, [authed, activeTab]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchCases() {
    setLoading(true);
    try {
      const res = await fetch("/api/cases");
      const data = await res.json();
      setCases(Array.isArray(data) ? data.reverse() : []);
    } catch { showToast("Failed to load cases", "error"); }
    finally { setLoading(false); }
  }

  async function fetchDonations() {
    setLoading(true);
    try {
      const res = await fetch("/api/donations", { headers: { "x-admin-password": password } });
      const data = await res.json();
      setDonations(Array.isArray(data) ? data.reverse() : []);
    } catch { showToast("Failed to load donations", "error"); }
    finally { setLoading(false); }
  }

  async function fetchGallery() {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      const uploadedOnly = Array.isArray(data) ? data.filter((item: any) => !item.id.startsWith("def_")) : [];
      setGallery(uploadedOnly);
    } catch { showToast("Failed to load gallery", "error"); }
    finally { setLoading(false); }
  }

  async function fetchStories() {
    setLoading(true);
    try {
      const res = await fetch("/api/stories");
      const data = await res.json();
      setStories(Array.isArray(data) ? data.reverse() : []);
    } catch { showToast("Failed to load stories", "error"); }
    finally { setLoading(false); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password.trim() === "") return showToast("Enter a password", "error");
    try {
      const res = await fetch("/api/settings", { headers: { "x-admin-password": password } });
      if (!res.ok) {
        throw new Error("Invalid password");
      }
      sessionStorage.setItem(ADMIN_PASS_KEY, password);
      setAuthed(true);
      showToast("Logged in successfully!", "success");
    } catch {
      showToast("Invalid admin password", "error");
    }
  }

  function handleLogout() {
    sessionStorage.removeItem(ADMIN_PASS_KEY);
    setAuthed(false);
    setPassword("");
    setCases([]);
    setDonations([]);
    setGallery([]);
  }

  function startEditCase(c: Case) {
    setEditingCase(c);
    setForm({
      title: c.title || "",
      patientName: c.patientName || "",
      location: c.location || "",
      urgency: c.urgency || "medium",
      description: c.description || "",
      goalAmount: c.goalAmount ? c.goalAmount.toString() : "",
      raisedAmount: c.raisedAmount ? c.raisedAmount.toString() : "",
      showProgress: c.showProgress !== false ? "true" : "false",
    });
    setCaseImageName(c.imageUrl ? "Current Image (Click to change)" : "");
    setCaseDocName(c.documentName || (c.documentUrl ? "Current Verification Doc" : ""));
  }

  function cancelEditCase() {
    setEditingCase(null);
    setForm({ title: "", patientName: "", location: "", urgency: "high", description: "", goalAmount: "", raisedAmount: "", showProgress: "true" });
    setCaseImageName("");
    setCaseDocName("");
    if (imageRef.current) imageRef.current.value = "";
    if (docRef.current) docRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.description) return showToast("Title and description are required", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageRef.current?.files?.[0]) fd.append("image", imageRef.current.files[0]);
      if (docRef.current?.files?.[0]) fd.append("document", docRef.current.files[0]);
      
      const url = editingCase ? `/api/cases/${editingCase.id}` : "/api/cases";
      const method = editingCase ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "x-admin-password": password }, body: fd });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast(editingCase ? "Case updated successfully!" : "Case added successfully!", "success");
      cancelEditCase();
      fetchCases();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || (editingCase ? "Failed to update case" : "Failed to add case"), "error");
    } finally { setSubmitting(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this case permanently?")) return;
    const res = await fetch(`/api/cases/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
    if (res.ok) { showToast("Case deleted", "success"); fetchCases(); }
    else showToast("Failed to delete", "error");
  }

  async function toggleActive(id: string, current: boolean) {
    const res = await fetch(`/api/cases/${id}`, { method: "PATCH", headers: { "x-admin-password": password, "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !current }) });
    if (res.ok) { showToast(`Case ${!current ? "activated" : "deactivated"}`, "success"); fetchCases(); }
  }

  async function handleSaveRaised(id: string) {
    if (editRaisedVal.trim() === "") return showToast("Enter a valid raised amount", "error");
    const amountNum = parseFloat(editRaisedVal);
    if (isNaN(amountNum) || amountNum < 0) return showToast("Enter a positive number", "error");
    
    try {
      const res = await fetch(`/api/cases/${id}`, {
        method: "PATCH",
        headers: {
          "x-admin-password": password,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raisedAmount: amountNum })
      });
      if (!res.ok) throw new Error("Failed to update raised amount");
      showToast("Raised amount updated successfully!", "success");
      setEditingCaseId(null);
      fetchCases();
    } catch (err: any) {
      showToast(err.message || "Failed to update raised amount", "error");
    }
  }

  const renderBoldText = (text: string) => {
    if (!text) return "";
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return <strong key={i} className="font-extrabold text-slate-900">{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  async function handleUploadGallery(e: React.FormEvent) {
    e.preventDefault();
    if (!galleryRef.current?.files?.[0]) return showToast("Select a gallery photo first", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("image", galleryRef.current.files[0]);
      fd.append("aspect", galleryForm.aspect);
      const res = await fetch("/api/gallery", { method: "POST", headers: { "x-admin-password": password }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Photo uploaded to gallery successfully!", "success");
      setGalleryForm({ aspect: "aspect-square" });
      setGalleryImageName("");
      if (galleryRef.current) galleryRef.current.value = "";
      fetchGallery();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || "Failed to upload photo", "error");
    } finally { setSubmitting(false); }
  }

  async function handleDeleteGallery(id: string) {
    if (!confirm("Delete this photo from your gallery?")) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Photo deleted from gallery", "success");
      fetchGallery();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || "Failed to delete photo", "error");
    }
  }

  function startEditStory(s: any) {
    setEditingStory(s);
    setStoriesForm({
      title: s.title || "",
      description: s.description || "",
    });
    setStoryImageName(s.imageUrl ? "Current Image (Click to change)" : "");
  }

  function cancelEditStory() {
    setEditingStory(null);
    setStoriesForm({ title: "", description: "" });
    setStoryImageName("");
    if (storyRef.current) storyRef.current.value = "";
  }

  async function handleUploadStory(e: React.FormEvent) {
    e.preventDefault();
    if (!storiesForm.title || !storiesForm.description) return showToast("Title and description are required", "error");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", storiesForm.title);
      fd.append("description", storiesForm.description);
      if (storyRef.current?.files?.[0]) fd.append("image", storyRef.current.files[0]);
      
      const url = editingStory ? `/api/stories/${editingStory.id}` : "/api/stories";
      const method = editingStory ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "x-admin-password": password },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast(editingStory ? "Story updated successfully!" : "Story uploaded successfully!", "success");
      cancelEditStory();
      fetchStories();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || (editingStory ? "Failed to update story" : "Failed to upload story"), "error");
    } finally { setSubmitting(false); }
  }

  async function handleDeleteStory(id: string) {
    if (!confirm("Delete this story from your successes?")) return;
    try {
      const res = await fetch(`/api/stories/${id}`, { method: "DELETE", headers: { "x-admin-password": password } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Story deleted", "success");
      fetchStories();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || "Failed to delete story", "error");
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/settings", { 
          method: "POST", 
          headers: { "x-admin-password": password, "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      
      showToast("Password updated successfully!", "success");
      setNewPassword("");
      setPassword(newPassword);
      sessionStorage.setItem(ADMIN_PASS_KEY, newPassword);
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || "Failed to change password", "error");
    } finally { setSubmitting(false); }
  }

  const urgencyConfig: Record<string, { label: string, color: string, bg: string, text: string }> = { 
    high: { label: "High Urgency", color: "#ef4444", bg: "#fef2f2", text: "#ef4444" }, 
    medium: { label: "Medium Urgency", color: "#f59e0b", bg: "#fffbeb", text: "#d97706" }, 
    low: { label: "Low Urgency", color: "#22c55e", bg: "#f0fdf4", text: "#16a34a" } 
  };

  const filteredDonations = donations.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.phone && d.phone.includes(searchTerm)) ||
    (d.pan && d.pan.toLowerCase().includes(searchTerm.toLowerCase())) ||
    d.cause.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.paymentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ── 1. Stunning Glassmorphic Login Screen ── */
  if (!authed) return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0a0a16] font-sans selection:bg-[#FF6B00]/30 selection:text-white">
      {/* Decorative Blur Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#FF6B00]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#2D6A4F]/10 blur-[120px] pointer-events-none" />
      
      {/* Custom Sliding Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{ 
              position: "fixed", 
              top: 24, 
              zIndex: 9999, 
              background: toast.type === "success" ? "#f0fdf4" : "#fef2f2", 
              border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}` 
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl max-w-sm w-full mx-4"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className={`text-sm font-semibold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-white/[0.04] border border-white/[0.08] rounded-3xl p-8 shadow-2xl flex flex-col items-center">
          
          {/* Logo Branding */}
          <div className="relative mb-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-lg mb-4 flex items-center justify-center bg-white/5">
              <img 
                src="/website/human%20trust%20logo.jpg.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-[#FF6B00]">HUMAN</span> <span className="text-white">PRAY</span> <span className="text-[#2D6A4F]">TRUST</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-400">Secure Admin Panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter administrator password" 
                  className="w-full pl-11 pr-12 py-3.5 bg-white/[0.03] border border-white/[0.08] hover:border-white/20 focus:border-[#FF6B00] rounded-2xl text-white placeholder-slate-500 text-sm outline-none transition-all duration-300 focus:ring-4 focus:ring-[#FF6B00]/10"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit" 
              className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-amber-600 hover:from-amber-600 hover:to-[#FF6B00] text-white font-bold rounded-2xl tracking-wider text-sm shadow-[0_4px_20px_rgba(255,107,0,0.3)] transition-all duration-300 flex items-center justify-center gap-2"
            >
              Sign In to Dashboard <ChevronRight className="w-4 h-4" />
            </motion.button>
          </form>
          
          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#FF6B00] transition-colors duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );

  /* ── 2. Premium Dashboard Layout ── */
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-[#FF6B00]/20 selection:text-slate-900">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{ 
              position: "fixed", 
              top: 24, 
              right: 24, 
              zIndex: 9999, 
              background: toast.type === "success" ? "#f0fdf4" : "#fef2f2", 
              border: `1px solid ${toast.type === "success" ? "#bbf7d0" : "#fecaca"}` 
            }}
            className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl max-w-sm w-full mx-4"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            )}
            <span className={`text-sm font-semibold ${toast.type === "success" ? "text-emerald-800" : "text-rose-800"}`}>
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE HEADER (Sticky) */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#1a1a2e] text-white px-5 py-4 flex items-center justify-between shadow-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <img 
            src="/website/human%20trust%20logo.jpg.jpeg" 
            alt="Logo" 
            className="w-9 h-9 rounded-full object-cover border border-white/10" 
          />
          <div>
            <h1 className="font-bold text-sm tracking-tight text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
              <span className="text-[#FF6B00]">HUMAN</span> <span className="text-white">PRAY</span> <span className="text-[#2D6A4F]">TRUST</span>
            </h1>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold block -mt-0.5">Admin Panel</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-300 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER SIDEBAR (AnimatePresence Overlay) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black z-50 lg:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              className="fixed top-0 bottom-0 left-0 w-[280px] bg-[#1a1a2e] text-white z-50 p-6 flex flex-col justify-between shadow-2xl lg:hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/website/human%20trust%20logo.jpg.jpeg" 
                      alt="Logo" 
                      className="w-10 h-10 rounded-full object-cover border border-white/15" 
                    />
                    <div>
                      <h1 className="font-bold text-sm text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                        <span className="text-[#FF6B00]">HUMAN</span> <span className="text-white">PRAY</span>
                      </h1>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Dashboard</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {[
                    { id: "cases", label: "Cases List", icon: LayoutDashboard },
                    { id: "donors", label: "Donors Hub", icon: HeartHandshake },
                    { id: "gallery", label: "Gallery Assets", icon: ImageIcon },
                    { id: "stories", label: "Successful Stories", icon: Award },
                    { id: "settings", label: "Admin Settings", icon: Settings },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                          isActive 
                            ? "bg-[#FF6B00] text-white shadow-lg shadow-[#FF6B00]/20" 
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <a 
                  href="/" 
                  className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-center text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> View Public Site
                </a>
                <button 
                  onClick={handleLogout}
                  className="w-full py-2.5 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/30 text-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DESKTOP SIDEBAR (Permanent) */}
      <aside className="hidden lg:flex w-72 bg-[#1a1a2e] text-white flex-col justify-between p-6 shrink-0 sticky top-0 h-screen border-r border-white/5 shadow-xl">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-white/15 shadow-md flex items-center justify-center bg-white/5">
              <img 
                src="/website/human%20trust%20logo.jpg.jpeg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="font-bold text-base leading-none text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                <span className="text-[#FF6B00]">HUMAN</span> <span className="text-white">PRAY</span> <span className="text-[#2D6A4F]">TRUST</span>
              </h1>
              <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-slate-400 mt-1 block">Management Suite</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {[
              { id: "cases", label: "Fundraiser Cases", icon: LayoutDashboard },
              { id: "donors", label: "Donation Records", icon: HeartHandshake },
              { id: "gallery", label: "Gallery Assets", icon: ImageIcon },
              { id: "stories", label: "Successful Stories", icon: Award },
              { id: "settings", label: "Admin Settings", icon: Settings },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4.5 py-3.5 rounded-2xl font-semibold text-sm transition-all duration-200 relative overflow-hidden group ${
                    isActive 
                      ? "bg-gradient-to-r from-[#FF6B00] to-[#e05e00] text-white shadow-lg shadow-[#FF6B00]/25" 
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{tab.label}</span>
                  {!isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#FF6B00] scale-0 group-hover:scale-100 transition-transform duration-200" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <a 
            href="/" 
            className="w-full py-3 rounded-2xl border border-white/10 hover:border-white/20 text-center text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center gap-2 transition-all bg-white/[0.02]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> View Public Site
          </a>
          
          <button 
            onClick={handleLogout}
            className="w-full py-3 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-900/30 text-rose-200 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* ── 3. Dashboard Content Canvas ── */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 capitalize flex items-center gap-2">
                <span>{activeTab === "donors" ? "Donations Tracker" : activeTab === "gallery" ? "Gallery Management" : `${activeTab} Dashboard`}</span>
              </h2>
              <p className="text-xs md:text-sm text-slate-500 mt-1">Manage and update human pray trust records and configurations in real-time.</p>
            </div>
            
            {activeTab === "cases" && (
              <button 
                onClick={fetchCases} 
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
              </button>
            )}
          </div>

          {/* TAB CHANNELS */}
          
          {/* ── CASES TAB ── */}
          {activeTab === "cases" && (
            <div className="space-y-6 md:space-y-8">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { 
                    label: "Total Cases", 
                    value: cases.length, 
                    icon: Layers, 
                    bg: "bg-blue-50/50", 
                    border: "border-blue-100", 
                    text: "text-blue-950", 
                    labelColor: "text-blue-600/80", 
                    iconBg: "bg-blue-100/60", 
                    iconColor: "text-blue-600" 
                  },
                  { 
                    label: "Active", 
                    value: cases.filter(c => c.isActive).length, 
                    icon: CheckCircle2, 
                    bg: "bg-emerald-50/60", 
                    border: "border-emerald-100", 
                    text: "text-emerald-950", 
                    labelColor: "text-emerald-700/80", 
                    iconBg: "bg-emerald-100/60", 
                    iconColor: "text-emerald-600" 
                  },
                  { 
                    label: "Inactive", 
                    value: cases.filter(c => !c.isActive).length, 
                    icon: Pause, 
                    bg: "bg-amber-50/50", 
                    border: "border-amber-100", 
                    text: "text-amber-950", 
                    labelColor: "text-amber-700/80", 
                    iconBg: "bg-amber-100/60", 
                    iconColor: "text-amber-600" 
                  },
                  { 
                    label: "Urgent Care", 
                    value: cases.filter(c => c.urgency === "high").length, 
                    icon: AlertCircle, 
                    bg: "bg-rose-50/60", 
                    border: "border-rose-100", 
                    text: "text-rose-950", 
                    labelColor: "text-rose-700/80", 
                    iconBg: "bg-rose-100/60", 
                    iconColor: "text-rose-600" 
                  },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={s.label} 
                      className={`rounded-2xl p-5 shadow-sm border flex items-center justify-between transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${s.bg} ${s.border}`}
                    >
                      <div className="space-y-1">
                        <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest block ${s.labelColor}`}>{s.label}</span>
                        <span className={`text-xl md:text-2xl font-extrabold tracking-tight block ${s.text}`}>{s.value}</span>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/50 ${s.iconBg} ${s.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Layout Content */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* ── Form Section: Add Case (Grid Col: 5) ── */}
                <div className="xl:col-span-5 bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 xl:sticky xl:top-[96px] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Plus className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="font-bold text-base text-slate-800">
                        {editingCase ? "Edit Fundraiser Case" : "Launch Fundraiser Case"}
                      </h3>
                    </div>
                    {editingCase && (
                      <button
                        type="button"
                        onClick={cancelEditCase}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Case Title *</label>
                      <input 
                        value={form.title} 
                        onChange={e => setForm({ ...form, title: e.target.value })} 
                        placeholder="e.g. Help Satyam get emergency heart surgery" 
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5"
                        required 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Patient Name</label>
                        <input 
                          value={form.patientName} 
                          onChange={e => setForm({ ...form, patientName: e.target.value })} 
                          placeholder="e.g. Satyam Kumar" 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Location</label>
                        <input 
                          value={form.location} 
                          onChange={e => setForm({ ...form, location: e.target.value })} 
                          placeholder="e.g. Varanasi, UP" 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Urgency Level</label>
                        <select 
                          value={form.urgency} 
                          onChange={e => setForm({ ...form, urgency: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        >
                          <option value="high">🔴 High Urgency</option>
                          <option value="medium">🟡 Medium Urgency</option>
                          <option value="low">🟢 Low Urgency</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Fund Raised Meter</label>
                        <select 
                          value={form.showProgress} 
                          onChange={e => setForm({ ...form, showProgress: e.target.value })} 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        >
                          <option value="true">🟢 Show Meter</option>
                          <option value="false">🔴 Hide Meter</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Goal Amount (₹)</label>
                        <input 
                          type="number" 
                          value={form.goalAmount} 
                          onChange={e => setForm({ ...form, goalAmount: e.target.value })} 
                          placeholder="e.g. 150000" 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Raised Amount (₹)</label>
                        <input 
                          type="number" 
                          value={form.raisedAmount} 
                          onChange={e => setForm({ ...form, raisedAmount: e.target.value })} 
                          placeholder="e.g. 10000" 
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Detailed Description *</label>
                      <textarea 
                        value={form.description} 
                        onChange={e => setForm({ ...form, description: e.target.value })} 
                        placeholder="Explain the patient's medical situation and how the funds will make an impact..." 
                        rows={4}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none resize-none transition-all focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5"
                        required 
                      />
                    </div>

                    {/* Styled Image Input Dropzone */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1 block">Patient Photo</label>
                      <div 
                        onClick={() => imageRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/20 flex flex-col items-center justify-center gap-1.5"
                      >
                        <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                        <span className="text-xs font-semibold text-slate-600 block">
                          {caseImageName ? caseImageName : "Upload Patient/Case Photo"}
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG or WebP up to 5MB</span>
                        <input 
                          ref={imageRef} 
                          type="file" 
                          accept="image/*" 
                          onChange={e => setCaseImageName(e.target.files?.[0]?.name || "")}
                          className="hidden" 
                        />
                      </div>
                    </div>

                    {/* Styled PDF/Doc Input Dropzone */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1 block">Verification Document (PDF/ID)</label>
                      <div 
                        onClick={() => docRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/20 flex flex-col items-center justify-center gap-1.5"
                      >
                        <FileText className="w-6 h-6 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-600 block">
                          {caseDocName ? caseDocName : "Upload verification certificate"}
                        </span>
                        <span className="text-[10px] text-slate-400">PDF, JPG or PNG (e.g. Medical Report)</span>
                        <input 
                          ref={docRef} 
                          type="file" 
                          accept=".pdf,image/*" 
                          onChange={e => setCaseDocName(e.target.files?.[0]?.name || "")}
                          className="hidden" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-2xl tracking-wider text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {submitting ? "Processing Asset..." : (editingCase ? "Save Changes" : "Launch Fundraiser")}
                    </button>
                    {editingCase && (
                      <button 
                        type="button" 
                        onClick={cancelEditCase}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl tracking-wider text-xs transition-all flex items-center justify-center mt-2 border-0 cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </div>

                {/* ── Cases List Section (Grid Col: 7) ── */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-800">Operational Cases</h3>
                    <span className="text-xs font-semibold text-slate-400">{cases.length} cases registered</span>
                  </div>

                  {loading ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                      Fetching current trust cases...
                    </div>
                  ) : cases.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                      <Layers className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                      <span className="font-semibold block mb-1">No Cases Initiated</span>
                      <span className="text-xs text-slate-400">Create your first fundraiser case using the configuration form.</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cases.map(c => {
                        const urg = urgencyConfig[c.urgency] || { label: "Standard Case", bg: "#f8fafc", text: "#64748b", color: "#64748b" };
                        return (
                          <motion.div 
                            layout
                            key={c.id} 
                            className={`bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 flex flex-col sm:flex-row ${
                              c.isActive ? "border-slate-100 hover:border-emerald-300" : "border-slate-200 bg-slate-50/50 opacity-85"
                            }`}
                          >
                            {/* Thumbnail Container */}
                            <div className="w-full sm:w-[150px] h-[150px] relative bg-slate-100 shrink-0">
                              {c.imageUrl ? (
                                <img src={c.imageUrl} alt={c.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                  <ImageIcon className="w-8 h-8" />
                                </div>
                              )}
                              {/* Urgency Overlay Badge */}
                              <div 
                                style={{ backgroundColor: urg.bg, color: urg.text }}
                                className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider shadow-sm border border-black/5"
                              >
                                {urg.label}
                              </div>
                            </div>

                            {/* Case Information Body */}
                            <div className="p-5 flex-1 min-w-0 flex flex-col justify-between">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-bold text-sm md:text-base text-slate-800 tracking-tight leading-tight line-clamp-1">
                                    {renderBoldText(c.title)}
                                  </h4>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      c.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                                    }`}>
                                      {c.isActive ? "LIVE" : "PAUSED"}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                      c.showProgress !== false ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                                    }`}>
                                      {c.showProgress !== false ? "METER ON" : "METER OFF"}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                                  {c.patientName && (
                                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {c.patientName}</span>
                                  )}
                                  {c.location && (
                                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {c.location}</span>
                                  )}
                                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                                </div>

                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                  {renderBoldText(c.description)}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 mt-4">
                                <div className="flex flex-col gap-1">
                                  {c.goalAmount > 0 ? (
                                    <div className="text-xs font-semibold text-slate-800">
                                      Target amount: <span className="text-[#FF6B00] font-bold">₹{c.goalAmount.toLocaleString("en-IN")}</span>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-400 font-medium">Ongoing Support</div>
                                  )}

                                  {editingCaseId === c.id ? (
                                    <div className="flex items-center gap-2 mt-1">
                                      <input
                                        type="number"
                                        value={editRaisedVal}
                                        onChange={(e) => setEditRaisedVal(e.target.value)}
                                        className="px-2 py-1 text-xs border border-slate-300 rounded-md w-24 outline-none focus:border-[#FF6B00]"
                                        placeholder="Raised"
                                      />
                                      <button
                                        onClick={() => handleSaveRaised(c.id)}
                                        className="px-2 py-1 bg-emerald-600 text-white rounded-md text-xs font-bold hover:bg-emerald-700 border-0 cursor-pointer"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingCaseId(null)}
                                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-bold hover:bg-slate-300 border-0 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                                      <span>Raised:</span>
                                      <span className="text-emerald-600 font-bold">₹{(c.raisedAmount || 0).toLocaleString("en-IN")}</span>
                                      <button
                                        onClick={() => {
                                          setEditingCaseId(c.id);
                                          setEditRaisedVal((c.raisedAmount || 0).toString());
                                        }}
                                        className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded text-[10px] font-bold transition-colors border-0 cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  )}
                                </div>

                                {/* Card Actions */}
                                <div className="flex items-center gap-2">
                                  {c.documentUrl && (
                                    <button 
                                      onClick={() => window.open(c.documentUrl, "_blank")}
                                      className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors border border-slate-100"
                                      title="Open Trust Verification Certificate"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => startEditCase(c)}
                                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Edit Case Details"
                                  >
                                    Edit Details
                                  </button>
                                  <button 
                                    onClick={() => toggleActive(c.id, c.isActive)}
                                    className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition-colors flex items-center gap-1 ${
                                      c.isActive 
                                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" 
                                        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                    }`}
                                  >
                                    {c.isActive ? (
                                      <>
                                        <Pause className="w-3.5 h-3.5" /> Pause
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-3.5 h-3.5" /> Launch
                                      </>
                                    )}
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(c.id)}
                                    className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                                    title="Delete Fundraiser"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
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

            </div>
          )}

          {/* ── DONORS TAB ── */}
          {activeTab === "donors" && (
            <div className="space-y-6">
              
              {/* Financial Dashboard Summary Banner */}
              <div className="bg-[#1a1a2e] text-white rounded-3xl p-6 shadow-md border border-white/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#FF6B00]/5 blur-[70px] pointer-events-none" />
                
                <div className="space-y-2 relative">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-xs text-[#FF6B00] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Financial Transparency Ledger
                  </div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Donations & Contributor Ledgers
                  </h3>
                  <p className="text-xs text-slate-400">All payments secured and verified via Razorpay PG.</p>
                </div>

                <div className="flex gap-6 shrink-0 relative bg-white/[0.03] p-4.5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Total Funds Raised</span>
                    <span className="text-xl md:text-2xl font-bold text-emerald-400 block">
                      ₹{donations.reduce((acc, d) => acc + d.amount, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Transaction Count</span>
                    <span className="text-xl md:text-2xl font-bold text-white block">
                      {donations.length} Contributions
                    </span>
                  </div>
                </div>
              </div>

              {/* Contributor List Table Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                {/* Search Bar / Panel Controls */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20">
                  <div className="relative w-full sm:max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      placeholder="Search contributors, emails, transaction codes..." 
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5 placeholder-slate-400"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm("")} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <span className="text-xs font-semibold text-slate-400 shrink-0">
                    Found {filteredDonations.length} matches
                  </span>
                </div>

                {loading ? (
                  <div className="p-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                    Syncing transaction histories...
                  </div>
                ) : filteredDonations.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                    <span className="font-semibold block mb-1">No Contributions Found</span>
                    <span className="text-xs text-slate-400">Try modifying your search criteria or checking back later.</span>
                  </div>
                ) : (
                  <>
                    {/* DESKTOP TABLE VIEW */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="py-4.5 px-6">Timestamp</th>
                            <th className="py-4.5 px-6">Donor Information</th>
                            <th className="py-4.5 px-6">PAN ID</th>
                            <th className="py-4.5 px-6">Fundraiser Cause</th>
                            <th className="py-4.5 px-6">Transaction Signature</th>
                            <th className="py-4.5 px-6 text-right">Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDonations.map(d => (
                            <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 px-6 text-xs text-slate-400">
                                {new Date(d.createdAt).toLocaleDateString("en-IN")}
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-bold text-sm text-slate-800">{d.name}</div>
                                <div className="text-xs text-slate-400 flex flex-col">
                                  <span>{d.email}</span>
                                  {d.phone && <span className="text-[10px] text-slate-500 mt-0.5">{d.phone}</span>}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs font-semibold text-slate-600">
                                {d.pan ? (
                                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] border border-blue-100 uppercase">{d.pan}</span>
                                ) : (
                                  <span className="text-slate-300">-</span>
                                )}
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-600 max-w-[150px] truncate" title={d.cause}>
                                {d.cause}
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-400 font-mono tracking-tight">
                                {d.paymentId}
                              </td>
                              <td className="py-4 px-6 text-right">
                                <span className="font-extrabold text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                  ₹{d.amount.toLocaleString("en-IN")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* MOBILE DETAILS CARDS VIEW (Collapse Wide Horizontal Table) */}
                    <div className="md:hidden divide-y divide-slate-100">
                      {filteredDonations.map(d => (
                        <div key={d.id} className="p-5 space-y-3.5">
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{d.name}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{d.email}</div>
                              {d.phone && <div className="text-[10px] text-slate-400 mt-0.5">{d.phone}</div>}
                            </div>
                            <span className="font-extrabold text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 shrink-0">
                              ₹{d.amount.toLocaleString("en-IN")}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-[11px]">
                            <div>
                              <span className="text-slate-400 uppercase tracking-wider block text-[9px] font-bold">Cause</span>
                              <span className="text-slate-700 font-semibold block truncate mt-0.5">{d.cause}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 uppercase tracking-wider block text-[9px] font-bold">Receipt (PAN)</span>
                              <span className="text-slate-700 font-semibold block mt-0.5">
                                {d.pan ? <span className="text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded uppercase">{d.pan}</span> : "None"}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 uppercase tracking-wider block text-[9px] font-bold">Timestamp</span>
                              <span className="text-slate-700 font-medium block mt-0.5">{new Date(d.createdAt).toLocaleDateString("en-IN")}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 uppercase tracking-wider block text-[9px] font-bold">Signature ID</span>
                              <span className="text-slate-500 font-mono truncate block mt-0.5">{d.paymentId}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>
          )}

          {/* ── 4. GALLERY TAB [RESTORED & PREMIUM IMPLEMENTATION] ── */}
          {activeTab === "gallery" && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Image Upload Control Card (Col: 4) */}
                <div className="xl:col-span-4 bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 xl:sticky xl:top-[96px] space-y-6">
                  <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                    <ImageIcon className="w-5 h-5 text-[#FF6B00]" />
                    <h3 className="font-bold text-base text-slate-800">Add Gallery Asset</h3>
                  </div>

                  <form onSubmit={handleUploadGallery} className="space-y-4">
                    
                    {/* Styled Image Input Dropzone */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1 block">Image Asset *</label>
                      <div 
                        onClick={() => galleryRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/20 flex flex-col items-center justify-center gap-2 group"
                      >
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                        <span className="text-xs font-semibold text-slate-600 block">
                          {galleryImageName ? galleryImageName : "Select Gallery Photo"}
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG or WebP up to 8MB</span>
                        <input 
                          ref={galleryRef} 
                          type="file" 
                          accept="image/jpeg,image/png,image/webp" 
                          onChange={e => setGalleryImageName(e.target.files?.[0]?.name || "")}
                          className="hidden" 
                          required
                        />
                      </div>
                    </div>

                    {/* Image Aspect ratio selector */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1 block">Visual Aspect Ratio *</label>
                      <select 
                        value={galleryForm.aspect} 
                        onChange={e => setGalleryForm({ ...galleryForm, aspect: e.target.value })} 
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all focus:border-[#FF6B00]"
                      >
                        <option value="aspect-square">Square (1:1)</option>
                        <option value="aspect-[16/9]">Landscape (16:9)</option>
                        <option value="aspect-[4/3]">Standard (4:3)</option>
                        <option value="aspect-[3/4]">Portrait (3:4)</option>
                      </select>
                      <span className="text-[10px] text-slate-400 ml-1 block">Sets how the layout previews this picture in grid portfolios.</span>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-2xl tracking-wider text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {submitting ? "Uploading asset..." : "Publish to Gallery"}
                    </button>

                  </form>
                </div>

                {/* Grid Portfolio Section (Col: 8) */}
                <div className="xl:col-span-8 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-800">Dynamic Asset Portfolio</h3>
                    <span className="text-xs font-semibold text-slate-400">{gallery.length} uploaded files listed</span>
                  </div>

                  {loading ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                      Loading gallery collection...
                    </div>
                  ) : gallery.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                      <span className="font-semibold block mb-1">No Custom Photos Published</span>
                      <span className="text-xs text-slate-400">Upload custom gallery images in the sidebar configuration layout. Default system fallback images will load on the main site.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {gallery.map(img => (
                        <motion.div 
                          layout
                          key={img.id}
                          className="bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm group relative overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                          <div className={`relative overflow-hidden rounded-xl bg-slate-100 w-full ${img.aspect}`}>
                            <img 
                              src={img.src} 
                              alt="Gallery Item" 
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            
                            {/* Visual deletion overlay trigger */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteGallery(img.id);
                                }}
                                className="pointer-events-auto p-3 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="p-2 text-center">
                            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block truncate">
                              Aspect: {img.aspect.replace("aspect-", "")}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* ── STORIES TAB ── */}
          {activeTab === "stories" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Story Upload Control Card */}
                <div className="xl:col-span-4 bg-white rounded-3xl p-5 md:p-7 shadow-sm border border-slate-100 xl:sticky xl:top-[96px] space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-[#FF6B00]" />
                      <h3 className="font-bold text-base text-slate-800">
                        {editingStory ? "Edit Success Story" : "Add Successful Story"}
                      </h3>
                    </div>
                    {editingStory && (
                      <button
                        type="button"
                        onClick={cancelEditStory}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-all border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUploadStory} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Story Title *</label>
                      <input 
                        value={storiesForm.title} 
                        onChange={e => setStoriesForm({ ...storiesForm, title: e.target.value })} 
                        placeholder="e.g. Stray dog rescued & fully rehabilitated" 
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none transition-all focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5"
                        required 
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">Description *</label>
                      <textarea 
                        value={storiesForm.description} 
                        onChange={e => setStoriesForm({ ...storiesForm, description: e.target.value })} 
                        placeholder="Describe this success story in detail..." 
                        rows={5}
                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 text-sm outline-none resize-none transition-all focus:border-[#FF6B00] focus:ring-4 focus:ring-[#FF6B00]/5"
                        required 
                      />
                    </div>

                    {/* Styled Image Input Dropzone */}
                    <div className="space-y-1">
                      <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1 block">Story Photo</label>
                      <div 
                        onClick={() => storyRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-[#FF6B00] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/20 flex flex-col items-center justify-center gap-2 group"
                      >
                        <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-[#FF6B00] transition-colors" />
                        <span className="text-xs font-semibold text-slate-600 block">
                          {storyImageName ? storyImageName : "Select Story Photo"}
                        </span>
                        <span className="text-[10px] text-slate-400">JPG, PNG or WebP up to 8MB</span>
                        <input 
                          ref={storyRef} 
                          type="file" 
                          accept="image/*" 
                          onChange={e => setStoryImageName(e.target.files?.[0]?.name || "")}
                          className="hidden" 
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={submitting} 
                      className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-2xl tracking-wider text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
                    >
                      {submitting ? "Processing Story..." : (editingStory ? "Save Changes" : "Publish Story")}
                    </button>
                    {editingStory && (
                      <button 
                        type="button" 
                        onClick={cancelEditStory}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl tracking-wider text-xs transition-all flex items-center justify-center mt-2 border-0 cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </form>
                </div>

                {/* Story List Section */}
                <div className="xl:col-span-8 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-base text-slate-800">Successful Stories</h3>
                    <span className="text-xs font-semibold text-slate-400">{stories.length} stories listed</span>
                  </div>

                  {loading ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-medium">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-slate-300" />
                      Loading successful stories...
                    </div>
                  ) : stories.length === 0 ? (
                    <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                      <Award className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                      <span className="font-semibold block mb-1">No Success Stories Published</span>
                      <span className="text-xs text-slate-400">Add a story using the form to display successes on the landing page!</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stories.map(s => (
                        <motion.div 
                          layout
                          key={s.id}
                          className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-all duration-300"
                        >
                          <div className="w-full sm:w-[160px] h-[160px] relative bg-slate-50 flex items-center justify-center border-r border-slate-100 shrink-0">
                            {s.imageUrl ? (
                              <img src={s.imageUrl} alt={s.title} className="w-full h-full object-contain p-1.5" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <ImageIcon className="w-8 h-8" />
                              </div>
                            )}
                          </div>

                          <div className="p-5 flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-2">
                              <h4 className="font-bold text-slate-800 text-sm md:text-base leading-tight truncate">
                                {s.title}
                              </h4>
                              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                                {s.description}
                              </p>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 mt-4">
                              <span className="text-[10px] text-slate-400">
                                Published: {new Date(s.createdAt).toLocaleDateString("en-IN")}
                              </span>
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => startEditStory(s)}
                                  className="px-3 py-1.5 rounded-xl font-bold text-xs bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Edit Story"
                                >
                                  Edit Details
                                </button>
                                <button 
                                  onClick={() => handleDeleteStory(s.id)}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-100"
                                  title="Delete Story"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === "settings" && (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-xl mx-auto space-y-6"
            >
              
              {/* Settings Configuration Card */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                  <Settings className="w-5 h-5 text-[#FF6B00]" />
                  <h3 className="font-bold text-base text-slate-800">Security Credentials</h3>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/50 p-4.5 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Set a strong new password below. If you forget your credential passcode, you will need to reset it manually inside the server's workspace settings folder (<code>data/admin-config.json</code>).
                  </p>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-500 ml-1">New Administrator Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      placeholder="Enter strong admin password" 
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-800 text-sm outline-none transition-all focus:border-[#FF6B00]"
                      required 
                      minLength={4}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting} 
                    className="w-full py-3.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold rounded-2xl tracking-wider text-sm transition-all shadow-sm"
                  >
                    {submitting ? "Saving changes..." : "Save Password Update"}
                  </button>
                </form>
              </div>

              {/* API and PG Diagnostics Alert Card */}
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-6 space-y-2 text-center text-xs text-slate-500 leading-relaxed">
                <h4 className="font-bold text-slate-700 block text-xs">Payment Gateway Configuration Notice</h4>
                <p>
                  Razorpay API parameters are configured using local environment directives (<code>RAZORPAY_KEY_ID</code> & <code>RAZORPAY_KEY_SECRET</code>). Reach out to system hosts to adjust keys or configure mock sandboxes.
                </p>
              </div>

            </motion.div>
          )}

        </div>
      </main>

    </div>
  );
}
