import { Component, AfterViewInit, HostListener, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common'; // NgIf มาจาก CommonModule
import { RouterLink } from '@angular/router'; // 👈 1. เพิ่มการ import RouterLink

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf, 
    RouterLink // 👈 2. เพิ่ม RouterLink เข้าไปใน imports array
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // ประกาศ property 'user' เพื่อให้ template และ method อื่นๆ ในคลาสสามารถเข้าถึงได้
  // กำหนด type เป็น object ที่มี name หรือเป็น null และให้ค่าเริ่มต้นเป็น null (ยังไม่ล็อกอิน)
  user: { username: string } | null = null; 
  showScrollTopButton = false; // 👈 1. เพิ่ม property สำหรับควบคุมการแสดงผลปุ่ม
  
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // สร้างฟังก์ชันสำหรับตรวจสอบสถานะล็อกอินโดยเฉพาะ
  private checkLoginStatus(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      // ตรวจสอบให้แน่ใจว่ามี property 'username' อยู่ในข้อมูลที่ดึงมา
      if (parsedUser && parsedUser.username) {
        this.user = { username: parsedUser.username };
      } else {
        this.user = null; // ถ้าข้อมูลไม่สมบูรณ์ ให้ถือว่ายังไม่ได้ล็อกอิน
      }
    } else {
      this.user = null;
    }
    console.log('HomeComponent: Login status checked.', this.user);
  }

  ngOnInit(): void {
    // 1. ตรวจสอบสถานะเมื่อโหลดหน้าครั้งแรก
    this.checkLoginStatus();

    // 2. เพิ่ม Event Listener เพื่อ "ดักฟัง" การเปลี่ยนแปลงสถานะจากหน้าอื่น
    // เราใช้ arrow function `() => this.checkLoginStatus()` เพื่อให้ `this` ยังคงหมายถึง HomeComponent
    window.addEventListener('loginStateChange', this.handleLoginStateChange);
  }

  ngAfterViewInit(): void {
    this.createParticles();
    this.setupSmoothScrolling();
    this.initIntersectionObserver();

    // เรียกใช้ครั้งแรกเผื่อ element อยู่ในหน้าจอแล้ว
    this.onWindowScroll();
  }

  // Listener สำหรับ Scroll Event
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    // Navbar style change
    const navbar = this.el.nativeElement.querySelector('nav');
    if (window.scrollY > 100) {
      this.renderer.addClass(navbar, 'scrolled');
    } else {
      this.renderer.removeClass(navbar, 'scrolled');
    }

    // 2. ตรวจสอบตำแหน่ง scroll เพื่อแสดง/ซ่อนปุ่ม Page Up
    // ถ้า scroll ลงมามากกว่า 400px ให้แสดงปุ่ม
    this.showScrollTopButton = window.scrollY > 400;

    // Trigger scroll animations for elements
    const elements = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
    elements.forEach((element: HTMLElement) => {
      const elementTop = element.getBoundingClientRect().top;
      if (elementTop < window.innerHeight - 100) {
        this.renderer.addClass(element, 'animated');
      }
    });
  }

  // สร้าง Particle สำหรับ Background
  createParticles(): void {
    const container = this.el.nativeElement.querySelector('.bg-animation');
    for (let i = 0; i < 50; i++) {
        const particle = this.renderer.createElement('div');
        this.renderer.addClass(particle, 'particle');
        this.renderer.setStyle(particle, 'left', `${Math.random() * 100}%`);
        this.renderer.setStyle(particle, 'top', `${Math.random() * 100}%`);
        this.renderer.setStyle(particle, 'animationDelay', `${Math.random() * 6}s`);
        this.renderer.setStyle(particle, 'animationDuration', `${Math.random() * 3 + 3}s`);
        this.renderer.appendChild(container, particle);
    }
  }

  // ทำให้การเลื่อนไปยัง Section ต่างๆ นุ่มนวล
  setupSmoothScrolling(): void {
    const links = this.el.nativeElement.querySelectorAll('a[href^="#"]');
    links.forEach((anchor: HTMLAnchorElement) => {
        anchor.addEventListener('click', (e: Event) => {
            e.preventDefault();
            const targetId = anchor.getAttribute('href');
            if (targetId) {
                const targetElement = this.el.nativeElement.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
  }

  // ตั้งค่า Intersection Observer สำหรับตรวจจับว่า Element เข้ามาในหน้าจอหรือยัง
  initIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // ในที่นี้เราใช้ class 'animated' จัดการ animation แทน
          // หากมี animation ที่ซับซ้อน สามารถเรียกใช้ function เฉพาะทางที่นี่ได้
          this.renderer.addClass(entry.target, 'animated');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const targets = this.el.nativeElement.querySelectorAll('.animate-on-scroll');
    targets.forEach((target: Element) => {
      this.observer.observe(target);
    });
  }
  
  // Clean up observer เมื่อ component ถูกทำลาย
  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    // 3. ยกเลิก Event Listener เมื่อ Component ถูกทำลาย เพื่อป้องกัน Memory Leak
    window.removeEventListener('loginStateChange', this.handleLoginStateChange);
  }

  // ใช้ Arrow function เพื่อให้ `this` ถูกต้องเสมอ
  private handleLoginStateChange = (): void => {
    this.checkLoginStatus();
  };

  // เพิ่มฟังก์ชัน logout()
  logout(): void {
    // ลบข้อมูลผู้ใช้ออกจาก localStorage
    localStorage.removeItem('currentUser');
    // "ประกาศ" บอกทั้งแอปว่าสถานะเปลี่ยนไปแล้ว
    window.dispatchEvent(new CustomEvent('loginStateChange'));
  }

  // 3. เพิ่มฟังก์ชันสำหรับเลื่อนกลับไปด้านบนสุด
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // ทำให้การเลื่อนนุ่มนวล
    });
  }
}