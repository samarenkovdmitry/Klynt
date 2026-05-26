import { getScoreColor } from "@/lib/report-metrics";

const SCORE_SIZE = 176;
const SCORE_RADIUS = 74;
const SCORE_STROKE = 6;
const SCORE_CENTER = SCORE_SIZE / 2;
const SCORE_CIRCUMFERENCE = 2 * Math.PI * SCORE_RADIUS;

type ScoreRingProps = {
  score: number;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
};

export function ScoreRing({
  score,
  className = "relative flex h-[176px] w-[176px] shrink-0 items-center justify-center",
  labelClassName = "text-[12px] font-semibold text-[var(--ink-primary)]",
  valueClassName = "text-[44px] leading-none font-semibold tracking-[-0.04em] md:text-[48px] md:tracking-[-0.06em]",
}: ScoreRingProps) {
  const progress = SCORE_CIRCUMFERENCE - (score / 100) * SCORE_CIRCUMFERENCE;
  const scoreColor = getScoreColor(score);

  return (
    <div className={className}>
      <svg
        className="absolute inset-0 h-full w-full -rotate-90"
        viewBox={`0 0 ${SCORE_SIZE} ${SCORE_SIZE}`}
        aria-hidden
      >
        <circle
          cx={SCORE_CENTER}
          cy={SCORE_CENTER}
          r={SCORE_RADIUS}
          stroke="#E5E7EB"
          strokeWidth={SCORE_STROKE}
          fill="transparent"
        />
        <circle
          cx={SCORE_CENTER}
          cy={SCORE_CENTER}
          r={SCORE_RADIUS}
          stroke={scoreColor}
          strokeWidth={SCORE_STROKE}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={SCORE_CIRCUMFERENCE}
          strokeDashoffset={progress}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      <div className="absolute text-center">
        <p className={labelClassName}>UX Score</p>
        <p className={valueClassName} style={{ color: scoreColor }}>
          {score}
        </p>
      </div>
    </div>
  );
}
