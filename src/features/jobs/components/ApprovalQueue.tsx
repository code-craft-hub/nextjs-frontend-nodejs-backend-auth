import React from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"

export default function ApprovalQueue() {
  return (
    <div className="w-full min-h-screen bg-white px-10 py-8">
      {/* Top left icon */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-5 text-black">
            <div className="w-6 h-6 border-2 border-black rounded-[4px] flex items-center justify-center">
              <div className="w-[8px] h-[14px] border-r-2 border-black" />
            </div>
          </div>

          <h1 className="text-[48px] font-normal text-black leading-none">
            Approval Queue
          </h1>
          <p className="mt-3 text-[18px] text-[#6b7280]">
            Review and approve AI-generated applications before they are sent.
          </p>
        </div>

        <div className="flex items-center gap-4 mt-8">
          <Button className="h-[44px] px-8 rounded-md bg-[#3b82f6] hover:bg-[#3b82f6]/90 text-white text-[16px] font-medium shadow-none">
            Approve all
          </Button>

          <Button
            variant="outline"
            className="h-[44px] px-8 rounded-md border border-[#ef4444] text-[#ef4444] hover:bg-transparent hover:text-[#ef4444] text-[16px] font-medium shadow-none"
          >
            Decline all
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="mt-10 border border-[#e5e7eb] rounded-lg shadow-none overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-[60px_1.6fr_1.2fr_1.3fr_1fr] items-center h-[56px] border-b border-[#e5e7eb] bg-white px-5">
          <div className="flex items-center justify-center">
            <Checkbox className="h-[18px] w-[18px] rounded-[4px] border-[#c7c7c7]" />
          </div>

          <div className="text-[13px] font-medium tracking-widest text-[#374151]">
            JOB TITLE
          </div>

          <div className="text-[13px] font-medium tracking-widest text-[#374151]">
            COMPANY
          </div>

          <div className="text-[13px] font-medium tracking-widest text-[#374151]">
            SUBMITTED
          </div>

          <div className="text-[13px] font-medium tracking-widest text-[#374151]">
            STATUS
          </div>
        </div>

        {/* Rows */}
        <ApprovalRow />
        <ApprovalRow />
        <ApprovalRow />
        <ApprovalRow />
        <ApprovalRow />
      </Card>
    </div>
  )
}

function ApprovalRow() {
  return (
    <div className="grid grid-cols-[60px_1.6fr_1.2fr_1.3fr_1fr] items-center h-[92px] border-b border-[#eeeeee] bg-white px-5">
      {/* Checkbox */}
      <div className="flex items-center justify-center">
        <Checkbox className="h-[18px] w-[18px] rounded-[4px] border-[#c7c7c7]" />
      </div>

      {/* Job title */}
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-semibold text-black">
          Senior Product Designer
        </span>
        <span className="text-[13px] text-[#6b7280]">
          Full-time • Remote
        </span>
      </div>

      {/* Company */}
      <div className="text-[15px] text-black font-normal">Amazon</div>

      {/* Submitted */}
      <div className="text-[15px] text-[#6b7280] font-normal">2m ago</div>

      {/* Status */}
      <div>
        <span className="inline-flex items-center justify-center px-4 py-[6px] rounded-full bg-[#dcfce7] text-[#15803d] text-[13px] font-medium">
          Completed
        </span>
      </div>
    </div>
  )
}