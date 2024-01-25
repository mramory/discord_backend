import { Role } from "@prisma/client";

export interface JwtPayload {
    id: number,
    email: string,
    name: string,
    viewName: string,
    role: Role,
    img: string
}