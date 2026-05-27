import { Link, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-sm font-medium text-muted-foreground transition-colors hover:text-foreground";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex h-14 items-center gap-6">
          <Link to="/" className="text-sm font-semibold">
            App
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className={cn(navLinkClass)}>
              Home
            </Link>
            <Link to="/tools" className={cn(navLinkClass)}>
              Tools
            </Link>
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
