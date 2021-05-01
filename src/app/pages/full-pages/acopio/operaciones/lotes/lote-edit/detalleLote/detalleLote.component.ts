import { Component, Input, OnInit ,ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,ControlContainer} from '@angular/forms';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertUtil } from '../../../../../../../services/util/alert-util';

@Component({
  selector:'app-detalleLote',
  templateUrl: './detalleLote.component.html',
  styleUrls: ['./detalleLote.component.scss',  "/assets/sass/libs/datatables.scss"]
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
    selected= [];
    lote: any;

    constructor( private controlContainer: ControlContainer,
      private modalService: NgbModal, private alertUtil: AlertUtil)
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
        this.lote = detalleLotes;
        this.detalleLotes = detalleLotes.listaDetalle;
        this.tempRows = detalleLotes.listaDetalle;
        this.rows = [...detalleLotes.listaDetalle];
      }

      agregarNotaIngreso($event)
      {
        let detalle: any[] = [];
        $event.forEach(x=>{
          let detalleId : any = {};  
          detalleId = this.detalleLotes.filter(y => y.NumeroNotaIngresoAlmacen == x.Numero);
          if (detalleId.length !=0)
          {
           detalle.push(detalleId[0].NumeroNotaIngresoAlmacen)}
        });
          if (detalle.length==0)
          {
       $event.forEach(x=>{
          let object : any = {};  
          object.NumeroNotaIngresoAlmacen = x.Numero;
          object.NotaIngresoAlmacenId = x.NotaIngresoAlmacenId;
          object.FechaIngresoAlmacen = x.FechaRegistro;
          object.CodigoSocio = x.CodigoSocio;
          object.UnidadMedida = x.UnidadMedida;
          object.CantidadPesado = x.CantidadPesado;
          object.KilosBrutosPesado = x.KilosBrutosPesado;
          object.KilosNetosPesado = x.KilosNetosPesado;
          object.TotalAnalisisSensorial = x.TotalAnalisisSensorial;
          object.RendimientoPorcentaje = x.RendimientoPorcentaje;
          object.HumedadPorcentaje = x.HumedadPorcentajeAnalisisFisico;
          object.Accion = 'N';
          this.detalleLotes.push(object);
        });
        let d = this.detalleLotes.filter(x=>x.Accion == null || x.Accion == 'N');
        this.tempRows = d;
        this.rows = [...this.tempRows];
        this.modalService.dismissAll();
      }
      else{
        let notasIngreso = "";
        detalle.forEach(
          x=> {
            notasIngreso = x + "," + notasIngreso;
          }
        )
        this.alertUtil.alertWarning("Oops...!", "Las Notas de Ingreso " + notasIngreso +" ya fueron agregadas.");
      }
       
      }

      eliminar(selected)
      {
        let form = this;
        this.alertUtil.alertSiNoCallback('Está seguro?', 'La Nota de Ingreso ' + selected[0].NumeroNotaIngresoAlmacen + ' se eliminará de su lista.' ,function(result){
          if(result.isConfirmed){
            let detalleEliminado: any[] =[];
            detalleEliminado = form.detalleLotes.filter(x=>x.NumeroNotaIngresoAlmacen == selected[0].NumeroNotaIngresoAlmacen)
            if (detalleEliminado.length > 0)
            {
              if ( detalleEliminado[0].Accion  == 'N')
              {
                form.detalleLotes = form.detalleLotes.filter(x=>x.NumeroNotaIngresoAlmacen != selected[0].NumeroNotaIngresoAlmacen);
              }
              else{
              detalleEliminado[0].Accion = "E";
              form.detalleLotes = form.detalleLotes.filter(x=>x.NumeroNotaIngresoAlmacen != selected[0].NumeroNotaIngresoAlmacen);
              form.detalleLotes.push(detalleEliminado[0]);
              }
              
            }
            let d = form.detalleLotes.filter(x=>x.Accion == null || x.Accion == 'N');
            form.tempRows = d;
            form.rows = [...form.tempRows];
            form.selected= [];
          }
        });
      }

      
}