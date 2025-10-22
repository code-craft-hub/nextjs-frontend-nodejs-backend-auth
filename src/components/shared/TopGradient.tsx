export const TopGradient = () => {
  return (
    <div
      className="absolute w-full h-64 top-0 pointer-events-none"
      style={{
        background: "url('/dashboard-gradient.svg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        maskImage:
          "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, black 0%, black 70%, transparent 100%)",
      }}
    />
  );
};
