import 'express-session';

declare module 'express-session' {
  interface SessionData {
    /** authenticated user id  */
    userId?: string;
    /** tenant the user belongs to */
    tenantId?: string;
  }
}
