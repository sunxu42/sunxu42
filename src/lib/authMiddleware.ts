import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

interface UserPayload {
  user_id: string;
  email: string;
  username: string;
}

interface AuthRequest extends NextRequest {
  user?: UserPayload;
}

export const verifyToken = (req: NextRequest): AuthRequest => {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return req as AuthRequest;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as UserPayload;
    return Object.assign(req, { user: decoded });
  } catch (error) {
    console.error("Token verification failed:", error);
    return req as AuthRequest;
  }
};

export const withAuth = (
  handler: (req: AuthRequest) => Promise<NextResponse>
) => {
  return async (req: NextRequest) => {
    const authReq = verifyToken(req);

    if (!authReq.user) {
      return NextResponse.json({ error: "用户未认证" }, { status: 401 });
    }

    return handler(authReq);
  };
};
