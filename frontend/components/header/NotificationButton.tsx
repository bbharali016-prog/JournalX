import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative border border-white/10 text-slate-300 hover:bg-white/5"
    >
      <Bell size={20} />
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet-500" />
    </Button>
  );
}
