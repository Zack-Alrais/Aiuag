#!/bin/bash
# Test every page route with curl; report non-200 (following redirects like a browser)
BASE="http://localhost:3100"
ROUTES=(
  "/ar" "/en"
  "/ar/about" "/ar/about/history" "/ar/about/mission" "/ar/about/objectives" "/ar/about/vision"
  "/ar/cards" "/ar/contact" "/ar/donations" "/ar/donations/success" "/ar/donations/cancel"
  "/ar/events" "/ar/faq" "/ar/graduate/claim"
  "/ar/media" "/ar/media/gallery" "/ar/media/posts" "/ar/media/publications" "/ar/media/reports" "/ar/media/videos"
  "/ar/membership" "/ar/membership/apply" "/ar/membership/benefits" "/ar/membership/manage"
  "/ar/news" "/ar/news/1"
  "/ar/organization" "/ar/organization/board" "/ar/organization/branches" "/ar/organization/committees" "/ar/organization/secretariat"
  "/ar/partners" "/ar/posts" "/ar/privacy" "/ar/profile" "/ar/projects" "/ar/publications"
  "/ar/resources" "/ar/services" "/ar/support" "/ar/terms" "/ar/verify" "/ar/volunteer"
  "/ar/dashboard"
  "/en/about" "/en/membership/apply" "/en/news"
  "/auth/login" "/auth/register" "/auth/forgot-password" "/auth/reset-password" "/auth/verify" "/auth/error"
  "/ar/login" "/ar/auth/login"
  "/sitemap.xml" "/robots.txt"
)
for r in "${ROUTES[@]}"; do
  # -L follows redirects, get final status
  code=$(curl -s -L -o /dev/null -w "%{http_code}" "$BASE$r")
  [ "$code" != "200" ] && echo "FAIL $code  $r" || echo "OK   $code  $r"
done
