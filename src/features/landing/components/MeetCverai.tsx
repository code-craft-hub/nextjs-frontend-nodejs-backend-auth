"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const MeetCverai = () => {
  const router = useRouter();
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background image — now discoverable by preload scanner */}
      <div className="absolute inset-0">
        <Image
          src="/meet-cverai-gradient.png"
          fill
          className="object-cover object-center"
          alt=""
          aria-hidden="true"
          quality={85}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Meet AI Apply - <br />
              Apply for Jobs in Seconds.
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Streamline your job search with AI-powered applications across
              LinkedIn, Telegram, WhatsApp, and more platforms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push(`/dashboard/home`)}
                className="max-sm:text-2xs wrap-break-word text-white px-8 py-3"
              >
                Start now - Your job hunt just got easier!
              </Button>
            </div>
          </div>
          <Image
            src="/job-interview.png"
            alt="Job Interview"
            width={600}
            height={490}
            className="w-full h-auto"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
      </div>
    </section>
  );
};
