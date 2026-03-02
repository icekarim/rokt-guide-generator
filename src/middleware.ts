export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /login
     * - /api/auth (NextAuth routes)
     * - /_next (Next.js internals)
     * - /favicon.ico, /rokt-logo-black.png, and other static files
     */
    "/((?!login|api/auth|_next/static|_next/image|favicon\\.ico|.*\\.png$).*)",
  ],
};
