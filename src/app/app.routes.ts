import { Routes } from '@angular/router';
import { ActivityFlowComponent } from './activity-flow/activity-flow';
import { ButtonTestComponent } from './button-test/button-test';
import { AssessMentQuestion } from './assess-ment-question/assess-ment-question';
import { ResultAndChooseActivity } from './result-and-choose-activity/result-and-choose-activity';
import { ButtonTest } from './button-test1/button-test';
import { AuthComponent } from './auth/auth';
import { HomeComponent } from './home/home';

export const routes: Routes = [
    {
        path: 'activity',
        component: ActivityFlowComponent
    },
    {
        path : 'test1',
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
      path:'test2',
      component:ButtonTest 
    },
    { 
      path: '', 
      component: HomeComponent 
    },
    { 
      path: 'auth', 
      component: AuthComponent 
    },
    { 
      path: '**', 
      redirectTo: '' 
    }
    // หากไม่พบ Route ไหนเลย ให้กลับไปหน้า dashboard
];
