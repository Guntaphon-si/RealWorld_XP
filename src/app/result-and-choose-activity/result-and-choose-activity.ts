import { Component, signal, computed  ,OnInit ,inject} from '@angular/core';
import { Activity, ActivityCard } from '../activity-card/activity-card';
import { DataService } from '../shared/data';
import { ApiService } from '../services/api';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ActivityInPlanBulkItem,ActivityInPlanBulkCreatePayload ,UserLifestyleCreatePayload,UserUpdatePayload} from '../services/api';
interface ParticleStyle {
  left: string;
  animationDelay: string;
  animationDuration: string;
}
const LIFESTYLE_MAP: { [key: number]: string } = {
  0: "Finance/Professional",
  1: "Health & Fitness",
  2: "Sustainability",
  3: "Tech/Digital",
  4: "Travel & Adventure"
};
@Component({
  selector: 'app-result-and-choose-activity',
  imports: [ActivityCard],
  templateUrl: './result-and-choose-activity.html',
  styleUrl: './result-and-choose-activity.css'
})

export class ResultAndChooseActivity implements OnInit{
  constructor(
    private router: Router,
  ) { }
  private sharedDataService = inject(DataService);
  private apiService = inject(ApiService);
  private subscription: Subscription = new Subscription();
  userId = signal<number>(0);
  isAssess = signal<number>(0);
  isLoading = signal<boolean>(true);
  lifeStyleId = signal<number[]>([]);
  activities = signal<Activity[]>([]);
  stressLevel = signal<number>(0);
  pageSize = 6; 
  currentPage = signal(1); 
  totalPages = computed(() => {
    return Math.ceil(this.activities().length / this.pageSize);
  });
  visibleActivities = computed(() => {
    const all = this.activities();
    const start = (this.currentPage() - 1) * this.pageSize;
    const end = start + this.pageSize;
    return all.slice(start, end);
  });
  goToNextPage(): void {
    // ตรวจสอบว่ายังไม่ถึงหน้าสุดท้าย
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(page => page + 1);
    }
  }

  goToPreviousPage(): void {
    // ตรวจสอบว่ายังไม่เลยหน้าแรก
    if (this.currentPage() > 1) {
      this.currentPage.update(page => page - 1);
    }
  }
  // ข้อมูลที่ได้จาก Service ส่วนกลาง
  lifestyleType = signal<string>('...')

  // 2. สร้าง computed signal เพื่อคำนวณค่าที่ถูกเลือกอัตโนมัติ
  //    โค้ดส่วนนี้จะทำงานใหม่ก็ต่อเมื่อ activities() เปลี่ยนแปลงเท่านั้น
  selectedActivities = computed(() => this.activities().filter(a => a.selected));
  selectedCount = computed(() => this.selectedActivities().length);
  particles = signal<ParticleStyle[]>([]);
  
  // 2. ngOnInit คือ Lifecycle Hook ที่จะทำงาน "ครั้งเดียว" ตอนที่ component ถูกสร้างขึ้น
  ngOnInit(): void {
    this.createParticles();
    this.loadRecommendedActivities();
  }
  lifestyleNamesString = computed(() => {
    const ids = this.lifeStyleId(); // อ่านค่า Array ID ปัจจุบัน
    if (!ids || ids.length === 0) {
      return 'ไม่พบไลฟ์สไตล์ที่เหมาะกับคุณ'; // ข้อความกรณีไม่มีข้อมูล
    }
    
    // แปลง Array ของ ID (number) ให้เป็น Array ของชื่อ (string)
    const names = ids.map(id => LIFESTYLE_MAP[id] || 'Unknown');
    
    // เชื่อม Array ของชื่อเข้าด้วยกันด้วยเครื่องหมาย ", "
    return names.join(', ');
  });
  loadRecommendedActivities(): void {
    this.subscription = this.sharedDataService.currentApiData.subscribe(profile => {
      console.log('Header received new profile:', profile);
      this.lifeStyleId.set(profile.pred_multilabel_idx);
      this.lifestyleType.set(profile.pred_multilabel_names);
      console.log(profile.pred_multilabel_idx);
      console.log(profile.pred_multilabel_names);
      // this.lifeStyleId().push(0,1,3,4)
    });
    this.subscription = this.sharedDataService.currentUserId.subscribe(userID => {
      console.log(userID);
      this.userId.set(userID);
    });
    this.subscription = this.sharedDataService.currentUserStress.subscribe(userStress => {
      console.log( "userStress: ",userStress);
      this.stressLevel.set(userStress);
    });
   
    this.apiService.getUserStress(this.userId()).subscribe({
        next: (user) => {
          if(user.stress_level){
            console.log("Already have life style but want to assessment again!!!");
            this.isAssess.set(1)
          }else{
            console.log("Not have life Style");
            this.isAssess.set(0)
          }
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการเรียก API userLifeStyle:', err);
          alert('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
        }
    })
    // 4. นำข้อมูลที่ได้ไปเรียกใช้ ApiService
    this.apiService.getActivitiesByLifestyles(this.lifeStyleId())
      .subscribe({
        next: (recommendedActivities) => {
          // 5. เมื่อ API ตอบกลับมาสำเร็จ, นำข้อมูลใส่ใน signal
          this.activities.set(recommendedActivities.map(act => ({ ...act, selected: false })));
          console.log('ได้รับข้อมูลกิจกรรมจาก API:', recommendedActivities);
          this.isLoading.set(false); // ปิดสถานะ Loading
        },
        error: (err) => {
          console.error('เกิดข้อผิดพลาดในการเรียก API:', err);
          alert('ไม่สามารถโหลดข้อมูลกิจกรรมได้');
          this.isLoading.set(false); // ปิดสถานะ Loading แม้จะเกิด error
        }
      });
  }
  // 3. ย้าย Logic การสร้าง particle มาไว้ใน method นี้
  createParticles(): void {
    const particleCount = 50;
    const newParticles: ParticleStyle[] = []; // สร้าง array ชั่วคราว

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        left: Math.random() * 100 + '%',
        animationDelay: Math.random() * 20 + 's',
        animationDuration: (Math.random() * 10 + 15) + 's'
      });
    }

    // 4. เมื่อสร้างข้อมูลเสร็จแล้ว ให้ set ค่าลงใน signal
    this.particles.set(newParticles);
  }
  // 3. ปรับ Method ให้ทำงานกับ Signal
  toggleActivity(activityToToggle: Activity): void {
    // การอัปเดต Signal จะใช้ .update() หรือ .set()
    this.activities.update(currentActivities => 
      currentActivities.map(act => 
        act.id === activityToToggle.id ? { ...act, selected: !act.selected } : act
      )
    );
    // ไม่ต้องเรียก updateSelectedList() แล้ว เพราะ computed signal จัดการให้เอง!
  }
  
  confirmActivities(): void {
    if (this.selectedCount() === 0) return;
    
    const activityNames = this.selectedActivities().map(a => a.id).join('\n');
    if(this.isAssess() === 0){
        this.apiService.createActivityPlan(this.userId()).subscribe({
          next: (response) => {
            console.log('สร้าง Plan สำเร็จ:', response);
            const newPlanId = response.id;

            // สมมติว่านี่คือรายการ activities ที่ผู้ใช้เลือกมาจากหน้าเว็บ
            const activitiesToInsert: ActivityInPlanBulkItem[] = this.activities().map(activity => ({
              activity_id: activity.id,
              is_chose: activity.selected ?? false // ใช้ property 'selected' มากำหนดค่า 'is_chose'
            }));

            // สร้าง payload สำหรับ API ตัวที่สอง
            const payload: ActivityInPlanBulkCreatePayload = {
              plan_id: newPlanId,
              activities: activitiesToInsert
            };

            // ---- API Call 2: เพิ่ม Activities เข้า Plan ----
            this.apiService.insertActivitiesIntoPlan(payload).subscribe({
              next: (insertedActivities) => {
                console.log('API 2 สำเร็จ: เพิ่ม Activities สำเร็จ:', insertedActivities);
              },
              error: (err) => {
                console.error('เกิดข้อผิดพลาดใน API 2:', err);
                alert('สร้าง Plan สำเร็จ แต่ไม่สามารถเพิ่ม Activities ได้');
                this.isLoading.set(false); // ปิด loading แม้จะเกิด error
              }
            });
          },
          error: (err) => {
            console.error('เกิดข้อผิดพลาด:', err);
          },
          complete: () => {
            this.isLoading.set(false);
          }
      });
      const payload: UserLifestyleCreatePayload = {
        user_id: this.userId(),
        lifestyle_ids: this.lifeStyleId()
      };

    // 2. เรียกใช้ Service
    this.apiService.insertUserLifestyles(payload).subscribe({
        next: (response) => {
          // 3. เมื่อสำเร็จ, แสดงผลลัพธ์ และปิดสถานะ loading
          console.log('บันทึก Lifestyles สำเร็จ:', response);
        },
        error: (err) => {
          // 4. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
          console.error('เกิดข้อผิดพลาดในการบันทึก Lifestyles:', err);
          alert('ไม่สามารถบันทึกข้อมูลได้');
        }
      });
      const dataToUpdate: UserUpdatePayload = {
        stress_level: this.stressLevel() 
      };
      const userId = this.userId();
       this.apiService.updateUser(userId, dataToUpdate).subscribe({
        next: (response) => {
            console.log('อัปเดต UserStress สำเร็จ:', response);
            this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          // 4. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
          console.error('เกิดข้อผิดพลาดในการอัปเดต UserUserStress:', err);
          if (err.status === 404) {
            alert('ไม่พบผู้ใช้งาน ID นี้');
          } else {
            alert('เกิดข้อผิดพลาดบางอย่าง');
          }
        }
      });
    }else if(this.isAssess() === 1){
      this.apiService.getUserPlanId(this.userId()).subscribe({
        next: (response) => {
          // 3. เมื่อสำเร็จ, แสดงผลลัพธ์ และปิดสถานะ loading
          console.log('ได้ PlanId สำเร็จ:', response);
           const activitiesToInsert: ActivityInPlanBulkItem[] = this.activities().map(activity => ({
              activity_id: activity.id,
              is_chose: activity.selected ?? false // ใช้ property 'selected' มากำหนดค่า 'is_chose'
            }));
            // สร้าง payload สำหรับ API ตัวที่สอง
            const payload: ActivityInPlanBulkCreatePayload = {
              plan_id: response.id,
              activities: activitiesToInsert
            };
          this.apiService.deleteActivity(response.id).subscribe({
              next: (deletedActivity) => {
                console.log('API 2 สำเร็จ: delete Activities สำเร็จ:', deletedActivity);
                this.apiService.insertActivitiesIntoPlan(payload).subscribe({
                  next: (insertedActivities) => {
                    console.log('API 3 สำเร็จ: เพิ่ม Activities สำเร็จ:', insertedActivities);
                  },
                  error: (err) => {
                    console.error('เกิดข้อผิดพลาดใน API 3:', err);
                    alert('delete สำเร็จ แต่ไม่สามารถเพิ่ม Activities ได้');
                    this.isLoading.set(false); // ปิด loading แม้จะเกิด error
                  }
                });
              },
              error: (err) => {
                console.error('เกิดข้อผิดพลาดใน API 2:', err);
                alert('delete Activities');
              }
          })
        },
        error: (err) => {
          // 4. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
          console.error('เกิดข้อผิดพลาดในการดู PlanId:', err);
          alert('ไม่สามารถดู PlanId');
        }
      });

      const dataToUpdate: UserUpdatePayload = {
        stress_level: this.stressLevel() ,
        xp: 0,
        level:1,
        day_streak:0,
        is_success: false,
        first_success: null,
        login_time: null
      };

      const userId = this.userId();

      // 2. เรียกใช้ Service พร้อมส่งทั้ง ID และข้อมูล
      this.apiService.updateUser(userId, dataToUpdate).subscribe({
        next: (response) => {
          // 3. เมื่อสำเร็จ, แสดงผลลัพธ์ และปิดสถานะ loading
          console.log('อัปเดต User สำเร็จ:', response);
          this.apiService.deleteUserLifestyles(userId).subscribe({
              next: (response) => {
                // 2. เมื่อสำเร็จ, แสดงข้อความ และปิดสถานะ loading
                console.log('ลบข้อมูลสำเร็จ: UserLifeStyle', response.detail);
                const payload: UserLifestyleCreatePayload = {
                  user_id: this.userId(),
                  lifestyle_ids: this.lifeStyleId()
                };

              // 2. เรียกใช้ Service
                this.apiService.insertUserLifestyles(payload).subscribe({
                    next: (response) => {
                      // 3. เมื่อสำเร็จ, แสดงผลลัพธ์ และปิดสถานะ loading
                      console.log('บันทึก Lifestyles สำเร็จ:', response);
                      this.router.navigate(['/dashboard']);
                    },
                    error: (err) => {
                      // 4. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
                      console.error('เกิดข้อผิดพลาดในการบันทึก Lifestyles:', err);
                      alert('ไม่สามารถบันทึกข้อมูลได้');
                    }
                  });
              },
              error: (err) => {
                // 3. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
                console.error('เกิดข้อผิดพลาดในการลบ: UserLifeStyle', err);
              }
            });
        },
        error: (err) => {
          // 4. หากเกิดข้อผิดพลาด, แสดง log และปิดสถานะ loading
          console.error('เกิดข้อผิดพลาดในการอัปเดต User:', err);
          if (err.status === 404) {
            alert('ไม่พบผู้ใช้งาน ID นี้');
          } else {
            alert('เกิดข้อผิดพลาดบางอย่าง');
          }
        }
      });
    }
  }
}
