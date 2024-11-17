import { Charts } from "@/components/charts";
import Chatbot from "@/components/chatbot";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen p-8 pb-20 gap-4 grid grid-rows-2">
      <div className="w-full min-h-full">
        <Card className="w-full min-h-full bg-white">
          <CardHeader>
            <h2 className="text-3xl font-bold">Summary</h2>
          </CardHeader>
          <CardContent>
            <Charts />
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 items-center justify-items-center">
        <Chatbot />
      </div>
    </div>
  );
}
