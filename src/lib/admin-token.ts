const SECRET = process.env.ADMIN_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "aiuag-admin-fallback-secret-change-me";

interface AdminTokenPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  exp: number;
  iat: number;
}

function base64urlEncode(input: string): string {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(input: string): string {
  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return atob(str);
}

async function hmacSign(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64urlEncode(new TextDecoder().decode(signature));
}

export async function signAdminToken(payload: Omit<AdminTokenPayload, "exp" | "iat">): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const token: AdminTokenPayload = {
    ...payload,
    iat: now,
    exp: now + 60 * 60 * 24, // 24 hours
  };
  const data = JSON.stringify(token);
  const signature = await hmacSign(data);
  return base64urlEncode(data) + "." + signature;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const [dataB64, signature] = token.split(".");
    if (!dataB64 || !signature) return null;
    const data = base64urlDecode(dataB64);
    const expectedSig = await hmacSign(data);
    if (signature !== expectedSig) return null;
    const payload: AdminTokenPayload = JSON.parse(data);
    if (!payload.id || !payload.email || !payload.role) return null;
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
