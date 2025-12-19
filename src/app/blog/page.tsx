import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogPage() {
  const t = useTranslations();
  // 示例博客文章数据
  const posts = [
    {
      id: 1,
      title: "Next.js 16 新特性详解",
      summary: "探索 Next.js 16 的最新功能，包括 Turbopack、App Router 改进等。",
      date: "2024-12-15",
    },
    {
      id: 2,
      title: "Tailwind CSS 4.0 自定义主题指南",
      summary: "学习如何在 Tailwind CSS 4.0 中创建和管理自定义主题。",
      date: "2024-12-10",
    },
    {
      id: 3,
      title: "Zustand 状态管理最佳实践",
      summary: "掌握 Zustand 的高级用法和性能优化技巧。",
      date: "2024-12-05",
    },
  ];

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="min-w-[280px] md:min-w-[600px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t("blog.title")}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map(post => (
            <Card key={post.id} className="hover:shadow-md cursor-pointer">
              <CardHeader>
                <CardTitle className="text-xl">{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{post.date}</p>
              </CardHeader>
              <CardContent>
                <p>{post.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
