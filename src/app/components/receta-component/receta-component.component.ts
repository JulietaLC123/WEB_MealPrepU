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

  // Filtros
  filtroNombre: string = '';
  filtroCategoria: string = '';
  filtroTiempo: string = '';

  constructor(
    private recetaService: RecetaService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Formulario crear: campos según el modelo de la API
    // ingredientes y pasos se ingresan separados por coma en un textarea
    this.recetaForm = this.formBuilder.group({
      titulo:      ['', Validators.required],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],  // string en UI, se convierte a array al enviar
      pasos:        ['', Validators.required],   // string en UI, se convierte a array al enviar
    });

    // Formulario editar: mismo shape
    this.editForm = this.formBuilder.group({
      titulo:      ['', Validators.required],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],
      pasos:        ['', Validators.required],
    });

    this.getAllRecetas();
  }

  // ── PERMISOS ──────────────────────────────────────────────
  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  // Puede eliminar: admin O el propio autor
  canDelete(receta: any): boolean {
    const userId = localStorage.getItem('userId');
    const autorId = receta.autorId?._id || receta.autorId;
    return this.authService.isAdmin() || (!!userId && userId === autorId);
  }

  // ── FILTROS ──────────────────────────────────────────────
  recetasFiltradas(): any[] {
    return this.recetaList.filter(r => {
      // ingredientes llega como Array<string> desde la API
      const ingStr = Array.isArray(r.ingredientes)
        ? r.ingredientes.join(' ')
        : (r.ingredientes || '');

      const matchNombre = !this.filtroNombre ||
        (r.titulo || '').toLowerCase().includes(this.filtroNombre.toLowerCase()) ||
        ingStr.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const matchCategoria = !this.filtroCategoria ||
        (r.categoria || '').toLowerCase() === this.filtroCategoria.toLowerCase();

      const matchTiempo = !this.filtroTiempo ||
        Number(r.tiempoPreparacion) <= Number(this.filtroTiempo);

      return matchNombre && matchCategoria && matchTiempo;
    });
  }

  limpiarFiltros() {
    this.filtroNombre = '';
    this.filtroCategoria = '';
    this.filtroTiempo = '';
  }

  // ── HELPERS ──────────────────────────────────────────────
  // Muestra ingredientes bonito en la tabla
  mostrarIngredientes(r: any): string {
    return Array.isArray(r.ingredientes) ? r.ingredientes.join(', ') : (r.ingredientes || '');
  }

  mostrarPasos(r: any): string {
    return Array.isArray(r.pasos) ? r.pasos.join(' → ') : (r.pasos || '');
  }

  getNombreAutor(r: any): string {
    return r.autorId?.nombre || '';
  }

  // Convierte string "a, b, c" a array ["a","b","c"]
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
    this.recetaService.getAllRecetasData().subscribe({
      next: (data: any) => { this.recetaList = data; },
      error: () => this.toastr.error('No se pudieron cargar las recetas', 'Error')
    });
  }

  newRecetaEntry() {
    if (this.recetaForm.invalid) return;
    const v = this.recetaForm.value;
    const userId = localStorage.getItem('userId');
    const payload = {
      titulo:      v.titulo,
      descripcion: v.descripcion,
      ingredientes: this.toArray(v.ingredientes),
      pasos:        this.toArray(v.pasos),
      autorId:      userId
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
    // Pre-cargar datos existentes en el formulario de edición
    this.editForm.setValue({
      titulo:      receta.titulo || '',
      descripcion: receta.descripcion || '',
      ingredientes: Array.isArray(receta.ingredientes)
        ? receta.ingredientes.join(', ')
        : (receta.ingredientes || ''),
      pasos: Array.isArray(receta.pasos)
        ? receta.pasos.join(', ')
        : (receta.pasos || '')
    });
    this.editableReceta = true;
    setTimeout(() => document.getElementById('editSection')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }

  updateRecetaEntry() {
    if (this.editForm.invalid) return;
    const v = this.editForm.value;
    const payload = {
      titulo:      v.titulo,
      descripcion: v.descripcion,
      ingredientes: this.toArray(v.ingredientes),
      pasos:        this.toArray(v.pasos)
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