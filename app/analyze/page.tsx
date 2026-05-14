"use client";

import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import {
  DownloadSimple,
  ChatCircleText,
  Gear,
  CopySimple,
  Check,
  ShareNetwork,
  ArrowClockwise,
  UploadSimple
} from "@phosphor-icons/react";
import { FormLabel } from "@/components/ui/FormLabel";
import { Button } from "@/components/ui/Button";

function SeverityBadge({ level }: { level: string }) {
  const normalized = level.toLowerCase() as "high" | "medium" | "low";

  const map = {
    high: { dot: "bg-[#EF4444]", text: "text-[#B91C1C]", label: "HIGH" },
    medium: { dot: "bg-[#F59E0B]", text: "text-[#B45309]", label: "MEDIUM" },
    low: { dot: "bg-[#10B981]", text: "text-[#047857]", label: "LOW" },
  };

  const s = map[normalized] ?? map.low;

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${s.text}`}>
      <span className={`w-[7px] h-[7px] rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function Analyze() {
  const [data, setData] = useState<any>(null);
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
    outerCard: "rounded-xl bg-white border border-[#DCE2E7]",
    card: "rounded-xl border border-[#DCE2E7] bg-white p-4 flex flex-col",
    label: "text-sm font-medium text-[var(--ink-primary)]",
    caption: "text-sm font-normal text-[#8E99A2]",
    value: "text-[20px] font-medium leading-tight text-[#061C2F]",
    title: "text-lg font-semibold text-[#061C2F]",
    primary: "text-[#375BE7]",
    primaryBg: "bg-[#EEF2FF]",
    scoreColor: "text-[#FF8D28]",
    link: "text-[var(--ink-primary)] text-sm font-medium hover:opacity-70 transition",
    titleSection: "text-[18px] font-semibold text-[#061C2F]",
    headingPage: "text-[28px] font-semibold tracking-tight text-[var(--ink-primary)]",
    softBg: "bg-[var(--gray-soft)]",
    section: "mt-6",
    softBorder: "border-[#D5DDE5]",
  };

  function getProgressText(progress: number) {
    if (progress < 30) return "Scanning layout...";
    if (progress < 70) return "Analyzing hierarchy...";
    return "Checking conversion flow...";
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

  // -------------------------------
  // SCREENSHOT CAPTURE (html2canvas)
  // -------------------------------
  async function captureScreenshot() {
    try {
      const canvas = await html2canvas(document.body, {
        scale: 1.5,
        useCORS: true,
        logging: false,
      });

      return canvas.toDataURL("image/png").split(",")[1];
    } catch (err) {
      console.error("Screenshot failed:", err);
      return "";
    }
  }

  // -------------------------------
  // ANALYZE HANDLER (with screenshot)
  // -------------------------------
  async function handleAnalyze() {
    try {
      if (!url && !uploadedImage) return;

      setLoading(true);
      setData(null);

      const form = new FormData();
      form.append("url", url);

      if (uploadedImage) {
        form.append("screenshot", uploadedImage);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: form,
      });

      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setLoading(false);
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

  // -------------------------------
  // IMPACT LOGIC (used in Issues)
  // -------------------------------
  function generateImpact(severity: string) {
    if (severity === "high") return { clarity: 12, cta: 8 };
    if (severity === "medium") return { clarity: 6, cta: 4 };
    return { clarity: 2, cta: 1 };
  }

  function getImpactColor(severity: string) {
    if (severity === "high") return "#FF383C";
    if (severity === "medium") return "#EA7B03";
    return "#6B7280";
  }

  // -------------------------------
  // UX Breakdown color logic (0–10 → 0–100%)
  // -------------------------------
  function getBreakdownMeta(value: number) {
    const percent = value * 10;

    if (percent >= 70) {
      return {
        bar: "bg-green-500",
        label: "Healthy",
        labelColor: "text-green-600"
      };
    }

    if (percent >= 50) {
      return {
        bar: "bg-amber-500",
        label: "At risk",
        labelColor: "text-amber-600"
      };
    }

    return {
      bar: "bg-red-500",
      label: "Failing",
      labelColor: "text-red-600"
    };
  }

  return (
  <>
    {/* TOP NAVBAR */}
    <header className="w-full border-b border-[#CDD7DF] bg-[#EBEFF3]">
      <div className="mx-auto max-w-[1200px] px-6 h-16 flex items-center justify-between">

        {/* LEFT — LOGO */}
        <div className="flex items-center">
          <svg width="72" height="31" viewBox="0 0 72 31" fill="none">
            <path d="M63.9571 24.3398H67.8022V19.5777V9.55947H71.9999V6.70217H67.8022L67.8019 0H63.9569L63.9571 6.70217H61.0293V9.55947H63.9571V20.4595V24.3398Z" fill="#061C2F"/>
            <path d="M48.7903 24.339H44.9453V6.70139H48.6845V10.1584H48.755C49.4958 7.6891 51.3301 6.34863 53.9052 6.34863C57.7855 6.34863 59.6904 8.99428 59.6904 12.8746V24.339H55.8454V14.0034C55.8454 10.7228 54.6813 9.24121 52.3179 9.24121C49.9544 9.24121 48.7903 10.8639 48.7903 13.7565V24.339Z" fill="#061C2F"/>
            <path d="M35.6889 30.3366H31.8791L34.5953 22.2938H31.4206L26.0234 6.70215H29.9037L34.9481 21.2709L39.8514 6.70215H43.6964L35.6889 30.3366Z" fill="#061C2F"/>
            <path d="M20.7266 24.34V0H24.5716V24.34H20.7266Z" fill="#061C2F"/>
            <path d="M3.98611 24.34H0V0H3.98611V11.147H7.47837L15.2389 0H19.6484L11.6056 11.5703H8.81883L19.7895 24.34H14.604L3.98611 11.9936V24.34Z" fill="#061C2F"/>
          </svg>
        </div>

        {/* RIGHT — ACTIONS */}
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition">
            <ChatCircleText size={18} weight="regular" />
            <span>Feedback</span>
          </button>

          <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition">
            <Gear size={18} weight="regular" />
            <span>Settings</span>
          </button>
        </div>

      </div>
    </header>

    {/* MAIN */}
    <main className="min-h-[calc(100dvh-64px)] bg-[#EBEFF3] p-6 text-[var(--ink-primary)]">
      <div className={`mx-auto max-w-[800px] ${styles.outerCard}`}>

        {/* START SCREEN */}
        {!data && (
          <div className="flex flex-col w-full px-8 py-6">

            <h1 className={styles.headingPage}>Analyze your website</h1>

            {/* URL INPUT */}
            <div className="mt-5 w-full">
              <FormLabel>Enter website URL</FormLabel>

              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://stripe.com"
                disabled={loading}
                className={`
                  mt-2 w-full h-12 rounded-[8px] border-2 border-[#DCE2E7]
                  bg-white px-3 text-base text-[var(--ink-primary)]
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
                  mt-2 flex flex-col items-center justify-center gap-2
                  rounded-[8px] py-6 px-4 text-center transition
                  border-2 border-dashed border-[#DCE2E7]
                  bg-white
                  ${loading ? "opacity-50 cursor-not-allowed" : "hover:border-[#8E99A2] cursor-pointer"}
                `}
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <UploadSimple size={24} weight="regular" color="#8E99A2" />

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
            <div className="mt-8 w-full">
              {!loading ? (
                <Button type="button" disabled={isButtonDisabled} onClick={handleAnalyze}>
                  Analyze UX
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="w-full h-6 flex items-center rounded-lg bg-transparent">
                    <div className="w-full h-1.5 rounded-full bg-transparent overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-200"
                        style={{ width: `${progress}%`, backgroundColor: "#14A8E8" }}
                      />
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-[var(--ink-secondary)] text-center">
                    {getProgressText(progress)}
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
        {/* REPORT SCREEN */}
        {data && (
          <div className="space-y-6 animate-fade-in transition-all duration-500 opacity-100">
            <div className="px-8 py-6">

              {/* HEADER */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <h1 className={styles.headingPage}>Clarity Report</h1>

                  <div className="mt-1 flex items-center gap-2">
                    {data.url && (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${data.url}&sz=32`}
                        alt="favicon"
                        className="h-4 w-4"
                      />
                    )}

                    <p className="text-sm text-[var(--ink-secondary)]">{data.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition">
                    <DownloadSimple size={18} weight="regular" />
                    <span>Download</span>
                  </button>

                  <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-soft">
                    <span className="text-xl leading-none text-[var(--ink-primary)] font-medium">⋯</span>
                  </button>
                </div>
              </div>

              <hr className="mb-6 border-[var(--stroke-light)]" />

              {/* SUMMARY HEADER */}
              <div className="mb-4 flex items-center justify-between">
                <h2 className={styles.titleSection}>Summary</h2>

                <div className="text-sm font-medium bg-gradient-to-r from-[#7F5CFF] to-[#00D1FF] bg-clip-text text-transparent">
                  Generated by AI
                </div>
              </div>

              {/* SUMMARY GRID */}
              <div className="grid grid-cols-3 gap-4">

                {/* UX SCORE */}
                <div className={styles.card}>
                  <p className={styles.label}>UX Score</p>

                  <p className={`mt-2 ${styles.value} ${styles.scoreColor}`}>
                    {data.score}
                    <span className="ml-1 text-sm font-normal text-[var(--ink-secondary)]">/100</span>
                  </p>

                  <div className="mt-2 mb-4 h-1.5 w-full rounded-full bg-[var(--stroke-light)]">
                    <div
                      className="h-1.5 rounded-full bg-[#FF8D28]"
                      style={{ width: `${data.score}%` }}
                    />
                  </div>

                  <p className={`${styles.caption} mt-auto`}>Overall UX quality</p>
                </div>

                {/* PRIMARY ISSUE */}
                <div className={styles.card}>
                  <p className={styles.label}>Primary Issue</p>

                  <p className={`mt-2 ${styles.value} text-[var(--ink-primary)]`}>
                    {getPrimaryIssueCategory(data.issues?.[0]?.description)}
                  </p>

                  <p className={`${styles.caption} mt-auto`}>Most impactful UX problem</p>
                </div>

                {/* CONVERSION HEALTH */}
                <div className={styles.card}>
                  <p className={styles.label}>Conversion Health</p>

                  <p className={`${styles.value} mt-2 capitalize ${getRiskColor(data.risk ?? "")} text-[var(--ink-primary)]`}>
                    {normalizeRisk(data.risk ?? "")}
                  </p>

                  <p className={`${styles.caption} mt-auto`}>Overall conversion condition</p>
                </div>

              </div>
              {/* UX ISSUES */}
              <div className="mb-8 space-y-4 mt-6">
                <h3 className={styles.titleSection}>UX Issues</h3>

                <div className="space-y-4">
                  {data.issues?.map((issue: any, index: number) => {
                    const impact = issue.impact ?? generateImpact(issue.severity);
                    const color = getImpactColor(issue.severity);

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-[var(--stroke-light)] bg-white p-5 flex gap-4"
                      >
                        {/* LEFT NUMBER */}
                        <div className="w-2 flex items-start justify-center">
                          <span className="text-base font-regular text-[var(--ink-secondary)]">
                            {index + 1}
                          </span>
                        </div>

                        {/* CENTER */}
                        <div className="flex-1">
                          <p className="text-base font-medium text-[var(--ink-primary)]">
                            {issue.description}
                          </p>

                          <p className="mt-1 text-sm font-medium text-[var(--ink-primary)]">
                            <span style={{ color }} className="inline-flex">-{impact.clarity}%</span>
                            <span className="inline-flex">&nbsp;clarity</span>

                            <span className="inline-flex">&nbsp;&nbsp;&nbsp;</span>

                            <span style={{ color }} className="inline-flex">-{impact.cta}%</span>
                            <span className="inline-flex">&nbsp;CTA engagement</span>
                          </p>

                          <p className="text-sm text-[var(--ink-primary)] mt-3">
                            {issue.description}
                          </p>

                          {issue.bullets?.length > 0 && (
                            <ul className="mt-3 space-y-1">
                              {issue.bullets.map((b: string, i: number) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-[var(--ink-secondary)]"
                                >
                                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--ink-secondary)]"></span>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* RIGHT — SEVERITY */}
                        <div className="w-20 flex justify-end items-start">
                          <SeverityBadge level={issue.severity} />
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
                    {data.suggestions.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="relative rounded-xl border border-[var(--stroke-light)] p-4 grid grid-cols-[14px_1fr] gap-4"
                      >
                        {/* LEFT NUMBER */}
                        <div className="w-4 flex items-start justify-center">
                          <span className="text-base font-regular text-[var(--ink-secondary)]">
                            {index + 1}
                          </span>
                        </div>

                        {/* CENTER */}
                        <div className="relative">

                          {/* IMPACT BADGE */}
                          <div className="absolute right-0 top-0">
                            <div className="rounded-md border border-green-600 bg-green-600 px-2.5 py-1 text-sm font-medium text-white">
                              {item.impact}
                            </div>
                          </div>

                          {/* SECTION TITLE */}
                          <p className="text-base font-medium text-[var(--ink-primary)] pr-20">
                            {item.section}
                          </p>

                          {/* BEFORE / AFTER */}
                          <div className="mt-4 grid gap-4 md:grid-cols-2">

                            {/* BEFORE */}
                            <div className="flex flex-col h-full">
                              <p className="text-xs font-medium text-[var(--ink-secondary)] mb-1">Before</p>
                              <div className="rounded-lg bg-soft p-3 flex-1">
                                <p className="text-sm leading-6 text-[var(--ink-primary)]">
                                  {item.before}
                                </p>
                              </div>
                            </div>

                            {/* AFTER */}
                            <div className="flex flex-col h-full">
                              <p className="text-xs font-medium text-[var(--ink-secondary)] mb-1">Improved</p>

                              <div className="rounded-lg bg-blue-100 px-3 py-[9px] flex-1">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-medium leading-5 text-[var(--ink-primary)]">
                                    {item.after}
                                  </p>

                                  <div className="relative">
                                    <button
                                      onClick={() => handleCopy(item.after, index)}
                                      className="flex items-center gap-1 rounded-md p-1 text-[var(--ink-primary)] hover:opacity-70 transition -mr-1"
                                    >
                                      {copiedIndex === index ? (
                                        <Check size={18} weight="regular" />
                                      ) : (
                                        <CopySimple size={18} weight="regular" />
                                      )}
                                    </button>

                                    {copiedIndex === index && (
                                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs text-[var(--ink-primary)] bg-white px-2 py-0.5 rounded-md border border-[rgba(0,0,0,0.06)] shadow-[0_1px_3px_rgba(0,0,0,0.05)] animate-fade-in">
                                        Copied
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                          </div>

                          <p className="mt-4 text-sm text-[var(--ink-secondary)]">
                            Why it works: It makes the message clearer and reduces cognitive load for the user.
                          </p>

                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* UX BREAKDOWN */}
              <div className="mt-10">
  <h3 className={styles.titleSection}>UX Breakdown</h3>

  <div className="rounded-xl bg-white border border-[var(--stroke-light)] p-5 space-y-5 mt-4">
    {data.breakdown &&
      Object.entries(data.breakdown).map(([key, value]) => {
        const numericValue = Number(value ?? 0); // 0–10
        const percent = numericValue * 10;       // 0–100
        const meta = getBreakdownMeta(numericValue);

        return (
          <div key={key}>
            {/* LABEL + VALUE + STATUS */}
            <div className="mb-1 flex justify-between">
              <span className="capitalize text-sm font-medium text-[var(--ink-primary)]">
                {key}
              </span>

              <div className="flex items-center gap-1">
                {/* VALUE AS PERCENT */}
                <span className="text-sm font-semibold text-[var(--ink-primary)]">
                  {percent}%
                </span>

                <span className="text-[var(--stroke-light)]">•</span>

                {/* STATUS LABEL */}
                <span className={`text-sm font-medium ${meta.labelColor}`}>
                  {meta.label}
                </span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="h-1.5 w-full rounded-full bg-[var(--stroke-light)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${meta.bar}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
  </div>
</div>

              {/* NEXT ACTIONS */}
              <div className="mt-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-1">

                  {/* Download report */}
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                  >
                    <DownloadSimple size={18} weight="regular" />
                    <span>Download report</span>
                  </button>

                  {/* Share */}
                  <button
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                  >
                    <ShareNetwork size={18} weight="regular" />
                    <span>Share</span>
                  </button>

                  {/* Re-run analysis */}
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-[var(--ink-primary)] hover:bg-soft transition"
                  >
                    <ArrowClockwise size={18} weight="regular" />
                    <span>Re-run analysis</span>
                  </button>

                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  </>
);
}