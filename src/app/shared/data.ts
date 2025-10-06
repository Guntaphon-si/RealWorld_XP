// src/app/shared/data.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // ใช้ BehaviorSubject เพื่อให้เราสามารถส่งค่าล่าสุดให้กับหน้าที่มา subscribe ทีหลังได้
  private readonly storageKey = 'userLifeStyle';
  private apiDataSource = new BehaviorSubject<any>(this.getInitialProfile());
  currentApiData = this.apiDataSource.asObservable(); // ทำให้ component อื่นๆ เข้ามา subscribe ได้
  
  private readonly userIdStorageKey = 'currentUserId';
  private userIdSource = new BehaviorSubject<number>(this.getInitialData(this.userIdStorageKey));
  currentUserId = this.userIdSource.asObservable();

  private readonly userStressStorageKey = 'currentUserStress';
  private userStress = new BehaviorSubject<number>(this.getInitialData(this.userStressStorageKey));
  currentUserStress = this.userStress.asObservable();

    private getInitialData(key: string): any {
    try {
      const savedData = localStorage.getItem(key);
      return savedData ? JSON.parse(savedData) : 0; // เปลี่ยนค่า default เป็น null
    } catch (e) {
      return 0;
    }
  }

  private getInitialProfile(){
    try {
      // ลองดึงข้อมูลจาก localStorage
      const savedProfile = localStorage.getItem(this.storageKey);
      // ถ้ามีข้อมูล ให้แปลงกลับจาก string เป็น object แล้ว return
      return savedProfile ? JSON.parse(savedProfile) : { err:"Not have user lifestyle data" };
    } catch (e) {
      // ถ้าเกิด error (เช่น ข้อมูลที่เก็บไว้ไม่ใช่ JSON) ให้ใช้ค่า default
      return { err:"Not have user lifestyle data" };
    }
  }
  constructor() { }

  // Method สำหรับให้หน้าฟอร์มเรียกใช้เพื่อ update ข้อมูล
  updateApiData(data: any) {
    this.apiDataSource.next(data);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  updateUserId(id: number): void {
    this.userIdSource.next(id);
    localStorage.setItem(this.userIdStorageKey, JSON.stringify(id));
  }

  updateUserStress(value: number): void {
    this.userStress.next(value);
    localStorage.setItem(this.userStressStorageKey, JSON.stringify(value));
  }

}