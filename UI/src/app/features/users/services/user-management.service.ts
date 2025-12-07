import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData, CreateUserData, UpdateUserData } from '../../../core/models/user.model';
import { HttpService } from '../../../core/services/http/http.service';

export interface UserListResponse {
    data: UserData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private db = inject(HttpService);

    getUsers(page: number = 1, perPage: number = 15): Observable<UserListResponse> {
        return this.db.get<UserListResponse>(`api/users?page=${page}&per_page=${perPage}`);
    }

    getUser(id: number): Observable<{ data: UserData }> {
        return this.db.get<{ data: UserData }>(`api/users/${id}`);
    }

    createUser(data: CreateUserData): Observable<UserData> {
        return this.db.post<UserData>('api/users', data);
    }

    updateUser(id: number, data: UpdateUserData): Observable<UserData> {
        return this.db.put<UserData>(`api/users/${id}`, data);
    }

    deleteUser(id: number): Observable<void> {
        return this.db.delete<void>(`api/users/${id}`);
    }

    activateUser(id: number): Observable<UserData> {
        return this.db.post<UserData>(`api/users/${id}/activate`, {});
    }

    deactivateUser(id: number): Observable<UserData> {
        return this.db.post<UserData>(`api/users/${id}/deactivate`, {});
    }
}
