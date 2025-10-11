"use client";
import { Card } from "@/components/ui/card";
import { memo, useMemo } from "react";
import { DataTable } from "../../components/dashboard-datatable";
import { AIApplyInput } from "../components/AIApplyInput";
import { RecentActivityCard } from "../components/RecentActivityCard";
import { MOCK_DATA } from "../components/constants";
import { toast } from "sonner";

export const AIApply = memo(() => {
  const recentActivityItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => ({ id: index })),
    []
  );

  return (
    <div className="flex flex-col font-poppins relative">
      <button
        className="w-full bg-lime-300 p-16"
        // onClick={() => {
        //   toast("This is a toast");
        // }}

        // onClick={() => {
        //   toast("A Sonner toast", {
        //     className: "",
        //     description: "With a description and an icon",
        //     duration: 5000,
        //     icon: <Book />,
        //   });
        // }}

        // onClick={() => {
        //   toast("This is an action toast", {
        // action: (
        //   <Card>
        //     <div className="p">work hard</div>
        //     <div className="p">work hard</div>
        //     <div className="p">work hard</div>
        //     <div className="p">work hard</div>
        //     <div className="p">work hard</div>
        //     <Button>submit</Button>
        //   </Card>
        // ),
        // action: <Button> work hard</Button>
        // action: {
        //   label: "Action",
        //   onClick: () => console.log("Action!"),
        // },

        //   });
        // }}

        //   onClick={() => {
        //   toast('My cancel toast', {
        //     cancel: {
        //       label: 'Cancel',
        //       onClick: () => console.log('Cancel!'),
        //     },
        //   });
        // }}

        // onClick={() => {
        //   const myPromise = new Promise<{ name: string }>((resolve) => {
        //     setTimeout(() => {
        //       resolve({ name: "My toast" });
        //     }, 3000);
        //   });

        //   toast.promise(myPromise, {
        //     loading: "Loading...",
        //     success: (data: { name: string }) => {
        //       return `${data.name} toast has been added`;
        //     },
        //     error: "Error",
        //   });
        // }}

        onClick={() => {
          const myPromise = new Promise<{ name: string }>((resolve) => {
            setTimeout(() => {
              resolve({ name: "My toast" });
            }, 3000);
          });

          toast.promise(myPromise, {
            loading: "Loading...",
            success: (data: { name: string }) => {
              return {
                message: `${data.name} toast has been added`,
                description: "Custom description for the success state",
              };
            },
            error: "Error",
          });
        }}
      >
        Toast
      </button>

      <h1 className="font-instrument text-3xl text-center tracking-tighter mb-12">
        AI Assist to Apply
      </h1>
      <div className="grid gap-y-16">
        <AIApplyInput />
        <DataTable data={MOCK_DATA} />
        <Card className="p-4 sm:p-7 gap-4">
          <h1 className="font-bold text-xl">Recent Activity</h1>
          <div className="grid sm:grid-cols-2 gap-y-4 sm:gap-y-8 gap-x-13">
            {recentActivityItems.map((item) => (
              <RecentActivityCard key={item.id} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
});

AIApply.displayName = "AIApply";
