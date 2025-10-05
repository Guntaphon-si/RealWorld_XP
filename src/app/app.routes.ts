import { Routes } from '@angular/router';
import { AssessMentQuestion } from './assess-ment-question/assess-ment-question';
import { ResultAndChooseActivity } from './result-and-choose-activity/result-and-choose-activity';
import { ButtonTest } from './button-test1/button-test';
export const routes: Routes = [
  {
    path: 'assessment', // เมื่อเข้ามาที่ path หลัก (เช่น yoursite.com)
    component: AssessMentQuestion // ให้ใช้กรอบ MainLayout
  },
  {
    path:'result',
    component:ResultAndChooseActivity 
  },
  {
    path:'',
    component:ButtonTest 
  },
  // หากไม่พบ Route ไหนเลย ให้กลับไปหน้า dashboard
  { path: '**', redirectTo: '' }
];



export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then(m => m.HomeComponent) },
  { path: 'auth', loadComponent: () => import('./auth/auth').then(m => m.AuthComponent) },
  { path: '**', redirectTo: '' }
];
