import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">App Template Ready</h1>
      <p className="mb-4 text-muted-foreground">
        Vite + React + TypeScript + shadcn/ui frontend and FastAPI backend scaffold is set up.
      </p>
      <div className="flex items-center gap-3">
        <Button>shadcn Button</Button>
        <Button variant="outline">Outline</Button>
      </div>
    </main>
  );
}
