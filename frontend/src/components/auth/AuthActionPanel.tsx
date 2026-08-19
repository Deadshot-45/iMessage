import { useState } from "react";
import { useClerk } from "@clerk/react";
import { ArrowRight } from "lucide-react";

const AFTER_AUTH = "/";

export function AuthActionPanel() {
  const clerk = useClerk();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clerk.openSignIn({
      fallbackRedirectUrl: AFTER_AUTH,
      forceRedirectUrl: AFTER_AUTH,
    });
  };

  const handleSignUp = () => {
    clerk.openSignUp({
      fallbackRedirectUrl: AFTER_AUTH,
      forceRedirectUrl: AFTER_AUTH,
    });
  };

  const handleForgotPassword = () => {
    clerk.openSignIn({
      fallbackRedirectUrl: AFTER_AUTH,
      forceRedirectUrl: AFTER_AUTH,
    });
  };

  return (
    <section className="relative flex flex-1 flex-col items-center justify-center sm:p-10 bg-[#FAFAFC] dark:bg-[#121214]">
      {/* Floating Sign In Card */}
      <div className="w-full max-w-97.5 bg-[#fafafcd6] dark:bg-[#121214b6] backdrop-blur-2xl rounded-[28px] p-8 sm:p-10 flex flex-col gap-0 items-center select-none">
        {/* Blue iMessage App Icon */}
        <div className="size-12 rounded-xl bg-linear-to-b from-[#2997FF] to-[#0071E3] flex items-center justify-center text-white shadow-[0_10px_25px_rgba(0,113,227,0.35)] mb-4 ring-1 ring-white/40">
          <svg
            viewBox="0 0 24 24"
            className="size-8 fill-white"
            fill="currentColor"
          >
            <path d="M12 3C6.477 3 2 6.94 2 11.8c0 2.76 1.44 5.23 3.69 6.84-.15.93-.57 2.2-1.63 3.29-.2.2-.07.56.21.56 2.06 0 3.86-.98 4.9-1.8.9.22 1.84.35 2.83.35 5.523 0 10-3.94 10-8.8S17.523 3 12 3z" />
          </svg>
        </div>

        <h1 className="text-xl! font-bold text-card-foreground! m-0! tracking-tight text-center">
          Sign in
        </h1>
        <p className="text-xs text-card-foreground/70 my-2! text-center">
          to continue to iMessage Web
        </p>

        {/* Inputs & Actions */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3.5">
          <div className="w-full">
            <input
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3.5 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="w-full">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 text-xs bg-white dark:bg-zinc-800/80 border border-gray-200/90 dark:border-zinc-700/80 rounded-2xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs font-normal text-[#007aff] hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-2xl bg-[#0066cc] hover:bg-[#005bb5] active:bg-[#004f9e] text-white font-medium text-xs shadow-[0_4px_14px_rgba(0,102,204,0.25)] flex items-center justify-center gap-2 cursor-pointer transition-all border-0 mt-1"
          >
            <span>Sign In</span>
            <ArrowRight size={15} />
          </button>

          <div className="flex items-center gap-3 my-3 w-full">
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
            <span className="text-[11px] text-gray-400 dark:text-zinc-500">
              or
            </span>
            <div className="h-px bg-gray-200 dark:bg-zinc-800 flex-1" />
          </div>

          <div className="text-center text-xs text-gray-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={handleSignUp}
              className="font-normal text-[#007aff] hover:underline bg-transparent border-0 cursor-pointer p-0"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>

      {/* reCAPTCHA Disclaimer Footer */}
      <p className="text-[10.5px] text-gray-400 dark:text-zinc-500 text-center mt-8 leading-relaxed">
        Protected by reCAPTCHA and subject to the Privacy Policy and Terms of
        Service.
      </p>
    </section>
  );
}

