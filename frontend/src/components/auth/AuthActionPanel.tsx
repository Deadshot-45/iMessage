import { useState } from "react";
import { ArrowRight, Loader2, Check, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";
import useValidation, { useUsernameAvailability } from "@/hooks/useValidation";
import toast from "react-hot-toast";

export function AuthActionPanel() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Consolidated validation hook & debounced username check
  const { checkPassword, checkEmail, checkFullName } = useValidation();
  const { isChecking: isCheckingUsername, status: usernameStatus } =
    useUsernameAvailability(username, isSignUp, 400);

  const signin = useAuthStore((state) => state.signin);
  const signup = useAuthStore((state) => state.signup);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const isSigningUp = useAuthStore((state) => state.isSigningUp);

  const isLoading = isLoggingIn || isSigningUp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      const nameError = checkFullName(fullName);
      if (typeof nameError === "string") {
        toast.error(nameError);
        return;
      }

      if (isCheckingUsername) {
        toast.error("Please wait while we verify username availability");
        return;
      }

      if (usernameStatus && !usernameStatus.available) {
        toast.error(usernameStatus.message || "Please choose a different username");
        return;
      }

      const emailError = checkEmail(email);
      if (typeof emailError === "string") {
        toast.error(emailError);
        return;
      }

      const passwordError = checkPassword(password);
      if (typeof passwordError === "string") {
        toast.error(passwordError);
        return;
      }

      const ok = await signup({
        fullName,
        username,
        email,
        password,
      });
      if (ok) {
        navigate("/");
      }
    } else {
      if (!identifier.trim()) {
        toast.error("Please enter your email or username");
        return;
      }
      if (!password) {
        toast.error("Please enter your password");
        return;
      }

      const ok = await signin(identifier, password);
      if (ok) {
        navigate("/");
      }
    }
  };

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center p-6 sm:px-10 bg-[#FAFAFC] dark:bg-[#121214] overflow-y-auto no-scrollbar">
      {/* Floating Sign In / Sign Up Card */}
      <div className="w-full max-w-97.5 bg-[#fafafcd6] dark:bg-[#121214b6] backdrop-blur-2xl rounded-[28px] p-8 sm:p-10 flex flex-col items-center select-none shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10">
        {/* App Icon */}
        <div className="size-12 rounded-xl bg-linear-to-b from-[#2997FF] to-[#0071E3] flex items-center justify-center text-white shadow-[0_10px_25px_rgba(0,113,227,0.35)] mb-3 ring-1 ring-white/40 shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="size-7 fill-white"
            fill="currentColor"
          >
            <path d="M12 3C6.477 3 2 6.94 2 11.8c0 2.76 1.44 5.23 3.69 6.84-.15.93-.57 2.2-1.63 3.29-.2.2-.07.56.21.56 2.06 0 3.86-.98 4.9-1.8.9.22 1.84.35 2.83.35 5.523 0 10-3.94 10-8.8S17.523 3 12 3z" />
          </svg>
        </div>

        <h1 className="text-2xl! font-bold text-card-foreground! m-0! tracking-tight text-center">
          {isSignUp ? "Create Account" : "Sign in"}
        </h1>
        <p className="text-xs text-muted-foreground my-2! text-center">
          {isSignUp
            ? "Get started with Web Messenger"
            : "to continue to Web Messenger"}
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-3 mt-2"
          autoComplete="on"
        >
          {isSignUp ? (
            <>
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Full Name (e.g. Alex Carter)"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="w-full flex flex-col gap-1">
                <div className="relative w-full flex items-center">
                  <input
                    type="text"
                    placeholder="Username (e.g. alex_carter)"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full px-4 py-3 pr-10 text-xs bg-white dark:bg-zinc-800/80 border rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                      usernameStatus
                        ? usernameStatus.available
                          ? "border-emerald-500/80 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border-gray-200/90 dark:border-zinc-700/80 focus:border-blue-500 focus:ring-blue-500/20"
                    }`}
                  />
                  <div className="absolute right-3.5 flex items-center justify-center pointer-events-none">
                    {isCheckingUsername ? (
                      <Loader2 className="size-4 animate-spin text-blue-500" />
                    ) : usernameStatus ? (
                      usernameStatus.available ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : (
                        <X className="size-4 text-rose-500" />
                      )
                    ) : null}
                  </div>
                </div>
                {usernameStatus && (
                  <span
                    className={`text-[11px] px-2 font-medium transition-all ${
                      usernameStatus.available
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-500 dark:text-rose-400"
                    }`}
                  >
                    {usernameStatus.message}
                  </span>
                )}
              </div>

              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="w-full">
                <input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Email or Username"
                  required
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="w-full">
                <input
                  type="password"
                  placeholder="Password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={
              isLoading ||
              (isSignUp &&
                (isCheckingUsername ||
                  (usernameStatus !== null && !usernameStatus.available)))
            }
            className="w-full h-11 rounded-2xl bg-[#0066cc] hover:bg-[#005bb5] active:bg-[#004f9e] disabled:opacity-60 text-white font-medium text-xs shadow-[0_4px_14px_rgba(0,102,204,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all border-0 mt-2"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                <span>{isSignUp ? "Sign Up" : "Sign In"}</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <div className="flex items-center gap-3 my-2 w-full">
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              or
            </span>
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-zinc-400">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-semibold text-[#007aff] hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </form>
      </div>

      {/* Security Disclaimer */}
      <p className="text-[10.5px] relative md:absolute bottom-0 md:bottom-6 text-gray-400 dark:text-zinc-500 text-center mt-6 leading-relaxed">
        Protected with JWT Authentication & Redis Session Store.
      </p>
    </section>
  );
}
