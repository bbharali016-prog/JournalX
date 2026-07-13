import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationButton() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-slate-300 hover:bg-slate-800"
    >
      <Bell size={20} />
    </Button>
  );
}