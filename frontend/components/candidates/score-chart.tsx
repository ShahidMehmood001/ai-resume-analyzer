"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { type ResumeScore } from "@/types";
import { getScoreHex } from "@/lib/utils";

interface Props {
  score: ResumeScore;
  type?: "radar" | "bar";
}

interface TooltipPayload {
  value: number;
  name: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: TooltipPayload; value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius)",
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,.15)",
      }}
    >
      <p style={{ color: "var(--color-muted-foreground)", marginBottom: 2 }}>
        {label ?? payload[0].payload.name}
      </p>
      <p style={{ color: getScoreHex(val), fontWeight: 700, fontSize: 16 }}>
        {val.toFixed(0)}
        <span style={{ color: "var(--color-muted-foreground)", fontWeight: 400, fontSize: 11 }}>
          {" "}/ 100
        </span>
      </p>
    </div>
  );
}

export function ScoreChart({ score, type = "radar" }: Props) {
  const data = [
    { subject: "Overall",    name: "Overall",    value: Math.round(score.overallScore) },
    { subject: "Skills",     name: "Skills",     value: Math.round(score.skillMatch) },
    { subject: "Experience", name: "Experience", value: Math.round(score.experienceRelevance) },
    { subject: "Education",  name: "Education",  value: Math.round(score.educationFit) },
  ];

  const primaryColor = "var(--color-primary)";
  const borderColor = "var(--color-border)";
  const mutedColor = "var(--color-muted-foreground)";

  if (type === "bar") {
    return (
      <ResponsiveContainer width="100%" height={190}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={borderColor} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: mutedColor }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            dataKey="subject"
            type="category"
            tick={{ fontSize: 11, fill: mutedColor }}
            width={76}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-accent)" }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((d) => (
              <Cell key={d.subject} fill={getScoreHex(d.value)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <PolarGrid stroke={borderColor} strokeDasharray="3 3" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 11, fill: mutedColor }}
          tickLine={false}
        />
        <Radar
          name="Score"
          dataKey="value"
          stroke={primaryColor}
          fill={primaryColor}
          fillOpacity={0.18}
          strokeWidth={2}
          dot={{ r: 3, fill: primaryColor, strokeWidth: 0 }}
        />
        <Tooltip content={<ChartTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Compact score ring for cards */
export function ScoreRing({
  score,
  size = 48,
}: {
  score: number;
  size?: number;
}) {
  const r = (size / 2) * 0.72;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreHex(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={3}
          fill="none"
          stroke="var(--color-border)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={3}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span
        className="absolute text-[11px] font-bold"
        style={{ color }}
      >
        {Math.round(score)}
      </span>
    </div>
  );
}
