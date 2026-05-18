"use client";

import { useState, useRef } from "react";
import {
  RiSettings3Line,
  RiUpload2Line,
  RiDownload2Line,
  RiShareForwardLine,
  RiRefreshLine,
  RiFileCopyLine,
  RiCheckLine,
} from "@remixicon/react";
import { FormLabel } from "@/components/ui/FormLabel";
import { Button } from "@/components/ui/Button";

type FlatIssue = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  title: string;
  severity: "low" | "medium" | "high";
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  bullets: string[];
  why: string;
};

type FlatSuggestion = {
  category: "Clarity" | "Navigation" | "Visuals" | "Trust" | "Conversion";
  section: string;
  recommendation: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type FlatCopy = {
  section: string;
  before: string;
  after: string;
  impact_metric_1: string;
  impact_value_1: number;
  impact_metric_2: string;
  impact_value_2: number;
  why: string;
};

type AuditResponseFlat = {
  url: string;
  score: number;
  risk: "low" | "medium" | "high";
  issues: FlatIssue[];
  suggestions: FlatSuggestion[];
  copy: FlatCopy[];
  clarity: number;
  navigation: number;
  visuals: number;
  trust: number;
  conversion: number;
};

export default function Analyze() {
  const [data, setData] = useState<AuditResponseFlat | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedImage(file);
  }

  const isButtonDisabled = !url && !uploadedImage;

  const styles = {
    card: "rounded-xl border border-[#DCE2E7] bg-white p-4 flex flex-col",
    label: "text-sm font-medium text-[var(--ink-primary)]",
    caption: "text-sm font-normal text-[#8E99A2]",
    value: "text-[24px] font-medium leading-tight text-[#061C2F]",
    title: "text-[20px] font-semibold text-[#061C2F]",
    primary: "text-[#375BE7]",
    primaryBg: "bg-[#EEF2FF]",
    scoreColor: "text-[#FF8D28]",
    link: "text-[var(--ink-primary)] text-sm font-medium hover:opacity-70 transition",
    titleSection: "text-[24px] font-semibold text-[#061C2F]",
    headingPage: "text-[28px] font-semibold tracking-tight text-[var(--ink-primary)]",
    softBg: "bg-[var(--gray-soft)]",
    section: "mt-6",
    softBorder: "border-[#D5DDE5]",
  };

  const steps = [
    { threshold: 10, label: "Scanning layout…" },
    { threshold: 30, label: "Analyzing hierarchy…" },
    { threshold: 55, label: "Checking clarity…" },
    { threshold: 75, label: "Evaluating trust signals…" },
    { threshold: 90, label: "Reviewing conversion flow…" },
    { threshold: 100, label: "Finalizing report…" }
  ];

  function getLoadingLabel(progress: number) {
    const step = steps.find(s => progress <= s.threshold);
    return step ? step.label : "Analyzing…";
  }

  function handleReset() {
    setData(null);
    setUrl("");
    setProgress(0);
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  // ------------------------------------------------------
  // 🔥 ОБНОВЛЁННЫЙ handleAnalyze (главный фикс)
  // ------------------------------------------------------
  async function handleAnalyze() {
    try {
      if (!url && !uploadedImage) return;

      setLoading(true);
      setData(null);
      setProgress(0);

      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8;
        });
      }, 250);

      // 1. Optional uploaded screenshot
