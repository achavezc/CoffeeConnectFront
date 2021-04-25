import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-agregar-archivo',
  templateUrl: './agregar-archivo.component.html',
  styleUrls: ['./agregar-archivo.component.scss']
})
export class MAgregarArchivoComponent implements OnInit {

  agregarArchivoForm: FormGroup;
  fileName = "";
  @Output() resAddFileEvent = new EventEmitter<any[]>();

  constructor(private fb: FormBuilder,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.LoadForm();
  }

  LoadForm(): void {
    this.agregarArchivoForm = this.fb.group({
      descripcion: []
    });
  }

  fileChange(event: any): void {

  }

  Descargar(): void {

  }

  SaveFile(): void {

  }

}
