import { LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/authClient";

type Props = { user: { name: string; email: string; image?: string | null } };

/** Signed-in header control: avatar with a small menu. */
export function AccountMenu({ user }: Props) {
  const label = user.name || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`Account: ${label}`} className="rounded-2xl bg-card">
          <Avatar className="size-[30px] rounded-[10px]">
            {user.image && <AvatarImage src={user.image} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback className="rounded-[10px] bg-primary text-sm font-extrabold text-primary-foreground">{label.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          {user.name && <span className="truncate text-sm font-semibold">{user.name}</span>}
          <span className="truncate text-xs text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void authClient.signOut()} className="min-h-11 rounded-xl text-sm">
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
