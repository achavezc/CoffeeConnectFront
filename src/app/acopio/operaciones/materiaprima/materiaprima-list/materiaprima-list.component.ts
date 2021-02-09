import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { DatatableComponent, ColumnMode } from "@swimlane/ngx-datatable";
//import { materiaPrimaListData } from "./data/materiaprima-list.data";
import { MaestroService } from '../../../../services/maestro.service';
import { AcopioService } from '../../../../services/acopio.service';

import { CustomValidator, DateValidators } from '../../../../shared/util/CustomValidator';
//import { MaestroUtil } from '../../../../services/util/maestro.util';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators, NgForm, MaxLengthValidator } from '@angular/forms';
import { DatePipe } from '@angular/common'
import {formatDate} from '@angular/common';
/*
export class User {
  public fname: string;
  public lname: string;
  public city: string;
}
*/
@Component({
    selector: "app-materiaprima-list",
    templateUrl: "./materiaprima-list.component.html",
    styleUrls: [
        "./materiaprima-list.component.scss",
        "/assets/sass/libs/datatables.scss",
    ],
    encapsulation: ViewEncapsulation.None
})


  
export class MateriaPrimaListComponent implements OnInit {

    @ViewChild('vform') validationForm: FormGroup;
    //user: User;
    //model = new User();
    submitted = false;

    listaEstado: Observable<any[]>;
    listaTipoDocumento: Observable<any[]>;
    selectedTipoDocumento: any;
    selectedEstado: any;
    consultaMateriaPrimaForm: FormGroup;
    //fechaInicio;
    //fechaFin;
    
   

    @ViewChild(DatatableComponent) table: DatatableComponent;

    // row data
    public rows = [];//materiaPrimaListData;
    public ColumnMode = ColumnMode;
    public limitRef = 10;

    // column header
    public columns = [
        { name: "ID", prop: "ID" },
        { name: "Username", prop: "Username" },
        { name: "Name", prop: "Name" },
        { name: "Last Activity", prop: "Last Activity" },
        { name: "Verified", prop: "Verified" },
        { name: "Role", prop: "Role" },
        { name: "Status", prop: "Status" },
        { name: "Actions", prop: "Actions" },
    ];

    // private
    private tempData = [];
    constructor(private maestroService: MaestroService,
                private acopioService: AcopioService) {
                  /*
                  this.model = {
                    fname: 'Mark',
                    lname: 'Otto',
                    city: ''
                  }}*/
        //this.tempData = materiaPrimaListData;
    }
    /*
    onSubmit(form) {
      console.log(form.value)
    }
    */
   /*
    onCustomFormSubmit() {
      this.validationForm.reset();
    }  
    */
    
    get f() {
      return this.consultaMateriaPrimaForm.controls;
    }
    
    onReactiveFormSubmit() {
      this.submitted = true;
      if (this.consultaMateriaPrimaForm.invalid) {
        return;
      }else{
        this.buscar();
      }
      console.log(this.consultaMateriaPrimaForm.value);
    }


    // Public Methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * filterUpdate
     *
     * @param event
     */
    filterUpdate(event) {
        
        const val = event.target.value.toLowerCase();

        // filter our data
        const temp = this.tempData.filter(function (d) {
            return d.Numero.toLowerCase().indexOf(val) !== -1 || !val;
        });

        // update the rows
        this.rows = temp;
        // Whenever the filter changes, always go back to the first page
        this.table.offset = 0;
        
    }

    /**
     * updateLimit
     *
     * @param limit
     */
    updateLimit(limit) {
        this.limitRef = limit.target.value;
    }

    ngOnInit(): void { 

      this.cargarForm();
      this.cargarcombos();



        this.consultaMateriaPrimaForm.controls['fechaFin'].setValue(this.currentDate());
        this.consultaMateriaPrimaForm.controls['fechaInicio'].setValue(this.currentMonthAgo());
        
    }
    currentDate() {
      const currentDate = new Date();
      return currentDate.toISOString().substring(0,10);
    }
    currentMonthAgo() {
      let now = new Date();
      let monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo.toISOString().substring(0,10);
    }

    cargarForm(){
      this.consultaMateriaPrimaForm = new FormGroup(
        {
        numeroGuia: new FormControl('',
         [Validators.required, 
          Validators.minLength(5), 
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')
        ]
        ),
        tipoDocumento: new FormControl('', []),
        nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
        fechaInicio: new FormControl('', 
        [Validators.required
          //,CustomeDateValidators.fromToDate('fechaFin','fechaInicio')
        ]
        ),
        numeroDocumento: new FormControl('', 
        [Validators.required, 
         Validators.minLength(8), 
         Validators.maxLength(20), 
         Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')
        ]
        ),
        estado: new FormControl('', []),
        fechaFin: new FormControl('',
         [Validators.required
         // ,CustomeDateValidators.fromToDate('fechaFin','fechaInicio')
        ]
        ),
        codigoSocio: new FormControl('', 
        [Validators.required, 
          Validators.minLength(5), 
          Validators.maxLength(20),
          Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')
        ]),
      }
      // , { validators: Validators.compose([
      //   DateValidators.dateLessThan('fechaFin', 'fechaInicio', { 'loaddate': false })
      //   //,DateValidators.dateLessThan('cargoLoadDate', 'cargoDeliveryDate', { 'cargoloaddate': true })
      // ])
      //   }
      
      );

    }
    cargarcombos(){
      this.maestroService.obtenerMaestros("EstadoGuiaRecepcion",1)
      .subscribe(res => {
          if (res.Result.Success)
          {
            this.listaEstado = res.Result.Data;
          }
        },
        err => {
          console.error(err);
        }
      );

      this.maestroService.obtenerMaestros("TipoDocumento",1)
      .subscribe(res => {
          if (res.Result.Success)
          {
            this.listaTipoDocumento = res.Result.Data;
          }
        },
        err => {
          console.error(err);
        }
      );
    }
    buscar() {
      //this.submitted = true;
      if (this.consultaMateriaPrimaForm.invalid) {
        this.submitted = true;
        return;
      }else{
        this.submitted = false;
        this.acopioService.consultarMateriaPrima()
        .subscribe(res => {
            if (res.Result.Success)
            {
              this.tempData = res.Result.Data;
              this.rows = [...this.tempData];
            }
          },
          err => {
            console.error(err);
          }
        );
      }
      console.log(this.consultaMateriaPrimaForm.value);
       

        //return;
      

        
    }
    

}
