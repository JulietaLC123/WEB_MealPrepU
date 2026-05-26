import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-component.component.html',
  styleUrl: './login-component.component.css'
})
export class LoginComponentComponent {

  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        localStorage.setItem('role', payload.rol || 'usuario');
        localStorage.setItem('userId', payload.id || '');
        localStorage.setItem('nombre', payload.nombre || 'Usuario');
        this.toastr.success('¡Bienvenido a MealPrepU!', 'Sesión iniciada');
        this.router.navigate(['/recetas']);
      },
      error: () => {
        this.toastr.error('Credenciales incorrectas. Intenta de nuevo.', 'Error');
        this.loading = false;
      }
    });
  }
}