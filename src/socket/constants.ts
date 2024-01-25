import { Injectable } from "@nestjs/common";

@Injectable()
export class ACTIONS {
    static JOIN = 'join'
    static LEAVE = 'leave'
    static SHARE_ROOMS = 'share-rooms'
    static ADD_PEER = 'add-peer'
    static REMOVE_PEER = 'remove-peer'
    static RELAY_SDP = 'relay-sdp'
    static RELAY_ICE = 'relay-ice'
    static ICE_CANDIDATE = 'ice-candidate'
    static SESSION_DESCRIPTION = 'session-description'
};
