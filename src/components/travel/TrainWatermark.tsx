import { useState } from "react";

const PHOTO = "https://images.unsplash.com/photo-1629653403102-8033bbaff2bc?auto=format&fit=crop&w=2000&q=76";
const SOURCE = "https://unsplash.com/photos/red-train-on-rail-near-body-of-water-during-daytime-lp3ht8q2SEE";

type TrainWatermarkProps = {
  className?: string;
  imageClassName?: string;
  gradientClassName?: string;
  showCredit?: boolean;
};

/**
 * Lightweight photographic Bernina Express watermark.
 * The previously embedded image in Hero.tsx is corrupted, so use a
 * licensed Swiss-rail photograph and retain the local SVG as offline fallback.
 * Text overlays must remain opaque enough for accessibility.
 */
export function TrainWatermark({
  className = "",
  imageClassName = "opacity-25",
  gradientClassName = "bg-gradient-to-r from-[#f7f5ed]/95 via-[#f7f5ed]/80 to-[#f7f5ed]/65",
  showCredit = false,
}: TrainWatermarkProps) {
  const [fallback, setFallback] = useState(false);
  return (
    <div className={className} aria-hidden="true">
      <img
        src={fallback ? "/hero-train.svg" : PHOTO}
        alt=""
        onError={() => setFallback(true)}
        loading="eager"
        decoding="async"
        className={"absolute inset-0 h-full w-full object-cover object-center " + imageClassName}
      />
      <div className={"absolute inset-0 " + gradientClassName}/>
      {showCredit && !fallback && (
        <span className="absolute bottom-2 right-4 text-[9px] tracking-wide text-[#777f72]/75">
          Foto: Christian Lue · Unsplash
        </span>
      )}
    </div>
  );
}
