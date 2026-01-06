import { StreamStatus } from '@/types'

const GenerationStatus = ({streamStatus}: {streamStatus: StreamStatus}) => {
  return (
   <div className="mb-4 p-3 rounded-lg border">
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`w-2 h-2 rounded-full ${
              streamStatus.isConnected
                ? "bg-green-500"
                : streamStatus.isComplete
                ? "bg-blue-500"
                : "bg-gray-400"
            }`}
          ></span>
          <span>
            {streamStatus.isConnected
              ? "Generating resume..."
              : streamStatus.isComplete
              ? "Resume generated!"
              : "Ready to generate"}
          </span>
          {streamStatus.completedSections.size > 0 && (
            <span className="">
              ({streamStatus.completedSections.size}/7 sections complete)
            </span>
          )}
        </div>
        {streamStatus.error && (
          <div className="mt-2 text-red-600 text-sm">
            Error: {streamStatus.error}
          </div>
        )}
      </div>
  )
}

export default GenerationStatus
