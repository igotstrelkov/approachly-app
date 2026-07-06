// Lifetime approaches after which the chart caption trims from teach+reassure
// ("Down is the win. Your real line — not a promise.") to just the essential
// cue ("Down is the win."). The reassurance is only needed for the first week
// or so; the "down = good" teach is worth keeping a little longer. Tune here.
export const CHART_CAPTION_TAUGHT_AT = 7;

export const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
};

// Monotone cubic (Fritsch–Carlson): tangents are clamped so a segment never
// overshoots its endpoints — a falling trend can't render as an upward hump.
export function monotonePath(pts: number[][]): string {
  const n = pts.length;
  if (n < 2)
    return (
      "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L")
    );
  const xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const dx: number[] = [],
    slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx[i] = xs[i + 1] - xs[i];
    slope[i] = (ys[i + 1] - ys[i]) / dx[i];
  }
  const m: number[] = new Array(n);
  m[0] = slope[0];
  m[n - 1] = slope[n - 2];
  for (let i = 1; i < n - 1; i++)
    m[i] = slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i],
      b = m[i + 1] / slope[i],
      s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  let path = "M" + xs[0].toFixed(1) + " " + ys[0].toFixed(1);
  for (let i = 0; i < n - 1; i++) {
    const c1x = xs[i] + dx[i] / 3,
      c1y = ys[i] + (m[i] * dx[i]) / 3;
    const c2x = xs[i + 1] - dx[i] / 3,
      c2y = ys[i + 1] - (m[i + 1] * dx[i]) / 3;
    path +=
      " C" +
      c1x.toFixed(1) +
      " " +
      c1y.toFixed(1) +
      " " +
      c2x.toFixed(1) +
      " " +
      c2y.toFixed(1) +
      " " +
      xs[i + 1].toFixed(1) +
      " " +
      ys[i + 1].toFixed(1);
  }
  return path;
}

export function buildChart(
  trend: number[],
  W: number,
  H: number,
  totalApproaches = 0,
) {
  const pad = 8,
    padB = 8;
  const max = Math.max(...trend),
    min = Math.min(...trend),
    range = Math.max(1, max - min);
  const pts = trend.map((v, i) => [
    pad + (trend.length === 1 ? 0.5 : i / (trend.length - 1)) * (W - pad * 2),
    pad + (1 - (v - min) / range) * (H - pad - padB),
  ]);
  const line = monotonePath(pts);
  const first = pts[0],
    last = pts[pts.length - 1];
  const area =
    line +
    " L" +
    last[0].toFixed(1) +
    " " +
    H +
    " L" +
    first[0].toFixed(1) +
    " " +
    H +
    " Z";
  // faint straight reference from first → current so the overall direction is unambiguous
  const refLine =
    "M" +
    first[0].toFixed(1) +
    " " +
    first[1].toFixed(1) +
    " L" +
    last[0].toFixed(1) +
    " " +
    last[1].toFixed(1);

  const delta = trend[0] - trend[trend.length - 1]; // positive = improvement (lower fear is better)
  const hasDelta = trend.length >= 2;
  const netDrop = delta > 0.05; // still net-down from day-one baseline

  // A "rising week": the most recent point ticks meaningfully higher than the
  // point ~4 steps back. Real anxiety data isn't monotonic; a hard stretch makes
  // the line go up. We surface that as a calm wobble (amber dot + reassurance),
  // NEVER an alarm — the line itself still visibly rises and keeps its color.
  const n = trend.length;
  const backIdx = Math.max(0, n - 5); // ~4 steps back, clamped
  const risingWeek = n >= 4 && trend[n - 1] - trend[backIdx] > 0.25;
  const chartDotColor = risingWeek ? "var(--amber)" : "var(--go)";
  let chartArrow: string,
    chartDelta: string,
    chartTrendColor: string,
    chartTrendTint: string;
  if (!hasDelta || Math.abs(delta) <= 0.05) {
    chartArrow = "—";
    chartDelta = "no change yet";
    chartTrendColor = "var(--ash)";
    chartTrendTint = "var(--slate)";
  } else if (delta > 0.05) {
    chartArrow = "▼";
    chartDelta = Math.abs(delta).toFixed(1) + " since start";
    chartTrendColor = "var(--go)";
    chartTrendTint = "rgba(52,209,126,.12)";
  } else {
    chartArrow = "▲";
    chartDelta = Math.abs(delta).toFixed(1) + " since start";
    chartTrendColor = "var(--amber)";
    chartTrendTint = "rgba(224,160,48,.12)";
  }
  return {
    chartLine: line,
    chartArea: area,
    chartRefLine: refLine,
    chartW: W,
    chartH: H,
    chartDotX: last[0].toFixed(1),
    chartDotY: last[1].toFixed(1),
    chartDotColor,
    chartCurrent: trend[trend.length - 1].toFixed(1),
    chartArrow,
    chartDelta,
    chartTrendColor,
    chartTrendTint,
    risingWeek,
    // Rising-week support copy — calm reassurance, never an error banner. A small
    // amber-tinted note plus a reframed caption. Honest: if still net-down from
    // baseline we name the drop; if the recent rise has pushed above the starting
    // point we don't claim a net drop. Null/undefined on the normal (falling/flat)
    // path so that case behaves exactly as before.
    chartNote: risingWeek
      ? "This week ticked up — that's normal. Reps through the hard weeks are the ones that move the line."
      : null,
    chartSubcaption: risingWeek
      ? netDrop
        ? `Rough week — the line wobbles, the trend holds. Still down ${delta.toFixed(1)} from day one.`
        : "Lines rise before they fall again. Showing up this week is the whole point."
      : undefined,
  };
}
