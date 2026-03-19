import { useState, useCallback } from "react";

/**
 * Enterprise-grade video player component with animated borders and play overlay
 * Optimized for performance and maintainability
 */
export const VideoModal: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoSrc, setVideoSrc] = useState<string>(
    "https://www.youtube.com/embed/6Uss1_YleJk"
  );

  /**
   * Handle play button click - loads and autoplays YouTube video
   */
  const handlePlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const embedUrl =
      "https://www.youtube.com/embed/6Uss1_YleJk?autoplay=1&rel=0";
    setVideoSrc(embedUrl);
    setIsPlaying(true);
  }, []);

  return (
    <div className="relative overflow-hidden max-w-screen-2xl w-full mx-auto">
      <div className="max-w-screen-xl mx-auto ">
        <div className="relative mt-0 overflow-hidden rounded-xl bg-transparent p-0.5 lg:h-[80svh] md:w-[70svw] 2xl:h-full 2xl:w-full max-lg:mb-16 mx-auto">
          {/* Animated Border Container */}
          <div className="absolute inset-0 pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              width="100%"
              height="100%"
              className="absolute w-full h-full"
            >
              <rect fill="none" width="100%" height="100%" rx="5%" ry="5%" />
            </svg>

            {/* Gradient Orb Animation */}
            <div className="absolute top-0 left-0 inline-block pointer-events-none">
              <div className="w-20 h-20 animate-[moveOrbOuter_8s_ease-in-out_infinite]">
                <div className="w-full h-full bg-[radial-gradient(circle,rgba(59,130,246,0.8)_40%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(236,72,153,0.8)_40%,transparent_60%)]" />
              </div>
            </div>
          </div>

          {/* Video Content Container */}
          <div className="relative w-full overflow-hidden rounded-xl aspect-video">
            {/* Cover Image */}
            {!isPlaying && (
              <img
                alt="Cver AI - Video Cover"
                loading="eager"
                className="w-full h-full object-cover block"
                src="/thumbnail.png"
              />
            )}

            {/* YouTube Video Player */}
            <iframe
              className={`w-full h-full rounded-xl ${
                isPlaying ? "block" : "hidden"
              }`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              src={videoSrc}
              title="Nx Video Player"
            />

            {/* Play Button Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 z-10 grid h-full w-full place-items-center">
                <div className="relative overflow-hidden rounded-full bg-transparent p-px  transition-all duration-300 hover:scale-105">
                  {/* Play Button Border Animation */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      preserveAspectRatio="none"
                      width="100%"
                      height="100%"
                      className="absolute w-full h-full"
                    >
                      <rect
                        fill="none"
                        width="100%"
                        height="100%"
                        rx="5%"
                        ry="5%"
                      />
                    </svg>

                    {/* Button Gradient Orb */}
                    <div className="absolute top-0 left-0 inline-block pointer-events-none">
                      <div className="w-20 h-20 animate-[moveOrbButton_3s_ease-in-out_infinite]">
                        <div className="w-full h-full bg-[radial-gradient(circle,rgba(59,130,246,0.8)_40%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(14,165,233,0.8)_40%,transparent_60%)]" />
                      </div>
                    </div>
                  </div>

                  {/* Play Button */}
                  <div
                    onClick={handlePlayClick}
                    className="relative isolate flex w-20 h-20 cursor-pointer items-center justify-center gap-6 rounded-full border-2 border-slate-100 bg-white/10 p-6 text-slate-950 backdrop-blur-3xl transition-all duration-300 hover:bg-white/20 hover:border-blue-500/50 group"
                    role="button"
                    aria-label="Play video"
                  >
                    {/* Play Icon */}
                    <svg
                      className="absolute left-6 top-6 w-8 h-8 stroke-current"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>

                    {/* Hover Text */}
                    <div className="absolute left-20 top-4 w-48 opacity-0 -translate-x-1.5 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0">
                      <p className="text-base font-medium leading-6 text-white mb-1">
                        Watch the video
                      </p>
                      <p className="text-xs leading-4 text-white/80">
                        See it in action.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes moveOrbOuter {
          0%,
          100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(400px, 0);
          }
          50% {
            transform: translate(800px, 0);
          }
          75% {
            transform: translate(400px, 0);
          }
        }

        @keyframes moveOrbButton {
          0%,
          100% {
            transform: translate(40px, 40px);
          }
          50% {
            transform: translate(0, 80px);
          }
        }
      `}</style>
    </div>
  );
};
