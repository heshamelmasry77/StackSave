import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type Props = {
  title: string;
  /** Small line above the title. */
  eyebrow?: string;
  /** Extra context for screen readers. Without it the sheet is announced by its title alone. */
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

/**
 * The app's one sheet: a bottom drawer on phones (swipe down to close), a dialog on larger screens.
 * The header stays put; the body scrolls, and nothing in it is squeezed when content overflows.
 */
export function AppSheet({ title, eyebrow, description, onClose, children }: Props) {
  const desktop = useMediaQuery("(min-width: 640px)");
  const onOpenChange = (open: boolean) => !open && onClose();

  const header = (Title: typeof DialogTitle | typeof DrawerTitle, Description: typeof DialogDescription | typeof DrawerDescription) => (
    <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-4">
      <div className="flex flex-col gap-1.5 text-left">
        {eyebrow && <span className="text-xs font-bold uppercase tracking-widest text-primary">{eyebrow}</span>}
        <Title className="text-xl font-extrabold tracking-tight">{title}</Title>
        {description && <Description className="sr-only">{description}</Description>}
      </div>
      <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close" className="-mr-2 text-muted-foreground">
        <XIcon className="size-5" />
      </Button>
    </div>
  );
  const body = <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-1 *:shrink-0">{children}</div>;

  if (desktop) {
    return (
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} {...(description ? {} : { "aria-describedby": undefined })} className="flex max-h-[85dvh] flex-col gap-3 rounded-[28px] border-border bg-card p-0 sm:max-w-md">
          {header(DialogTitle, DialogDescription)}
          {body}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open onOpenChange={onOpenChange}>
      <DrawerContent {...(description ? {} : { "aria-describedby": undefined })} className="max-h-[90dvh] gap-3 rounded-t-[28px] border-border bg-card data-[vaul-drawer-direction=bottom]:max-h-[90dvh] data-[vaul-drawer-direction=bottom]:rounded-t-[28px]">
        {header(DrawerTitle, DrawerDescription)}
        {body}
      </DrawerContent>
    </Drawer>
  );
}
