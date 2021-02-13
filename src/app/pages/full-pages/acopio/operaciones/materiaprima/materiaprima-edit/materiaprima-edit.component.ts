import { Component, OnInit, ViewEncapsulation,Input,ViewChild } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
import { materiaPrimaListData } from "../../materiaprima/materiaprima-list/data/materiaprima-list.data";
import { MaestroService } from '../../../../../../services/maestro.service';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-materiaprima-list',
  templateUrl: './materiaprima-edit.component.html',
  styleUrls: ['./materiaprima-edit.component.scss', '/assets/sass/pages/page-users.scss', '/assets/sass/libs/select.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MateriaPrimaEditComponent implements OnInit {
  
  @ViewChild('vform') validationForm: FormGroup;
  @Input() name;
  closeResult: string;
  consultaMateriaPrimaForm: FormGroup;
  listaProducto: Observable<any[]>;
  listaSubProducto: Observable<any[]>;
  selectedEstado: any;
  selectProducto: any;
  selectSubProducto: any;
  popupModel;
  
@ViewChild(DatatableComponent) table: DatatableComponent;

    
    public ColumnMode = ColumnMode;
    public limitRef = 10;


constructor(private modalService: NgbModal, private maestroService: MaestroService) { 
 
}

  ngOnInit(): void {
    this.cargarForm();
    this.cargarcombos();
  }

  cargarForm() {
    this.consultaMateriaPrimaForm = new FormGroup(
      {
        numGuia: new FormControl('', []),
        numReferencia: new FormControl('', []),
        producto: new FormControl('', []),
        subproducto: new FormControl('', [])
      });
    //this.consultaMateriaPrimaForm.setValidators(this.comparisonValidator())
  }
  open(content) {
    this.modalService.open(content).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
}

private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return `with: ${reason}`;
    }
}

cargarcombos() {
  this.maestroService.obtenerMaestros("Producto", 1)
    .subscribe(res => {
      if (res.Result.Success) {
        this.listaProducto = res.Result.Data;
      }
    },
      err => {
        console.error(err);
      }
    );

  this.maestroService.obtenerMaestros("SubProducto", 1)
    .subscribe(res => {
      if (res.Result.Success) {
        this.listaSubProducto = res.Result.Data;
      }
    },
      err => {
        console.error(err);
      }
    );

}


}
