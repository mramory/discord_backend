
export class CreateChannelDto {
    serverId: string
    
    name: string

    type: ChannelType
}

enum ChannelType {
    TEXT = "TEXT",
    VOICE = "VOICE"
}