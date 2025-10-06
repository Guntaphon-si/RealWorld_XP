import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DashboardService, DashboardResponse, ActivityData, UserData } from '../services/dashboard.service';

interface ActivityTag {
  label: string;
  type: 'indoor' | 'outdoor' | 'easy' | 'medium' | 'hard' | 'benefit';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  imports: [CommonModule],
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Dropdown state
  isDropdownOpen = false;

  // Current user ID (get from auth service or session)
  currentUserId: number = 1; // TODO: Get from authentication service

  // User data
  user: UserData | null = null;

  // Activities from backend
  activities: ActivityData[] = [];

  // Loading state
  isLoading = true;
  errorMessage = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.createParticles();
    this.setupClickOutsideListener();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // Load dashboard data from backend
  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardData(this.currentUserId).subscribe({
      next: (response: DashboardResponse) => {
        this.user = response.user;
        this.activities = response.activities;
        this.isLoading = false;
        console.log('Dashboard data loaded:', response);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load dashboard data';
        this.isLoading = false;
        console.error('Error loading dashboard:', error);
      }
    });
  }

  // Computed properties
  get assessmentProgress(): number {
    if (!this.user) return 0;
    return (this.user.stress_level / 10) * 100;
  }

  get xpProgress(): number {
    if (!this.user) return 0;
    return this.user.xp; // Already calculated as percentage in backend
  }

  get userLevel(): number {
    return this.user?.level || 1;
  }

  get dayStreak(): number {
    return this.user?.day_streak || 0;
  }

  get completedToday(): number {
    // Count activities with success_count > 0
    return this.activities.filter(a => a.success_count > 0).length;
  }

  get totalActivitiesToday(): number {
    return this.activities.length;
  }

  get dailyProgress(): number {
    if (this.totalActivitiesToday === 0) return 0;
    return (this.completedToday / this.totalActivitiesToday) * 100;
  }

  get circularProgressOffset(): number {
    const circumference = 2 * Math.PI * 45; // radius = 45
    return circumference - (this.dailyProgress / 100) * circumference;
  }

  // Get stress level text
  getStressLevelText(): string {
    if (!this.user) return 'ไม่ทราบ';
    const level = this.user.stress_level;
    if (level <= 3) return 'ต่ำ';
    if (level <= 6) return 'ปานกลาง';
    return 'สูง';
  }

  // Particle animation
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

  // Dropdown methods
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  private setupClickOutsideListener(): void {
    document.addEventListener('click', (e: MouseEvent) => {
      const profileSection = document.querySelector('.profile-section');
      if (profileSection && !profileSection.contains(e.target as Node)) {
        this.isDropdownOpen = false;
      }
    });
  }

  // Navigation methods
  openSettings(): void {
    this.router.navigate(['/settings']);
    this.isDropdownOpen = false;
  }

  logout(): void {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      // Clear user session
      // TODO: Call auth service logout
      this.router.navigate(['/login']);
    }
    this.isDropdownOpen = false;
  }

  // Activity methods
   startActivity(userId: number,activityId: number): void {
    
    // นำทางไปยัง path '/activity' พร้อมส่ง query params
    this.router.navigate(['/activity'], {
      queryParams: {
        userId: userId,
        activityId: activityId
      }
    });
  }

  completeActivity(activity: ActivityData): void {
    this.dashboardService.completeActivity(this.currentUserId, activity.activity_id).subscribe({
      next: (response) => {
        console.log('Activity completed:', response);
        // Reload dashboard to update XP and success count
        this.loadDashboardData();
        // Show success message
        alert(`กิจกรรมสำเร็จ! ได้รับ ${response.xp_gained} XP`);
      },
      error: (error) => {
        console.error('Error completing activity:', error);
        alert('เกิดข้อผิดพลาดในการบันทึกกิจกรรม');
      }
    });
  }

  viewAllActivities(): void {
    this.router.navigate(['/all-activities']);
  }

  // Get activity icon based on activity name or type
  getActivityIcon(activity: ActivityData): string {
    const name = activity.activity_name.toLowerCase();
    if (name.includes('โยคะ') || name.includes('yoga')) return '🧘‍♀️';
    if (name.includes('เดิน') || name.includes('walk')) return '🚶‍♂️';
    if (name.includes('อาหาร') || name.includes('food')) return '🥗';
    if (name.includes('อ่าน') || name.includes('read')) return '📚';
    if (name.includes('วิ่ง') || name.includes('run')) return '🏃';
    if (name.includes('จักรยาน') || name.includes('bike')) return '🚴';
    return '⭐'; // Default icon
  }

  // Get tags for activity
  getActivityTags(activity: ActivityData): ActivityTag[] {
    const tags: ActivityTag[] = [];
    
    // Add type tag
    if (activity.activity_type === 'INDOOR') {
      tags.push({ label: 'Indoor', type: 'indoor' });
    } else if (activity.activity_type === 'OUTDOOR') {
      tags.push({ label: 'Outdoor', type: 'outdoor' });
    }

    // Add difficulty based on time
    if (activity.base_time <= 20) {
      tags.push({ label: 'Easy', type: 'easy' });
    } else if (activity.base_time <= 40) {
      tags.push({ label: 'Medium', type: 'medium' });
    } else {
      tags.push({ label: 'Hard', type: 'hard' });
    }

    return tags;
  }

  // Utility methods
  formatXP(current: number, max: number = 100): string {
    return `${current} / ${max}`;
  }

  getDailyProgressText(): string {
    return `${this.completedToday}/${this.totalActivitiesToday}`;
  }
}