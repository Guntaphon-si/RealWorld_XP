import { Component } from '@angular/core';
import { Router } from '@angular/router'; // 👈 1. Import Router
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-button-test',
  standalone: true,
  imports: [CommonModule], // 👈 2. เพิ่ม CommonModule
  templateUrl: './button-test.html',
  styleUrl: './button-test.css'
})
export class ButtonTestComponent {

  // 👈 3. Inject Router เข้ามาใช้งาน
  constructor(private router: Router) {}

  // 👇 4. สร้างฟังก์ชันสำหรับเริ่มกิจกรรม
  startActivity(userId: number,activityId: number): void {
    
    // นำทางไปยัง path '/activity' พร้อมส่ง query params
    this.router.navigate(['/activity'], {
      queryParams: {
        userId: userId,
        activityId: activityId
      }
    });
  }
}