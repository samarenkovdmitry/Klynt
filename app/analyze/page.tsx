"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RiSettings3Line,
  RiUpload2Line,
  RiDownload2Line,
  RiCheckLine
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
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedImage(file);
    setImageName(file.name);
    setImageSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
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

      const reportId = crypto.randomUUID();

      // сохраняем отчет
      localStorage.setItem(
       `report-${reportId}`,
        JSON.stringify(flat)
      );

      setProgress(100);
      clearInterval(interval);

      // переход на страницу отчета
      router.push(`/report/${reportId}`);

    } catch (err) {
      console.error("Request failed:", err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
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
            <svg width="110" height="38" viewBox="0 0 110 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M102.178 15.8852V29.2289H106.106V15.8852H109.807V12.8658H106.106V8.1582L102.178 8.87246V12.8658H99.353V15.8852H102.178Z" fill="#061C2F"/>
<path d="M84.6265 29.2288V12.8658H88.3601V16.0475H88.4575C88.8038 14.9436 89.4098 14.0779 90.2756 13.4502C91.163 12.8009 92.2235 12.4762 93.4572 12.4762C94.4962 12.4762 95.4377 12.7143 96.2818 13.1905C97.1259 13.645 97.8077 14.3376 98.3272 15.2683C98.8466 16.199 99.1063 17.3894 99.1063 18.8396V29.2288H95.1779V19.4889C95.1779 18.2985 94.8858 17.3786 94.3014 16.7293C93.7386 16.08 93.0027 15.7553 92.0937 15.7553C90.9898 15.7553 90.1241 16.1557 89.4964 16.9566C88.8687 17.7574 88.5549 18.8288 88.5549 20.1707V29.2288H84.6265Z" fill="#061C2F"/>
<path d="M67.1005 12.8658H71.2561L75.5416 27.4108H75.6066L79.8596 12.8658H83.8854L76.8728 34.943H73.0093L75.1196 28.6769H72.1327L67.1005 12.8658Z" fill="#061C2F"/>
<path d="M62.4609 29.2288V6.63226H66.3893V29.2288H62.4609Z" fill="#061C2F"/>
<path d="M56.6085 7.15186H61.2187L52.323 19.1319L52.5178 16.5671L61.5434 29.229H56.7709L48.979 17.9631L56.6085 7.15186ZM44.7584 7.15186H48.7842V29.229H44.7584V7.15186Z" fill="#061C2F"/>
<path d="M37.1354 18.5678L18.5677 37.1357V22.2822L25.9937 29.7083L27.8505 27.8514L18.567 18.5678L27.8505 9.28427L25.9937 7.42741L18.5677 14.8534V4.21569e-06L37.1354 18.5678ZM15.7821 34.3501L0 18.5678L15.7821 2.78563V34.3501Z" fill="#061C2F"/>
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
    pt-6
    pb-12
    text-[var(--ink-primary)]
  "
>
        <div className="mx-auto max-w-[980px]">

          {/* START SCREEN */}
          
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

              <div className="mx-auto max-w-[720px] text-center">
  <div
    className="
      mx-auto
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
      mt-4
      text-[52px]
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
      mt-4
      mx-auto
      max-w-[620px]
      text-[18px]
      leading-8
      text-[var(--ink-secondary)]
    "
  >
    Get AI-powered insights about friction points, weak messaging,
    trust issues, and conversion opportunities.
  </p>

<div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-[13px] text-neutral-500">

  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
    AI UX Analysis
  </div>

  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
    Full-page screenshots
  </div>

  <div className="rounded-full bg-[#F5F7FA] px-3 py-1">
    Conversion insights
  </div>

</div>

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
    onClick={() => !loading && fileInputRef.current?.click()}
    className={`
      mt-3
      rounded-[24px]
      border-2
      border-dashed
      transition-all
      duration-200
      cursor-pointer

      ${
        uploadedImage
          ? `
            border-[#BFE7F8]
            bg-[#F7FCFF]
            hover:border-[#8ED8F5]
          `
          : `
            border-[#DCE2E7]
            bg-white
            hover:border-[#8E99A2]
          `
      }

      ${loading ? "opacity-50 cursor-not-allowed" : ""}
    `}
  >

    {!uploadedImage ? (
      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">

        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#F3F9FC]
          "
        >
          <RiUpload2Line size={26} className="text-[#14A8E8]" />
        </div>

        <p className="mt-5 text-[15px] font-medium text-[var(--ink-primary)]">
          Click to upload screenshot
        </p>

        <p className="mt-1 text-[14px] text-[var(--ink-secondary)]">
          PNG, JPG up to 20 MB
        </p>

        <p className="mt-4 text-[13px] text-neutral-400">
          Full-page screenshots produce better UX analysis
        </p>

      </div>
    ) : (
      <div className="flex items-center justify-between gap-5 px-6 py-5">

        {/* LEFT */}
        <div className="flex items-center gap-4 min-w-0">

          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#14A8E8]
            "
          >
            <RiCheckLine size={22} className="text-white" />
          </div>

          <div className="min-w-0">

            <p
              className="
                truncate
                text-[15px]
                font-semibold
                text-[var(--ink-primary)]
              "
            >
              {imageName}
            </p>

            <p className="mt-1 text-[13px] text-[#14A8E8]">
              {imageSize} • Ready for analysis
            </p>

          </div>
        </div>

        {/* ACTION */}
        <div
          className="
            rounded-full
            border
            border-[#D9EAF3]
            bg-white
            px-4
            py-2
            text-[13px]
            font-medium
            text-[var(--ink-primary)]
          "
        >
          Replace
        </div>

      </div>
    )}
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
      className="w-full"
    >
      Analyze UX
    </Button>
  ) : (
    <div
      className="
        rounded-[24px]
        border
        border-[rgba(20,168,232,0.10)]
        bg-[#F8FCFF]
        px-6
        py-5
      "
    >

      {/* TOP */}
      <div className="flex items-start justify-between gap-6">

        {/* LEFT */}
        <div>
          <p
            className="
              text-[18px]
              font-semibold
              tracking-[-0.02em]
              text-[var(--ink-primary)]
            "
          >
            Generating UX report
          </p>

          <p className="mt-1 text-[14px] text-[var(--ink-secondary)]">
            {getLoadingLabel(progress)}
          </p>
        </div>

        {/* PERCENT */}
        <div
          className="
            rounded-full
            border
            border-[rgba(20,168,232,0.12)]
            bg-white
            px-3
            py-1.5
            text-[14px]
            font-semibold
            text-[#14A8E8]
          "
        >
          {Math.floor(progress)}%
        </div>
      </div>

      {/* BAR */}
      <div className="mt-5">

        <div
          className="
            h-[10px]
            overflow-hidden
            rounded-full
            bg-[#DDEAF2]
          "
        >
          <div
            className="
              h-full
              rounded-full
              transition-all
              duration-500
              ease-out
            "
            style={{
              width: `${progress}%`,
              background:
                "linear-gradient(90deg, #14A8E8 0%, #3CC6FF 100%)",
              boxShadow: "0 0 18px rgba(20,168,232,0.35)",
            }}
          />
        </div>

        {/* FOOTER */}
        <div className="mt-3 flex items-center justify-between">

          <span className="text-[13px] text-[var(--ink-secondary)]">
            AI is evaluating visual hierarchy, clarity & trust signals
          </span>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#14A8E8] animate-pulse" />

            <span className="text-[13px] font-medium text-[#14A8E8]">
              Processing
            </span>
          </div>

        </div>
      </div>
    </div>
  )}
</div>

            </div>
          

        </div>
      </main>
    </>
  );
}