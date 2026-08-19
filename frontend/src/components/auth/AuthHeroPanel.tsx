import { Play } from "lucide-react";

export function AuthHeroPanel() {
  return (
    <section className="relative hidden md:flex flex-1 flex-col justify-center p-8 lg:p-12 bg-linear-to-br from-[#4f56e0] via-[#4367f6] to-[#5598f8] overflow-hidden select-none">
      {/* Ambient background soft glow effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Ambient Message Thread */}
      <div className="relative z-10 flex flex-col gap-5 max-w-110 mx-auto w-full">
        {/* Incoming Bubble 1 */}
        <div className="self-end bg-white/20 backdrop-blur-2xl border border-white/30 text-white rounded-[22px] p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-75">
          <p className="text-[12px] leading-relaxed">
            Have you checked out the new Sequoia Glass design system? It's incredible. 🤩
          </p>
          <span className="text-[9px] text-white/60 block mt-2 text-left">
            10:42 AM
          </span>
        </div>

        {/* Outgoing Bubble 2 */}
        <div className="self-start bg-[#0A7CFF] border border-blue-400/25 text-white rounded-[22px] p-4 shadow-[0_10px_35px_rgba(10,124,255,0.3)] max-w-75">
          <p className="text-[12px] leading-relaxed">
            Yeah, the vibrant mica effects and heavy blurs feel exactly like a native macOS app!
          </p>
          <span className="text-[9px] text-white/70 block mt-2 text-right">
            Delivered
          </span>
        </div>

        {/* Rich Media Card Bubble 3 */}
        <div className="self-end bg-white/20 backdrop-blur-2xl border border-white/30 rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.15)] max-w-65 w-full">
          <div className="aspect-16/10 rounded-2xl overflow-hidden relative bg-slate-900/30 group cursor-pointer flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
              alt="Design System Preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute size-10 rounded-2xl bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg group-hover:scale-110 transition-transform">
              <Play size={20} className="ml-0.5 fill-white text-white" />
            </div>
          </div>
          <div className="pt-1 px-1">
            <p className="text-[12px] font-semibold text-white truncate tracking-tight">
              Design_System_Preview.mp4
            </p>
            <p className="text-[10.5px] text-white/65 mt-0.5">12.4 MB</p>
          </div>
        </div>

        {/* Typing Dots Bubble 4 */}
        <div className="self-start ml-8 bg-white/25 backdrop-blur-xl border border-white/30 rounded-full px-3 py-2 flex items-center gap-1.5 shadow-md">
          <div
            className="size-1.5 rounded-full bg-white/80 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="size-1.5 rounded-full bg-white/80 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="size-1.5 rounded-full bg-white/80 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </section>
  );
}

