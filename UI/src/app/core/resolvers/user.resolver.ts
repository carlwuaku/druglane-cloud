import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

export const userResolver: ResolveFn<User> = (route, state, authService: AuthService = inject(AuthService)): Observable<User> => authService.getUser();
