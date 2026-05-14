import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { RiShieldCheckLine, RiTimerLine } from "react-icons/ri";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/generic/Button";
import { ErrMessage } from "../components/generic/ErrMessage";

const PIN_MAX = 8;
const PIN_MIN = 4;

const getInitials = (email: string): string => {
  if (!email) return "??";
  const local = email.split("@")[0];
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
};

const currentShiftLabel = (): string => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  // Diurno 08:00 → 18:30 (480 → 1110 min)
  if (minutes >= 480 && minutes < 1110) return "Diurno — 08:00 a 18:30";
  return "Nocturno — 18:00 a 08:00";
};

export const LoginPinPage = () => {
  const { loginPin, formError, isLoading, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Recuerda el último email usado para que el operador no tenga que volver a
  // teclearlo después de salir y volver.
  const lastEmail = localStorage.getItem("lastPinEmail") || "";
  const [email, setEmail] = useState<string>(lastEmail);
  const [digits, setDigits] = useState<string[]>(Array(PIN_MAX).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const shift = useMemo(currentShiftLabel, []);

  useEffect(() => {
    if (user) navigate("/panel/");
  }, [navigate, user]);

  const setDigit = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = clean;
      return next;
    });
    if (clean && idx < PIN_MAX - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (idx: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    const raw = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!raw) return;
    e.preventDefault();
    setDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < raw.length && idx + i < PIN_MAX; i++) {
        next[idx + i] = raw[i];
      }
      return next;
    });
    const last = Math.min(idx + raw.length, PIN_MAX - 1);
    inputsRef.current[last]?.focus();
  };

  const pinValue = digits.join("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || pinValue.length < PIN_MIN || pinValue.length > PIN_MAX) return;
    localStorage.setItem("lastPinEmail", email);
    loginPin({ email, pin: pinValue });
  };

  const initials = getInitials(email);
  const operatorName = email ? email.split("@")[0] : "Operador";

  return (
    <div className="min-h-screen bg-[#1A2340] flex-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_top,_#1E3A6E44_0%,_#0D152800_70%)] pointer-events-none" />
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-[0_8px_60px_rgba(0,0,0,0.3)] p-10 flex flex-col gap-7">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5">
          <RiShieldCheckLine className="w-7 h-7 text-[#1A3B8F]" />
          <span className="font-bold text-xl text-[#1A3B8F]">CC-IOD</span>
          <span className="text-xs text-[#999]">Technologies</span>
        </div>

        <div className="h-px bg-[#EEEEEE]" />

        {/* Avatar + operador */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-[#1A3B8F] to-[#2D52B0] ring-[3px] ring-[#1A3B8F22] flex-center text-white text-3xl font-bold">
            {initials}
          </div>
          <div className="text-xl font-semibold text-[#333]">{operatorName}</div>
          <div className="text-sm text-[#666]">Operador de Monitoreo</div>
        </div>

        {/* PIN section */}
        <form className="flex flex-col items-center gap-4" onSubmit={submit}>
          <div className="w-full">
            <label className="block text-xs font-semibold text-[#666] mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@cciodtech.com"
              className="w-full border border-[#E0E0E0] rounded-md px-3 h-[40px] text-sm focus:outline-none focus:border-[#1A3B8F]"
              autoComplete="email"
            />
          </div>

          <div className="text-sm font-medium text-[#333]">
            Ingresa tu PIN de acceso rápido <span className="text-[#999]">({PIN_MIN}–{PIN_MAX} dígitos)</span>
          </div>
          <div className="flex justify-center gap-1.5">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => setDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={(e) => handlePaste(i, e)}
                className={[
                  "w-9 h-12 text-center text-xl bg-[#F8F9FA] rounded-lg",
                  "border-2 transition focus:outline-none",
                  d ? "border-[#1A3B8F]" : "border-[#E0E0E0]",
                ].join(" ")}
              />
            ))}
          </div>

          {formError && <ErrMessage message={formError} center />}

          <Button
            type="submit"
            spinner
            isLoading={isLoading}
            size="auth"
            darkMode
            disabled={pinValue.length < PIN_MIN || !email}
          >
            INGRESAR
          </Button>
        </form>

        {/* Info turno */}
        <div className="self-center flex items-center gap-2 px-4 py-2 rounded-full bg-[#E3F2FD] text-[#1A3B8F] text-xs font-medium">
          <RiTimerLine className="w-3.5 h-3.5" />
          Turno {shift}
        </div>

        <div className="h-px bg-[#EEEEEE]" />

        <NavLink
          to="/sign-in"
          className="text-center text-xs text-[#1A3B8F] hover:underline"
        >
          Usar contraseña completa →
        </NavLink>
      </div>
    </div>
  );
};
