import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidationErrors, ValidatorFn, FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Router } from "@angular/router"

@Component({
  selector: 'app-consultar-lotes',
  templateUrl: './consultar-lotes.component.html',
  styleUrls: ['./consultar-lotes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MConsultarLotesComponent implements OnInit {

  ngOnInit(): void { }

  /* @ViewChild('vform') validationForm: FormGroup;
   selectSubProducto: any;
   consultaMateriaPrimaFormEdit: FormGroup;


   constructor(private modalService: NgbModal,
       private router: Router,
       private fb: FormBuilder)
       {

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
  
   cargarForm() {
       let x = this.selectSubProducto;
         this.consultaMateriaPrimaFormEdit =this.fb.group(
           {
             tipoProveedorId: ['', ],
             socioId:  ['', ],
             terceroId:  ['', ],
             intermediarioId:  ['', ],
             numGuia:  ['', ],
             numReferencia:  ['', ],
             producto:  ['', Validators.required],
             subproducto:['', Validators.required],
             tipoProduccion:['', ],
             provNombre: ['', Validators.required],
             provDocumento: ['', Validators.required],
             provTipoSocio: new FormControl({value: '', disabled: true},[Validators.required]),
             provCodigo: ['', ],
             provDepartamento: ['', Validators.required],
             provProvincia: ['', Validators.required],
             provDistrito: ['', Validators.required],
             provZona: ['', Validators.required],
             provFinca: ['',],
             fechaCosecha: ['', Validators.required],
             guiaReferencia:   new FormControl('', [Validators.minLength(5), Validators.maxLength(20), Validators.pattern('^[A-Za-z0-9ñÑáéíóúÁÉÍÓÚ ]+$')]),
             fechaPesado:  ['', ],
             pesado: this.fb.group({
               unidadMedida: new FormControl('', [Validators.required]),
               cantidad: new FormControl('', [Validators.required]),
               kilosBruto: new FormControl('', [Validators.required]),
               tara: new FormControl('', []),
               observacionPesado: new FormControl('', []),
   
               exportGramos: new FormControl('', []),
               exportPorcentaje: new FormControl('', []),
               descarteGramos: new FormControl('', []),
               descartePorcentaje: new FormControl('', []),
               cascarillaGramos: new FormControl('', []),
               cascarillaPorcentaje: new FormControl('', []),
               totalGramos: new FormControl('', []),
               totalPorcentaje: new FormControl('', []),
               humedad: new FormControl('', []),
               ObservacionAnalisisFisico: new FormControl('', []),
               ObservacionRegTostado: new FormControl('', []),
               ObservacionAnalisisSensorial: new FormControl('', [])
             }),
             estado:  ['', ],
             socioFincaId:  ['', ],
             terceroFincaId:  ['', ]
   
           });
     }*/
}