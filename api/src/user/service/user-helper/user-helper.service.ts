import { Injectable } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { IUser } from 'src/user/model/user.interface';
import { LoginUserDto } from 'src/user/model/dto/login-user.dto';
import { CreateUserDto } from 'src/user/model/dto/create-user.dto';

@Injectable()
export class UserHelperService {
  createUserDtoToEntity(createUserDto: CreateUserDto): Observable<IUser> {
    return of({
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password
    });
  }

  loginUserDtoToEntity(loginUserDto: LoginUserDto): Observable<IUser> {
    return of({
      email: loginUserDto.email,
      password: loginUserDto.password
    });
  }
}
