import { Routes } from '@angular/router';
import { ActivityFlowComponent } from './activity-flow/activity-flow';
import { ButtonTestComponent } from './button-test/button-test';


export const routes: Routes = [
    {
        path: 'activity',
        component: ActivityFlowComponent
    },
    {
        path : '',
        component: ButtonTestComponent
    }
];