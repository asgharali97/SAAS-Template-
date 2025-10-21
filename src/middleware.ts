import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/clerk-sdk-node";

const publicRoutes = createRouteMatcher(["/", "api/webhook/register", "/sign-in", "/sign-up"]);

// export default clerkMiddleware(async (authFn, req) => {
//   const {userId} = await authFn()
//     if (!userId && !publicRoutes(req)) {
//       return NextResponse.redirect(new URL("/sign-in", req.url));
//     }

//     if (userId) {
//       try {
//         console.log(userId)
//         const user = await clerkClient.users.getUser(userId);
//         const role = user.publicMetadata.role as string | undefined;

//         if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
//           return NextResponse.redirect(new URL("/admin/dashboard"), req.url);
//         }

//         if (role !== "admin" && req.nextUrl.pathname.startWith("/admin")) {
//           return NextResponse.redirect(new URL("/dasborad"), req.url);
//         }

//         if (publicRoutes(req)) {
//           return NextResponse.redirect(
//             role === "admin" ? "admin/dashboard" : "/dashboard",
//             req.url
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching user data from Clerk:", error);
//         return NextResponse.redirect(new URL("/error", req.url));
//       }
//     }
//   });



export default clerkMiddleware(async (authFn, req) => {
  const { userId } = await authFn();
  if (!userId && !publicRoutes(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  if (userId) {
    try {
      const CLERK_API_KEY = process.env.CLERK_API_KEY;
      if (!CLERK_API_KEY) {
        console.error("CLERK_API_KEY is not set. Set your Clerk backend API key in env.");
        return NextResponse.redirect(new URL("/error", req.url));
      }
      
      const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${CLERK_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        console.error("Clerk user fetch failed:", await res.text());
        return NextResponse.redirect(new URL("/error", req.url));
      }

      const user = await res.json();
      // REST returns public_metadata (snake_case)
      const role = (user?.public_metadata?.role) as string | undefined;

      if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }

      if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (publicRoutes(req)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        );
      }
    } catch (error) {
      console.error("Error fetching user data from Clerk:", error);
      return NextResponse.redirect(new URL("/error", req.url));
    }
  }
});


export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}