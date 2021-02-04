import { Routes, RouterModule } from '@angular/router';

//Route for content layout with sidebar, navbar and footer.

export const Full_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadChildren: () => import('../../pages/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'acopio',
    loadChildren: () => import('../../acopio/acopio.module').then(m => m.AcopioModule)
  }
];
