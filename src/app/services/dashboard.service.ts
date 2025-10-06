import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserData {
  id: number;
  username: string;
  stress_level: number;
  xp: number;
  level: number;
  day_streak: number;
  is_success: boolean;
  first_success: string | null;
  login_time: string | null;
}

export interface ActivityData {
  activity_id: number;
  activity_name: string;
  base_time: number;
  base_xp: number;
  activity_type: string;
  description: string;
  success_count: number;
  is_chose: boolean;
  plan_id: number;
  user_id: number;
}

export interface DashboardResponse {
  user: UserData;
  activities: ActivityData[];
  activity_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8000/api/dashboard';

  constructor(private http: HttpClient) {}

  /**
   * Get complete dashboard data for a user
   */
  getDashboardData(userId: number): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.apiUrl}/${userId}`);
  }

  /**
   * Get only user activities
   */
  getUserActivities(userId: number): Observable<ActivityData[]> {
    return this.http.get<ActivityData[]>(`${this.apiUrl}/${userId}/activities`);
  }

  /**
   * Get only user info
   */
  getUserInfo(userId: number): Observable<UserData> {
    return this.http.get<UserData>(`${this.apiUrl}/${userId}/user-info`);
  }

  /**
   * Toggle activity choice (select/deselect)
   */
  toggleActivityChoice(userId: number, activityId: number, isChose: boolean): Observable<any> {
    const isChoseValue = isChose ? 1 : 0;
    return this.http.put(
      `${this.apiUrl}/${userId}/activity/${activityId}/toggle?is_chose=${isChoseValue}`,
      {}
    );
  }

  /**
   * Complete an activity
   */
  completeActivity(userId: number, activityId: number): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/${userId}/activity/${activityId}/complete`,
      {}
    );
  }

  /**
   * Increment user's day streak
   */
  incrementStreak(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/streak/increment`, {});
  }

  /**
   * Reset user's day streak
   */
  resetStreak(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${userId}/streak/reset`, {});
  }
}