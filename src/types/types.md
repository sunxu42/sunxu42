┌─────────────────────────────┐
│ Prisma Schema（数据库模型） │
└─────────────────┬───────────┘
↓
┌─────────────────────────────┐
│ 生成Zod Schema │
│ UserCreateInputObjectZodSchema │
│ UserProfileCreateInputObjectZodSchema │
└─────────────────┬───────────┘
↓
┌─────────────────────────────┐
│ 基础类型（common.ts） │
│ ├─ UserCoreSchema（数据库层） │
│ ├─ UserProfileCoreSchema │
│ ├─ FullUserSchema │
│ ├─ ApiUserSchema（API层） │
│ └─ FrontendUserSchema（前端层） │
└─────────────────┬───────────┘
↓
┌─────────────────────────────┐
│ 业务类型（user-schemas.ts） │
│ ├─ user-schemas.ts │
│ └─ auth-schemas.ts │
└─────────────────┬───────────┘
↓
┌─────────────────────────────┐
│ 业务使用 │
│ ├─ 状态管理（auth.ts） │
│ ├─ API路由（profile/route.ts）│
│ └─ 其他业务代码 │
└─────────────────────────────┘
