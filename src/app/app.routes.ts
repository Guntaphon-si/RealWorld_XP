import { Routes } from '@angular/router';
import { ActivityFlowComponent } from './activity-flow/activity-flow';
import { ButtonTestComponent } from './button-test/button-test';
import { AssessMentQuestion } from './assess-ment-question/assess-ment-question';
import { ResultAndChooseActivity } from './result-and-choose-activity/result-and-choose-activity';
import { ButtonTest } from './button-test1/button-test';
import { DashboardComponent } from './dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: 'activity',
        component: ActivityFlowComponent
    },
    {
        path : 'test',
        component: ButtonTestComponent
    },
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
    {
      path: 'dashboard',
      component: DashboardComponent
    },
    { path: '', loadComponent: () => import('./home/home').then(m => m.HomeComponent) },
    { path: 'auth', loadComponent: () => import('./auth/auth').then(m => m.AuthComponent) },
    { path: '**', redirectTo: '' }
];


