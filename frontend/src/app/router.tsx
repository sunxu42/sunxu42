import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/app/layout";
import { HomePage } from "@/app/pages/home-page";
import { ToolsPage } from "@/features/tools/pages/tools-page";
import { PresentationToolPage } from "@/features/tools/presentation/pages/presentation-tool-page";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/tools", element: <ToolsPage /> },
      { path: "/tools/presentation", element: <PresentationToolPage /> },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);
