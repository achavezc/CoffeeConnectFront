import { Component, Input, OnInit ,ViewChild} from '@angular/core';
import { MaestroUtil } from '../../../../../../../services/util/maestro-util';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn,ControlContainer} from '@angular/forms';
import { DatatableComponent } from "@swimlane/ngx-datatable";

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

    constructor( private controlContainer: ControlContainer)
    {

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
        this.tempRows = detalleLotes.listaDetalle;
        this.rows = [...detalleLotes.listaDetalle];
      }

      
}