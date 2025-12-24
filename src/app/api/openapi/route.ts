import { NextRequest, NextResponse } from "next/server";
import swaggerUiDist from "swagger-ui-dist";

// OpenAPI 3.0 Specification
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "sunxu42 API",
    version: "1.0.0",
    description: "sunxu42项目的API文档",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "开发服务器",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "使用JWT令牌进行认证",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          user_id: {
            type: "string",
            example: "123e4567-e89b-12d3-a456-426614174000",
          },
          username: {
            type: "string",
            example: "user123",
          },
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          nickname: {
            type: "string",
            example: "用户123",
          },
          avatar_url: {
            type: "string",
            format: "uri",
            nullable: true,
            example: "https://example.com/avatar.jpg",
          },
          phone: {
            type: "string",
            nullable: true,
            example: "13800138000",
          },
          gender: {
            type: "string",
            nullable: true,
            enum: ["male", "female", "other"],
          },
          bio: {
            type: "string",
            nullable: true,
            example: "这是用户简介",
          },
        },
        required: ["user_id", "username", "email"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "user@example.com",
          },
          password: {
            type: "string",
            example: "password123",
          },
        },
        required: ["email", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: true,
          },
          message: {
            type: "string",
            example: "登录成功",
          },
          user: {
            $ref: "#/components/schemas/User",
          },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "string",
            example: "服务器内部错误",
          },
          details: {
            type: "string",
            nullable: true,
            example: "详细错误信息",
          },
          code: {
            type: "string",
            nullable: true,
            example: "INTERNAL_SERVER_ERROR",
          },
        },
        required: ["error"],
      },
      ProfileUpdateRequest: {
        type: "object",
        properties: {
          username: {
            type: "string",
            example: "newusername",
          },
          nickname: {
            type: "string",
            example: "新昵称",
          },
          avatar_url: {
            type: "string",
            format: "uri",
            example: "https://example.com/newavatar.jpg",
          },
          phone: {
            type: "string",
            example: "13900139000",
          },
          gender: {
            type: "string",
            enum: ["male", "female", "other"],
          },
          bio: {
            type: "string",
            example: "新的用户简介",
          },
        },
      },
    },
  },
  paths: {
    "/login": {
      post: {
        summary: "用户登录",
        description: "用户登录或注册新用户",
        tags: ["认证"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "登录成功",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },
          "201": {
            description: "用户创建成功并登录",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginResponse",
                },
              },
            },
          },
          "400": {
            description: "请求数据验证失败",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "密码错误",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "服务器内部错误",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/refresh-token": {
      post: {
        summary: "刷新访问令牌",
        description: "使用刷新令牌获取新的访问令牌",
        tags: ["认证"],
        responses: {
          "200": {
            description: "令牌刷新成功",
          },
          "401": {
            description: "刷新令牌无效",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "服务器内部错误",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/profile": {
      get: {
        summary: "获取用户资料",
        description: "获取当前登录用户的个人资料",
        tags: ["用户"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        responses: {
          "200": {
            description: "获取成功",
            content: {
              "application/json": {
                schema: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  user: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
          "401": {
            description: "未认证",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "服务器内部错误",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      put: {
        summary: "更新用户资料",
        description: "更新当前登录用户的个人资料",
        tags: ["用户"],
        security: [
          {
            BearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ProfileUpdateRequest",
              },
            },
          },
        },
        responses: {
          "200": {
            description: "更新成功",
            content: {
              "application/json": {
                schema: {
                  success: {
                    type: "boolean",
                    example: true,
                  },
                  user: {
                    $ref: "#/components/schemas/User",
                  },
                },
              },
            },
          },
          "400": {
            description: "请求数据验证失败",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "401": {
            description: "未认证",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          "500": {
            description: "服务器内部错误",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
  },
};

// Handle GET request to return OpenAPI spec in JSON
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const format = url.searchParams.get("format");

  // If format is 'json', return raw JSON spec
  if (format === "json") {
    return NextResponse.json(openApiSpec);
  }

  // Otherwise, return Swagger UI HTML
  const swaggerHtml = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>sunxu42 API文档</title>
      <link rel="stylesheet" type="text/css" href="${swaggerUiDist.getAbsoluteFSPath()}">
      <script src="${swaggerUiDist.getAbsoluteFSPath()}"></script>
      <script src="${swaggerUiDist.getAbsoluteFSPath()}"></script>
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script>
        window.onload = function() {
          SwaggerUIBundle({
            spec: ${JSON.stringify(openApiSpec)},
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout"
          });
        };
      </script>
    </body>
    </html>
  `;

  return new NextResponse(swaggerHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

// Handle POST request for RPC (not implemented yet)
export async function POST(req: NextRequest) {
  return NextResponse.json({ error: "RPC功能尚未实现" }, { status: 501 });
}
