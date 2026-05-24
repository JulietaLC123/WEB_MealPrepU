import { Routes } from '@angular/router';
import { RecetaComponentComponent } from './components/receta-component/receta-component.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { SignupComponentComponent } from './components/signup-component/signup-component.component';

export const routes: Routes = [
  { path: 'recetas', component: RecetaComponentComponent },
  { path: 'login',   component: LoginComponentComponent },
  { path: 'signup',  component: SignupComponentComponent },
  { path: '',        redirectTo: '/recetas', pathMatch: 'full' }
];
