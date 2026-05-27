import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PresentationToolPage() {
  return (
    <main className="container py-10">
      <div className="mb-6">
        <Link
          to="/tools"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          ← Back to Tools
        </Link>
      </div>
      <h1 className="mb-2 text-3xl font-bold">Presentation</h1>
      <p className="text-muted-foreground">
        Presentation tool workspace. Build your slides and export here.
      </p>
    </main>
  );
}
