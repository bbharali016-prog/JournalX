import SearchBar from "./SearchBar";
import NotificationButton from "./NotificationButton";
import UserMenu from "./UserMenu";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-6">
      <SearchBar />

      <div className="flex items-center gap-4">
        <Button>Upgrade Pro</Button>

        <NotificationButton />

        <UserMenu />
      </div>
    </header>
  );
}