import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  level: number;
  current_xp: number;
  xp_for_next_level: number;
  day_streak: number;   
  is_success: boolean;
}

export interface Activity {
  id: number;
  name: string;
  base_time: number;
  base_xp: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) { }

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${userId}`);
  }

  getActivity(activityId: number): Observable<Activity> {
    return this.http.get<Activity>(`${this.apiUrl}/activity/${activityId}`);
  }

  completeActivity(userId: number, activityId: number): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user/${userId}/complete`, { activity_id: activityId });
  }
}