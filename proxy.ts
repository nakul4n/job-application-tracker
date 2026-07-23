export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/applications/:path*",
    "/contacts/:path*",
    "/follow-ups/:path*",
    "/interviews/:path*",
    "/resumes/:path*",
    "/analytics/:path*",
    "/settings/:path*",
  ],
};
