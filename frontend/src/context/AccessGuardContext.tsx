import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { X, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AccessGuardContextType {
  isUnlocked: boolean;
  requireAccess: (action: () => void | Promise<void>) => void;
  lock: () => void;
}

const AccessGuardContext = createContext<AccessGuardContextType>({
  isUnlocked: false,
  requireAccess: (action) => action(),
  lock: () => {},
});

export const useAccessGuard = () => useContext(AccessGuardContext);

const EXPECTED_PIN = (import.meta.env.VITE_ACCESS_CODE as string) || "1234";

export const AccessGuardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState<boolean>(false);

  const pendingActionRef = useRef<(() => void | Promise<void>) | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const lock = useCallback(() => {
    setIsUnlocked(false);
  }, []);

  const requireAccess = useCallback(
    (action: () => void | Promise<void>) => {
      // Always prompt for 4-digit verification for live backend requests
      pendingActionRef.current = action;
      setDigits(["", "", "", ""]);
      setError(null);
      setIsOpen(true);
    },
    []
  );

  // Auto-focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 80);
    }
  }, [isOpen]);

  const verifyCode = (code: string) => {
    if (code === EXPECTED_PIN) {
      setIsUnlocked(true);
      setIsOpen(false);
      setError(null);

      // Execute queued action
      if (pendingActionRef.current) {
        const action = pendingActionRef.current;
        pendingActionRef.current = null;
        try {
          const res = action();
          if (res instanceof Promise) {
            res.catch((err) => console.error("[AccessGuard] Protected action promise rejected:", err));
          }
        } catch (err) {
          console.error("[AccessGuard] Protected action thrown synchronously:", err);
        }
      }
    } else {
      setError("Incorrect 4-digit code. Please try again.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    setError(null);
    const char = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = char;
    setDigits(nextDigits);

    // Auto-advance to next input
    if (char && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 4 digits entered
    if (char && index === 3) {
      const fullCode = nextDigits.join("");
      if (fullCode.length === 4) {
        verifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const fullCode = digits.join("");
      if (fullCode.length === 4) {
        verifyCode(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const nextDigits = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setDigits(nextDigits);

    if (pasted.length === 4) {
      verifyCode(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, 3)]?.focus();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    pendingActionRef.current = null;
    setError(null);
  };

  return (
    <AccessGuardContext.Provider value={{ isUnlocked, requireAccess, lock }}>
      {children}

      {/* 4-Digit Security Authorization Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs transition-opacity duration-200">
          <div
            className={`relative w-full max-w-sm rounded-3xl bg-[#FDFBF9] border border-sand-200/90 p-6 sm:p-7 shadow-card-lg space-y-6 transition-all transform ${
              shake ? "animate-shake" : "animate-scale-in"
            }`}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-400 hover:text-ink-700 hover:bg-sand-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-coral-50 border border-coral-200 text-coral-600 flex items-center justify-center shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-bold text-ink-900 tracking-tight">
                Authorization Required
              </h3>
              <p className="text-xs text-ink-500 leading-relaxed max-w-xs mx-auto">
                Enter your 4-digit access code to authorize live website crawling &amp; optimization requests.
              </p>
            </div>

            {/* 4-Digit PIN Boxes */}
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[idx]}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold font-mono rounded-2xl bg-white border transition-all focus:outline-none ${
                      error
                        ? "border-coral-400 text-coral-600 focus:ring-2 focus:ring-coral-400/20"
                        : digits[idx]
                        ? "border-sand-400 text-ink-900 shadow-2xs"
                        : "border-sand-200 text-ink-900 focus:border-coral-500 focus:ring-2 focus:ring-coral-500/10"
                    }`}
                  />
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-coral-600 text-center animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                size="md"
                className="w-1/2"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="w-1/2"
                disabled={digits.join("").length < 4}
                onClick={() => verifyCode(digits.join(""))}
              >
                Verify Code
              </Button>
            </div>
          </div>
        </div>
      )}
    </AccessGuardContext.Provider>
  );
};
