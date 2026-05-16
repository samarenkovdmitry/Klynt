"use client";

import { useState, useRef } from "react";
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
    setUploadedImage(null);
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1500);
  }

  // ------------------------------------------------------
  // 🔥 HYBRID ANALYZE (URL + screenshot)
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

      const form = new FormData();
      form.append("url", url);

      if (uploadedImage) {
        form.append("screenshot", uploadedImage);
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

  // ------------------------------------------------------
  // 🔥 RETURN (UI)
  // ------------------------------------------------------
  return (
    <div className="w-full max-w-4xl mx-auto py-10">
      {/* INPUT CARD */}
      <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
        <h1 className="text-[28px] font-semibold text-[#061C2F] mb-6">
          UX Audit
        </h1>

        <div className="flex flex-col gap-4">
          <div>
            <FormLabel>Website URL</FormLabel>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <FormLabel>Or upload screenshot</FormLabel>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <UploadSimple size={20} />
              <span>{uploadedImage ? uploadedImage.name : "Choose file…"}</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          <Button
            disabled={isButtonDisabled || loading}
            onClick={handleAnalyze}
            className="mt-4"
          >
            {loading ? getLoadingLabel(progress) : "Analyze"}
          </Button>
        </div>
      </div>

      {/* RESULTS */}
      {data && (
        <div className="mt-10 space-y-10">
          {/* SCORE */}
          <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Overall Score</h2>
            <div className="text-[40px] font-bold text-[#061C2F]">
              {data.score}
            </div>
            <div className={`mt-2 text-lg ${getRiskColor(data.risk)}`}>
              {normalizeRisk(data.risk)}
            </div>
          </div>

          {/* BREAKDOWN */}
          <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Breakdown</h2>

            <div className="space-y-4">
              {breakdownItems.map((item) => {
                const meta = getBreakdownMeta(item.value);
                return (
                  <div key={item.key}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{item.label}</span>
                      <span className={meta.labelColor}>{meta.label}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${meta.bar}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ISSUES */}
          <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Issues</h2>

            <div className="space-y-6">
              {(data.issues ?? []).map((issue, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="font-semibold text-lg">{issue.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{issue.why}</div>

                  <ul className="list-disc ml-5 mt-2 text-sm">
                    {(issue.bullets ?? []).map((b, i) => (
                    

                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <div className="mt-2 text-sm text-gray-700">
                    Impact: {issue.impact_metric_1} {issue.impact_value_1}
                    {issue.impact_metric_2 &&
                      `, ${issue.impact_metric_2} ${issue.impact_value_2}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Suggestions</h2>

            <div className="space-y-6">
              {data.suggestions.map((s, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="font-semibold text-lg">{s.section}</div>
                  <div className="mt-1 text-sm">{s.recommendation}</div>
                  <div className="mt-2 text-sm text-gray-700">
                    Impact: {s.impact_metric_1} {s.impact_value_1}
                    {s.impact_metric_2 &&
                      `, ${s.impact_metric_2} ${s.impact_value_2}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COPY REFINEMENTS */}
          <div className="rounded-xl border border-[#DCE2E7] bg-white p-6">
            <h2 className="text-xl font-semibold mb-4">Copy Refinements</h2>

            <div className="space-y-6">
              {data.copy.map((c, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="font-semibold text-lg">{c.section}</div>

                  <div className="mt-2">
                    <div className="text-sm text-gray-600">Before:</div>
                    <div className="p-3 bg-gray-100 rounded text-sm">
                      {c.before}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-sm text-gray-600">After:</div>
                    <div className="p-3 bg-green-50 rounded text-sm">
                      {c.after}
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-700">
                    Impact: {c.impact_metric_1} {c.impact_value_1}
                    {c.impact_metric_2 &&
                      `, ${c.impact_metric_2} ${c.impact_value_2}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleReset} className="mt-6">
            Reset
          </Button>
        </div>
      )}
    </div>
  );
}
