import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/BottomNav";
import { useCart } from "@/hooks/useCart";
import StudentHome from "@/pages/student/Home";
import NexChow from "@/pages/student/NexChow";
import RestaurantDetail from "@/pages/student/RestaurantDetail";
import Checkout from "@/pages/student/Checkout";
import NexDispatch from "@/pages/student/NexDispatch";
import NexTrip from "@/pages/student/NexTrip";
import Wallet from "@/pages/student/Wallet";
import ProfileScreen from "@/pages/student/Profile";
import ChatScreen from "@/pages/student/Chat";
import type { Tables } from "@/integrations/supabase/types";

export default function StudentLayout() {
  const [tab, setTab] = useState("home");
  const [restaurant, setRestaurant] = useState<Tables<"restaurants"> | null>(null);
  const [atCheckout, setAtCheckout] = useState(false);
  const { totalQty } = useCart();

  const renderContent = () => {
    if (tab === "chow") {
      if (atCheckout) return <Checkout onBack={() => setAtCheckout(false)} onDone={() => { setAtCheckout(false); setTab("home"); }} />;
      if (restaurant) return <RestaurantDetail restaurant={restaurant} onBack={() => setRestaurant(null)} onCheckout={() => setAtCheckout(true)} />;
      return <NexChow onSelect={(r) => { setRestaurant(r); }} onCheckout={() => setAtCheckout(true)} />;
    }
    if (tab === "dispatch") return <NexDispatch />;
    if (tab === "trip") return <NexTrip />;
    if (tab === "wallet") return <Wallet />;
    if (tab === "profile") return <ProfileScreen />;
    if (tab === "chat") return <ChatScreen />;
    return <StudentHome setTab={setTab} />;
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      <div className="flex-1 overflow-y-auto pb-20">{renderContent()}</div>
      <BottomNav role="student" tab={tab} setTab={(t) => { setTab(t); setRestaurant(null); setAtCheckout(false); }} cartCount={totalQty} />
    </div>
  );
}
