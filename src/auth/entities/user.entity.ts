import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({
    required: true,
    unique: true,
    index: true,
    set: (value: string) => value.toLowerCase().trim(),
  })
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Prop({ required: true, select: false })
  password: string;

  @IsString()
  @MinLength(4)
  @Prop({ required: true, index: true })
  fullname: string;

  @IsBoolean()
  @Prop({ default: true })
  isActive: boolean;

  @IsArray()
  @Prop({ default: ['user'] })
  roles: string[];
}
export const UserSchema = SchemaFactory.createForClass(User);