const screenshotToSend = uploadedImage;

      // 2. Build form data
      const form = new FormData();
      form.append("url", url);

      if (screenshotToSend) {
        form.append("screenshot", screenshotToSend);
      }

      // 3. Send request
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        console.error("Backend error:", await res.text());
        clearInterval(interval);
        setLoading(false);
        return;
      }

      const json = await res.json();

      // 4. Flatten breakdown for UI
      const flat: AuditResponseFlat = {
        url: json.url ?? "",
        score: json.score ?? 0,
        risk: json.risk ?? "low",
        issues: json.issues ?? [],
        suggestions: json.suggestions ?? [],
        copy: json.copy ?? [],
        clarity: json.breakdown?.clarity ?? 0,
        navigation: json.breakdown?.navigation ?? 0,
        visuals: json.breakdown?.visuals ?? 0,
        trust: json.breakdown?.trust ?? 0,
        conversion: json.breakdown?.conversion ?? 0,
      };

      setData(flat);

      setProgress(100);
      clearInterval(interval);

    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }

  function normalizeRisk(risk: string) {
    if (!risk) return "—";
    const r = risk.toLowerCase();
    if (r === "low") return "Good";
    if (r === "medium") return "Fair";
    if (r === "high") return "Poor";
    return risk;
  }

  function getRiskColor(risk: string) {
    if (!risk) return "text-gray-600";
    const r = risk.toLowerCase();
    if (r === "low") return "text-green-600";
    if (r === "medium") return "text-amber-600";
    if (r === "high") return "text-red-600";
    return "text-gray-600";
  }

  function getPrimaryIssueCategory(title: string) {
    if (!title) return "—";
    const t = title.toLowerCase();
    if (t.includes("clarity")) return "Clarity";
    if (t.includes("hierarchy")) return "Hierarchy";
    if (t.includes("trust")) return "Trust";
    if (t.includes("cta")) return "CTA";
    if (t.includes("conversion")) return "Conversion";
    return "Other";
  }

  function getBreakdownMeta(value: number) {
    const percent = value;

    if (percent >= 70) {
      return {
        bar: "bg-green-500",
        label: "Healthy",
        labelColor: "text-green-600",
      };
    }

    if (percent >= 50) {
      return {
        bar: "bg-amber-500",
        label: "At risk",
        labelColor: "text-amber-600",
      };
    }

    return {
      bar: "bg-red-500",
      label: "Failing",
      labelColor: "text-red-600",
    };
  }

  const breakdownItems =
    data
      ? [
          { key: "clarity", label: "Clarity", value: data.clarity },
          { key: "navigation", label: "Navigation", value: data.navigation },
          { key: "visuals", label: "Visuals", value: data.visuals },
          { key: "trust", label: "Trust", value: data.trust },
          { key: "conversion", label: "Conversion", value: data.conversion },
        ]
      : [];


  return (
    <>
      {/* TOP NAVBAR */}
      <header
  className="
    sticky
    top-0
    z-50
    w-full
    border-b
    border-[rgba(0,0,0,0.06)]
    bg-white
  "
>

        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-8">

          {/* LEFT — LOGO */}
          <div className="flex items-center gap-3">
            <svg width="125" height="42" viewBox="0 0 125 42" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M115.564 17.966V33.0578H120.007V17.966H124.193V14.5511H120.007V9.22668L115.564 10.0345V14.5511H112.369V17.966H115.564Z" fill="#061C2F"/>
<path d="M95.7131 33.0577V14.551H99.9359V18.1495H100.046C100.438 16.9011 101.123 15.9219 102.102 15.2119C103.106 14.4775 104.305 14.1104 105.701 14.1104C106.876 14.1104 107.941 14.3796 108.895 14.9182C109.85 15.4323 110.621 16.2156 111.209 17.2683C111.796 18.3209 112.09 19.6673 112.09 21.3074V33.0577H107.647V22.0418C107.647 20.6954 107.316 19.655 106.656 18.9206C106.019 18.1862 105.187 17.819 104.159 17.819C102.91 17.819 101.931 18.2719 101.221 19.1777C100.511 20.0834 100.156 21.2952 100.156 22.8129V33.0577H95.7131Z" fill="#061C2F"/>
<path d="M75.8911 14.5511H80.5912L85.4382 31.0015H85.5116L90.3219 14.5511H94.8751L86.9437 39.5205H82.5741L84.9608 32.4336H81.5826L75.8911 14.5511Z" fill="#061C2F"/>
<path d="M70.6437 33.0578V7.50085H75.0867V33.0578H70.6437Z" fill="#061C2F"/>
<path d="M64.0247 8.0885H69.2388L59.1777 21.6381L59.398 18.7372L69.606 33.0579H64.2083L55.3956 20.3162L64.0247 8.0885ZM50.6221 8.0885H55.1753V33.0579H50.6221V8.0885Z" fill="#061C2F"/>
<path d="M29.3994 33.6003L20.9997 42V25.2007L29.3994 33.6003ZM41.9995 21.0001L31.4993 31.5004L20.9991 21.0001L31.4993 10.4998L41.9995 21.0001ZM17.8502 38.8505L0 21.0001L17.8502 3.14975V38.8505ZM29.3994 8.3999L20.9997 16.7996V0.000210792L29.3994 8.3999Z" fill="#061C2F"/>
</svg>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--ink-primary)]">
                UX Clarity Analyzer
              </span>

              <span className="mt-1 text-[11px] text-[var(--ink-secondary)]">
                AI-powered website review
              </span>
            </div>


          </div>

          {/* RIGHT — ACTIONS */}
