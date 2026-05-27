import { Link } from "react-router-dom";
import { tools } from "@/features/tools/tools-registry";

export function ToolsPage() {
  return (
    <main className="container py-10">
      <h1 className="mb-2 text-3xl font-bold">Tools</h1>
      <p className="mb-8 text-muted-foreground">
        A collection of utilities. Select a tool to get started.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <li key={tool.id}>
            <Link
              to={tool.path}
              className="block rounded-lg border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:bg-accent/50"
            >
              <h2 className="text-lg font-semibold">{tool.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{tool.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
