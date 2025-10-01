import { Component,OnInit ,signal,ViewChild, ElementRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule ,FormGroup, FormControl, Validators,ReactiveFormsModule} from '@angular/forms';
import { ApiService } from '../services/api';
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
      age: new FormControl(null, [Validators.required]),
      gender: new FormControl(null, [Validators.required]), 
      vacationDays: new FormControl(null, [Validators.required]),
      monthlySpend: new FormControl(null, [Validators.required]),
      onlinePurchases: new FormControl(null, [Validators.required]),
      charityDonations: new FormControl(null, [Validators.required]),
      weeklyExercise: new FormControl(null, [Validators.required]),
      // Step 2
      portfolioValue: new FormControl(null, [Validators.required]),
      healthConsciousness: new FormControl(null, [Validators.required]),
      educationLevel: new FormControl(null, [Validators.required]),
      dailyScreenTime: new FormControl(null, [Validators.required]),
      environmentalAwareness: new FormControl(null, [Validators.required]),
      socialMediaInfluence: new FormControl(null, [Validators.required]),
      // Step 3
      riskTolerance: new FormControl(null, [Validators.required]),
      professionalTrainings: new FormControl(null, [Validators.required]),
      techSavviness: new FormControl(null, [Validators.required]),
      financialWellness: new FormControl(null, [Validators.required]),
      lifestyleBalance: new FormControl(null, [Validators.required]),
      entertainmentEngagement: new FormControl(null, [Validators.required]),
      // Step 4
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
        this.router.navigate(['/result']);
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
      // แปลงค่าเป็นทศนิยม ถ้าไม่มีค่าให้เป็น 0
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
    const controlsStep2 = ['portfolioValue', 'healthConsciousness', 'educationLevel', 'dailyScreenTime', 'environmentalAwareness', 'socialMediaInfluence'];
    const controlsStep3 = ['riskTolerance', 'professionalTrainings', 'techSavviness', 'financialWellness', 'lifestyleBalance', 'entertainmentEngagement'];
    const controlsStep4 = ['socialResponsibility', 'workLifeBalance', 'investmentRiskAppetite', 'ecoConsciousness', 'stressManagement', 'timeManagement'];

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
