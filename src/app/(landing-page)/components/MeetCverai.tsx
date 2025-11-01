import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

export const MeetCverai = () => {
  const router = useRouter();
  return (
    <section className="py-20 bg-[url('/meet-cverai-gradient.png')] bg-cover bg-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                onClick={() => {
                  router.push(`/dashboard/home`);
                }}
                className="max-sm:text-2xs break-words text-white px-8 py-3"
              >
                Start now - Your job hunt just got easier!
              </Button>
            </div>
          </div>
          <img src="/job-interview.png" alt="Job Interview" />
        </div>
      </div>
    </section>
  );
};