<div className="flex items-center">
  <button
    className="
      flex
      items-center
      gap-2
      rounded-full
      border
      border-transparent
      px-4
      py-2
      text-[14px]
      font-medium
      text-[var(--ink-primary)]
      transition-all
      duration-200
      hover:border-[rgba(6,28,47,0.06)]
      hover:bg-white
    "
  >
    <RiSettings3Line size={18} className="shrink-0" />
    <span>Settings</span>
  </button>
</div>

        </div>
      </header>

      {/* MAIN */}
      <main
  className="
    min-h-[calc(100dvh-72px)]
    bg-[#F5F7FA]
    px-6
    py-10
    text-[var(--ink-primary)]
  "
>
        <div className="mx-auto max-w-[980px]">

          {/* START SCREEN */}
          {!data && (
            <div
  className="
    rounded-[36px]
    border
    border-[rgba(6,28,47,0.06)]
    bg-white
    px-10
    py-10
    shadow-[0_10px_40px_rgba(0,0,0,0.03)]
  "
>

              <div className="max-w-[720px]">
  <div
    className="
      inline-flex
      items-center
      rounded-full
      border
      border-[#DCE7F8]
      bg-[#F4F8FF]
      px-3
      py-1
      text-[12px]
      font-semibold
      text-[#2F6FED]
    "
  >
    AI UX Review
  </div>

  <h1
    className="
      mt-5
      text-[44px]
      leading-[1.05]
      tracking-[-0.04em]
      font-semibold
      text-[var(--ink-primary)]
    "
  >
    Analyze your website clarity and conversion UX
  </h1>

  <p
    className="
      mt-5
      max-w-[620px]
      text-[18px]
      leading-8
      text-[var(--ink-secondary)]
    "
  >
    Get AI-powered insights about friction points, weak messaging,
    trust issues, and conversion opportunities.
  </p>
</div>

              {/* URL INPUT */}
              <div className="mt-10 w-full">
                <FormLabel>Enter website URL</FormLabel>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://stripe.com"
                  disabled={loading}
                  className={`
                    mt-3
h-[58px]
w-full
rounded-2xl
border
border-[#D8E0E7]
bg-[#FCFDFD]
px-5
text-[16px]
text-[var(--ink-primary)]
shadow-[0_1px_2px_rgba(0,0,0,0.02)]
transition-all
duration-200
                    placeholder-[var(--ink-secondary)]
                    focus:outline-none
                    ${loading ? "opacity-60 cursor-not-allowed" : "focus:border-[#14A8E8]"}
                  `}
                />
              </div>

              {/* UPLOAD */}
              <div className="mt-6 w-full">
                <label className="text-sm font-medium text-[var(--ink-secondary)]">
                  Or upload website screenshot
                </label>

                <div
  className={`
    mt-3
    flex
    min-h-[220px]
    flex-col
    items-center
    justify-center
    gap-3
                    rounded-[28px] py-6 px-4 text-center transition
                    border border-dashed border-[#D7E0E8]
                    bg-[#FBFCFD]
                    ${loading ? "opacity-50 cursor-not-allowed" : "hover:border-[#8E99A2] cursor-pointer"}
                  `}
                  onClick={() => !loading && fileInputRef.current?.click()}
                >
                  <RiUpload2Line size={24} color="#8E99A2" className="shrink-0"/>

                  <p className="text-sm text-[var(--ink-secondary)]">Click to upload or drag and drop</p>
                  <p className="text-xs text-[var(--ink-secondary)]">Max 20 MB. Use full-page screenshot for best results.</p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
              </div>

              {/* BUTTON / PROGRESS */}
              <div className="mt-10 w-full">
                {!loading ? (
                  <Button
                    type="button"
                    disabled={isButtonDisabled}
                    onClick={handleAnalyze}
                  >
                    Analyze UX
                  </Button>
                ) : (
                  <div className="space-y-3">

                    {/* PROGRESS BAR */}
                    <div className="w-full h-2 rounded-lg bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* PERCENT + LABEL */}
                    <div className="flex items-center justify-between text-xs text-[var(--ink-secondary)]">
                      <span>{Math.floor(progress)}%</span>
                      <span>{getLoadingLabel(progress)}</span>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* REPORT SCREEN */}
          {data && (
              <div className="animate-fade-in transition-all duration-500 opacity-100">
              <>
  {/* WHITE REPORT HERO */}
  <div
    className="
      relative
      overflow-hidden
      rounded-[36px]
      border
      border-[rgba(6,28,47,0.06)]
      bg-white
      px-10
      py-8
      shadow-[0_10px_40px_rgba(0,0,0,0.03)]
    "
  >

    {/* TOP LIGHT */}
    <div
      className="
        pointer-events-none
        absolute
        inset-0
        bg-[radial-gradient(circle_at_top,#EAF4FF_0%,transparent_65%)]
      "
    />

    <div className="relative z-10">

{/* REPORT HEADER */}
<div className="mb-8 flex items-start justify-between gap-6">

  {/* LEFT */}
  <div>

    {/* TITLE */}
    <div className="flex items-center gap-3">

      <h1
        className="
          text-[40px]
          leading-none
          font-semibold
          tracking-[-0.04em]
          text-[var(--ink-primary)]
        "
      >
        Clarity Report
      </h1>

      <div
        className="
          rounded-full
          bg-[#EEF2FF]
          px-3
          py-1
          text-[12px]
          font-semibold
          text-[#5B5BD6]
        "
      >
        AI Generated
      </div>

    </div>

    {/* META */}
    <div className="mt-4 flex flex-wrap items-center gap-3 text-[14px] text-[var(--ink-secondary)]">

      {/* DOMAIN */}
      <div className="flex items-center gap-2">

        {data.url && (
          <img
            src={`https://www.google.com/s2/favicons?domain=${data.url}&sz=32`}
            alt="favicon"
            className="h-4 w-4 rounded-sm"
          />
        )}

        <span>{data.url}</span>
      </div>

      <span className="text-neutral-300">•</span>

      <span>3 screenshots analyzed</span>

      <span className="text-neutral-300">•</span>

      <span>
        Generated {new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>

    </div>

  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-2">

    {/* DOWNLOAD */}
    <button
      className="
        flex items-center gap-2
        rounded-xl
        border border-neutral-200
        bg-white
        px-4
        py-2.5
        text-[14px]
        font-medium
        text-[var(--ink-primary)]
        transition-all
        hover:bg-neutral-50
      "
    >
      <RiDownload2Line size={18} className="shrink-0" />
      <span>Download</span>
    </button>

  </div>

</div>

{/* SUMMARY */}
<div className="mt-2">

  {/* SECTION TITLE */}
  <h2 className={styles.titleSection}>Summary</h2>

  {/* TOP INSIGHT */}
  <div
    className="
      mt-4
      rounded-[24px]
      border
      border-neutral-200
      bg-[#F8FAFC]
      px-6
      py-5
    "
  >
    <p
      className="
        max-w-[980px]
        text-[17px]
        leading-[1.5]
        font-medium
        tracking-[-0.01em]
        text-[var(--ink-primary)]
      "
    >
      Clear visual structure and modern presentation, but weak CTA specificity
      reduces conversion confidence in the first screen experience.
    </p>
  </div>

  {/* SUMMARY GRID */}
  <div className="mt-5 grid grid-cols-[1.6fr_0.7fr] gap-4">

    {/* MAIN CARD */}
    <div
      className="
        rounded-[28px]
        border
        border-neutral-200
        bg-white
        px-7
        py-7
      "
    >
      <div className="flex items-center gap-7">

        {/* SCORE */}
        <div className="relative flex h-[132px] w-[132px] items-center justify-center">

          {/* RING */}
          <div
            className="
              absolute inset-0 rounded-full
              border-[7px]
              border-neutral-200
            "
          />

          {/* ACTIVE ARC */}
          <div
            className="
              absolute inset-0 rounded-full
              border-[7px]
              border-transparent
              border-t-[#FF7A00]
              border-r-[#FF7A00]
              rotate-[135deg]
            "
          />

          {/* SCORE */}
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
              UX Score
            </p>

            <p className="mt-1 text-[44px] leading-none font-semibold text-[#FF7A00]">
              {data.score}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1">

          {/* VERDICT */}
          <p
            className="
              max-w-[620px]
              text-[20px]
              leading-[1.35]
              font-semibold
              tracking-[-0.02em]
              text-[var(--ink-primary)]
            "
          >
            Above average UX quality with moderate conversion friction
          </p>

          {/* META */}
          <div className="mt-5 space-y-2">

            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-neutral-500">
                Best:
              </span>

              <span className="text-[15px] text-[var(--ink-secondary)]">
                Navigation clarity
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[15px] font-medium text-neutral-500">
                Risk:
              </span>

              <span className="text-[15px] text-[var(--ink-secondary)]">
                Trust positioning
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>

    {/* CONVERSION CARD */}
    <div
      className="
        rounded-[28px]
        border
        border-neutral-200
        bg-white
        px-7
        py-7
      "
    >
      <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
        Conversion Health
      </p>

      <div className="mt-4 flex items-center gap-2">

        <div className="h-3 w-3 rounded-full bg-[#FF5A4F]" />

        <p
          className="
            text-[20px]
            font-semibold
            tracking-[-0.02em]
            text-[#FF5A4F]
          "
        >
          {normalizeRisk(data.risk ?? "")}
        </p>
      </div>

      <p
        className="
          mt-6
          text-[15px]
          leading-7
          text-[var(--ink-secondary)]
        "
      >
        CTA clarity and trust positioning reduce conversion confidence.
      </p>
    </div>

  </div>
</div>

    </div>

    {/* FADE OUT */}
    <div
      className="
        pointer-events-none
        absolute
        bottom-0
        left-0
        right-0
        h-24
        bg-gradient-to-b
        from-transparent
        to-[#F5F7FA]
      "
    />
  </div>

  {/* LOWER CONTENT */}
  <div className="relative z-10 -mt-4 space-y-6">

                {/* UX ISSUES */}
                <div className="mb-8 space-y-4 mt-6">
                  <h3 className={styles.titleSection}>UX Issues</h3>

                  <div className="space-y-4">
                    {data.issues?.map((issue, index) => {
                      const impactEntries = [
                        {
                          key: issue.impact_metric_1,
                          value: issue.impact_value_1,
                        },
                        {
                          key: issue.impact_metric_2,
                          value: issue.impact_value_2,
                        },
                      ]
                        .filter(e => e.key && typeof e.value === "number" && e.value !== 0)
                        .slice(0, 2);

                      return (
                        <div
                          key={index}
                          className="
                          rounded-[28px]
                          border
                          border-[var(--stroke-light)]
                          bg-white
                          px-8
                          py-7
                          flex
                          gap-6
                          transition-all
                          hover:-translate-y-[1px]
                          hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                          "
                        >
                          {/* LEFT NUMBER */}
                          <div className="flex items-start justify-center pt-1">
                            <span className="text-[38px] leading-none font-medium text-neutral-300">
                              {index + 1}
                            </span>
                          </div>

                          {/* CENTER */}
                          <div className="flex-1">

                            {/* TOP ROW */}
                            <div className="flex items-start justify-between gap-6">

                              {/* TITLE */}
                              <p
                                className="
                                flex-1
                                min-w-0
                                text-[21px]
                                font-semibold
                                leading-[1.25]
                                tracking-[-0.02em]
                                text-[var(--ink-primary)]
                                "
                              >
                                {issue.title}
                              </p>

                              {/* IMPACT BADGES */}
                              <div className="flex shrink-0 flex-wrap justify-end gap-2 max-w-[220px]">
                                {impactEntries.map((entry, i) => (
                                  <div
                                     key={i}
                                     className="
                                       rounded-full
                                       border
                                       border-red-200
                                       bg-red-50
                                       px-4
                                       py-2
                                       text-[13px]
                                       font-semibold
                                       text-red-500
                                       whitespace-nowrap
                                      "
                                    >
                                    {entry.value}% {entry.key}
                                </div>
                               ))}
                              </div>
                           </div>

                            {/* SIGNAL TAGS */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              {issue.bullets?.slice(0, 3).map((b, i) => (
                                <span
                                  key={i}
                                  className="
                                    rounded-full
                                    border
                                    border-neutral-200
                                    bg-neutral-50
                                    px-3.5
                                    py-1.5
                                    text-[13px]
                                    font-medium
                                    text-neutral-600
                                  "
                                >
                                  {b}
                                </span>
                              ))}
                            </div>

                            {/* WHY IT MATTERS */}
                            {issue.why && (
                              <div className="mt-6 border-t border-neutral-100 pt-5">
    
                                <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
                                   Why it matters
                                </p>

                                <p className="mt-2 max-w-[920px] text-[15px] leading-7 text-[var(--ink-secondary)]">
                                   {issue.why}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SUGGESTED IMPROVEMENTS */}
                {data?.suggestions && data.suggestions.length > 0 && (
                  <div className="mt-6">
                    <h3 className={styles.titleSection}>Suggested Improvements</h3>

                    <div className="space-y-4 mt-4">
                      {data.suggestions.map((item, index) => {
                        const impactEntries = [
                          {
                            key: item.impact_metric_1,
                            value: item.impact_value_1,
                          },
                          {
                            key: item.impact_metric_2,
                            value: item.impact_value_2,
                          },
                        ]
                          .filter(e => e.key && typeof e.value === "number" && e.value !== 0)
                          .slice(0, 2);

                        return (
                          <div
                            key={index}
                            className="
                              rounded-[28px]
                              border
                              border-[var(--stroke-light)]
                              bg-white
                              px-8
                              py-7
                              flex
                              gap-6
                              transition-all
                              duration-200
                              hover:-translate-y-[1px]
                              hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                            "
                          >
                            {/* LEFT NUMBER */}
                            <div className="flex items-start justify-center pt-1">
                              <span className="text-[38px] leading-none font-medium text-neutral-300">
                                {index + 1}
                              </span>
                            </div>

                            {/* RIGHT CONTENT */}
                            <div className="flex-1">

                              {/* TOP ROW */}
                              <div className="flex items-start justify-between gap-6">

                                {/* LEFT SIDE */}
                                <div className="flex-1 min-w-0">

                                  {/* TITLE */}
                                  <p
                                    className="
                                      text-[21px]
                                      leading-[1.2]
                                      font-semibold
                                      tracking-[-0.02em]
                                      text-[var(--ink-primary)]
                                    "
                                  >
                                      {item.section}
                                  </p>

                                   {/* RECOMMENDATION */}
                                   <p
                                      className="
                                        mt-3
                                        max-w-[760px]
                                        text-[18px]
                                        leading-7
                                        text-[var(--ink-primary)]
                                      "
                                    >
                                      {item.recommendation}
                                   </p>

                                </div>

                                {/* IMPACT BADGES */}
                                <div className="flex shrink-0 flex-wrap justify-end gap-2 max-w-[240px]">
                                  {impactEntries.map((entry, i) => (
                                    <div
                                      key={i}
                                      className="
                                        rounded-full
                                       border
                                       border-emerald-200
                                       bg-emerald-50
                                       px-4
                                       py-2
                                       text-[13px]
                                       font-semibold
                                       text-emerald-600
                                       whitespace-nowrap
                                      "
                                    >
                                      +{Math.abs(entry.value)}% {entry.key}
                                    </div>
                                  ))}
                                </div>

                              </div>

                              {/* WHY IT WORKS */}
                              {item.why && (
                                <div className="mt-6 border-t border-neutral-100 pt-5">

                                   <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
                                     Why it works
                                   </p>

                                   <p className="max-w-[920px] text-[16px] leading-7 text-[var(--ink-secondary)]">
                                     {item.why}
                                   </p>
                                </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )} 

                {/* COPY REFINEMENT */}
                {data?.copy && data.copy.length > 0 && (
                  <div className="mt-10">
                    <h3 className={styles.titleSection}>Copy Refinement</h3>

                    <div className="space-y-4 mt-4">
                      {data.copy.map((item, index) => {
                        const impactEntries = [
                          {
                            key: item.impact_metric_1,
                            value: item.impact_value_1,
                          },
                          {
                            key: item.impact_metric_2,
                            value: item.impact_value_2,
                          },
                        ]
                          .filter(e => e.key && typeof e.value === "number" && e.value !== 0)
                          .slice(0, 2);

                        return (
                          <div
  key={index}
  className="
    rounded-[28px]
    border
    border-[var(--stroke-light)]
    bg-white
    px-8
    py-7
    flex
    gap-6
    transition-all
    duration-200
    hover:-translate-y-[1px]
    hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
  "
>
  {/* LEFT NUMBER */}
  <div className="flex items-start justify-center pt-1">
    <span className="text-[38px] leading-none font-medium text-neutral-300">
      {index + 1}
    </span>
  </div>

  {/* RIGHT CONTENT */}
  <div className="flex-1">

    {/* TOP ROW */}
    <div className="flex items-start justify-between gap-6">

      {/* LEFT */}
      <div className="flex-1 min-w-0">

        {/* SECTION */}
        <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          {item.section}
        </p>

        {/* TITLE */}
        <p
          className="
            mt-2
            text-[22px]
            leading-[1.2]
            font-semibold
            tracking-[-0.02em]
            text-[var(--ink-primary)]
            max-w-[760px]
          "
        >
          Improve copy clarity and conversion intent
        </p>

      </div>

      {/* IMPACT BADGES */}
      <div className="flex shrink-0 flex-wrap justify-end gap-2 max-w-[240px]">
        {impactEntries.map((entry, i) => (
          <div
            key={i}
            className="
              rounded-full
              border
              border-sky-200
              bg-sky-50
              px-4
              py-2
              text-[13px]
              font-semibold
              text-sky-700
              whitespace-nowrap
            "
          >
            +{Math.abs(entry.value)}% {entry.key}
          </div>
        ))}
      </div>

    </div>

    {/* BEFORE / AFTER */}
    <div className="mt-6 grid gap-4 lg:grid-cols-2">

      {/* BEFORE */}
      <div
        className="
          rounded-2xl
          border
          border-neutral-200
          bg-neutral-50
          p-5
        "
      >
        <div className="mb-3 flex items-center justify-between">

          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-neutral-400">
            Before
          </p>

          <div
            className="
              rounded-full
              bg-white
              border
              border-neutral-200
              px-2.5
              py-1
              text-[11px]
              font-medium
              text-neutral-500
            "
          >
            Original
          </div>

        </div>

        <p className="text-[16px] leading-7 text-neutral-600">
          {item.before}
        </p>
      </div>

      {/* AFTER */}
      <div
        className="
          rounded-2xl
          border
          border-sky-200
          bg-sky-50/70
          p-5
          relative
        "
      >
        <div className="mb-3 flex items-center justify-between gap-3">

          <div className="flex items-center gap-2">

            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-sky-700">
              Improved
            </p>

            <div
              className="
                rounded-full
                bg-white
                border
                border-sky-200
                px-2.5
                py-1
                text-[11px]
                font-medium
                text-sky-700
              "
            >
              AI Suggestion
            </div>

          </div>

          {/* COPY BUTTON */}
          <div className="relative">
            <button
              onClick={() => handleCopy(item.after, index)}
              className="
                flex
                items-center
                justify-center
                rounded-xl
                border
                border-sky-200
                bg-white
                h-9
                w-9
                text-sky-700
                hover:bg-sky-100
                transition
              "
            >
              {copiedIndex === index ? (
                <RiCheckLine size={18} className="shrink-0"/>
              ) : (
                <RiFileCopyLine size={18} className="shrink-0"/>
              )}
            </button>

            {copiedIndex === index && (
              <div
                className="
                  absolute
                  -top-8
                  left-1/2
                  -translate-x-1/2
                  whitespace-nowrap
                  rounded-full
                  border
                  border-sky-200
                  bg-white
                  px-3
                  py-1
                  text-[11px]
                  font-medium
                  text-sky-700
                  shadow-sm
                "
              >
                Copied
              </div>
            )}
          </div>

        </div>

        <p className="text-[17px] font-medium leading-7 text-[var(--ink-primary)]">
          {item.after}
        </p>
      </div>

    </div>

    {/* WHY IT WORKS */}
    {item.why && (
      <div className="mt-6 border-t border-neutral-100 pt-5">

        <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
          Why it works
        </p>

        <p className="mt-2 max-w-[920px] text-[15px] leading-7 text-[var(--ink-secondary)]">
          {item.why}
        </p>

      </div>
    )}

  </div>
</div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* NEXT ACTIONS */}
                <div className="mt-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-1">

                    {/* Download report */}
                    <button
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                    >
                      <RiDownload2Line size={18} className="shrink-0"/>
                      <span>Download report</span>
                    </button>

                    {/* Share */}
                    <button
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                    >
                      <RiShareForwardLine size={18} className="shrink-0"/>
                      <span>Share</span>
                    </button>

                    {/* Re-run analysis */}
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                    >
                      <RiRefreshLine size={18} className="shrink-0"/>
                      <span>Re-run analysis</span>
                    </button>

                  </div>
                </div>

              </div>
              
            </>
          </div>
          )}
        </div>
      </main>
    </>
  );
}