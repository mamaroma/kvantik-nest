import { AuthenticatedUser } from "../auth/auth.interfaces";

declare global {
    namespace Express {
        interface Request {
            authUser?: AuthenticatedUser;
        }

        interface Response {
            locals: {
                authUser?: AuthenticatedUser;
                session?:
                    | { isAuthed: false }
                    | { isAuthed: true; user: string; email: string; role: string; userId: string };
            };
        }
    }
}

export {};
