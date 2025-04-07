import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FindOneUserByEmail, FindOneUserById } from './dto/findOneUser.dto';
import { UserReturn } from './dto/user-return.object';
import { Request } from 'express';
import { Prisma, User } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
        private cloudinary: CloudinaryService 
    ) {}

    async findOneByEmail(dto: FindOneUserByEmail) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if(!user) return null
        return user
    }

    async findOneById(dto: FindOneUserById) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: dto.id
            },
            select: UserReturn
        })
        if(!user) return null
        return user
    }

    async getAll(req: Request){
        const currentUser = req.user as User
        const users = await this.prisma.$queryRaw(Prisma.sql`
            SELECT * 
            FROM "User" 
            WHERE "User"."email" != ${currentUser.email};
        `);
        if(!users) throw new HttpException("Users Not Found", HttpStatus.NOT_FOUND)
        
        return users
    }

    async change(dto: {newName: string, img: string}, req: Request) {
        const currentUser = req.user as User
        if(!currentUser) throw new HttpException("User Not Found", HttpStatus.BAD_REQUEST)

        let cloudImage = null
        if(dto.img){
            cloudImage = await this.cloudinary.uploadImage(dto.img)
        }

        const newUser = this.prisma.user.update({
            where: {
                id: currentUser.id
            },
            data: {
                name: dto.newName,
                img: cloudImage?.url
            }
        })
        console.log(newUser)
        return newUser
    }
}
