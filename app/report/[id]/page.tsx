"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  RiDownload2Line,
  RiFileCopyLine,
  RiCheckLine,
  RiShareForwardLine,
  RiRefreshLine,
  RiSettings3Line
} from "@remixicon/react";

export default function ReportPage() {


  // =========================
  // PARAMS
  // =========================
  const params = useParams();
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // =========================
  // STATE
  // =========================

  const [data, setData] = useState<any>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  

  // =========================
  // STYLES
  // =========================

  const styles = {
      titleSection: "text-[24px] font-semibold text-[#061C2F]",

};


  // =========================
  // HELPERS
  // =========================

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


  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }


  function handleReset() {
    setData(null);
    setUrl("");
    setProgress(0);
    setUploadedImage(null);
    setImageName("");
  }


  async function handleShare() {
  const url = window.location.href;

  if (navigator.share) {
    await navigator.share({
      title: "Klynt UX Report",
      url,
    });

    return;
  }

  await navigator.clipboard.writeText(url);
}




  // =========================
  // LOAD REPORT
  // =========================

  useEffect(() => {
    const stored = localStorage.getItem(
      `report-${params.id}`
    );

    if (stored) {
      setData(JSON.parse(stored));
    }
  }, [params.id]);



  // =========================
  // LOADING
  // =========================

  if (!data) {
    return (
      <main className="p-10">
        Loading report...
      </main>
    );
  }



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
          <div className="flex items-center gap-4">
            <svg width="118" height="44" viewBox="0 0 118 44" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="2.5" width="39" height="39" rx="9.5" stroke="#DCE2E7"/>
