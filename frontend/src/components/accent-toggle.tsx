import { Palette, Check } from "lucide-react";
import { useAccent, ACCENTS } from "./provider/accent-provider";
import type { AccentColor } from "./provider/accent-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function AccentToggle() {
  const { accent, setAccent } = useAccent();

  return (
    <Dialog>
      <DialogTrigger
        className="text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-colors bg-transparent border-0 outline-none"
        title="Change accent color"
      >
        <Palette className="size-4.5" />
      </DialogTrigger>

      <DialogContent className="max-w-xs rounded-3xl border border-black/8 dark:border-white/12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-5 shadow-2xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left">
            Accent Color
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4 justify-items-center">
          {ACCENTS.map((ac: AccentColor) => {
            const isActive = ac.id === accent;
            return (
              <button
                key={ac.id}
                onClick={() => setAccent(ac.id)}
                className="group relative flex size-12 flex-col overflow-hidden rounded-full border border-black/10 dark:border-white/10 shadow-md transition-all duration-150 hover:scale-110 active:scale-95 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent p-0"
                title={ac.name}
              >
                <div style={{ backgroundColor: ac.colors[0], height: "35%" }} className="w-full shrink-0" />
                <div style={{ backgroundColor: ac.colors[1], height: "25%" }} className="w-full shrink-0" />
                <div style={{ backgroundColor: ac.colors[2], height: "20%" }} className="w-full shrink-0" />
                <div style={{ backgroundColor: ac.colors[3], height: "20%" }} className="w-full shrink-0" />

                {isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15">
                    <Check className="size-5 text-white drop-shadow-[0_1px_2.5px_rgba(0,0,0,0.55)] stroke-[3.5]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
