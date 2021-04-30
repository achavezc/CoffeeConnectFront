import { Component, Input, OnInit ,ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,ControlContainer} from '@angular/forms';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector:'app-detalleLote',
  templateUrl: './detalleLote.component.html',
  styleUrls: ['./detalleLote.component.scss']
})
export class DetalleLoteComponent implements OnInit {
    public detalleLoteFormGroup: FormGroup;
    limitRef: number = 10;
    @ViewChild(DatatableComponent) table: DatatableComponent;
    rows: any[] = [];
    tempRows: any[];
    errorGeneral = { isError: false, msgError: '' };
    popUp = true;
    detalleLotes: any[] =[];

    constructor( private controlContainer: ControlContainer,
      private modalService: NgbModal)
    {

    }
    openModal(modalNotaIngresoAlmacen) {
      this.modalService.open(modalNotaIngresoAlmacen, { windowClass: 'dark-modal', size: 'xl' });
  
    }
    close() {
      this.modalService.dismissAll();
    }
    ngOnInit(): void {
        this.detalleLoteFormGroup = <FormGroup> this.controlContainer.control;
    }

    updateLimit(limit: any) {
        this.limitRef = limit.target.value;
      }
    
      filterUpdate(event) {
        const val = event.target.value.toLowerCase();
        const temp = this.tempRows.filter(function (d) {
          return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
        });
        this.rows = temp;
        this.table.offset = 0;
      }

      cargarDatos(detalleLotes:any){
        this.detalleLotes = detalleLotes.listaDetalle;
        this.tempRows = detalleLotes.listaDetalle;
        this.rows = [...detalleLotes.listaDetalle];
      }

      agregarNotaIngreso($event)
      {
       
       $event.forEach(x=>{
          let object : any = {};  
          object.NumeroNotaIngresoAlmacen = x.Numero;
          object.FechaIngresoAlmacen = x.FechaRegistro;
          object.CodigoSocio = x.CodigoSocio;
          object.UnidadMedida = x.UnidadMedida;
          object.CantidadPesado = x.CantidadPesado;
          object.KilosBrutosPesado = x.KilosBrutosPesado;
          object.KilosNetosPesado = x.KilosNetosPesado;
          object.TotalAnalisisSensorial = x.TotalAnalisisSensorial;
          object.RendimientoPorcentaje = x.RendimientoPorcentaje;
          object.HumedadPorcentaje = x.HumedadPorcentajeAnalisisFisico;
          this.detalleLotes.push(object);
        });
        this.tempRows = this.detalleLotes;
        this.rows = [...this.detalleLotes];
      }

      
}