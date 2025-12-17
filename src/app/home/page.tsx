import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-2xl font-bold">home</div>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/about" className="w-full sm:w-auto">
          <Button variant="default" size="lg" className="cursor-pointer w-full">
            关于我们
          </Button>
        </Link>
        <Link href="/blog" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="cursor-pointer w-full">
            博客
          </Button>
        </Link>
      </div>
    </div>
  );
}