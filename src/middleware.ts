import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales,
 
  // Used when no locale matches
  defaultLocale: 'en',

  // Only run middleware on paths that need localization
  localePrefix: 'as-needed'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',

    // Set a cookie to remember the previous locale for
    // all other pages (also enables locale detection)
    '/(th|en)/:path*'
  ]
};