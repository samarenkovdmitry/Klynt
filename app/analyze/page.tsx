"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  RiUpload2Line,
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
  const [error, setError] = useState<string | null>(null);

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

  const steps = [
    { threshold: 10, label: "Scanning layout…" },
    { threshold: 30, label: "Analyzing hierarchy…" },
    { threshold: 55, label: "Checking clarity…" },
    { threshold: 75, label: "Evaluating trust signals…" },
    { threshold: 90, label: "Reviewing conversion flow…" },
    { threshold: 100, label: "Finalizing report…" }
  ];

  function getLoadingLabel(progress: number) {
    const step = steps.find((s) => progress <= s.threshold);
    return step ? step.label : "Analyzing…";
  }

  async function handleAnalyze() {
    try {
      if (!url && !uploadedImage) return;

      setLoading(true);
      setData(null);
      setProgress(0);
      setError(null);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) return prev;
          return prev + Math.random() * 8;
        });
      }, 250);

      const screenshotToSend = uploadedImage;

      const form = new FormData();
      form.append("url", url);

      if (screenshotToSend) {
        form.append("screenshot", screenshotToSend);
      }

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

      if (!res.ok) {
        setLoading(false);
        clearInterval(interval);

        setError(json?.error || "Something went wrong during analysis.");

        return;
      }

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

      localStorage.setItem(`report-${reportId}`, JSON.stringify(flat));

      setProgress(100);

      clearInterval(interval);

      router.push(`/report/${reportId}`);
    } catch (error: any) {
      setError(
        error?.message ||
          "Something went wrong while analyzing the website."
      );
    } finally {
    }
  }

  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-[rgba(6,28,47,0.06)] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[64px] md:h-[72px] max-w-[1180px] items-center justify-between px-4 md:px-6">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img
              src="/klynt-logo-dark.svg"
              alt="Klynt"
              className="h-[34px] md:h-[40px] w-auto"
            />
          </div>

          {/* RIGHT */}
          <div className="hidden sm:flex flex-col leading-none text-right">
            <span className="text-[12px] md:text-[13px] font-semibold tracking-[-0.02em] text-[#061C2F]">
              UX Clarity Analyzer
            </span>

            <span className="mt-1 text-[11px] text-[#8F99A2]">
              AI-powered website review
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="min-h-[calc(100dvh-64px)] bg-[#F5F7FA] px-4 py-5 md:px-6 md:py-8">
        <div className="mx-auto max-w-[920px]">

          {/* CARD */}
          <div
            className="
              rounded-[28px]
              md:rounded-[36px]
              border
              border-[rgba(6,28,47,0.06)]
              bg-white
              px-5
              py-6
              md:px-10
              md:py-10
              shadow-[0_10px_40px_rgba(0,0,0,0.03)]
            "
          >

            {/* HERO */}
            <div className="mx-auto max-w-[700px] text-center">

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
                  text-[11px]
                  md:text-[12px]
                  font-semibold
                  text-[#2F6FED]
                "
              >
                AI UX Review
              </div>

              <h1
                className="
                  mt-4
                  text-[34px]
                  leading-[1.02]
                  tracking-[-0.06em]
                  font-semibold
                  text-[#061C2F]
                  sm:text-[42px]
                  md:text-[56px]
                "
              >
                Analyze your website clarity and UX
              </h1>

              <p
                className="
                  mt-4
                  mx-auto
                  max-w-[620px]
                  text-[15px]
                  leading-7
                  text-[#6B7280]
                  md:text-[18px]
                "
              >
                Get AI-powered insights about friction points, weak messaging,
                trust issues and conversion opportunities.
              </p>

              {/* FEATURE PILLS */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:gap-3">

                {[
                  "AI UX analysis",
                  "Full-page screenshots",
                  "Conversion insights",
                ].map((item) => (
                  <div
                    key={item}
                    className="
                      rounded-full
                      border
                      border-[rgba(6,28,47,0.06)]
                      bg-[#F8FAFC]
                      px-3
                      py-1.5
                      text-[12px]
                      font-medium
                      text-[#6B7280]
                      md:px-4
                      md:py-2
                      md:text-[13px]
                    "
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* FORM */}
            <div className="mt-8 md:mt-10">

              {/* URL */}
              <div>
                <FormLabel>Website URL</FormLabel>

                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://stripe.com"
                  disabled={loading}
                  className={`
                    mt-3
                    h-[54px]
                    md:h-[58px]
                    w-full
                    rounded-2xl
                    border
                    border-[#D8E0E7]
                    bg-[#FCFDFD]
                    px-5
                    text-[15px]
                    md:text-[16px]
                    text-[#061C2F]
                    shadow-[0_1px_2px_rgba(0,0,0,0.02)]
                    transition-all
                    duration-200
                    placeholder:text-[#9AA3AC]
                    focus:outline-none
                    ${
                      loading
                        ? "cursor-not-allowed opacity-60"
                        : "focus:border-[#14A8E8]"
                    }
                  `}
                />
              </div>

              {/* DIVIDER */}
              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#E6EBF0]" />

                <span className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#9AA3AC]">
                  Or
                </span>

                <div className="h-px flex-1 bg-[#E6EBF0]" />
              </div>

              {/* UPLOAD */}
              <div>

                <label className="text-[14px] font-medium text-[#6B7280]">
                  Upload screenshot
                </label>

                <div
                  onClick={() =>
                    !loading && fileInputRef.current?.click()
                  }
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
                        `
                        : `
                          border-[#DCE2E7]
                          bg-white
                          hover:border-[#8E99A2]
                        `
                    }

                    ${
                      loading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }
                  `}
                >

                  {!uploadedImage ? (
                    <div className="flex flex-col items-center justify-center px-5 py-8 md:px-6 md:py-10 text-center">

                      <div
                        className="
                          flex
                          h-12
                          w-12
                          md:h-14
                          md:w-14
                          items-center
                          justify-center
                          rounded-full
                          bg-[#F3F9FC]
                        "
                      >
                        <RiUpload2Line
                          size={24}
                          className="text-[#14A8E8]"
                        />
                      </div>

                      <p className="mt-4 text-[15px] font-medium text-[#061C2F]">
                        Click to upload screenshot
                      </p>

                      <p className="mt-1 text-[13px] md:text-[14px] text-[#8F99A2]">
                        PNG, JPG up to 20 MB
                      </p>

                      <p className="mt-3 text-[12px] md:text-[13px] text-neutral-400">
                        Full-page screenshots produce better analysis
                      </p>

                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">

                      <div className="flex min-w-0 items-center gap-4">

                        <div
                          className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#14A8E8]
                          "
                        >
                          <RiCheckLine
                            size={20}
                            className="text-white"
                          />
                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-[14px]
                              md:text-[15px]
                              font-semibold
                              text-[#061C2F]
                            "
                          >
                            {imageName}
                          </p>

                          <p className="mt-1 text-[12px] md:text-[13px] text-[#14A8E8]">
                            {imageSize} • Ready for analysis
                          </p>
                        </div>
                      </div>

                      <div
                        className="
                          shrink-0
                          rounded-full
                          border
                          border-[#D9EAF3]
                          bg-white
                          px-3
                          py-1.5
                          text-[12px]
                          md:text-[13px]
                          font-medium
                          text-[#061C2F]
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

              {/* ACTION */}
              <div className="mt-8 md:mt-10">

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
                      px-5
                      py-5
                      md:px-6
                    "
                  >

                    <div className="flex items-start justify-between gap-5">

                      <div>
                        <p
                          className="
                            text-[16px]
                            md:text-[18px]
                            font-semibold
                            tracking-[-0.02em]
                            text-[#061C2F]
                          "
                        >
                          Generating UX report
                        </p>

                        <p className="mt-1 text-[13px] md:text-[14px] text-[#6B7280]">
                          {getLoadingLabel(progress)}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-full
                          border
                          border-[rgba(20,168,232,0.12)]
                          bg-white
                          px-3
                          py-1.5
                          text-[13px]
                          md:text-[14px]
                          font-semibold
                          text-[#14A8E8]
                        "
                      >
                        {Math.floor(progress)}%
                      </div>
                    </div>

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
                            boxShadow:
                              "0 0 18px rgba(20,168,232,0.35)",
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

                        <span className="text-[12px] md:text-[13px] text-[#6B7280]">
                          AI is evaluating hierarchy, clarity & trust
                        </span>

                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#14A8E8] animate-pulse" />

                          <span className="text-[12px] md:text-[13px] font-medium text-[#14A8E8]">
                            Processing
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ERROR */}
              {error && (
                <div
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-[#FFD9D6]
                    bg-[#FFF4F3]
                    px-4
                    py-4
                  "
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[15px] font-medium text-[#D14343]">
                        Analysis failed
                      </p>

                      <p className="mt-1 text-[14px] text-[#9F5C5C]">
                        {error}
                      </p>
                    </div>

                    <button
                      onClick={handleAnalyze}
                      className="
                        shrink-0
                        rounded-full
                        bg-red-100
                        px-3
                        py-1.5
                        text-[12px]
                        font-medium
                        text-red-700
                        transition
                        hover:bg-red-200
                      "
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* FOOTNOTE */}
          <div className="mt-6 text-center">
            <p className="text-[12px] md:text-[13px] text-[#9AA3AC]">
              Your screenshots and URLs are processed securely and never shared.
            </p>
          </div>

        </div>
      </main>
    </>
  );
}