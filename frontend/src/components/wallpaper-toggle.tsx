import { Wallpaper } from "lucide-react";
import { useWallpaper, WALLPAPERS } from "./provider/wallpaper-provider";
import type { Wallpaper as WallpaperType } from "./provider/wallpaper-provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

export function WallpaperToggle() {
  const { wallpaper, setWallpaper } = useWallpaper();

  return (
    <Dialog>
      <DialogTrigger
        className="text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-colors bg-transparent border-0 outline-none"
        title="Change wallpaper"
      >
        <Wallpaper className="size-4.5" />
      </DialogTrigger>

      <DialogContent className="max-w-sm rounded-3xl border border-black/8 dark:border-white/12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl p-5 shadow-2xl ">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground! text-left">
            Select Wallpaper
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3">
          {WALLPAPERS.map((wp: WallpaperType) => {
            const isActive = wp.id === wallpaper;
            return (
              <button
                key={wp.id}
                onClick={() => setWallpaper(wp.id)}
                className="group relative flex flex-col items-center gap-1.5 p-1 rounded-xl transition-all duration-150 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer border-0 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={wp.name}
              >
                <div
                  className={`size-16 rounded-lg border shadow-xs transition-all duration-150 relative overflow-hidden flex items-center justify-center
                    ${isActive 
                      ? "border-accent ring-2 ring-accent/35 scale-95" 
                      : "border-black/10 dark:border-white/10 group-hover:scale-105"
                    }`}
                  style={{
                    background: wp.type === "gradient" ? wp.thumbnail : `url(${wp.thumbnail}) center/cover no-repeat`,
                  }}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-accent/10 flex items-center justify-center">
                      <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider scale-90">
                        Active
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium text-foreground/80 text-center truncate w-full">
                  {wp.name}
                </span>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
