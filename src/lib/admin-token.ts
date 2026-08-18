import { SignJWT, jwtVerify } from "jose";

const SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "aiuag-admin-fallback-secret-change-me";
const secretKey = new TextEncoder().encode(SECRET);

interface AdminTokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, "exp" | "iat">): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.id || !payload.email || !payload.role) return null;
    return payload as unknown as AdminTokenPayload;
  } catch {
    return null;
  }
}