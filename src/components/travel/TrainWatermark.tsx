import { useState } from "react";

// Ilustração aprovada para o projeto Europa 2028: trem vermelho,
// viaduto de pedra e Alpes suíços. Arquivo local versionado no GitHub.
const APPROVED_TRAIN = "/viagem-trem-aprovado.webp";

type TrainWatermarkProps = {
  className?: string;
  imageClassName?: string;
  gradientClassName?: string;
  showCredit?: boolean;
};

export function TrainWatermark({
  className = "",
  imageClassName = "opacity-[.25]",
  gradientClassName = "bg-gradient-to-r from-[#f7f5ed]/95 via-[#f7f5ed]/80 to-[#f7f5ed]/65",
}: TrainWatermarkProps) {
  const [fallback, setFallback] = useState(false);

  return (
    <div className={className} aria-hidden="true">
      <img
        src={fallback ? "/hero-train.svg" : APPROVED_TRAIN}
        alt=""
        onError={() => setFallback(true)}
        loading="eager"
        decoding="async"
        className={"absolute inset-0 h-full w-full object-cover object-center " + imageClassName}
      />
      <div className={"absolute inset-0 " + gradientClassName} />
    </div>
  );
}
