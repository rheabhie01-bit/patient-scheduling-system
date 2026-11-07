import { useEffect, useState } from "react";

function Clock({ variant = "compact" }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const time = now.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
  const date = now.toLocaleDateString("en-PH", {
    weekday: variant === "large" ? "long" : "short",
    month: variant === "large" ? "long" : "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className={`clock clock-${variant}`}>
      <strong className="clock-time">{time}</strong>
      <span className="clock-date">{date}</span>
    </div>
  );
}

export default Clock;