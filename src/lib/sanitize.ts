// HTML/Script sanitizer - strips all HTML tags
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return input;
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Strip all HTML tags (for storage)
export function stripHtml(input: string): string {
  if (!input || typeof input !== "string") return input;
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .trim();
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "كلمة المرور يجب أن تحتوي على رقم واحد على الأقل" };
  }
  return { valid: true, message: "" };
}

// Sanitize object values (recursive)
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key of Object.keys(sanitized)) {
    const value = sanitized[key];
    if (typeof value === "string") {
      (sanitized as Record<string, unknown>)[key] = stripHtml(value);
    }
  }
  return sanitized;
}