<path d="M25.6568 30.4854L19.9999 36.1422L20 24.8285L25.6568 30.4854ZM34.1421 22.0001L27.5426 28.5995L20.9433 22.0001L27.5427 15.4006L34.1421 22.0001ZM17.1715 33.3138L5.85791 22L17.1716 10.6863L17.1715 33.3138ZM25.6569 13.5148L20 19.1716L20 7.85786L25.6569 13.5148Z" fill="#061C2F"/>
<path d="M109.419 19.0976V32.4413H113.348V19.0976H117.049V16.0782H113.348V11.3706L109.419 12.0849V16.0782H106.595V19.0976H109.419Z" fill="#061C2F"/>
<path d="M91.8683 32.4411V16.0781H95.6019V19.2598H95.6993C96.0456 18.1559 96.6516 17.2901 97.5174 16.6625C98.4048 16.0131 99.4654 15.6885 100.699 15.6885C101.738 15.6885 102.679 15.9266 103.524 16.4027C104.368 16.8573 105.05 17.5499 105.569 18.4806C106.088 19.4113 106.348 20.6017 106.348 22.0519V32.4411H102.42V22.7012C102.42 21.5108 102.128 20.5909 101.543 19.9416C100.98 19.2922 100.245 18.9676 99.3355 18.9676C98.2316 18.9676 97.3659 19.368 96.7382 20.1688C96.1105 20.9697 95.7967 22.0411 95.7967 23.383V32.4411H91.8683Z" fill="#061C2F"/>
<path d="M74.3423 16.0781H78.4979L82.7835 30.623H82.8484L87.1015 16.0781H91.1273L84.1146 38.1552H80.2511L82.3614 31.8892H79.3745L74.3423 16.0781Z" fill="#061C2F"/>
<path d="M69.7028 32.4413V9.84473H73.6312V32.4413H69.7028Z" fill="#061C2F"/>
<path d="M63.8504 10.3643H68.4606L59.5648 22.3443L59.7596 19.7795L68.7852 32.4414H64.0127L56.2208 21.1755L63.8504 10.3643ZM52.0002 10.3643H56.026V32.4414H52.0002V10.3643Z" fill="#061C2F"/>
</svg>

          </div>

          <div className="flex items-center">
  <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[13px] font-semibold tracking-[-0.01em] text-[var(--ink-primary)]">
                UX Clarity Analyzer
              </span>

              <span className="mt-1 text-[11px] text-[var(--ink-secondary)]">
                AI-powered website review
              </span>
            </div>
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


         <div className="animate-fade-in opacity-100">
              <>
               {/* WHITE REPORT HERO */}
              <div
                className="
                relative
                overflow-hidden
                rounded-[36px]
                bg-white
                px-10
                py-8
                "
              >
            
              {/* TOP LIGHT */}
              <div
                className="
                pointer-events-none
                absolute
                inset-0
                bg-[radial-gradient(circle_at_top,#F7FBFF_0%,transparent_72%)]
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
                      onClick={() => window.print()}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[rgba(6,28,47,0.08)]
                        bg-white
                        px-5
                        py-3
                        text-[14px]
                        font-medium
                        text-[var(--ink-primary)]
                        transition-all
                        duration-200
                        hover:border-[rgba(20,168,232,0.18)]
                        hover:bg-[#F8FBFF]
                        hover:shadow-[0_4px_16px_rgba(20,168,232,0.08)]
                      "
                    >
                      <RiDownload2Line size={18} className="shrink-0"/>
                      <span>Export PDF</span>
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
      mt-5
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
        print-break
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
<div className="relative flex h-[148px] w-[148px] items-center justify-center">

  {(() => {
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const progress = circumference - (data.score / 100) * circumference;

    return (
      <>
        <svg
          className="-rotate-90"
          width="148"
          height="148"
        >
          <circle
            cx="74"
            cy="74"
            r={radius}
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="transparent"
          />

          <circle
            cx="74"
            cy="74"
            r={radius}
            stroke="#FF7A00"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            className="transition-all duration-700 ease-out"
          />
        </svg>


        {/* SCORE */}
        <div className="absolute text-center">
          <p className="text-[15px] font-semibold text-[var(--ink-primary)]">
            UX Score
          </p>

          <p className="text-[44px] leading-none font-semibold text-[#FF7A00]">
            {data.score}
          </p>
        </div>
      </>
    );
  })()}
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
        print-break
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
          leading-5
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
                <div className="mb-8 mt-10 px-10">
                  <h3 className={styles.titleSection}>UX Issues</h3>

                  <div className="space-y-4 mt-5">
                    {data.issues?.map((issue: any, index: number) => {
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
                          print-break
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
                              {issue.bullets?.slice(0, 3).map((b: any, i: number) => (
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

                                <p className="mt-1 max-w-[920px] text-[15px] leading-5 text-[var(--ink-secondary)]">
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
                  <div className="mt-10 px-10">
                    <h3 className={styles.titleSection}>Suggested Improvements</h3>

                    <div className="space-y-4 mt-5">
                      {data.suggestions.map((item: any, index: number) => {
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
                              print-break
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
                                      leading-[1.4]
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

                                   <p className="mt-1 max-w-[920px] text-[16px] leading-7 text-[var(--ink-secondary)]">
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
                  <div className="mt-10 px-10">
                    <h3 className={styles.titleSection}>Copy Refinement</h3>

                    <div className="space-y-4 mt-5">
                      {data.copy.map((item: any, index: number) => {
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
    print-break
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
            leading-[1.4]
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

        <p className="mt-1 max-w-[920px] text-[15px] leading-5 text-[var(--ink-secondary)]">
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
                <div className="mt-14 px-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-2">

                    {/* Download report */}
                    <button
                      onClick={() => window.print()}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[rgba(6,28,47,0.08)]
                        bg-white
                        px-5
                        py-3
                        text-[14px]
                        font-medium
                        text-[var(--ink-primary)]
                        transition-all
                        duration-200
                        hover:border-[rgba(20,168,232,0.18)]
                        hover:bg-[#F8FBFF]
                        hover:shadow-[0_4px_16px_rgba(20,168,232,0.08)]
                      "
                    >
                      <RiDownload2Line size={18} className="shrink-0"/>
                      <span>Export PDF</span>
                    </button>

                    {/* Share */}
                    <button
                      onClick={handleShare}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[rgba(6,28,47,0.08)]
                        bg-white
                        px-5
                        py-3
                        text-[14px]
                        font-medium
                        text-[var(--ink-primary)]
                        transition-all
                        duration-200
                        hover:border-[rgba(20,168,232,0.18)]
                        hover:bg-[#F8FBFF]
                        hover:shadow-[0_4px_16px_rgba(20,168,232,0.08)]
                      "
                    >
                      <RiShareForwardLine size={18} className="shrink-0"/>

                      {copied ? "Copied link" : "Share"}
                    </button>

                    {/* Re-run analysis */}
                    <button
                      onClick={handleReset}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-[rgba(6,28,47,0.08)]
                        bg-white
                        px-5
                        py-3
                        text-[14px]
                        font-medium
                        text-[var(--ink-primary)]
                        transition-all
                        duration-200
                        hover:border-[rgba(20,168,232,0.18)]
                        hover:bg-[#F8FBFF]
                        hover:shadow-[0_4px_16px_rgba(20,168,232,0.08)]
                      "
                   >
                      <RiRefreshLine size={18} className="shrink-0"/>
                      <span>Re-run analysis</span>
                    </button>

                  </div>
                </div>

              </div>
              
            </>
            </div>
          </div>
    </main>
    </>
  );
}          
          