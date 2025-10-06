import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, User, Activity } from '../services/api'; 
import { ActivatedRoute, Router } from '@angular/router'; 

@Component({
  selector: 'app-activity-flow',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-flow.html',
  styleUrls: ['./activity-flow.css']
})
export class ActivityFlowComponent implements OnInit, OnDestroy {

  currentStep: 'loading' | 'start' | 'timer' | 'complete' = 'loading';

  user: User | null = null;
  activity: Activity | null = null;
  activityIcon: string = '🧘‍♀️';

  private activityIconMap = new Map<string, string>([
    ["จดไอเดียลงสมุด", "✍️"],
    ["จัดระเบียบอุปกรณ์เดินทาง", "🧳"],
    ["จัดโต๊ะทำงาน 5 นาที", "🖥️"],
    ["ชี้จุดบนแผนที่/ลูกโลก", "🗺️"],
    ["ดื่มน้ำเปล่า 1 แก้วทันทีที่ตื่น", "💧"],
    ["ต่อเลโก้/โมเดล 1 ชิ้น", "🧱"],
    ["ทดลองใช้ประสาทสัมผัสใหม่", "🖐️"],
    ["ประเมินระยะทางด้วยสายตา", "📏"],
    ["ปิดสวิตช์-ถอดปลั๊ก", "🔌"],
    ["ฝึกการสบตาและยิ้ม", "😊"],
    ["ภารกิจ \"มองขึ้นฟ้า\"", "☁️"],
    ["ภารกิจเก็บขยะ 3 ชิ้น", "🚮"],
    ["มองหารูปแบบในธรรมชาติ", "🌿"],
    ["ยืดเหยียดหลังเลิกงาน", "🤸"],
    ["รดน้ำต้นไม้/ดูแลแปลงผัก", "🌱"],
    ["วางแผนการกินเพื่อลดขยะ", "🥗"],
    ["วิ่งขึ้น-ลงบันได", "👟"],
    ["สังเกตการณ์ธุรกิจรอบตัว", "📈"],
    ["สังเกตและสเก็ตช์ภาพ", "🎨"],
    ["อ่านหนังสือธุรกิจ/พัฒนาตนเอง 1 บท", "📚"],
    ["เขียน To-Do List ของวันพรุ่งนี้", "📝"],
    ["เดินรับแดดเช้า", "☀️"],
    ["เดินสำรวจซอยที่ไม่คุ้นเคย", "🗺️"],
    ["เดินเท้า/ปั่นจักรยานแทนการใช้รถ", "🚲"],
    ["เดินเร็วเคลียร์สมอง", "🏃"],
  ]);


  isPaused = false;
  timeRemaining: number = 0;
  formattedTime: string = '00:00';
  private timerInterval: any;

  isModalVisible = false;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  

  ngOnInit(): void {
    this.createParticles(50, 'particles-js');
    this.route.queryParams.subscribe(params => {
      const userId = +params['userId'];
      const activityId = +params['activityId'];

      if (userId && activityId) {
        this.loadInitialData(userId, activityId);
      } else {
        console.error('User ID and Activity ID are required');
      }
    });
  }

  private getActivityIcon(activityName: string): string {
    return this.activityIconMap.get(activityName) || '✨'; 
  }

  loadInitialData(userId: number, activityId: number): void {
    this.currentStep = 'loading';
    this.apiService.getUser(userId).subscribe(user => this.user = user);
    this.apiService.getActivity(activityId).subscribe(activity => {
      this.activity = activity;
      if (this.activity) {
        this.activityIcon = this.getActivityIcon(this.activity.name);
      }
      // this.timeRemaining = this.activity.base_time * 60;
      this.timeRemaining = this.activity.base_time ;
      this.formattedTime = this.formatTime(this.timeRemaining);
      this.currentStep = 'start';
    });
  }

  startActivity(): void {
    if (!this.activity) return;
    this.currentStep = 'timer';
    this.startTimer();
  }

  completeActivity(): void {
    if (!this.user || !this.activity) return;
    clearInterval(this.timerInterval);

    this.apiService.completeActivity(this.user.id, this.activity.id).subscribe(updatedUser => {
        this.user = updatedUser; 
        this.currentStep = 'complete';
        setTimeout(() => this.createConfetti(120, 'confetti-js'), 100);
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.timeRemaining > 0) {
        this.timeRemaining--;
        this.formattedTime = this.formatTime(this.timeRemaining);
      } else if (this.timeRemaining <= 0) {
        this.completeActivity();
      }
    }, 1000);
  }

  togglePause(): void { this.isPaused = !this.isPaused; }
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  showCancelModal(): void { this.isModalVisible = true; }
  closeModal(): void { this.isModalVisible = false; }
  confirmCancel(): void {
    this.isModalVisible = false;
    clearInterval(this.timerInterval);
    if (this.user && this.activity) {
      this.loadInitialData(this.user.id, this.activity.id);
    }
  }

  get xpProgressPercentage(): number {
    if (!this.user) return 0;
    return (this.user.current_xp / this.user.xp_for_next_level) * 100;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

 private createParticles(count: number, containerId: string): void {
    const container = this.el.nativeElement.querySelector(`#${containerId}`);
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const particle = this.renderer.createElement('div');
      this.renderer.addClass(particle, 'particle');
      this.renderer.setStyle(particle, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(particle, 'animation-duration', `${Math.random() * 15 + 10}s`);
      this.renderer.setStyle(particle, 'animation-delay', `${Math.random() * 5}s`);
      const xEnd = (Math.random() - 0.5) * 400;
      this.renderer.setStyle(particle, '--x-end', `${xEnd}px`);
      this.renderer.appendChild(container, particle);
    }
  }

  private createConfetti(count: number, containerId: string): void {
    const container = this.el.nativeElement.querySelector(`#${containerId}`);
    if (!container) return;
    
    container.innerHTML = '';

    const colors = ['#64ffda', '#fb923c', '#facc15', '#a78bfa'];
    for (let i = 0; i < count; i++) {
      const confettiPiece = this.renderer.createElement('div');
      this.renderer.addClass(confettiPiece, 'confetti-piece');
      this.renderer.setStyle(confettiPiece, 'left', `${Math.random() * 100}%`);
      this.renderer.setStyle(confettiPiece, 'background-color', colors[Math.floor(Math.random() * colors.length)]);
      this.renderer.setStyle(confettiPiece, 'transform', `rotate(${Math.random() * 360}deg)`);
      this.renderer.setStyle(confettiPiece, 'animation-duration', `${Math.random() * 3 + 2}s`);
      this.renderer.setStyle(confettiPiece, 'animation-delay', `${Math.random() * 2}s`);
      this.renderer.appendChild(container, confettiPiece);
    }
  }
}