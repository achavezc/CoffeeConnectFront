import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-proyectos-edit',
  templateUrl: './proyectos-edit.component.html',
  styleUrls: ['./proyectos-edit.component.scss']
})
export class ProyectosEditComponent implements OnInit {

  proyectosEditForm: FormGroup;

  constructor() { }

  ngOnInit(): void {
  }

  get f() {
    return this.proyectosEditForm.controls;
  }

}
