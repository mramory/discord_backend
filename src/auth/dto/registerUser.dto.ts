import { IsEmail } from "class-validator";


type BirthdayType = {
    day: number
    month: string
    year: number
}

export class RegisterUserDto {
    @IsEmail()
    email: string

    password: string

    name: string

    birthday: BirthdayType

    viewName?: string
}