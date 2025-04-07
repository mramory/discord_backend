type RestorePassType = {
    email: string
    pass: string
}

export class RestorePassDto {
    pass: string

    email: string

    code: string
}