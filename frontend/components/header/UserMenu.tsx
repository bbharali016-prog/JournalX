import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

export default function UserMenu() {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarFallback>BB</AvatarFallback>
      </Avatar>

      <div>
        <p className="text-white font-medium">
          Bitupan
        </p>

        <p className="text-xs text-slate-400">
          Free Plan
        </p>
      </div>
    </div>
  );
}