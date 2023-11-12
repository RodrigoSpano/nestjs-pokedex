import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import { GetRawHeaders, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { EValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute(
    @GetUser() user: User,
    @GetUser('email') email: string,
    @GetRawHeaders() rawHeaders: string[],
  ) {
    return {
      user,
      email,
      rawHeaders,
    };
  }

  @Get('private-roles')
  // @SetMetadata('roles', ['admin', 'super']) //creo un decorador para evitar esto
  @RoleProtected(EValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard) //? todo esto lo metemos dentro de un custom decorator
  privateRoute2(@GetUser() user: User) {
    return user;
  }

  @Get('custom-decorator')
  privateRouteCustomDecoratorAuth(@GetUser() user: User) {
    return user;
  }
}
