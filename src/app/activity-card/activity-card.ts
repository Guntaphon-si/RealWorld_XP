import { NgClass } from '@angular/common';
import { Component , input, output} from '@angular/core';

export interface Activity {
  id: number;
  name: string;
  activity_type: string;
  base_time: number;
  description: string;
  selected?: boolean; // เพิ่ม property นี้เพื่อเช็คว่าถูกเลือกหรือไม่
}
@Component({
  selector: 'app-activity-card',
  imports: [NgClass],
  templateUrl: './activity-card.html',
  styleUrl: './activity-card.css'
})

export class ActivityCard {
    activity = input.required<Activity>(); 

  // ใช้ output() แบบใหม่
  cardClicked = output<void>();

  onCardClick(): void {
    this.cardClicked.emit();
  }

}
