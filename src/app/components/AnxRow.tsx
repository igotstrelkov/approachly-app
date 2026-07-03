import { MONO } from "../theme";

export const AnxRow = ({
  value,
  onPick,
}: {
  value: number;
  onPick: (n: number) => void;
}) => (
  <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
      const on = n === value;
      return (
        <button
          key={n}
          className="aq-cell"
          onClick={() => onPick(n)}
          style={{
            flex: 1,
            height: 46,
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            background: on ? "var(--bone)" : "var(--slate)",
            color: on ? "var(--ink)" : "var(--ash)",
            fontFamily: MONO,
            fontSize: 14,
            fontWeight: 700,
            transform: on ? "scale(1.08)" : "scale(1)",
            transition:
              "transform .13s cubic-bezier(.3,1.4,.5,1),background .13s ease",
          }}
        >
          {n}
        </button>
      );
    })}
  </div>
);
