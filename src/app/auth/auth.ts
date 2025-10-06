import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '../shared/data';
@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  activeTab: string = 'login';
  isLoading: boolean = false;
  passwordVisibility: { [key: string]: boolean } = {
    loginPassword: false,
    signupPassword: false,
    confirmPassword: false
  };
  
  // Form data
  loginForm = {
    username: '',
    password: '',
    rememberMe: false
  };

  signupForm = {
    username: '', // email field is not used by backend yet
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  private animationInterval: any;

  constructor(
    private router: Router,
    private http: HttpClient,
    private userIdDataService: DataService,
  ) {}

  ngOnInit() {
    this.createParticles();
    this.initializeAnimations();
  }

  ngOnDestroy() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
    }
  }

  createParticles() {
    const bgAnimation = document.getElementById('bgAnimation');
    if (!bgAnimation) return;

    const particleCount = 40;
    bgAnimation.innerHTML = ''; // Clear existing particles

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
      bgAnimation.appendChild(particle);
    }
  }

  initializeAnimations() {
    // Add floating animation to logo
    this.animationInterval = setInterval(() => {
      const logo = document.querySelector('.logo');
      if (logo) {
        (logo as HTMLElement).style.transform = 'translateY(' + Math.sin(Date.now() * 0.001) * 3 + 'px)';
      }
    }, 50);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    this.isLoading = false;
    this.resetForms();
  }

  resetForms() {
    this.loginForm = {
      username: '',
      password: '',
      rememberMe: false
    };

    this.signupForm = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    };
  }

  togglePassword(inputId: string) {
    this.passwordVisibility[inputId] = !this.passwordVisibility[inputId];
  }

  getPasswordType(inputId: string): string {
    return this.passwordVisibility[inputId] ? 'text' : 'password';
  }

  getPasswordToggleIcon(inputId: string): string {
    return this.passwordVisibility[inputId] ? '🙈' : '👁️';
  }

  onLogin() {
    if (!this.loginForm.username || !this.loginForm.password) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    this.handleLoginAsync();
  }

  // สร้างฟังก์ชันใหม่เพื่อใช้ async/await
  private async handleLoginAsync(): Promise<void> {
    this.isLoading = true;
    try {
      // Step 1: รอจนกว่าจะได้ token กลับมา
      const tokenResponse = await firstValueFrom(this.login(this.loginForm));
      
      // Step 2: รอจนกว่าจะได้ข้อมูลโปรไฟล์ผู้ใช้
      const userProfile = await firstValueFrom(this.getUserProfile(tokenResponse.access_token));

      // Step 3: เก็บข้อมูลผู้ใช้ (ที่มี name) ลงใน localStorage
      localStorage.setItem('currentUser', JSON.stringify(userProfile));

      // Step 4: "ประกาศ" บอกทั้งแอปว่าสถานะเปลี่ยนไปแล้ว
      window.dispatchEvent(new CustomEvent('loginStateChange'));

      console.log('Login and profile fetch successful', { token: tokenResponse, profile: userProfile });
      this.userIdDataService.updateUserId(userProfile.id);
      // Step 5: เปลี่ยนหน้าหลังจากทุกอย่างเสร็จสิ้น
      await this.router.navigate(['/home']);
    } catch (err) {
      console.error('Login failed', err);
      alert('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      this.isLoading = false;
    }
  }

  onSignup() {
    if (!this.signupForm.username || !this.signupForm.password || !this.signupForm.confirmPassword) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    if (this.signupForm.password !== this.signupForm.confirmPassword) {
      alert('รหัสผ่านไม่ตรงกัน กรุณาลองใหม่');
      return;
    }

    if (this.signupForm.password.length < 8) {
      alert('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }


    this.isLoading = true;
    const { username, password } = this.signupForm;
    this.signup({ username, password }).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        this.isLoading = false;
        alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
        this.switchTab('login'); // สลับไปหน้า login อัตโนมัติ
      },
      error: (err) => {
        console.error('Signup failed', err);
        // แสดงข้อความ error จาก backend ถ้ามี
        alert(`สมัครสมาชิกไม่สำเร็จ: ${err.error.detail || 'เกิดข้อผิดพลาด'}`);
        this.isLoading = false;
      }
    });
  }

  socialLogin(provider: string) {
    const providerNames: { [key: string]: string } = {
      'google': 'Google',
      'facebook': 'Facebook',
      'line': 'LINE'
    };
    
    alert(`กำลังเข้าสู่ระบบด้วย ${providerNames[provider]}...\n(นี่คือการจำลองเท่านั้น)`);
  }

  // Password validation for real-time feedback
  isPasswordMatch(): boolean {
    if (!this.signupForm.confirmPassword) return true;
    return this.signupForm.password === this.signupForm.confirmPassword;
  }

  getConfirmPasswordClass(): string {
    if (!this.signupForm.confirmPassword) return '';
    return this.isPasswordMatch() ? 'password-match' : 'password-mismatch';
  }

  onInputFocus(event: Event) {
    const element = event.target as HTMLElement;
    const parent = element.parentElement;
    if (parent) {
      parent.style.transform = 'translateY(-1px)';
    }
  }

  onInputBlur(event: Event) {
    const element = event.target as HTMLElement;
    const parent = element.parentElement;
    if (parent) {
      parent.style.transform = 'translateY(0)';
    }
  }

  // --- Methods moved from AuthService ---
  private apiUrl = 'http://localhost:8000/api/auth';

  signup(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, user);
  }

  login(credentials: any): Observable<any> {
    // FastAPI's OAuth2PasswordRequestForm expects form data
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post(`${this.apiUrl}/token`, body.toString(), { headers }).pipe(
      tap((response: any) => {
        // Save the token to localStorage upon successful login
        if (response.access_token) {
          localStorage.setItem('access_token', response.access_token);
        }
      })
    );
  }

  // --- ฟังก์ชันใหม่สำหรับดึงข้อมูลผู้ใช้ ---
  getUserProfile(token: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    // The user profile endpoint is at /api/auth/me
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }
}