import { Request } from 'express';

export type Session =
    | { isAuthed: false }
    | { isAuthed: true; user: string; email: string; role: string; userId: string };

export function sessionFromRequest(req: Request): Session {
    return req.authUser
        ? {
              isAuthed: true,
              user: req.authUser.name,
              email: req.authUser.email,
              role: req.authUser.role,
              userId: req.authUser.id,
          }
        : { isAuthed: false };
}
