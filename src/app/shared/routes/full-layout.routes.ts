import { Routes, RouterModule } from '@angular/router';

//Route for content layout with sidebar, navbar and footer.

export const Full_ROUTES: Routes = [
  {
    path: 'acopio',
    loadChildren: () => import('../../acopio/acopio.module').then(m => m.AcopioModule)
  }
];
