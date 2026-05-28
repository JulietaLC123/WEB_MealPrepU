import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { RecetaService } from '../../services/receta.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-receta-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './receta-component.component.html',
  styleUrl: './receta-component.component.css'
})
export class RecetaComponentComponent implements OnInit {

  recetaList: any[] = [];
  recetaForm!: FormGroup;
  editForm!: FormGroup;
  idReceta: any;
  editableReceta: boolean = false;

  // Modal detalle
  recetaSeleccionada: any = null;

  // Filtros
  filtroNombre: string = '';
  filtroCategoria: string = '';
  filtroTiempo: string = '';

  readonly categorias = ['Desayuno', 'Almuerzo', 'Cena', 'Snack', 'Postre'];

  constructor(
    private recetaService: RecetaService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.recetaForm = this.formBuilder.group({
      titulo:            ['', Validators.required],
      descripcion:       ['', Validators.required],
      ingredientes:      ['', Validators.required],
      pasos:             ['', Validators.required],
      categoria:         ['', Validators.required],       // obligatorio
      tiempoPreparacion: ['', [Validators.required, Validators.min(1)]]
    });

    this.editForm = this.formBuilder.group({
      titulo:            ['', Validators.required],
      descripcion:       ['', Validators.required],
      ingredientes:      ['', Validators.required],
      pasos:             ['', Validators.required],
      categoria:         ['', Validators.required],
      tiempoPreparacion: ['', [Validators.required, Validators.min(1)]]
    });

    this.getAllRecetas();
  }

  // ── PERMISOS ──────────────────────────────────────────────
  isAdmin(): boolean   { return this.authService.isAdmin(); }
  isLoggedIn(): boolean { return this.authService.isLoggedIn(); }

  canEdit(receta: any): boolean {
    const userId = localStorage.getItem('userId');
    const autorId = receta.autorId?._id || receta.autorId;
    return this.authService.isAdmin() || (!!userId && userId === autorId);
  }

  canDelete(receta: any): boolean {
    const userId = localStorage.getItem('userId');
    const autorId = receta.autorId?._id || receta.autorId;
    return this.authService.isAdmin() || (!!userId && userId === autorId);
  }

  // ── FILTROS (se aplican en la API) ────────────────────────
  aplicarFiltros() {
    this.getAllRecetas();
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroTiempo = '';
    this.getAllRecetas();
  }

  // ── MODAL DETALLE ─────────────────────────────────────────
  verDetalle(receta: any) {
    this.recetaSeleccionada = receta;
    // Abrir el modal nativo de Bootstrap
    const modal = document.getElementById('modalDetalleReceta');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).show();
    }
  }

  cerrarDetalle() {
    this.recetaSeleccionada = null;
    const modal = document.getElementById('modalDetalleReceta');
    if (modal) {
      (window as any).bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }

  // ── HELPERS ──────────────────────────────────────────────
  mostrarIngredientes(r: any): string {
    return Array.isArray(r.ingredientes) ? r.ingredientes.join(', ') : (r.ingredientes || '');
  }

  mostrarPasos(r: any): string {
    return Array.isArray(r.pasos) ? r.pasos.join(' → ') : (r.pasos || '');
  }

  getNombreAutor(r: any): string {
    return r.autorId?.nombre || '';
  }

  private toArray(val: string): string[] {
    return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  // ── TOASTR ───────────────────────────────────────────────
  newMessage(messageText: string) {
    this.toastr.success('Clic aquí para actualizar la lista', messageText)
      .onTap.pipe(take(1))
      .subscribe(() => this.getAllRecetas());
  }

  // ── CRUD ─────────────────────────────────────────────────
  getAllRecetas() {
    const filtros = {
      nombre:    this.filtroNombre    || undefined,
      categoria: this.filtroCategoria || undefined,
      tiempoMax: this.filtroTiempo    || undefined
    };
    this.recetaService.getAllRecetasData(filtros).subscribe({
      next: (data: any) => { this.recetaList = data; },
      error: () => this.toastr.error('No se pudieron cargar las recetas', 'Error')
    });
  }

  newRecetaEntry() {
    if (this.recetaForm.invalid) {
      this.recetaForm.markAllAsTouched();
      return;
    }
    const v = this.recetaForm.value;
    const userId = localStorage.getItem('userId');
    const payload = {
      titulo:            v.titulo,
      descripcion:       v.descripcion,
      ingredientes:      this.toArray(v.ingredientes),
      pasos:             this.toArray(v.pasos),
      categoria:         v.categoria,
      tiempoPreparacion: Number(v.tiempoPreparacion),
      autorId:           userId
    };
    this.recetaService.newReceta(payload).subscribe({
      next: () => {
        this.recetaForm.reset();
        this.getAllRecetas();
        this.newMessage('Receta registrada exitosamente');
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || 'Error al guardar', 'Error');
      }
    });
  }

  toggleEditReceta(receta: any) {
    this.idReceta = receta._id;
    this.editForm.setValue({
      titulo:            receta.titulo || '',
      descripcion:       receta.descripcion || '',
      ingredientes: Array.isArray(receta.ingredientes)
        ? receta.ingredientes.join(', ')
        : (receta.ingredientes || ''),
      pasos: Array.isArray(receta.pasos)
        ? receta.pasos.join(', ')
        : (receta.pasos || ''),
      categoria:         receta.categoria || '',
      tiempoPreparacion: receta.tiempoPreparacion || ''
    });
    this.editableReceta = true;
    setTimeout(() => document.getElementById('editSection')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  updateRecetaEntry() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const v = this.editForm.value;
    const payload = {
      titulo:            v.titulo,
      descripcion:       v.descripcion,
      ingredientes:      this.toArray(v.ingredientes),
      pasos:             this.toArray(v.pasos),
      categoria:         v.categoria,
      tiempoPreparacion: Number(v.tiempoPreparacion)
    };
    this.recetaService.updateReceta(this.idReceta, payload).subscribe({
      next: () => {
        this.editableReceta = false;
        this.getAllRecetas();
        this.newMessage('Receta actualizada');
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.error || 'Error al actualizar', 'Error');
      }
    });
  }

  deleteRecetaEntry(id: any) {
    if (!confirm('¿Seguro que deseas eliminar esta receta?')) return;
    this.recetaService.deleteReceta(id).subscribe({
      next: () => {
        this.getAllRecetas();
        this.newMessage('Receta eliminada');
      },
      error: () => this.toastr.error('No tienes permiso para eliminar', 'Error')
    });
  }
}
