import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { CSSProperties, InputHTMLAttributes } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppLoadingScreen } from "@/components/common/AppLoadingScreen";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { getReadableAuthError } from "@/lib/firebase";
import type { LoginCredentials, SignupCredentials } from "@/types/auth";
import { loginSchema, signupSchema } from "@/utils/validators";

const backgroundStars = Array.from({ length: 48 }, (_, index) => ({
  id: index,
  left: `${(index * 17) % 100}%`,
  top: `${4 + ((index * 23) % 54)}%`,
  delay: `${(index % 12) * 0.45}s`,
  size: `${1 + (index % 3)}px`,
}));

const shootingStars = [
  { left: "14%", top: "9%", delay: "0s" },
  { left: "60%", top: "6%", delay: "1.9s" },
  { left: "82%", top: "17%", delay: "3.4s" },
  { left: "35%", top: "20%", delay: "5.2s" },
];

const cloudLayers = [
  { className: "login-cloud login-cloud-one", delay: "0s" },
  { className: "login-cloud login-cloud-two", delay: "-8s" },
  { className: "login-cloud login-cloud-three", delay: "-15s" },
];

export function LoginPage({ initialMode = "login" }: { initialMode?: "login" | "signup" }) {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [loadingScreenVisible, setLoadingScreenVisible] = useState(false);
  const loginForm = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const signupForm = useForm<SignupCredentials>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "" },
  });
  const loginSubmitting = loginForm.formState.isSubmitting;
  const signupSubmitting = signupForm.formState.isSubmitting;

  async function onLoginSubmit(values: LoginCredentials) {
    setLoadingScreenVisible(true);
    try {
      await login(values);
      toast.success("Teacher session authenticated");
      navigate(routes.dashboard);
    } catch (error) {
      toast.error(getReadableAuthError(error));
    } finally {
      setLoadingScreenVisible(false);
    }
  }

  async function onSignupSubmit(values: SignupCredentials) {
    setLoadingScreenVisible(true);
    try {
      await signup(values);
      toast.success("Account created");
      navigate(routes.dashboard);
    } catch (error) {
      toast.error(getReadableAuthError(error));
    } finally {
      setLoadingScreenVisible(false);
    }
  }

  function switchMode(nextMode: "login" | "signup") {
    setMode(nextMode);
    loginForm.clearErrors();
    signupForm.clearErrors();
  }

  return (
    <div className="login-stage">
      {loadingScreenVisible ? <AppLoadingScreen exiting={false} /> : null}
      <LoginSky />

      <section className="login-shell" aria-label="Teacher login">
        <div className="login-poster">
          <div className="login-card-wrap">
            <div className="login-card-enter login-card">
              <div className="login-card-header">
                <div className="login-brand-mark">
                  <UserRound aria-hidden="true" />
                </div>
                <h1>{mode === "login" ? "Teacher Login" : "Create Teacher Account"}</h1>
              </div>

              <div className="login-mode-switch" aria-label="Authentication mode">
                <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>
                  Login
                </button>
                <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>
                  Sign Up
                </button>
              </div>

              {mode === "login" ? (
                <form className="login-form" onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <FloatingInput
                    label="Email ID"
                    icon={UserRound}
                    type="email"
                    error={loginForm.formState.errors.email?.message}
                    inputProps={loginForm.register("email")}
                  />
                  <FloatingInput
                    label="Password"
                    icon={LockKeyhole}
                    type="password"
                    error={loginForm.formState.errors.password?.message}
                    inputProps={loginForm.register("password")}
                  />

                  <div className="login-options">
                    <label className="login-check">
                      <input type="checkbox" {...loginForm.register("remember")} />
                      <span>
                        <Check />
                      </span>
                      Remember me
                    </label>
                    <Link to={routes.forgotPassword}>Forgot Password?</Link>
                  </div>

                  <button type="submit" disabled={loginSubmitting} className="login-submit">
                    {loginSubmitting ? <LoaderCircle className="login-spin" /> : <ShieldCheck />}
                    {loginSubmitting ? "Signing In..." : "Login"}
                  </button>
                  <button type="button" className="login-secondary-action" onClick={() => switchMode("signup")}>
                    Create an account
                  </button>
                </form>
              ) : (
                <form className="login-form" onSubmit={signupForm.handleSubmit(onSignupSubmit)}>
                  <FloatingInput
                    label="Full Name"
                    icon={UserRound}
                    error={signupForm.formState.errors.fullName?.message}
                    inputProps={signupForm.register("fullName")}
                  />
                  <FloatingInput
                    label="Email ID"
                    icon={UserRound}
                    type="email"
                    error={signupForm.formState.errors.email?.message}
                    inputProps={signupForm.register("email")}
                  />
                  <FloatingInput
                    label="Password"
                    icon={LockKeyhole}
                    type="password"
                    error={signupForm.formState.errors.password?.message}
                    inputProps={signupForm.register("password")}
                  />
                  <FloatingInput
                    label="Confirm Password"
                    icon={LockKeyhole}
                    type="password"
                    error={signupForm.formState.errors.confirmPassword?.message}
                    inputProps={signupForm.register("confirmPassword")}
                  />

                  <button type="submit" disabled={signupSubmitting} className="login-submit">
                    {signupSubmitting ? <LoaderCircle className="login-spin" /> : <ShieldCheck />}
                    {signupSubmitting ? "Creating..." : "Sign Up"}
                  </button>
                  <button type="button" className="login-secondary-action" onClick={() => switchMode("login")}>
                    Already have an account?
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FloatingInput({
  error,
  icon: Icon,
  inputProps,
  label,
  type = "text",
}: {
  error?: string;
  icon: typeof UserRound;
  inputProps: InputHTMLAttributes<HTMLInputElement>;
  label: string;
  type?: string;
}) {
  return (
    <div className="login-field-wrap">
      <label className="login-field">
        <Icon />
        <input
          {...inputProps}
          type={type}
          placeholder={label}
          aria-label={label}
        />
      </label>
      {error ? <p className="login-error">{error}</p> : null}
    </div>
  );
}

function LoginSky() {
  return (
    <div className="login-sky" aria-hidden="true">
      <div className="login-stars">
        {backgroundStars.map((star) => (
          <span
            key={star.id}
            style={
              {
                "--star-left": star.left,
                "--star-top": star.top,
                "--star-delay": star.delay,
                "--star-size": star.size,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="login-shooting-stars">
        {shootingStars.map((star) => (
          <span
            key={`${star.left}-${star.top}`}
            style={
              {
                "--shoot-left": star.left,
                "--shoot-top": star.top,
                "--shoot-delay": star.delay,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="login-moon" />
      {cloudLayers.map((cloud) => (
        <div key={cloud.className} className={cloud.className} style={{ animationDelay: cloud.delay }} />
      ))}
      <div className="login-mountains login-mountains-back" />
      <div className="login-mountains login-mountains-front" />
      <div className="login-lake" />
    </div>
  );
}
