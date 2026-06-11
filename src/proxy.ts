import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/login", "/register"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isProjectsList = nextUrl.pathname === "/projects";
  const isPublic = publicRoutes.includes(nextUrl.pathname) || isProjectsList;

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
