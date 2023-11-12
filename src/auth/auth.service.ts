import { User } from './entities/user.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto } from './dto';
import { IJwtPayload } from './interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const newUser: User = await this.userModel.create({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
      });
      const { fullname, email, roles } = newUser;
      return {
        email,
        fullname,
        roles,
        token: this.generateJwtToken({ id: newUser._id }),
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.userModel
        .findOne({ email: loginUserDto.email })
        .select({ email: true, password: true, fullname: true });

      if (!user) throw new UnauthorizedException('Invalid credentials');

      const isMatch: boolean = bcrypt.compareSync(
        loginUserDto.password,
        user.password,
      );
      if (!isMatch) throw new UnauthorizedException('Invalid credentials');
      const { email, fullname, roles } = user;
      return {
        email,
        fullname,
        roles,
        token: this.generateJwtToken({ id: user._id }),
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  private generateJwtToken(payload: IJwtPayload): string {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDbExceptions(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException(
        `email already exists - ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException('please check sv logs');
  }
}
