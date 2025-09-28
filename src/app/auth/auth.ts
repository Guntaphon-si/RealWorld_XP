import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };

  private animationInterval: any;

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

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      alert('เข้าสู่ระบบสำเร็จ!\nกำลังไปยัง Dashboard...');
      // Here you would redirect to the questionnaire or dashboard
      // this.router.navigate(['/dashboard']);
    }, 2000);
  }

  onSignup() {
    if (!this.signupForm.username || !this.signupForm.email || 
        !this.signupForm.password || !this.signupForm.confirmPassword) {
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

    if (!this.signupForm.acceptTerms) {
      alert('กรุณายอมรับเงื่อนไขการใช้งาน');
      return;
    }

    this.isLoading = true;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
      alert('สร้างบัญชีสำเร็จ!\nกำลังไปยังแบบสอบถาม...');
      // Here you would redirect to the questionnaire
      // this.router.navigate(['/questionnaire']);
    }, 2500);
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
}