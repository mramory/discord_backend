import { IsEmail } from "class-validator";

export class FindOneUserByEmail {
    @IsEmail()
    email: string
}

export class FindOneUserById {
    id: number
}
