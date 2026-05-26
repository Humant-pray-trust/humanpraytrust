"use client";
import { useState, useEffect } from "react";
import Script from "next/script";

const C = { saffron: "#FF6B00", green: "#2D6A4F", charcoal: "#1a1a2e", white: "#ffffff" };

const PRESETS = [500, 1000, 2000, 5000, 10000, 21000];

const IMPACT_MAP: Record<number, string> = {
  500:   "Feeds a family for a week 🍚",
  1000:  "Covers a child's school supplies 📚",
  2000:  "Provides medicine for a month 💊",
  5000:  "Funds an animal rescue operation 🐾",
  10000: "Sponsors a special day celebration 🎂",
  21000: "Covers basic surgery support 🏥",
};

const CAUSES = [
  { id: "general", label: "Where Needed Most", emoji: "❤️" },
  { id: "medical", label: "Medical Aid", emoji: "🏥" },
  { id: "birthday", label: "Special Day Mission", emoji: "🎂" },
  { id: "dog_feeding", label: "Dog Feeding Mission", emoji: "🐕" },
  { id: "animal",   label: "Animal Welfare",   emoji: "🐾" },
  { id: "education",label: "Education",         emoji: "📚" },
];

export default function DonatePage() {
  const [amount, setAmount]         = useState<number | "">(1000);
  const [custom, setCustom]         = useState("");
  const [cause, setCause]           = useState("general");
  const [step, setStep]             = useState<1 | 2 | 3>(1);
  const [form, setForm]             = useState({ name: "", email: "", phone: "", pan: "", message: "" });
  const [submitted, setSubmitted]   = useState(false);
  const [freq, setFreq]             = useState<"once" | "monthly">("once");
  const [processing, setProcessing] = useState(false);
  const [altTab, setAltTab]         = useState<"qr" | "bank">("qr");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [dynamicCauses, setDynamicCauses] = useState(CAUSES);
  const [directAmount, setDirectAmount] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const caseParam = params.get("case");
      if (caseParam) {
        setSelectedCase(caseParam);
        setCause(`case_${caseParam}`);
        setDynamicCauses(prev => [
          { id: `case_${caseParam}`, label: `Support ${caseParam} (Live Case)`, emoji: "❤️" },
          ...prev
        ]);
      }
      
      const amountParam = params.get("amount");
      if (amountParam) {
        const parsed = parseInt(amountParam);
        if (!isNaN(parsed) && parsed > 0) {
          setAmount(parsed);
        }
      }

      const nameParam = params.get("name");
      const emailParam = params.get("email");
      const phoneParam = params.get("phone");
      const panParam = params.get("pan");
      if (nameParam || emailParam || phoneParam || panParam) {
        setForm(prev => ({
          ...prev,
          name: nameParam || prev.name,
          email: emailParam || prev.email,
          phone: phoneParam || prev.phone,
          pan: panParam || prev.pan,
        }));
        setStep(3);
      }
    }
  }, []);

  const finalAmount = custom ? parseInt(custom) : (amount || 0);

  useEffect(() => {
    if (finalAmount > 0) {
      setDirectAmount(finalAmount.toString());
    }
  }, [finalAmount]);

  function copyToClipboard(text: string, fieldName: string) {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  const impactLabel = IMPACT_MAP[finalAmount] || `Supporting ${finalAmount >= 10000 ? "a major cause" : "real change"} ✨`;

  function handlePreset(v: number) {
    setAmount(v);
    setCustom("");
  }

  function handleCustom(v: string) {
    setCustom(v);
    setAmount("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return alert("Name and Email are required");
    
    setProcessing(true);
    
    try {
      const configRes = await fetch("/api/razorpay/config");
      const configData = await configRes.json();
      if (!configData.key_id) {
        alert("Online payment gateway is temporarily unavailable. You can easily make a direct donation using our QR code or bank details below! We have scrolled down to the direct payment options for you.");
        setProcessing(false);
        const el = document.getElementById("alternative-methods");
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // 2. Create Order on Server
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount })
      });
      const orderData = await orderRes.json();
      if (orderData.error) {
        alert(orderData.error);
        setProcessing(false);
        return;
      }

      // 3. Open Razorpay Widget
      const options = {
        key: configData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Human Pray Trust",
        description: `Donation for ${dynamicCauses.find(c => c.id === cause)?.label}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 4. Verify Payment on Server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              donorData: {
                ...form,
                amount: finalAmount,
                cause: dynamicCauses.find(c => c.id === cause)?.label
              }
            })
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setSubmitted(true);
          } else {
            alert("Payment verification failed");
          }
          setProcessing(false);
        },
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone
        },
        theme: {
          color: C.saffron
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert("Payment failed. " + response.error.description);
        setProcessing(false);
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
      alert("Online payment is currently unavailable. You can still complete your donation securely using our QR code or direct bank details shown at the bottom of the page!");
      setProcessing(false);
      const el = document.getElementById("alternative-methods");
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /* ── Success Screen ── */
  if (submitted) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e 0%,#0d2818 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ textAlign: "center", color: "white", maxWidth: 500 }}>
        <div style={{ fontSize: "5rem", marginBottom: 16, animation: "bounce 1s infinite" }}>🙏</div>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "2.5rem", marginBottom: 12 }}>
          Thank You, <span style={{ color: C.saffron }}>{form.name || "Dear Donor"}</span>!
        </h1>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: 32 }}>
          Your donation of <strong style={{ color: C.saffron }}>₹{finalAmount.toLocaleString("en-IN")}</strong> towards <strong>{dynamicCauses.find(c => c.id === cause)?.label}</strong> was successful. You will receive a confirmation on <strong>{form.email}</strong>.
        </p>
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 20, padding: "1.5rem", marginBottom: 32, backdropFilter: "blur(10px)" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", margin: 0 }}>
            📜 An 80G tax exemption certificate will be emailed within 7 working days.
          </p>
        </div>
        <a href="/" style={{ background: C.saffron, color: "white", padding: "14px 36px", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: "1rem" }}>← Back to Home</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", fontFamily: "Inter,sans-serif", background: "#f8f9fa" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* ── Hero Banner ── */}
      <div style={{ background: `linear-gradient(135deg, ${C.charcoal} 0%, #0f2d1e 100%)`, padding: "1.5rem 2rem 5.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -80, right: -80, width: 200, height: 200, borderRadius: "50%", background: `${C.saffron}10`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 180, height: 180, borderRadius: "50%", background: `${C.green}15`, pointerEvents: "none" }} />

        <a href="/" style={{ position: "absolute", top: 16, left: 24, color: "rgba(255,255,255,0.65)", textDecoration: "none", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
          ← Back to site
        </a>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 8, marginTop: 8 }}>
          <img src="/website/human%20trust%20logo.jpg.jpeg" alt="Logo" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.78rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700 }}>HUMAN PRAY TRUST</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(1.5rem,3.5vw,2.4rem)", color: "white", margin: "0 0 6px", lineHeight: 1.2, fontWeight: 700 }}>
          Your Kindness Can <span style={{ color: C.saffron }}>Change a Life</span> Today
        </h1>
        
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", margin: "0 auto", fontWeight: 500 }}>
          🔒 100% Secure · 📜 80G Tax Exempt · ✅ Verified NGO
        </p>
      </div>

      {/* ── Donation Panel Side-by-Side Wrapper ── */}
      <div className="max-w-[1280px] mx-auto px-6 relative z-10 -mt-20 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* ── Main Card ── */}
          <div style={{ background: "white", borderRadius: 28, boxShadow: "0 20px 80px rgba(0,0,0,0.12)", overflow: "hidden" }}>

          {/* Step Indicator */}
          <div style={{ display: "flex", borderBottom: "1px solid #f1f1f1" }}>
            {[
              { n: 1, label: "Choose Amount" },
              { n: 2, label: "Pick a Cause" },
              { n: 3, label: "Your Details" },
            ].map(s => (
              <button
                key={s.n}
                onClick={() => step > s.n && setStep(s.n as 1|2|3)}
                style={{ flex: 1, padding: "1.2rem 0.5rem", border: "none", background: "none", cursor: step > s.n ? "pointer" : "default", borderBottom: step === s.n ? `3px solid ${C.saffron}` : "3px solid transparent", transition: "all 0.2s" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s.n ? C.saffron : "#e5e7eb", color: step >= s.n ? "white" : "#999", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: "0.8rem", fontWeight: 700, transition: "all 0.3s" }}>
                  {step > s.n ? "✓" : s.n}
                </div>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, color: step === s.n ? C.charcoal : "#aaa", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </button>
            ))}
          </div>

          <div style={{ padding: "1.5rem 1.25rem" }}>

            {/* ── STEP 1: Amount ── */}
            {step === 1 && (
              <div>
                {/* Frequency toggle */}
                <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 50, padding: 4, marginBottom: 28, width: "fit-content" }}>
                  {(["once", "monthly"] as const).map(f => (
                    <button key={f} onClick={() => setFreq(f)} style={{ padding: "8px 24px", borderRadius: 50, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", background: freq === f ? C.charcoal : "transparent", color: freq === f ? "white" : "#888", transition: "all 0.25s" }}>
                      {f === "once" ? "One-Time" : "Monthly"}
                    </button>
                  ))}
                </div>

                <h2 style={{ margin: "0 0 20px", fontSize: "1.3rem", color: C.charcoal, fontWeight: 700 }}>Select Amount</h2>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }}>
                  {PRESETS.map(v => (
                    <button
                      key={v}
                      onClick={() => handlePreset(v)}
                      style={{ padding: "14px 8px", borderRadius: 14, border: `2px solid ${amount === v && !custom ? C.saffron : "#e5e7eb"}`, background: amount === v && !custom ? `${C.saffron}12` : "white", color: amount === v && !custom ? C.saffron : C.charcoal, fontWeight: 700, fontSize: "1rem", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      ₹{v.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>

                <div style={{ position: "relative", marginBottom: 24 }}>
                  <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontWeight: 700, fontSize: "1.1rem", color: "#888" }}>₹</span>
                  <input
                    type="number"
                    placeholder="Enter custom amount"
                    value={custom}
                    onChange={e => handleCustom(e.target.value)}
                    style={{ width: "100%", padding: "14px 16px 14px 36px", borderRadius: 14, border: `2px solid ${custom ? C.saffron : "#e5e7eb"}`, fontSize: "1rem", boxSizing: "border-box", outline: "none", fontFamily: "Inter,sans-serif", transition: "border-color 0.2s" }}
                  />
                </div>

                {/* Impact label */}
                {finalAmount > 0 && (
                  <div style={{ background: `linear-gradient(135deg, ${C.green}15, ${C.saffron}10)`, borderRadius: 14, padding: "14px 20px", marginBottom: 28, border: `1px solid ${C.green}30` }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: C.green }}>
                      💚 Your ₹{finalAmount.toLocaleString("en-IN")} — {impactLabel}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => finalAmount >= 10 && setStep(2)}
                  disabled={finalAmount < 10}
                  style={{ width: "100%", padding: "16px", background: finalAmount >= 10 ? C.saffron : "#e5e7eb", color: finalAmount >= 10 ? "white" : "#aaa", border: "none", borderRadius: 14, fontWeight: 800, fontSize: "1.05rem", cursor: finalAmount >= 10 ? "pointer" : "not-allowed", letterSpacing: "0.04em", transition: "all 0.2s" }}
                >
                  Continue →
                </button>
              </div>
            )}

            {/* ── STEP 2: Cause ── */}
            {step === 2 && (
              <div>
                <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem", color: C.charcoal, fontWeight: 700 }}>Where should your donation go?</h2>
                <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 24 }}>You are donating ₹{finalAmount.toLocaleString("en-IN")} {freq === "monthly" ? "every month" : "one time"}.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
                  {dynamicCauses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setCause(c.id)}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 16, border: `2px solid ${cause === c.id ? C.saffron : "#e5e7eb"}`, background: cause === c.id ? `${C.saffron}10` : "white", cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}
                    >
                      <span style={{ fontSize: "1.8rem" }}>{c.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: cause === c.id ? C.saffron : C.charcoal, fontSize: "0.95rem" }}>{c.label}</div>
                        {c.id === "general" && <div style={{ fontSize: "0.75rem", color: "#888", marginTop: 2 }}>Trust allocates where impact is highest</div>}
                      </div>
                      {cause === c.id && <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: C.saffron, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700 }}>✓</div>}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ flex: 1, padding: "14px", background: "#f1f5f9", color: C.charcoal, border: "none", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>← Back</button>
                  <button onClick={() => setStep(3)} style={{ flex: 2, padding: "14px", background: C.saffron, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: "pointer", fontSize: "0.95rem" }}>Continue →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Details ── */}
            {step === 3 && (
              <form onSubmit={handleSubmit}>
                <h2 style={{ margin: "0 0 6px", fontSize: "1.3rem", color: C.charcoal, fontWeight: 700 }}>Your Details</h2>
                <p style={{ color: "#888", fontSize: "0.85rem", marginBottom: 24 }}>Required for generating your 80G tax exemption certificate.</p>
                <p style={{ margin: "-12px 0 24px", color: C.saffron, fontSize: "0.8rem", fontWeight: 700 }}>
                  Prefer direct UPI / Bank Transfer? <button type="button" onClick={() => {
                    const el = document.getElementById("alternative-methods");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} style={{ background: "none", border: "none", color: C.saffron, fontWeight: 700, padding: 0, textDecoration: "underline", cursor: "pointer", fontSize: "0.8rem" }}>Skip & view details below</button>
                </p>

                {/* Summary pill */}
                <div style={{ background: "#f8f9fa", borderRadius: 14, padding: "14px 18px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                  <div><span style={{ color: "#888", fontSize: "0.8rem" }}>Donating</span> <strong style={{ color: C.saffron }}>₹{finalAmount.toLocaleString("en-IN")} {freq === "monthly" ? "/month" : ""}</strong></div>
                  <div><span style={{ color: "#888", fontSize: "0.8rem" }}>Towards</span> <strong style={{ color: C.charcoal }}>{dynamicCauses.find(c => c.id === cause)?.emoji} {dynamicCauses.find(c => c.id === cause)?.label}</strong></div>
                </div>

                {[
                  { key: "name",  label: "Full Name *",     placeholder: "Rajesh Kumar",           type: "text",  required: true },
                  { key: "email", label: "Email Address *",  placeholder: "you@example.com",        type: "email", required: true },
                  { key: "phone", label: "Phone Number",     placeholder: "+91 85108 04149",         type: "tel",   required: false },
                  { key: "pan",   label: "PAN Card (for 80G Certificate)", placeholder: "ABCDE1234F", type: "text", required: false },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      required={f.required}
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", boxSizing: "border-box", outline: "none", fontFamily: "Inter,sans-serif" }}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Message (Optional)</label>
                  <textarea
                    placeholder="A word of encouragement or a prayer for the person you're helping..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: "1.5px solid #e5e7eb", fontSize: "0.9rem", boxSizing: "border-box", outline: "none", fontFamily: "Inter,sans-serif", height: 80, resize: "vertical" }}
                  />
                </div>

                {/* Payment methods */}
                <div style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>We accept</p>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {["💳 Credit/Debit Card", "📱 UPI", "🏦 Net Banking", "📲 PhonePe/GPay"].map(m => (
                      <span key={m} style={{ padding: "6px 14px", background: "#f1f5f9", borderRadius: 50, fontSize: "0.78rem", fontWeight: 600, color: "#555" }}>{m}</span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" onClick={() => setStep(2)} style={{ flex: 1, padding: "14px", background: "#f1f5f9", color: C.charcoal, border: "none", borderRadius: 14, fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>← Back</button>
                  <button disabled={processing} type="submit" style={{ flex: 2, padding: "14px", background: `linear-gradient(135deg, ${C.saffron}, #e65c00)`, color: "white", border: "none", borderRadius: 14, fontWeight: 800, cursor: processing ? "not-allowed" : "pointer", fontSize: "1rem", letterSpacing: "0.04em", boxShadow: `0 8px 24px ${C.saffron}55`, opacity: processing ? 0.7 : 1 }}>
                    {processing ? "Processing..." : `🙏 Donate ₹${finalAmount.toLocaleString("en-IN")} ${freq === "monthly" ? "/month" : ""}`}
                  </button>
                </div>

                <p style={{ textAlign: "center", color: "#aaa", fontSize: "0.75rem", marginTop: 16 }}>
                  🔒 Secured by 256-bit SSL encryption. We never store your card details.
                </p>
                <p style={{ textAlign: "center", color: "#666", fontSize: "0.82rem", marginTop: 12 }}>
                  Having trouble? <button type="button" onClick={() => {
                    const el = document.getElementById("alternative-methods");
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }} style={{ background: "none", border: "none", color: C.saffron, fontWeight: 700, padding: 0, textDecoration: "underline", cursor: "pointer" }}>Pay via direct UPI QR / Bank Transfer</button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* ── Alternative Payment Section ── */}
        <div 
          id="alternative-methods"
          style={{ 
            background: "white", 
            borderRadius: 28, 
            boxShadow: "0 20px 80px rgba(0,0,0,0.08)", 
            padding: "1.5rem 1.25rem", 
            position: "relative",
            overflow: "hidden",
            border: "1px solid #eaeaea"
          }}
        >
          {/* Subtle gradient accent bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, ${C.saffron}, ${C.green})` }} />

          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <span style={{ background: `${C.saffron}15`, color: C.saffron, padding: "6px 16px", borderRadius: 50, fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "inline-block", marginBottom: 12 }}>
              Fallback Options
            </span>
            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: C.charcoal, margin: "0 0 10px" }}>
              Alternative Donation Methods
            </h2>
            <p style={{ color: "#666", fontSize: "0.95rem", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
              If you experience issues with the online gateway or prefer a direct transaction, you can securely donate using our verified details below.
            </p>
          </div>

          {/* Alternative tabs */}
          <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 16, padding: 6, marginBottom: 32, maxWidth: 440, margin: "0 auto 32px" }}>
            <button 
              type="button"
              onClick={() => setAltTab("qr")}
              style={{ 
                flex: 1, 
                padding: "12px 16px", 
                borderRadius: 12, 
                border: "none", 
                cursor: "pointer", 
                fontWeight: 700, 
                fontSize: "0.9rem", 
                background: altTab === "qr" ? "white" : "transparent", 
                color: altTab === "qr" ? C.charcoal : "#666", 
                boxShadow: altTab === "qr" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s" 
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>📱</span> UPI Scan & Pay
            </button>
            <button 
              type="button"
              onClick={() => setAltTab("bank")}
              style={{ 
                flex: 1, 
                padding: "12px 16px", 
                borderRadius: 12, 
                border: "none", 
                cursor: "pointer", 
                fontWeight: 700, 
                fontSize: "0.9rem", 
                background: altTab === "bank" ? "white" : "transparent", 
                color: altTab === "bank" ? C.charcoal : "#666", 
                boxShadow: altTab === "bank" ? "0 4px 12px rgba(0,0,0,0.05)" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "all 0.2s" 
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>🏦</span> Bank Transfer
            </button>
          </div>

          {/* QR Tab Content */}
          {altTab === "qr" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32, alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ 
                  background: "white", 
                  padding: 16, 
                  borderRadius: 24, 
                  boxShadow: "0 10px 30px rgba(0,0,0,0.06)", 
                  border: "1px solid #eaeaea",
                  position: "relative",
                  maxWidth: 280,
                  textAlign: "center"
                }}>
                  {/* Subtle scan-line corner frame decorations */}
                  <div style={{ position: "absolute", top: 12, left: 12, width: 20, height: 20, borderTop: `3px solid ${C.saffron}`, borderLeft: `3px solid ${C.saffron}` }} />
                  <div style={{ position: "absolute", top: 12, right: 12, width: 20, height: 20, borderTop: `3px solid ${C.saffron}`, borderRight: `3px solid ${C.saffron}` }} />
                  <div style={{ position: "absolute", bottom: 12, left: 12, width: 20, height: 20, borderBottom: `3px solid ${C.saffron}`, borderLeft: `3px solid ${C.saffron}` }} />
                  <div style={{ position: "absolute", bottom: 12, right: 12, width: 20, height: 20, borderBottom: `3px solid ${C.saffron}`, borderRight: `3px solid ${C.saffron}` }} />
                  
                  <img 
                    src="/website/photo_2026-05-24_12-55-12.jpg" 
                    alt="Human Pray Trust QR Code" 
                    style={{ width: "100%", height: "auto", borderRadius: 12, display: "block" }} 
                  />
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: C.charcoal, marginTop: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Human Pray Trust
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 2 }}>
                    Official UPI QR Code
                  </div>
                </div>
              </div>

              <div style={{ background: "#f8f9fa", borderRadius: 20, padding: "1.5rem", border: "1px dashed #e5e7eb" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: C.charcoal, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  📌 Easy Scanning Instructions
                </h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.9rem", color: "#555", lineHeight: 1.5 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ background: C.saffron, color: "white", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>1</span>
                    <span>Open any UPI App (GPay, PhonePe, Paytm, BHIM, or your bank app).</span>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ background: C.saffron, color: "white", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>2</span>
                    <span>Point your app's scanner at our QR code above to read.</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ background: C.saffron, color: "white", width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>3</span>
                    <span>Or pay directly using our registered UPI ID below:</span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: "8px 14px", marginTop: 12, justifyContent: "space-between" }}>
                  <code style={{ fontSize: "0.95rem", fontWeight: 700, color: C.charcoal, letterSpacing: "0.02em" }}>boim-712201590596@boi</code>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard("boim-712201590596@boi", "upi")}
                    style={{ 
                      background: copiedField === "upi" ? C.green : C.charcoal, 
                      color: "white", 
                      border: "none", 
                      borderRadius: 8, 
                      padding: "6px 12px", 
                      fontSize: "0.75rem", 
                      fontWeight: 700, 
                      cursor: "pointer", 
                      transition: "all 0.2s" 
                    }}
                  >
                    {copiedField === "upi" ? "Copied! ✓" : "Copy ID 📋"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Tab Content */}
          {altTab === "bank" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Premium digital bank card visual */}
              <div style={{ 
                background: `linear-gradient(135deg, ${C.charcoal} 0%, #0d2818 100%)`, 
                borderRadius: 24, 
                padding: "2rem", 
                color: "white", 
                position: "relative",
                boxShadow: "0 15px 35px rgba(13, 40, 24, 0.25)",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.06)"
              }}>
                {/* Decorative glows */}
                <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `${C.saffron}15`, filter: "blur(20px)" }} />
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Official Beneficiary</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "0.02em", color: C.white }}>Human Pray Trust</div>
                  </div>
                  {/* Mock Bank Icon / Logo */}
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f8a846", letterSpacing: "0.05em" }}>Bank of India</div>
                    <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>Current Account</div>
                  </div>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Account Number</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.05em", fontFamily: "Courier New, monospace", display: "flex", alignItems: "center", gap: 12 }}>
                    <span>7122 2011 0000 596</span>
                    <button 
                      type="button"
                      onClick={() => copyToClipboard("712220110000596", "acc_num")}
                      style={{ 
                        background: "rgba(255,255,255,0.15)", 
                        border: "none", 
                        borderRadius: 6, 
                        width: 28, 
                        height: 28, 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        cursor: "pointer", 
                        color: "white",
                        fontSize: "0.8rem",
                        transition: "background 0.2s"
                      }}
                      title="Copy Account Number"
                    >
                      {copiedField === "acc_num" ? "✓" : "📋"}
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>IFSC Code</div>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, fontFamily: "Courier New, monospace", display: "flex", alignItems: "center", gap: 8 }}>
                      <span>BKID0007122</span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard("BKID0007122", "ifsc")}
                        style={{ 
                          background: "rgba(255,255,255,0.15)", 
                          border: "none", 
                          borderRadius: 6, 
                          padding: "2px 6px",
                          cursor: "pointer", 
                          color: "white",
                          fontSize: "0.7rem"
                        }}
                      >
                        {copiedField === "ifsc" ? "✓" : "📋"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Branch</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>Sector 62 Noida</div>
                  </div>
                </div>
              </div>

              {/* Extra Bank Details List */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "0 8px" }}>
                <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", fontWeight: 700 }}>MICR Code</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: C.charcoal, marginTop: 2 }}>110013083</div>
                </div>
                <div style={{ background: "#f8f9fa", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "0.7rem", color: "#888", textTransform: "uppercase", fontWeight: 700 }}>Account Type</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: C.charcoal, marginTop: 2 }}>Current Account</div>
                </div>
              </div>
            </div>
          )}

          {/* Action alert banner & verification instructions */}
          <div style={{ 
            background: `linear-gradient(135deg, ${C.green}08, ${C.saffron}05)`, 
            borderRadius: 20, 
            padding: "1.5rem", 
            marginTop: 32, 
            border: `1px solid ${C.green}20`,
            display: "flex",
            flexDirection: "column",
            gap: 12
          }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.4rem", marginTop: -2 }}>✨</span>
              <p style={{ margin: 0, fontSize: "0.88rem", color: C.green, fontWeight: 600, lineHeight: 1.5 }}>
                Direct transfers don't automatically trigger our website database. Sharing your screenshot ensures your contribution is verified and your 80G tax certificate is generated successfully!
              </p>
            </div>

            {selectedCase && (
              <div style={{ background: "#e0f2fe", border: "1px solid #bae6fd", borderRadius: 12, padding: "8px 12px", fontSize: "0.8rem", color: "#0369a1", fontWeight: 700, marginTop: 4 }}>
                💝 Selected Case: {selectedCase}
              </div>
            )}

            {/* Direct Amount input */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 320, marginTop: 4 }}>
              <label style={{ fontSize: "0.72rem", fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Transferred Amount (₹)
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", fontWeight: 700, color: "#666" }}>₹</span>
                <input 
                  type="number"
                  placeholder="Enter exact transferred amount"
                  value={directAmount}
                  onChange={e => setDirectAmount(e.target.value)}
                  style={{ 
                    width: "100%", 
                    padding: "8px 12px 8px 24px", 
                    borderRadius: 8, 
                    border: `1.5px solid ${C.green}30`, 
                    fontSize: "0.85rem", 
                    outline: "none",
                    fontWeight: 700,
                    color: C.charcoal
                  }}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
              <a 
                href={`https://wa.me/918510804149?text=${encodeURIComponent(
                  selectedCase 
                    ? `Hi! I've just made a direct donation of ₹${directAmount || finalAmount || "___"} for the case of "${selectedCase}" to Human Pray Trust. Please find attached my payment screenshot for verification.`
                    : `Hi! I've just made a direct donation of ₹${directAmount || finalAmount || "___"} towards "${dynamicCauses.find(c => c.id === cause)?.label || "Where Needed Most"}" to Human Pray Trust. Please find attached my payment screenshot for verification.`
                )}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  background: "#25d366", 
                  color: "white", 
                  textDecoration: "none", 
                  padding: "10px 18px", 
                  borderRadius: 10, 
                  fontSize: "0.82rem", 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 12px rgba(37, 211, 102, 0.2)"
                }}
              >
                💬 Send WhatsApp Receipt
              </a>
              <a 
                href={`mailto:contact@humanpraytrust.org?subject=${encodeURIComponent(
                  selectedCase 
                    ? `Direct Donation Receipt - ₹${directAmount || finalAmount || "___"} for ${selectedCase}`
                    : `Direct Donation Receipt - ₹${directAmount || finalAmount || "___"} towards ${dynamicCauses.find(c => c.id === cause)?.label || "Where Needed Most"}`
                )}&body=${encodeURIComponent(
                  selectedCase
                    ? `Dear Human Pray Trust,\n\nI have transferred a donation of ₹${directAmount || finalAmount || "___"} for the case "${selectedCase}" via direct transfer. Please find attached the screenshot.\n\nDetails:\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPAN: ${form.pan}`
                    : `Dear Human Pray Trust,\n\nI have transferred a donation of ₹${directAmount || finalAmount || "___"} towards "${dynamicCauses.find(c => c.id === cause)?.label || "Where Needed Most"}" via direct transfer. Please find attached the screenshot.\n\nDetails:\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPAN: ${form.pan}`
                )}`}
                style={{ 
                  background: C.charcoal, 
                  color: "white", 
                  textDecoration: "none", 
                  padding: "10px 18px", 
                  borderRadius: 10, 
                  fontSize: "0.82rem", 
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                📧 Email Receipt
              </a>
            </div>
          </div>
        </div>

        </div> {/* End of side-by-side grid */}

        {/* ── Bottom trust strip ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { icon: "🧾", title: "80G Certified", desc: "Tax deduction under Section 80G" },
            { icon: "🔍", title: "Full Transparency", desc: "All expenditures published annually" },
            { icon: "💯", title: "Direct Impact", desc: "100% reaches the beneficiary" },
          ].map(t => (
            <div key={t.title} style={{ background: "white", borderRadius: 16, padding: "1.25rem", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: "1.8rem", marginBottom: 8 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, color: C.charcoal, fontSize: "0.85rem", marginBottom: 4 }}>{t.title}</div>
              <div style={{ color: "#888", fontSize: "0.75rem" }}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
