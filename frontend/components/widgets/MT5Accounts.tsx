import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function MT5Accounts() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">MT5 Accounts</h3>

        <Button variant="link" className="text-blue-400 p-0">
          View All
        </Button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-lg border border-slate-800 p-4">
          <p className="font-medium text-white">Real Account</p>

          <p className="text-xs text-slate-400 mt-1">
            Login: 12345678
          </p>

          <Badge className="mt-3 bg-green-600">
            Connected
          </Badge>
        </div>

        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Connect MT5
        </Button>
      </div>
    </div>
  );
}