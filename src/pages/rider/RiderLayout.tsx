import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import RiderApp from "./RiderApp";

export default function RiderLayout() {
  const [tab, setTab] = useState("rdashboard");
  return (
    <div className="h-full flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <RiderApp tab={tab} />
      </div>
      <BottomNav role="rider" tab={tab} setTab={setTab} />
    </div>
  );
}
