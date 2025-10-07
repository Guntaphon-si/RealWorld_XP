import { Component,OnInit ,signal,ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,FormGroup, FormControl, Validators,ReactiveFormsModule} from '@angular/forms';
import { ApiService, PredictionRequest } from '../services/api';
import { DataService } from '../shared/data';
import { Router } from '@angular/router';
interface ParticleStyle {
  left: string;
  animationDelay: string;
  animationDuration: string;
}
@Component({
  selector: 'app-assess-ment-question',
  imports: [FormsModule,ReactiveFormsModule,CommonModule],
  templateUrl: './assess-ment-question.html',
  styleUrl: './assess-ment-question.css'
})
export class AssessMentQuestion implements OnInit{
 // 1. สร้าง property เพื่อเก็บฟอร์มของเรา
 @ViewChild('formContainer') private formContainer!: ElementRef;
  socialForm!: FormGroup;
  currentStep = 1; // ตัวแปรเก็บหน้าปัจจุบัน
  totalSteps = 4;  // จำนวนหน้าทั้งหมด
  isLoading = false;
  constructor(
    private router: Router,
    private apiService: ApiService,
    private lifestyleDataService: DataService
  ) { }
   private scrollToTop(): void {
    // ใช้ .scrollIntoView() เพื่อเลื่อนไปที่ Element ที่เราอ้างอิงไว้
    // { behavior: 'smooth' } ทำให้การเลื่อนดูนุ่มนวล ไม่กระตุก
    this.formContainer.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  particles = signal<ParticleStyle[]>([]);
  // 2. ngOnInit เป็นฟังก์ชันที่จะรัน 1 ครั้งเมื่อ Component ถูกสร้าง
  ngOnInit(): void {
    this.createParticles();
    // 3. กำหนดโครงสร้างของฟอร์มที่นี่
    this.socialForm = new FormGroup({
      // Step 1
      age: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(200)]),
      gender: new FormControl(null, [Validators.required]), 
      vacationDays: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(365)]),
      monthlySpend: new FormControl(null, [Validators.required, Validators.min(0)]),
      onlinePurchases: new FormControl(null, [Validators.required]),
      charityDonations: new FormControl(null, [Validators.required]),
      weeklyExercise: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(168)]),
      // Step 2
      portfolioValue: new FormControl(null, [Validators.required, Validators.min(0)]),
      healthConsciousness: new FormControl(null, [Validators.required]),
      educationLevel: new FormControl(null, [Validators.required]),
      dailyScreenTime: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(24)]),
      social_media_platforms_used: new FormControl(null, [Validators.required, Validators.min(0)]),
      hours_on_TikTok: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(24)]),
      sleep_hours: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(24)]),
      
      // Step 3
      mood_score: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(10)]),
      environmentalAwareness: new FormControl(null, [Validators.required]),
      socialMediaInfluence: new FormControl(null, [Validators.required]),
      riskTolerance: new FormControl(null, [Validators.required]),
      professionalTrainings: new FormControl(null, [Validators.required, Validators.min(0)]),
      techSavviness: new FormControl(null, [Validators.required]),
      financialWellness: new FormControl(null, [Validators.required]),
     
      // Step 4
      lifestyleBalance: new FormControl(null, [Validators.required]),
      entertainmentEngagement: new FormControl(null, [Validators.required]),
      socialResponsibility: new FormControl(null, [Validators.required]),
      workLifeBalance: new FormControl(null, [Validators.required]),
      investmentRiskAppetite: new FormControl(null, [Validators.required]),
      ecoConsciousness: new FormControl(null, [Validators.required]),
      stressManagement: new FormControl(null, [Validators.required]),
      timeManagement: new FormControl(null, [Validators.required]),
    });
  }
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
  // 4. สร้างฟังก์ชันสำหรับจัดการการ submit ฟอร์ม
  nextStep(): void {
    if (this.isCurrentStepValid()) {
      this.currentStep++;
      this.scrollToTop();
    }
  }

  // ฟังก์ชันย้อนกลับ
  prevStep(): void {
    this.currentStep--;
    this.scrollToTop();
  }
  
  // ฟังก์ชันสำหรับส่งข้อมูล (เมื่ออยู่หน้าสุดท้าย)
  onSubmit(): void {
    if (!this.socialForm.valid) {
      return; // ถ้าฟอร์มไม่สมบูรณ์ ก็ไม่ต้องทำอะไรต่อ
    }
    const requestData: PredictionRequest = {
      "screen_time_hours": this.socialForm.value.dailyScreenTime,
      "social_media_platforms_used": this.socialForm.value.social_media_platforms_used,
      "hours_on_TikTok": this.socialForm.value.hours_on_TikTok,
      "sleep_hours": this.socialForm.value.sleep_hours,
      "mood_score": this.socialForm.value.mood_score
    };
    console.log("Stress",requestData);
    
    this.isLoading = true; // เริ่ม loading
    const payload = this.transformFormData(this.socialForm.value);
    console.log('Transformed Payload to be sent:', payload);
    // 4. เรียกใช้ฟังก์ชันจาก Service และส่งค่าจากฟอร์มเข้าไป
    this.apiService.submitAssessment(payload).subscribe({
      // 5. จัดการกับผลลัพธ์ที่ API ส่งกลับมา (กรณีสำเร็จ)
      next: (response) => {
        this.isLoading = false; // หยุด loading
        console.log('API Response:', response);
        this.lifestyleDataService.updateApiData(response);
      // 3. Navigate ไปยังหน้าแสดงผล
        this.apiService.predictStressLevel(requestData).subscribe({
          next: (response) => {
            // --- ✅ สำเร็จ ---
            this.lifestyleDataService.updateUserStress(response.stress_level_class+1)
            console.log('API Response Stress:', response.stress_level_class+1);
            this.router.navigate(['/result']);
          },
          error: (err) => {
            // --- ❌ เกิดข้อผิดพลาด ---
            console.error('API Error Stress:', err);
          }
        });
      },
      // 6. จัดการกับข้อผิดพลาด (กรณี API ยิงไม่สำเร็จ)
      error: (error) => {
        this.isLoading = false; // หยุด loading
        console.error('API Error:', error);
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล!');
      }
    });
  }
   private transformFormData(formValue: any): { numeric: number[], categorical: number[] } {
    // --- จัดการข้อมูล Categorical (Gender) ---
    let genderValue: number;
    const usdToThbRate = 36.5;
    switch (formValue.gender) {
      case 'ชาย':
        genderValue = 0;
        break;
      case 'หญิง':
        genderValue = 1;
        break;
      default: // กรณี "ไม่ต้องการระบุ" หรือค่าอื่นๆ
        genderValue = 0;
        break;
    }

    // --- จัดการข้อมูล Numeric ---
    // สร้าง Array ของ key ตามลำดับที่ถูกต้อง (ยกเว้น gender)
    const numericFieldOrder = [
      'age', 'vacationDays', 'monthlySpend', 'onlinePurchases', 'charityDonations', 
      'weeklyExercise', 'portfolioValue', 'healthConsciousness', 'educationLevel', 
      'dailyScreenTime', 'environmentalAwareness', 'socialMediaInfluence', 'riskTolerance', 
      'professionalTrainings', 'techSavviness', 'financialWellness', 'lifestyleBalance', 
      'entertainmentEngagement', 'socialResponsibility', 'workLifeBalance', 
      'investmentRiskAppetite', 'ecoConsciousness', 'stressManagement', 'timeManagement'
    ];
    
    // ใช้ .map() เพื่อดึงค่าตามลำดับและแปลงเป็นตัวเลข
    const numericValues = numericFieldOrder.map(key => {
      const value = formValue[key];
      if (key === 'monthlySpend' || key === 'portfolioValue') {
        return value / usdToThbRate;
      }
      if (key === 'healthConsciousness') {
        // สูตร: NewValue = ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
        // ((value - 1) / (5 - 1)) * (13.4 - 0)
        const rescaledValue = ((value - 1) / 4) * 13.4;
        return rescaledValue;
      }
      if (key === 'educationLevel') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (8 - 1)) * (15.3 - 0)
        const rescaledValue = ((value - 1) / 7) * 15.3;
        return rescaledValue;
      }
      if (key === 'environmentalAwareness') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
        // ((value - 1) / (5 - 1)) * (15.4 - 0)
        const rescaledValue = ((value - 1) / 4) * 15.4;
        return rescaledValue;
      }
      if (key === 'socialMediaInfluence') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - New-Min)
      // ((value - 1) / (5 - 1)) * (45 - 0)
        const rescaledValue = ((value - 1) / 4) * 45;
        return rescaledValue;
      }
      if (key === 'riskTolerance') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (49 - 0)
        const rescaledValue = ((value - 1) / 4) * 49;
        return rescaledValue;
      }
      if (key === 'techSavviness') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (39.1 - 0)
        const rescaledValue = ((value - 1) / 4) * 39.1;
        return rescaledValue;
      }
      if (key === 'financialWellness') {
        // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
        // ((value - 1) / (5 - 1)) * (594 - 0)
        const rescaledValue = ((value - 1) / 4) * 594;
        return rescaledValue;
      }
      if (key === 'lifestyleBalance') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (60.7 - 0)
        const rescaledValue = ((value - 1) / 4) * 60.7;
        return rescaledValue;
      }
      if (key === 'entertainmentEngagement') {
      // สูตร: NewValue = NewMin + (((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin))
      // 0.1 + (((value - 1) / (5 - 1)) * (3.32 - 0.1))
        const rescaledValue = 0.1 + (((value - 1) / 4) * 3.22);
        return rescaledValue;
      }
      if (key === 'socialResponsibility') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (18.1 - 0)
        const rescaledValue = ((value - 1) / 4) * 18.1;
        return rescaledValue;
      }
      if (key === 'workLifeBalance') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (1.58 - 0)
        const rescaledValue = ((value - 1) / 4) * 1.58;
        return rescaledValue;
      }
      if (key === 'investmentRiskAppetite') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (9.07 - 0)
        const rescaledValue = ((value - 1) / 4) * 9.07;
        return rescaledValue;
      }
      if (key === 'ecoConsciousness') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (3.25 - 0)
        const rescaledValue = ((value - 1) / 4) * 3.25;
        return rescaledValue;
      }
      if (key === 'stressManagement') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (9.89 - 0)
        const rescaledValue = ((value - 1) / 4) * 9.89;
        return rescaledValue;
      }
      if (key === 'timeManagement') {
      // สูตร: ((OldValue - OldMin) / (OldMax - OldMin)) * (NewMax - NewMin)
      // ((value - 1) / (5 - 1)) * (122 - 0)
        const rescaledValue = ((value - 1) / 4) * 122;
        return rescaledValue;
      }
      // ถ้าเป็น key อื่นๆ ให้คืนค่าเดิม
      return parseFloat(value || '0');
    });
    const healthRating = parseFloat(formValue.healthConsciousness || '0');
    const exerciseHours = parseFloat(formValue.weeklyExercise || '0');

    // 2. คำนวณตามสูตร
    const wellnessScore = (healthRating * 0.45) + (exerciseHours * 0.55);
    
    // 3. นำค่าที่ได้ไปต่อท้าย Array ของ numeric
    numericValues.push(wellnessScore);
    // คืนค่า object ในรูปแบบที่ API ต้องการ
    return {
      "numeric": numericValues,
      "categorical": [genderValue]
    };
  }

  // ตรวจสอบว่าฟอร์มในหน้าปัจจุบันถูกต้องหรือไม่
  isCurrentStepValid(): boolean {
    const controlsStep1 = ['age','gender', 'vacationDays', 'monthlySpend', 'onlinePurchases', 'charityDonations', 'weeklyExercise'];
    const controlsStep2 = ['portfolioValue', 'healthConsciousness', 'educationLevel', 'dailyScreenTime', 'social_media_platforms_used', 'hours_on_TikTok','sleep_hours'];
    const controlsStep3 = ['mood_score', 'environmentalAwareness', 'socialMediaInfluence', 'riskTolerance', 'professionalTrainings', 'techSavviness','financialWellness'];
    const controlsStep4 = ['lifestyleBalance', 'entertainmentEngagement', 'socialResponsibility', 'workLifeBalance', 'investmentRiskAppetite', 'ecoConsciousness','stressManagement','timeManagement'];

    let controlsToCheck: string[] = [];
    switch(this.currentStep) {
      case 1: controlsToCheck = controlsStep1; break;
      case 2: controlsToCheck = controlsStep2; break;
      case 3: controlsToCheck = controlsStep3; break;
      case 4: controlsToCheck = controlsStep4; break;
    }

    // เช็คว่าทุก control ในหน้านั้นๆ มีค่า (valid) หรือไม่
    return controlsToCheck.every(controlName => {
        const control = this.socialForm.get(controlName);
        return control ? control.valid : false;
    });
  }
}
