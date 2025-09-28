import { Component, AfterViewInit, HostListener, ElementRef, Renderer2, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  
  private observer!: IntersectionObserver;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

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
  }
}