// app/docs/page.tsx
"use client";

import "swagger-ui-dist/swagger-ui.css";
import SwaggerUI from "swagger-ui-react";

export default function DocsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">T3 Stack API 文档</h1>
      <SwaggerUI
        url="/api/openapi" // 加载我们生成的 OpenAPI 规范
        docExpansion="full"
        persistAuthorization
      />
    </div>
  );
}
