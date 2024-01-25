import { Injectable } from '@nestjs/common';
import * as fs from "fs"
import { UploadApiErrorResponse, UploadApiResponse, v2 } from 'cloudinary';


@Injectable()
export class CloudinaryService {
    async uploadImage(
        file: string,
    ) {

        return v2.uploader.upload(file);
    }
}