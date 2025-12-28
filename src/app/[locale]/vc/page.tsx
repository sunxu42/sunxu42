"use client";

import VCAboutMe from "./components/VCAboutMe";
import VCContactMe from "./components/VCContactMe";
import VCHeader from "./components/VCHeader";
import VCHome from "./components/VCHome";
import VCProjects from "./components/VCProjects";

export default function VC() {
  return (
    <div className="w-full bg-background text-foreground">
      <VCHeader />
      <main className="relative m-h-screen">
        <VCHome />
        <VCAboutMe />
        <VCProjects />
        <VCContactMe />
      </main>
    </div>
  );
}
