import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

function passwordsMatch(control: AbstractControl) {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-signup-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup-component.component.html',
  styleUrl: './signup-component.component.css'
})
export class SignupComponentComponent {

  signupForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.signupForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordsMatch });
  }

  get nombre() { return this.signupForm.get('nombre'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { confirmPassword, ...data } = this.signupForm.value;
    this.authService.register(data).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        localStorage.setItem('role', payload.rol || 'usuario');
        localStorage.setItem('userId', payload.id || '');
        localStorage.setItem('nombre', payload.nombre || 'Usuario');
        this.toastr.success('Cuenta creada correctamente', '¡Registro exitoso!');
        this.router.navigate(['/recetas']);
      },
      error: () => {
        this.toastr.error('Error al registrarse. El correo puede ya estar en uso.', 'Error');
        this.loading = false;
      }
    });
  }
}