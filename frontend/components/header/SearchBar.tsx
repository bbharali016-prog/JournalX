import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  return (
    <div className="relative w-80">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        size={18}
      />

      <Input
        placeholder="Search trades..."
        className="pl-10 bg-slate-900 border-slate-800 text-white"
      />
    </div>
  );
}