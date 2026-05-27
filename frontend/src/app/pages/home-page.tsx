import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomePage() {
  return (
    <main className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">App Template Ready</h1>
      <p className="mb-4 text-muted-foreground">
        Vite + React + TypeScript + shadcn/ui frontend and FastAPI backend scaffold is set up.
      </p>
      <Link to="/tools" className={cn(buttonVariants())}>
        Open Tools
      </Link>
    </main>
  );
}
