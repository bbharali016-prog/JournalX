import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: StatCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800 hover:border-blue-500 transition-all">
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>

          <h2 className="text-3xl font-bold text-white mt-2">
            {value}
          </h2>

          {change && (
            <p className="text-green-400 text-sm mt-2">
              {change}
            </p>
          )}
        </div>

        <div className="bg-blue-500/20 p-4 rounded-xl">
          <Icon className="text-blue-500" size={28} />
        </div>
      </CardContent>
    </Card>
  );
}