import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./provider/theme-provider";

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
  ] as const;

  // Find index to position sliding background
  const activeIndex = options.findIndex((opt) => opt.value === theme);

  return (
    <div 
      className={cn(
        "relative flex items-center p-1 rounded-full bg-black/6 dark:bg-white/8 backdrop-blur-md border border-black/3 dark:border-white/3 w-[58px] h-[30px] select-none",
        className
      )}
    >
      {/* Sliding background circle */}
      <div 
        className="absolute left-0.5 w-[28px] h-[28px] rounded-full bg-white dark:bg-zinc-700/90 shadow-sm border border-black/4 dark:border-white/4 transition-all duration-200 ease-out"
        style={{
          transform: `translateX(${activeIndex * 24}px)`,
        }}
      />

      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "relative flex items-center justify-center w-[32px] h-[22px] rounded-full transition-colors focus-visible:outline-none cursor-pointer z-10",
              isActive 
                ? "text-neutral-900 dark:text-white" 
                : "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
            )}
            title={opt.label}
          >
            <Icon 
              className={cn(
                "h-[15px] w-[15px] transition-transform duration-200",
                isActive && "scale-110",
                opt.value === "light" && isActive && "text-amber-500",
                opt.value === "dark" && isActive && "text-blue-400"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
