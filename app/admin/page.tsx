"use client";
import { useState, useEffect, useRef } from "react";

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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<"cases" | "donors" | "settings">("cases");
  
  const [cases, setCases] = useState<Case[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({ title: "", patientName: "", location: "", urgency: "high", description: "", goalAmount: "" });
  
  const [newPassword, setNewPassword] = useState("");
  
  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
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
      const res = await fetch("/api/cases", { method: "POST", headers: { "x-admin-password": password }, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showToast("Case added successfully!", "success");
      setForm({ title: "", patientName: "", location: "", urgency: "high", description: "", goalAmount: "" });
      if (imageRef.current) imageRef.current.value = "";
      if (docRef.current) docRef.current.value = "";
      fetchCases();
    } catch (err: any) {
      if (err.message === "Unauthorized") handleLogout();
      showToast(err.message || "Failed to add case", "error");
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

  const urgencyColor: Record<string, string> = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

  /* ── Login Screen ── */
  if (!authed) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form onSubmit={handleLogin} style={{ background: "white", borderRadius: 24, padding: "3rem 2.5rem", width: "100%", maxWidth: 400, boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/website/human%20trust%20logo.jpg.jpeg" alt="Logo" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", display: "block", margin: "0 auto 16px" }} />
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.6rem", margin: 0 }}>
            <span style={{ color: "#FF6B00" }}>Admin</span> <span style={{ color: "#1a1a2e" }}>Panel</span>
          </h1>
          <p style={{ color: "#999", fontSize: "0.85rem", marginTop: 6 }}>Human Pray Trust</p>
        </div>
        <label style={labelStyle}>Admin Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" style={inputStyle} required />
        <button type="submit" style={{ ...btnStyle, width: "100%", marginTop: 16 }}>Login →</button>
      </form>
    </div>
  );

  /* ── Dashboard ── */
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "Inter,sans-serif" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "14px 24px", borderRadius: 12, color: "white", background: toast.type === "success" ? "#22c55e" : "#ef4444", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", fontWeight: 600 }}>
          {toast.type === "success" ? "✓ " : "✗ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <header style={{ background: "#1a1a2e", color: "white", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src="/website/human%20trust%20logo.jpg.jpeg" alt="Logo" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover" }} />
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "1.15rem", fontWeight: 700 }}>
              <span style={{ color: "#FF6B00" }}>Human Pray</span> <span style={{ color: "#4CAF7D" }}>Trust</span>
            </div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.3)", padding: 4, borderRadius: 12 }}>
          {(["cases", "donors", "settings"] as const).map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t)}
              style={{ padding: "6px 16px", borderRadius: 8, border: "none", background: activeTab === t ? "rgba(255,255,255,0.15)" : "transparent", color: activeTab === t ? "white" : "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", textDecoration: "none" }}>← View Site</a>
          <button onClick={handleLogout} style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem" }}>Logout</button>
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        
        {/* CASES TAB */}
        {activeTab === "cases" && (
          <>
            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 32 }}>
              {[
                { label: "Total Cases", value: cases.length, color: "#1a1a2e" },
                { label: "Active Cases", value: cases.filter(c => c.isActive).length, color: "#22c55e" },
                { label: "Inactive Cases", value: cases.filter(c => !c.isActive).length, color: "#f59e0b" },
                { label: "High Urgency", value: cases.filter(c => c.urgency === "high").length, color: "#ef4444" },
              ].map(s => (
                <div key={s.label} style={{ background: "white", borderRadius: 16, padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderTop: `4px solid ${s.color}` }}>
                  <div style={{ fontSize: "2rem", fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "0.8rem", color: "#888", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24, alignItems: "start" }}>
              {/* ── Add Case Form ── */}
              <div style={{ background: "white", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", position: "sticky", top: 90 }}>
                <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.2rem", color: "#1a1a2e", fontWeight: 700 }}>➕ Add New Case</h2>
                <form onSubmit={handleSubmit}>
                  <label style={labelStyle}>Case Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Help Satyam get surgery" style={inputStyle} required />

                  <label style={labelStyle}>Patient Name</label>
                  <input value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} placeholder="e.g. Satyam Kumar" style={inputStyle} />

                  <label style={labelStyle}>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Varanasi, UP" style={inputStyle} />

                  <label style={labelStyle}>Urgency Level</label>
                  <select value={form.urgency} onChange={e => setForm({ ...form, urgency: e.target.value })} style={inputStyle}>
                    <option value="high">🔴 High — Immediate help needed</option>
                    <option value="medium">🟡 Medium — Needs help soon</option>
                    <option value="low">🟢 Low — Ongoing support</option>
                  </select>

                  <label style={labelStyle}>Goal Amount (₹)</label>
                  <input type="number" value={form.goalAmount} onChange={e => setForm({ ...form, goalAmount: e.target.value })} placeholder="e.g. 150000" style={inputStyle} />

                  <label style={labelStyle}>Description *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the person's situation and how donations will help..." style={{ ...inputStyle, height: 120, resize: "vertical" }} required />

                  <label style={labelStyle}>📷 Case Photo (JPG, PNG, WebP)</label>
                  <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" style={fileInputStyle} />

                  <label style={labelStyle}>📄 Document (PDF, JPG — medical reports, ID proof, etc.)</label>
                  <input ref={docRef} type="file" accept=".pdf,image/jpeg,image/png" style={fileInputStyle} />

                  <button type="submit" disabled={submitting} style={{ ...btnStyle, width: "100%", marginTop: 20, opacity: submitting ? 0.7 : 1 }}>
                    {submitting ? "Uploading..." : "Add Fundraiser Case"}
                  </button>
                </form>
              </div>

              {/* ── Cases List ── */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#1a1a2e", fontWeight: 700 }}>📋 All Cases</h2>
                  <button onClick={fetchCases} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: "0.85rem" }}>🔄 Refresh</button>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "4rem", color: "#888" }}>Loading cases...</div>
                ) : cases.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem", color: "#888", background: "white", borderRadius: 20 }}>
                    <div style={{ fontSize: "3rem", marginBottom: 12 }}>📭</div>
                    <div>No cases yet. Add your first fundraiser above.</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {cases.map(c => (
                      <div key={c.id} style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: c.isActive ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(0,0,0,0.08)" }}>
                        <div style={{ display: "flex", gap: 0 }}>
                          {c.imageUrl && (
                            <img src={c.imageUrl} alt={c.title} style={{ width: 120, height: 120, objectFit: "cover", flexShrink: 0 }} />
                          )}
                          <div style={{ padding: "1rem 1.25rem", flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                              <h3 style={{ margin: 0, fontSize: "1rem", color: "#1a1a2e", fontWeight: 700 }}>{c.title}</h3>
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <span style={{ background: c.isActive ? "#dcfce7" : "#fef3c7", color: c.isActive ? "#16a34a" : "#d97706", padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700 }}>
                                  {c.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                                <span style={{ background: `${urgencyColor[c.urgency]}22`, color: urgencyColor[c.urgency], padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
                                  {c.urgency}
                                </span>
                              </div>
                            </div>
                            <div style={{ fontSize: "0.78rem", color: "#888", marginTop: 4 }}>
                              {c.patientName && <span>👤 {c.patientName} </span>}
                              {c.location && <span>📍 {c.location} </span>}
                              <span>📅 {new Date(c.createdAt).toLocaleDateString("en-IN")}</span>
                            </div>
                            <p style={{ margin: "8px 0", fontSize: "0.82rem", color: "#555", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{c.description}</p>
                            {c.goalAmount > 0 && (
                              <div style={{ fontSize: "0.8rem", color: "#1a1a2e", fontWeight: 600 }}>
                                🎯 Goal: ₹{c.goalAmount.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                              {c.documentUrl && (
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
                                  style={{ 
                                    fontSize: "0.78rem", 
                                    color: "#3b82f6", 
                                    textDecoration: "none", 
                                    background: "#eff6ff", 
                                    padding: "4px 10px", 
                                    borderRadius: 6, 
                                    fontWeight: 600,
                                    border: "none",
                                    cursor: "pointer"
                                  }}
                                >
                                  📄 {c.documentName || "View Document"}
                                </button>
                              )}
                              <button onClick={() => toggleActive(c.id, c.isActive)} style={{ fontSize: "0.78rem", color: c.isActive ? "#d97706" : "#16a34a", background: c.isActive ? "#fef9c3" : "#dcfce7", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                                {c.isActive ? "⏸ Deactivate" : "▶ Activate"}
                              </button>
                              <button onClick={() => handleDelete(c.id)} style={{ fontSize: "0.78rem", color: "#ef4444", background: "#fef2f2", border: "none", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                                🗑 Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* DONORS TAB */}
        {activeTab === "donors" && (
          <div style={{ background: "white", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: "#1a1a2e", fontWeight: 700 }}>💖 Donation Records</h2>
              <div style={{ fontSize: "0.9rem", color: "#888" }}>
                Total Raised: <strong style={{ color: "#22c55e" }}>₹{donations.reduce((acc, d) => acc + d.amount, 0).toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#888" }}>Loading donations...</div>
            ) : donations.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#888", background: "#f8f9fa", borderRadius: 16 }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>💸</div>
                <div>No donations recorded yet.</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#f1f5f9", textAlign: "left", color: "#555" }}>
                      <th style={{ padding: "12px 16px", borderRadius: "8px 0 0 8px" }}>Date</th>
                      <th style={{ padding: "12px 16px" }}>Donor Name</th>
                      <th style={{ padding: "12px 16px" }}>Email / Phone</th>
                      <th style={{ padding: "12px 16px" }}>PAN (80G)</th>
                      <th style={{ padding: "12px 16px" }}>Cause</th>
                      <th style={{ padding: "12px 16px" }}>Payment ID</th>
                      <th style={{ padding: "12px 16px", borderRadius: "0 8px 8px 0", textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((d, i) => (
                      <tr key={d.id} style={{ borderBottom: i === donations.length - 1 ? "none" : "1px solid #eee" }}>
                        <td style={{ padding: "16px", color: "#888", whiteSpace: "nowrap" }}>{new Date(d.createdAt).toLocaleDateString("en-IN")}</td>
                        <td style={{ padding: "16px", fontWeight: 600, color: "#1a1a2e" }}>{d.name}</td>
                        <td style={{ padding: "16px", color: "#555" }}>
                          <div>{d.email}</div>
                          {d.phone && <div style={{ fontSize: "0.75rem", color: "#888" }}>{d.phone}</div>}
                        </td>
                        <td style={{ padding: "16px", color: "#555", fontWeight: 600 }}>{d.pan || "-"}</td>
                        <td style={{ padding: "16px", color: "#555" }}>{d.cause}</td>
                        <td style={{ padding: "16px", color: "#888", fontSize: "0.8rem", fontFamily: "monospace" }}>{d.paymentId}</td>
                        <td style={{ padding: "16px", fontWeight: 700, color: "#22c55e", textAlign: "right" }}>₹{d.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: 500, margin: "0 auto" }}>
            <div style={{ background: "white", borderRadius: 20, padding: "2rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <h2 style={{ margin: "0 0 1.5rem", fontSize: "1.4rem", color: "#1a1a2e", fontWeight: 700 }}>⚙️ Admin Settings</h2>
              
              <div style={{ background: "#fff8f1", borderLeft: "4px solid #FF6B00", padding: "1rem", borderRadius: "0 8px 8px 0", marginBottom: 24 }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "#888", lineHeight: 1.5 }}>
                  Change your admin password here. If you forget this password, you will need to manually reset it in the server's data files.
                </p>
              </div>

              <form onSubmit={handlePasswordChange}>
                <label style={labelStyle}>New Admin Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                  placeholder="Enter new strong password" 
                  style={{ ...inputStyle, marginBottom: 16 }} 
                  required 
                  minLength={4}
                />
                
                <button type="submit" disabled={submitting} style={{ ...btnStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
            
            <div style={{ marginTop: 24, textAlign: "center", fontSize: "0.85rem", color: "#888" }}>
              Razorpay API keys must be configured in <code>data/admin-config.json</code> or via Environment Variables (<code>RAZORPAY_KEY_ID</code>, <code>RAZORPAY_KEY_SECRET</code>) for donations to work.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.78rem", fontWeight: 700, color: "#444", marginBottom: 6, marginTop: 14, textTransform: "uppercase", letterSpacing: "0.06em" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", outline: "none", boxSizing: "border-box", fontFamily: "Inter,sans-serif", transition: "border-color 0.2s", background: "#fafafa" };
const fileInputStyle: React.CSSProperties = { width: "100%", padding: "10px 0", fontSize: "0.85rem", boxSizing: "border-box", cursor: "pointer" };
const btnStyle: React.CSSProperties = { background: "#FF6B00", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", letterSpacing: "0.03em", transition: "opacity 0.2s" };
