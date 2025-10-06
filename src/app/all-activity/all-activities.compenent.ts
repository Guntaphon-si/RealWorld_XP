import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AllActivitiesService, ActivityWithSelection } from '../services/all-activities.service';

interface ActivityTag {
  label: string;
  type: string;
}

@Component({
  selector: 'app-all-activities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-activities.component.html',
  styleUrls: ['./all-activities.component.css']
})
export class AllActivitiesComponent implements OnInit {
  // Current user ID
  currentUserId: number = 1; // TODO: Get from auth service

  // Activities data
  activities: ActivityWithSelection[] = [];
  selectedActivities: Set<number> = new Set();

  // Loading state
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private allActivitiesService: AllActivitiesService
  ) {}

  ngOnInit(): void {
    this.loadActivities();
    this.createParticles();
  }

  // Load all activities with user's current selections
  loadActivities(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.allActivitiesService.getAllActivitiesForUser(this.currentUserId).subscribe({
      next: (response) => {
        this.activities = response;
        
        // Pre-select activities that user has already chosen
        response.forEach(activity => {
          if (activity.is_chosen) {
            this.selectedActivities.add(activity.activity_id);
          }
        });
        
        this.isLoading = false;
        console.log('Activities loaded:', response);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load activities';
        this.isLoading = false;
        console.error('Error loading activities:', error);
      }
    });
  }

  // Toggle activity selection
  toggleActivity(activityId: number): void {
    if (this.selectedActivities.has(activityId)) {
      this.selectedActivities.delete(activityId);
    } else {
      this.selectedActivities.add(activityId);
    }
  }

  // Check if activity is selected
  isSelected(activityId: number): boolean {
    return this.selectedActivities.has(activityId);
  }

  // Get selection count
  get selectionCount(): number {
    return this.selectedActivities.size;
  }

  // Get activity icon
  getActivityIcon(activity: ActivityWithSelection): string {
    const name = activity.activity_name.toLowerCase();
    if (name.includes('โยคะ') || name.includes('yoga')) return '🧘‍♀️';
    if (name.includes('เดิน') || name.includes('walk')) return '🚶‍♂️';
    if (name.includes('อ่าน') || name.includes('read')) return '📚';
    if (name.includes('กาแฟ') || name.includes('coffee')) return '☕';
    if (name.includes('ต้นไม้') || name.includes('plant')) return '🌿';
    if (name.includes('เขียน') || name.includes('write')) return '✏️';
    if (name.includes('อาหาร') || name.includes('food') || name.includes('ทำ')) return '🥗';
    if (name.includes('วาด') || name.includes('draw')) return '🎨';
    if (name.includes('เพลง') || name.includes('music')) return '🎵';
    if (name.includes('วิ่ง') || name.includes('run')) return '🏃';
    if (name.includes('จักรยาน') || name.includes('bike')) return '🚴';
    return '⭐';
  }

  // Get activity tags
  getActivityTags(activity: ActivityWithSelection): ActivityTag[] {
    const tags: ActivityTag[] = [];
    
    // Add type tag
    if (activity.activity_type === 'INDOOR') {
      tags.push({ label: 'Indoor', type: 'indoor' });
    } else if (activity.activity_type === 'OUTDOOR') {
      tags.push({ label: 'Outdoor', type: 'outdoor' });
    }

    // Add benefit tag based on description
    const desc = activity.description?.toLowerCase() || '';
    if (desc.includes('ลดความเครียด') || desc.includes('ผ่อนคลาย')) {
      tags.push({ label: 'ลดความเครียด', type: 'benefit' });
    } else if (desc.includes('สดชื่น') || desc.includes('อากาศ')) {
      tags.push({ label: 'สดชื่น', type: 'benefit' });
    } else if (desc.includes('พัฒนา') || desc.includes('เรียนรู้')) {
      tags.push({ label: 'พัฒนาตัวเอง', type: 'benefit' });
    } else if (desc.includes('สร้างสรรค์')) {
      tags.push({ label: 'สร้างสรรค์', type: 'benefit' });
    } else if (desc.includes('สงบ') || desc.includes('mindful')) {
      tags.push({ label: 'Mindful', type: 'benefit' });
    }

    return tags;
  }

  // Clear all selections
  clearAll(): void {
    if (this.selectionCount === 0) return;
    
    if (confirm('คุณต้องการล้างการเลือกทั้งหมดหรือไม่?')) {
      this.selectedActivities.clear();
    }
  }

  // Save selection
  saveSelection(): void {
    if (this.selectionCount === 0) {
      alert('กรุณาเลือกกิจกรรมอย่างน้อย 1 รายการ');
      return;
    }

    this.isSaving = true;
    const selectedIds = Array.from(this.selectedActivities);

    this.allActivitiesService.updateUserActivitySelection(this.currentUserId, selectedIds).subscribe({
      next: (response) => {
        this.isSaving = false;
        alert(`บันทึกสำเร็จ! คุณได้เลือก ${this.selectionCount} กิจกรรม`);
        
        // Navigate back to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error saving selection:', error);
        alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง');
      }
    });
  }

  // Go back to dashboard
  goToDashboard(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('คุณมีกิจกรรมที่เลือกไว้ ต้องการออกโดยไม่บันทึกหรือไม่?')) {
        this.router.navigate(['/dashboard']);
      }
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Check for unsaved changes
  private hasUnsavedChanges(): boolean {
    const currentSelection = new Set(this.selectedActivities);
    const originalSelection = new Set(
      this.activities.filter(a => a.is_chosen).map(a => a.activity_id)
    );

    if (currentSelection.size !== originalSelection.size) return true;

    for (const id of currentSelection) {
      if (!originalSelection.has(id)) return true;
    }

    return false;
  }

  // Create particles animation
  private createParticles(): void {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 20 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
      particlesContainer.appendChild(particle);
    }
  }
}