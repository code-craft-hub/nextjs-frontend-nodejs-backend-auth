import {
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { childChartType } from "@/types";
import { format, isValid } from "date-fns";
import { Separator } from "@/components/ui/separator";
const BarVariant = ({ chartData }: childChartType) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active) return null;
    const resume = {
      name: payload[0]?.name,
      dayName:
        isValid(new Date(payload[0]?.payload?.selectedDay)) &&
        format(new Date(payload[0]?.payload?.selectedDay), "EEEE"),
      value: payload[0]?.value,
    };
    const question = {
      name: payload[1]?.name,
      dayName:
        isValid(new Date(payload[1]?.payload?.selectedDay)) &&
        format(new Date(payload[1]?.payload?.selectedDay), "EEEE"),
      value: payload[1]?.value,
    };
    const letter = {
      name: payload[2]?.name,
      dayName:
        isValid(new Date(payload[2]?.payload?.selectedDay)) &&
        format(new Date(payload[2]?.payload?.selectedDay), "EEEE"),
      value: payload[2]?.value,
    };
    return (
      <div className="rounded-lg bg-white shadow-sm border overflow-hidden">
         <div className="text-sm p-2 px-3 bg-muted text-muted-foreground font-bold uppercase flex justify-between items-center ">
          {resume?.dayName ? resume?.dayName : "No Activity"}
          <div className="flex gap-1">
          <div className="size-1.5 bg-[#F0811A] rounded-full" />
          <div className="size-1.5 bg-[#4680EE] rounded-full" />
          <div className="size-1.5 bg-[#388B12] rounded-full" />

          </div>
        </div>
        <Separator />
        <div className="p-2 ">
          <div className="flex flex-col p-2  justify-between gap-2">
            <div className="flex  items-center gap-x-2">
              <div className="size-1.5 bg-[#F0811A] rounded-full" />
              <p className="text-sm text-muted-foreground">{resume?.name}</p>
              <p className="text-sm text-right font-medium">{resume?.value}</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="size-1.5 bg-[#4680EE] rounded-full" />
              <p className="text-sm text-muted-foreground">{question?.name}</p>
              <p className="text-sm text-right font-medium">
                {question?.value}
              </p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="size-1.5 bg-[#388B12] rounded-full" />
              <p className="text-sm text-muted-foreground">{letter?.name}</p>
              <p className="text-sm text-right font-medium">{letter?.value}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart margin={{ left: 20, top: 20 }} data={chartData}>
        <CartesianGrid strokeDasharray="" horizontal={false} stroke="#f0f0f0" />
        <defs>
          <linearGradient id="letter" x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
            <stop offset={"2%"} stopColor="#388B12" stopOpacity={0.8} />
            <stop offset={"98%"} stopColor="#388B12" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resume" x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
            <stop offset={"2%"} stopColor="#4680EE" stopOpacity={0.8} />
            <stop offset={"98%"} stopColor="#4680EE" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="question" x1={"0"} y1={"0"} x2={"0"} y2={"1"}>
            <stop offset={"2%"} stopColor="#F0811A" stopOpacity={0.8} />
            <stop offset={"98%"} stopColor="#F0811A" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={<CustomTooltip />}
        />
        <Legend wrapperStyle={{ paddingTop: "30px", fontSize: "14px" }} />
        <XAxis
          axisLine={true}
          tickLine={true}
          tick={{ fill: "#d1d5db" }}
          dataKey="name"
          tickFormatter={(value) => value}
          tickMargin={16}
        />
        <Bar
          name="Interview Question"
          type={"monotone"}
          dataKey={"question"}
          stackId={"question"}
          strokeWidth={2}
          stroke="#F0811A"
          fill="url(#question)"
          className="drop-shadow-sm"
          legendType="wye"
          radius={[10, 10, 0, 0]}
        />
        <Bar
          name="Resume"
          type={"monotone"}
          dataKey={"resume"}
          stackId={"resume"}
          strokeWidth={2}
          stroke="#4680EE"
          fill="url(#resume)"
          className="drop-shadow-sm"
          legendType="wye"
          radius={[10, 10, 0, 0]}
        />
        <Bar
          name="Cover Letter"
          type={"monotone"}
          dataKey={"letter"}
          stackId={"letter"}
          strokeWidth={2}
          stroke="#388B12"
          fill="url(#letter)"
          className="drop-shadow-sm"
          legendType="wye"
          radius={[10, 10, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BarVariant;
