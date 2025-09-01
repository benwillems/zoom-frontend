import { getSession } from '@auth0/nextjs-auth0/edge'
import { NextResponse } from 'next/server'

// Define public routes that should skip authentication
const publicPaths = ['/leads']

function isPublicPath(path) {
  return publicPaths.some(
    publicPath => path.startsWith(publicPath) || path === publicPath
  )
}

// Create a custom middleware handler without using withMiddlewareAuthRequired
export async function middleware(request) {
  // Get the path from the request URL
  const path = request.nextUrl.pathname

  // If the path is public, skip authentication
  if (isPublicPath(path)) {
    return NextResponse.next()
  }

  const requestHeaders = new Headers(request.headers)

  try {
    const user = await getSession(
      request,
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    )

    if (
      !user ||
      (user &&
        user.accessTokenExpiresAt &&
        user.accessTokenExpiresAt <= Math.floor(Date.now() / 1000))
    ) {
      const loginUrl = `${process.env.FE_URL}/api/auth/login`
      return NextResponse.redirect(loginUrl)
    }

    requestHeaders.set('Authorization', `Bearer ${user.accessToken}`)
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Handle any errors that occur during authentication
    console.error('Authentication error:', error)
    const loginUrl = `${process.env.FE_URL}/api/auth/login`
    return NextResponse.redirect(loginUrl)
  }
}

// Configure which paths the middleware should run on
// https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth/* (Auth0 authentication endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
