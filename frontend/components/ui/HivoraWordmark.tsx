import { cn } from "@/lib/utils"

interface HivoraWordmarkProps {
  className?: string
  /** Size of the text – any Tailwind text-* class e.g. "text-lg", "text-2xl" */
  size?: string
}

/**
 * Renders the HIVORA brand name with the signature cyan→purple gradient
 * on the "IV" letters, matching the official logo style.
 */
export function HivoraWordmark({ className, size = "text-xl" }: HivoraWordmarkProps) {
  return (
    <span
      className={cn("font-bold tracking-widest uppercase select-none", size, className)}
      aria-label="HIVORA"
    >
      <span className="text-white">H</span>
      <span
        style={{
          background: "linear-gradient(90deg, #38BDF8 0%, #818CF8 50%, #A855F7 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        IV
      </span>
      <span className="text-white">ORA</span>
    </span>
  )
}
