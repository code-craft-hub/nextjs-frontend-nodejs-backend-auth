import AreaVariant from "./AreaVariant";
import BarVariant from "./BarVariant";
import { childChartType } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ShadcnChart = ({ chartData }: childChartType) => {
  return (
    <div className="w-full dashCard bg-white border-[1px] p-4 rounded-md 2xl:p-8">
      <Tabs defaultValue="area" className="w-full ">
        <div className="justify-between flex items-center">
          <TabsList className="rounded-lg">
            <TabsTrigger className="p-1 px-2 rounded-md" value="area">
              Area
            </TabsTrigger>
            <TabsTrigger className="p-1 px-2 rounded-md" value="bar">
              Bar
            </TabsTrigger>
          </TabsList>
          <h1 className="font-bold">Daily Stats</h1>
        </div>
        <TabsContent value="area">
          <AreaVariant chartData={chartData} />
        </TabsContent>
        <TabsContent value="bar">
          <BarVariant chartData={chartData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShadcnChart;
