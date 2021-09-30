import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable } from 'rxjs';
import { UserEntity } from 'src/user/model/user.entity';
import { IUser } from 'src/user/model/user.interface';
import { Repository } from 'typeorm';
import { map, switchMap } from 'rxjs/operators';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { AuthService } from 'src/auth/service/auth.service';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService
  ) {}

  create(newUser: IUser): Observable<IUser> {
    return this.mailExists(newUser.email).pipe(
      switchMap((exists: boolean) => {
        if(!exists) {
          return this.hashPassword(newUser.password).pipe(
            switchMap((passwordHash: string) => {

              newUser.password = passwordHash;
              return from(this.userRepository.save(newUser)).pipe(
                switchMap((user: IUser) => this.findOne(user.id))
              );
          })
          )
        } else {
          throw new HttpException('Email is already in use', HttpStatus.CONFLICT);
        }
      })
    )
  }

  login(user: IUser): Observable<string> {
    return this.findByEmail(user.email).pipe(
      switchMap((foundUser: IUser) => {
        if (foundUser) {
          return this.validatePassword(user.password, foundUser.password).pipe(
            switchMap((matches: boolean) => {
              if (matches) {
                return this.findOne(foundUser.id).pipe(
                switchMap((payload: IUser) => this.authService.generateJwt(payload)))
              } else {
                throw new HttpException('Login was not successfully, wrong credentials', HttpStatus.UNAUTHORIZED);
              }
            })
          )
        } else {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
      })
    )
  }

  findAll(options: IPaginationOptions): Observable<Pagination<IUser>> {
    return from(paginate<UserEntity>(this.userRepository, options));
  }

  private findByEmail(email: string): Observable<IUser> {
    return from(this.userRepository.findOne({email}, {select: ['id', 'email', 'username', 'password']}));
  }

  private hashPassword(password: string): Observable<String> {
    return this.authService.hashPassword(password);
  }

  private validatePassword(password: string, storedPasswordHash: string): Observable<any> {
    return this.authService.comparePasswords(password, storedPasswordHash);
  }

  private findOne(id: number): Observable<IUser> {
    return from(this.userRepository.findOne({id}));
  }

  private mailExists(email: string): Observable<boolean> {
    return from(this.userRepository.findOne({email})).pipe(
      map((user: IUser) => {
        if(user) {
          return true;
        } else {
          return false;
        }
      })
    )
  }
}
