import { Form, Formik } from "formik";
import { NavLink, useNavigate } from "react-router-dom";
import { loginSchema } from "../utils/FormSchema";
import { FormikInput } from "../components/Inputs/FormikInput";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiFingerprintLine,
  RiKey2Line,
  RiLockPasswordLine,
  RiMailLine,
  RiRadarLine,
  RiShieldKeyholeLine,
  RiTimeLine,
} from "react-icons/ri";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "../components/generic/Button";
import { AuthContext } from "../context/AuthContext";
import { UserForm } from "../interfaces/auth.interfaces";
import { ErrMessage } from "../components/generic/ErrMessage";

type AuthMethod = "password" | "pin" | "webauthn";

const methods: { id: AuthMethod; label: string; icon: JSX.Element }[] = [
  { id: "password", label: "Contraseña", icon: <RiLockPasswordLine /> },
  { id: "pin", label: "PIN", icon: <RiKey2Line /> },
  { id: "webauthn", label: "Huella", icon: <RiFingerprintLine /> },
];

const currentShiftLabel = (): string => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  // Diurno 08:00 → 18:30 (480 → 1110 min)
  if (minutes >= 480 && minutes < 1110) return "Diurno 08:00 a 18:30";
  // El resto del día: nocturno 18:00 a 08:00
  return "Nocturno 18:00 a 08:00";
};

export const SignInPage = () => {
  const { loginUser, loginPin, loginWebauthn, formError, isLoading, user } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const initialData: UserForm = { email: "", password: "" };
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [method, setMethod] = useState<AuthMethod>("password");
  const [pinEmail, setPinEmail] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [webauthnEmail, setWebauthnEmail] = useState<string>("");
  const shift = useMemo(currentShiftLabel, []);

  useEffect(() => {
    if (user) navigate("/panel/");
  }, [navigate, user]);

  return (
    <div className="h-screen bg-[#1A2340] flex-center">
      <div className="w-full max-w-[760px] mx-4 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        {/* Panel izquierdo — branding */}
        <div className="md:w-[300px] bg-gradient-to-b from-[#1A3B8F] to-[#2D52B0] text-white p-8 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <RiShieldKeyholeLine className="w-7 h-7" />
            <span className="font-bold text-lg tracking-[2px]">CC-IOD</span>
          </div>
          <span className="text-xs tracking-[3px] text-white/70 -mt-4">
            TECHNOLOGIES
          </span>
          <h1 className="text-3xl font-bold mt-2">Bienvenido</h1>
          <p className="text-center text-sm text-white/80 leading-relaxed">
            Sistema de Monitoreo
            <br />
            Electrónico
          </p>
          <div className="w-28 h-28 rounded-full bg-white/10 flex-center">
            <RiRadarLine className="w-12 h-12 text-white/60" />
          </div>
        </div>

        {/* Panel derecho — form */}
        <div className="flex-1 p-8 md:p-9 flex flex-col gap-5">
          <h2 className="text-[22px] font-bold text-[#333]">Iniciar Sesión</h2>

          {/* Selector de método */}
          <div>
            <div className="text-[11px] tracking-[1px] font-semibold text-[#666] mb-2">
              MÉTODO DE ACCESO
            </div>
            <div className="grid grid-cols-3 gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={[
                    "flex flex-col items-center gap-1 py-2 rounded-md border text-xs font-medium transition",
                    method === m.id
                      ? "border-[#1A3B8F] bg-[#1A3B8F]/5 text-[#1A3B8F]"
                      : "border-[#E0E0E0] text-[#666] hover:border-[#999]",
                  ].join(" ")}
                >
                  <span className="text-lg">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-[#EEEEEE]" />

          {method === "password" && (
            <Formik
              initialValues={initialData}
              validationSchema={loginSchema}
              enableReinitialize
              onSubmit={(data) => loginUser(data)}
            >
              <Form className="flex flex-col gap-3">
                <FormikInput
                  type="text"
                  required
                  name="email"
                  placeholder="usuario@cciodtech.com"
                  icon={<RiMailLine />}
                  bgTheme={false}
                />
                <FormikInput
                  type={showPassword ? "text" : "password"}
                  required
                  name="password"
                  placeholder="Contraseña"
                  icon={showPassword ? <RiEyeLine /> : <RiEyeOffLine />}
                  onClickIcon={() => setShowPassword(!showPassword)}
                  bgTheme={false}
                />
                {formError && <ErrMessage message={formError} center={false} />}
                <Button
                  type="submit"
                  spinner
                  isLoading={isLoading}
                  size="auth"
                  darkMode
                >
                  INGRESAR
                </Button>
              </Form>
            </Formik>
          )}

          {method === "pin" && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (pinEmail && pin) loginPin({ email: pinEmail, pin });
              }}
            >
              <label className="text-xs font-semibold text-[#666]">
                Correo electrónico
              </label>
              <input
                type="email"
                value={pinEmail}
                onChange={(e) => setPinEmail(e.target.value)}
                placeholder="usuario@cciodtech.com"
                className="border border-[#E0E0E0] rounded-md px-3 h-[42px] text-sm focus:outline-none focus:border-[#1A3B8F]"
                autoFocus
              />
              <label className="text-xs font-semibold text-[#666]">
                PIN (4-8 dígitos)
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="\d{4,8}"
                maxLength={8}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="border border-[#E0E0E0] rounded-md px-3 h-[42px] text-center tracking-[0.5em] text-lg focus:outline-none focus:border-[#1A3B8F]"
              />
              {formError && <ErrMessage message={formError} center={false} />}
              <Button
                type="submit"
                spinner
                isLoading={isLoading}
                size="auth"
                darkMode
                disabled={pin.length < 4 || !pinEmail}
              >
                INGRESAR CON PIN
              </Button>
              <NavLink
                to="/login-pin"
                className="text-xs text-[#2D52B0] hover:underline text-center"
              >
                Vista de operador (Login Rápido) →
              </NavLink>
            </form>
          )}

          {method === "webauthn" && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (webauthnEmail) loginWebauthn(webauthnEmail);
              }}
            >
              <label className="text-xs font-semibold text-[#666]">
                Correo electrónico
              </label>
              <input
                type="email"
                value={webauthnEmail}
                onChange={(e) => setWebauthnEmail(e.target.value)}
                placeholder="usuario@cciodtech.com"
                className="border border-[#E0E0E0] rounded-md px-3 h-[42px] text-sm focus:outline-none focus:border-[#1A3B8F]"
                autoFocus
              />
              <p className="text-xs text-[#666] leading-relaxed">
                El navegador te pedirá usar tu autenticador
                (huella, Windows Hello, Touch ID o llave de seguridad).
              </p>
              {formError && <ErrMessage message={formError} center={false} />}
              <Button
                type="submit"
                spinner
                isLoading={isLoading}
                size="auth"
                darkMode
                disabled={!webauthnEmail}
              >
                AUTENTICAR CON HUELLA
              </Button>
            </form>
          )}

          {method === "password" && (
            <div className="text-center -mt-1">
              <NavLink
                to="/forgot-password"
                className="text-xs text-[#2D52B0] hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </NavLink>
            </div>
          )}

          {/* Info de turno */}
          <div className="mt-auto flex items-center justify-center gap-1.5 text-[10px] text-[#999]">
            <RiTimeLine className="w-3 h-3" />
            <span>Turno actual: {shift}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
