import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
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

export interface ActivityPlanCreatePayload {
  user_id: number;
}
export interface ActivityPlanResponse {
  id: number;
  user_id: number;
}

export interface ActivityInPlanBulkItem {
  activity_id: number;
  is_chose: boolean;
}
export interface ActivityInPlanBulkCreatePayload {
  plan_id: number;
  activities: ActivityInPlanBulkItem[];
}
export interface ActivityInPlanResponse {
  id: number;
  plan_id: number;
  activity_id: number;
  success_count: number;
  is_chose: boolean;
}


export interface UserLifestyleCreatePayload {
  user_id: number;
  lifestyle_ids: number[];
}

export interface UserLifestyleResponse {
  id: number;
  user_id: number;
  lifestyle_id: number;
}

export interface UserUpdatePayload {
  stress_level?: number;
  xp?: number;
  level?: number;
  day_streak?: number;
  is_success?: boolean;
  first_success?: string|null; // ใน TypeScript, datetime มักจะถูกจัดการเป็น string (ISO format) หรือ Date
  login_time?: string|null;
}

/**
 * Interface สำหรับข้อมูล User ที่จะได้รับกลับมา
 * ตรงกับ Pydantic: UserRespond
 */
export interface UserResponse {
  id: number;
  username: string;
  stress_level?: number | null;
  xp?: number | null;
  level?: number | null;
  day_streak?: number | null;
  is_success?: boolean | null;
  first_success?: string | null;
  login_time?: string | null;
}

export interface DetailResponse {
  detail: string;
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
    return this.http.post<User>(`${this.apiUrl}/user/${userId}/complete`, { activity_id: activityId });}
  // สมมติว่านี่คือ URL ของ API ที่คุณจะส่งข้อมูลไป
  private apiUrlPredictLifeStyle = 'http://127.0.0.1:8000/api/predictLifeStyle';
  private GetActivity = 'http://127.0.0.1:8000/api/activityByLifestyleId';
  private GetUserLifeStyle = 'http://127.0.0.1:8000/api/userStressById';
  private createPlanUrl = 'http://127.0.0.1:8000/api/createActivityPlan/';
  private insertActivitiesUrl = 'http://127.0.0.1:8000/api/InsertActivityInPlan/';
  private insertUserLifestyleUrl = 'http://127.0.0.1:8000/api/insertUserLifeStyle/';
  private getPlanId = "http://127.0.0.1:8000/api/userPlanId";
  private deleteAcitivityUrl = "http://127.0.0.1:8000/api/deleteActivityInPlan";
  private updateUserUrl = 'http://127.0.0.1:8000/api/updateUser';
  private deleteUserLifestyleUrl = 'http://127.0.0.1:8000/api/deleteUserLifeStyle';

  // 1. ทำการ "ฉีด" (Inject) HttpClient เข้ามาใช้งาน

  // 2. สร้างฟังก์ชันสำหรับส่งข้อมูลฟอร์ม
  // formData: any คือ object ข้อมูลจากฟอร์ม
  // Observable<any> คือชนิดของข้อมูลที่จะได้รับกลับมาจาก API
  submitAssessment(formData: any): Observable<any> {
    // 3. ใช้ http.post เพื่อส่งข้อมูล (Method POST)
    // Argument ตัวแรกคือ URL, ตัวที่สองคือข้อมูลที่จะส่ง (body)
    return this.http.post<any>(this.apiUrlPredictLifeStyle, formData);
  }
  getActivitiesByLifestyles(lifestyleIds: number[]): Observable<any[]> {
    
    // 1. สร้าง HttpParams ขึ้นมา
    let params = new HttpParams();

    // 2. วนลูปอาเรย์ lifestyleIds ที่รับเข้ามา
    lifestyleIds.forEach(id => {
      // 3. ใช้ .append() เพื่อเพิ่มค่าเข้าไปใน key 'lifestyleId'
      // การใช้ .append() จะทำให้เราสามารถมี key ชื่อเดียวกันแต่มีหลายค่าได้
      params = params.append('lifestyleId', id.toString());
    });

    // 4. ส่ง HTTP GET request พร้อมกับ params ที่สร้างขึ้น
    return this.http.get<any[]>(this.GetActivity, { params });
  }
  getUserStress(id:number) : Observable<any> {
    const params = new HttpParams().set('id', id.toString());
  // ส่ง params เข้าไปใน options object ของ http.get
    return this.http.get(this.GetUserLifeStyle, { params: params });
  }

  createActivityPlan(userId: number): Observable<ActivityPlanResponse> {
    // 2. สร้าง object ของ body ที่จะส่งไปให้ตรงกับ Pydantic model
    const payload: ActivityPlanCreatePayload = {
      user_id: userId
    };

    // 3. เรียกใช้ http.post พร้อมระบุ Type ของข้อมูลที่จะได้รับกลับมา
    return this.http.post<ActivityPlanResponse>(this.createPlanUrl, payload);
  }
  insertActivitiesIntoPlan(payload: ActivityInPlanBulkCreatePayload): Observable<ActivityInPlanResponse[]> {
    return this.http.post<ActivityInPlanResponse[]>(this.insertActivitiesUrl, payload);
  }

   insertUserLifestyles(payload: UserLifestyleCreatePayload): Observable<UserLifestyleResponse[]> {
    // ใช้ http.post<UserLifestyleResponse[]> เพื่อบอกว่าข้อมูลที่คาดหวังว่าจะได้รับกลับมาคือ Array
    return this.http.post<UserLifestyleResponse[]>(this.insertUserLifestyleUrl, payload);
  }

  getUserPlanId(id:number) : Observable<any> {
    const params = new HttpParams().set('id', id.toString());
  // ส่ง params เข้าไปใน options object ของ http.get
    return this.http.get(this.getPlanId, { params: params });
  }

  deleteActivity(id:number) : Observable<any> {
    const params = new HttpParams().set('plan_id', id.toString());
  // ส่ง params เข้าไปใน options object ของ http.get
    return this.http.delete(this.deleteAcitivityUrl, { params: params });
  }
  updateUser(userId: number, updateData: UserUpdatePayload): Observable<UserResponse> {
    
    // 1. สร้าง HttpParams เพื่อส่ง user_id เป็น Query Parameter
    //    ผลลัพธ์ที่ได้จะเป็น /updateUser?user_id=123
    const params = new HttpParams().set('user_id', userId.toString());

    // 2. เรียกใช้ http.patch<UserResponse>()
    //    - Argument 1: URL
    //    - Argument 2: Request Body (ข้อมูลที่จะอัปเดต)
    //    - Argument 3: Options object ซึ่งเราใส่ params เข้าไป
    return this.http.patch<UserResponse>(this.updateUserUrl, updateData, { params });
  }
  deleteUserLifestyles(userId: number): Observable<DetailResponse> {
    
    // 1. สร้าง HttpParams เพื่อส่ง user_id เป็น Query Parameter
    //    ผลลัพธ์ที่ได้จะเป็น /deleteUserLifeStyle?user_id=123
    const params = new HttpParams().set('user_id', userId.toString());

    // 2. เรียกใช้ http.delete<DetailResponse>()
    //    - Argument 1: URL
    //    - Argument 2: Options object ซึ่งเราใส่ params เข้าไป
    return this.http.delete<DetailResponse>(this.deleteUserLifestyleUrl, { params });
  }
}