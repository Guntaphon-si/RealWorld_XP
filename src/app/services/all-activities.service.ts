import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ActivityWithSelection {
  activity_id: number;
  activity_name: string;
  base_time: number | null;
  base_xp: number | null;
  activity_type: string | null;
  description: string | null;
  is_chosen: boolean;
  in_plan_id: number | null;
}

export interface ActivitySelectionResponse {
  message: string;
  selected_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class AllActivitiesService {
  private apiUrl = environment.apiUrl || 'http://localhost:8000/';

  constructor(private http: HttpClient) {}

  /**
   * Get all activities for a user with their selection status
   * @param userId - The ID of the user
   * @returns Observable of activity array with selection status
   */
  getAllActivitiesForUser(userId: number): Observable<ActivityWithSelection[]> {
    return this.http.get<ActivityWithSelection[]>(
      `${this.apiUrl}/api/activities/user/${userId}/all`
    );
  }

  /**
   * Update user's activity selection
   * @param userId - The ID of the user
   * @param activityIds - Array of selected activity IDs
   * @returns Observable of response message
   */
  updateUserActivitySelection(
    userId: number, 
    activityIds: number[]
  ): Observable<ActivitySelectionResponse> {
    return this.http.put<ActivitySelectionResponse>(
      `${this.apiUrl}/api/activities/user/${userId}/selection`,
      { activity_ids: activityIds }
    );
  }
}