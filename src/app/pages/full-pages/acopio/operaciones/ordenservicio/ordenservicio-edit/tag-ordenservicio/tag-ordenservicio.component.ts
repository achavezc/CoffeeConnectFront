import { Component, OnInit, ViewChild, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import swal from 'sweetalert2';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, ControlContainer } from '@angular/forms';
import { MaestroService } from '../../../../../../../services/maestro.service';

@Component({
  selector: 'tag-orden-servicio',
  templateUrl: './tag-ordenservicio.component.html',
  styleUrls: ['./tag-ordenservicio.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TagOrdenServicioComponent implements OnInit {

  tagOrdenServicio: FormGroup;
  listaTipoProduccion: any[];
  selectedTipoProduccion: any;
  listaProducto: any[];
  selectedProducto: any;
  listaSubProducto: any[];
  selectedSubProducto: any;
  listaUnidadMedida: any[];
  selectedUnidadMedida: any;
  submitted = false;
  viewTagSeco: boolean = false;
  @Output() subproductoEvent = new EventEmitter<boolean>();
  constructor( private controlContainer: ControlContainer,
    private maestroService: MaestroService, )
  {}
    ngOnInit(): void
    {
      this.tagOrdenServicio = <FormGroup> this.controlContainer.control;
      this.cargarformTagOrdenSalida();
    }

    cargarformTagOrdenSalida()
  {
    this.maestroService.obtenerMaestros("TipoProduccion")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaTipoProduccion = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
      this.maestroService.obtenerMaestros("Producto")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaProducto = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
      this.maestroService.obtenerMaestros("UnidadMedida")
      .subscribe(res => {
        if (res.Result.Success) {
          this.listaUnidadMedida = res.Result.Data;
        }
      },
        err => {
          console.error(err);
        }
      );
  }
  changeSubProducto(e) {
    let filterProducto = e.Codigo;
    this.cargarSubProducto(filterProducto);
  }
  async cargarSubProducto(codigo:any){
    
    var data = await this.maestroService.obtenerMaestros("SubProducto").toPromise();
    if (data.Result.Success) {
     this.listaSubProducto = data.Result.Data.filter(obj => obj.Val1 == codigo);
   }

 }
 changeView(e) {

  let filterSubTipo = e.Codigo;
  if (filterSubTipo == "02")
  {
      this.viewTagSeco = true;
  }
  else
  {
    this.viewTagSeco = false;
  }
  this.subproductoEvent.emit(this.viewTagSeco)
}
}
