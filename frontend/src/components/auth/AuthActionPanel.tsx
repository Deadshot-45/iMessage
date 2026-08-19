import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export function AuthActionPanel() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const signin = useAuthStore((state) => state.signin);
  const signup = useAuthStore((state) => state.signup);
  const isLoggingIn = useAuthStore((state) => state.isLoggingIn);
  const isSigningUp = useAuthStore((state) => state.isSigningUp);

  const isLoading = isLoggingIn || isSigningUp;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
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
      const ok = await signin(identifier, password);
      if (ok) {
        navigate("/");
      }
    }
  };

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center p-6 sm:p-10 bg-[#FAFAFC] dark:bg-[#121214] overflow-y-auto">
      {/* Floating Sign In / Sign Up Card */}
      <div className="w-full max-w-[390px] bg-[#fafafcd6] dark:bg-[#121214b6] backdrop-blur-2xl rounded-[28px] p-8 sm:p-10 flex flex-col items-center select-none shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-black/5 dark:border-white/10">
        {/* Blue iMessage App Icon */}
        <div className="size-12 rounded-xl bg-gradient-to-b from-[#2997FF] to-[#0071E3] flex items-center justify-center text-white shadow-[0_10px_25px_rgba(0,113,227,0.35)] mb-3 ring-1 ring-white/40 shrink-0">
          <svg
            viewBox="0 0 24 24"
            className="size-7 fill-white"
            fill="currentColor"
          >
            <path d="M12 3C6.477 3 2 6.94 2 11.8c0 2.76 1.44 5.23 3.69 6.84-.15.93-.57 2.2-1.63 3.29-.2.2-.07.56.21.56 2.06 0 3.86-.98 4.9-1.8.9.22 1.84.35 2.83.35 5.523 0 10-3.94 10-8.8S17.523 3 12 3z" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-foreground m-0 tracking-tight text-center">
          {isSignUp ? "Create Apple Account" : "Sign in"}
        </h1>
        <p className="text-xs text-muted-foreground my-1.5 text-center">
          {isSignUp ? "Get started with iMessage Web" : "to continue to iMessage Web"}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3 mt-4">
          {isSignUp ? (
            <>
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Full Name (e.g. John Appleseed)"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="w-full">
                <input
                  type="text"
                  placeholder="Username (e.g. john_apple)"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>

              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email address"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
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
      <p className="text-[10.5px] text-gray-400 dark:text-zinc-500 text-center mt-6 leading-relaxed">
        Protected with JWT Authentication & Redis Session Store.
      </p>
    </section>
  );
}
