import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { RecetaService } from '../../services/receta.service';

@Component({
  selector: 'app-receta-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './receta-component.component.html',
  styleUrl: './receta-component.component.css'
})
export class RecetaComponentComponent implements OnInit {

  recetaList: any[] = [];
  recetaForm: any;
  idReceta: any;
  editableReceta: boolean = false;

  constructor(
    private recetaService: RecetaService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.recetaForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      ingredientes: ['', Validators.required],
      tiempoPreparacion: ['', Validators.required],
      categoria: ['', Validators.required]
    });
    this.getAllRecetas();
  }

  // Mensaje de confirmación con toastr
  newMessage(messageText: string) {
    this.toastr.success('Clic aquí para actualizar la lista', messageText)
      .onTap
      .pipe(take(1))
      .subscribe(() => window.location.reload());
  }

  // GET - obtener todas las recetas
  getAllRecetas() {
    this.recetaService.getAllRecetasData().subscribe((data: any) => {
      this.recetaList = data;
    });
  }

  // POST - crear nueva receta
  newRecetaEntry() {
    this.recetaService.newReceta(this.recetaForm.value).subscribe(
      () => {
        this.router.navigate(['/recetas'])
          .then(() => {
            this.newMessage('Receta registrada exitosamente');
          });
      }
    );
  }

  // PUT - toggle formulario de edición y cargar datos
  toggleEditReceta(id: any) {
    this.idReceta = id;
    this.recetaService.getOneReceta(id).subscribe(
      (data: any) => {
        this.recetaForm.setValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          ingredientes: data.ingredientes,
          tiempoPreparacion: data.tiempoPreparacion,
          categoria: data.categoria
        });
      }
    );
    this.editableReceta = !this.editableReceta;
  }

  // PUT - actualizar receta
  updateRecetaEntry() {
    for (let key in this.recetaForm.value) {
      if (this.recetaForm.value[key] === '') {
        this.recetaForm.removeControl(key);
      }
    }
    this.recetaService.updateReceta(this.idReceta, this.recetaForm.value).subscribe(
      () => {
        this.editableReceta = false;
        this.newMessage('Receta actualizada');
      }
    );
  }

  // DELETE - eliminar receta
  deleteRecetaEntry(id: any) {
    this.recetaService.deleteReceta(id).subscribe(
      () => {
        this.newMessage('Receta eliminada');
      }
    );
  }
}
