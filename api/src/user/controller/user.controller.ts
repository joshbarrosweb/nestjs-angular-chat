import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateUserDto } from '../model/dto/create-user.dto';
import { LoginUserDto } from '../model/dto/login-user.dto';
import { ILoginResponse } from '../model/login-response.interface';
import { IUser } from '../model/user.interface';
import { UserHelperService } from '../service/user-helper/user-helper.service';
import { UserService } from '../service/user-service/user.service';

@Controller('users')
export class UserController {
  constructor (
    private userService: UserService,
    private userHelperService: UserHelperService
  ) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Observable<IUser> {
    return this.userHelperService.createUserDtoToEntity(createUserDto).pipe(
      switchMap((user: IUser) => this.userService.create(user))
    )
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Observable<Pagination<IUser>> {
    limit = limit > 100 ? 100: limit;
    return this.userService.findAll({page, limit, route: 'http://localhost:3000/api/users'});
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto): Observable<ILoginResponse> {
    return this.userHelperService.loginUserDtoToEntity(loginUserDto).pipe(
      switchMap((user: IUser) => this.userService.login(user).pipe(
        map((jwt: string) => {
          return {
            access_token: jwt,
            token_type: 'JWT',
            expires_in: 10000
          }
        })
      ))
    )
  }
}
