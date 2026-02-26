import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import AdminApp from "./AdminApp";

export default function AdminLayout() {
  const [tab, setTab] = useState("adashboard");
  return (
    <div className="h-full flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto pb-20">
        <AdminApp tab={tab} />
      </div>
      <BottomNav role="admin" tab={tab} setTab={setTab} />
    </div>
  );
}
