import { useState, useEffect, useRef } from "react";
import { FiClock, FiAlertTriangle } from "react-icons/fi";

export function TestTimer({
  expiredAt,
  initialSeconds = null,
  onTimeUp,
  warningThreshold = 300, // 5 minutes
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    if (initialSeconds !== null) return Math.floor(initialSeconds);
    if (!expiredAt) return null;

    const expired = new Date(expiredAt).getTime();
    const now = Date.now();
    return Math.max(0, Math.floor((expired - now) / 1000));
  });

  const [isWarning, setIsWarning] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const intervalRef = useRef(null);
  const hasTriggeredTimeUp = useRef(false);

  useEffect(() => {
    if (secondsRemaining === null) return;

    intervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [secondsRemaining]);

  useEffect(() => {
    if (secondsRemaining === 0 && !hasTriggeredTimeUp.current) {
      hasTriggeredTimeUp.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      onTimeUpRef.current?.();
    }
  }, [secondsRemaining]);

  useEffect(() => {
    if (secondsRemaining === null) return;
    setIsWarning(secondsRemaining <= warningThreshold && secondsRemaining > 60);
    setIsCritical(secondsRemaining <= 60);
  }, [secondsRemaining, warningThreshold]);

  const formatTime = (totalSeconds) => {
    totalSeconds = Math.floor(totalSeconds);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (secondsRemaining === null) return null;

  const getTimerClasses = () => {
    let classes =
      "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ";

    if (isCritical) {
      classes += "bg-red-100 text-red-700 border border-red-300 animate-pulse";
    } else if (isWarning) {
      classes += "bg-yellow-100 text-yellow-700 border border-yellow-300";
    } else {
      classes += "bg-gray-100 text-gray-700 border border-gray-300";
    }

    return classes;
  };

  return (
    <div className={getTimerClasses()}>
      {isCritical ? (
        <FiAlertTriangle className="text-xl" />
      ) : (
        <FiClock className="text-xl" />
      )}
      <span className="text-lg font-mono">{formatTime(secondsRemaining)}</span>
      {isWarning && !isCritical && (
        <span className="text-sm opacity-75">con lai</span>
      )}
    </div>
  );
}

export default TestTimer;
