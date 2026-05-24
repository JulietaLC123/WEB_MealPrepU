import { Routes } from '@angular/router';
import { RecetaComponentComponent } from './components/receta-component/receta-component.component';

export const routes: Routes = [
  { path: 'recetas', component: RecetaComponentComponent },
  { path: '', redirectTo: '/recetas', pathMatch: 'full' }
];
