import { User } from "@prisma/client";
import { ArrayNotEmpty } from "class-validator";


export class CreateGroupConversationDto {
    @ArrayNotEmpty()
    users: User[]
    
    serverId: string
    
    name: string

    img: string
}