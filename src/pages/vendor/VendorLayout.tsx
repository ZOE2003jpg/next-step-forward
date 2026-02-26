import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import VendorApp from "./VendorApp";

export default function VendorLayout() {
  const [tab, setTab] = useState("dashboard");
  return (
    <div className="h-full flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <VendorApp tab={tab} />
      </div>
      <BottomNav role="vendor" tab={tab} setTab={setTab} />
    </div>
  );
}
