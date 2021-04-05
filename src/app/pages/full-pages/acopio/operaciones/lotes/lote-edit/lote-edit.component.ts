import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef, TRANSLATIONS } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { NgxSpinnerService } from "ngx-spinner";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { ActivatedRoute, Router } from '@angular/router';
import swal from 'sweetalert2';

import { DateUtil } from '../../../../../../services/util/date-util';
import { LoteService } from '../../../../../../services/lote.service';
import { MaestroService } from '../../../../../../services/maestro.service';
import { AlertUtil } from '../../../../../../services/util/alert-util';

@Component({
  selector: 'app-lote-edit',
  templateUrl: './lote-edit.component.html',
  styleUrls: ['./lote-edit.component.scss', '/assets/sass/libs/datatables.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoteEditComponent implements OnInit {

  constructor(private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private loteService: LoteService,
    private spinner: NgxSpinnerService,
    private maestroService: MaestroService,
    private alert: AlertUtil,
    private dateUtil: DateUtil) { }

  loteEditForm: any;
  listAlmacenes: any[];
  selectedAlmacen: any;
  limitRef: number = 10;
  rows: any[] = [];
  tempRows: any[];
  selected: any;
  vId: number;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  errorGeneral = { isError: false, msgError: '' };
  listEtiquetasLotes: any[];

  ngOnInit(): void {
    this.vId = parseInt(this.route.snapshot.params['id']);
    if (this.vId && this.vId > 0) {
      this.LoadForm();
      // this.LoadCombos();
      this.SearchById();
    }
  }

  LoadForm(): void {
    this.loteEditForm = this.fb.group({
      razonSocial: [],
      nroLote: [],
      direccion: [],
      fecha: [],
      ruc: [],
      almacen: ['', [Validators.required]],
      totalPesoNeto: [],
      promedioRendimiento: [],
      promedioHumedad: [],
      promedioPuntajeFinal: []
    });
  }
  get f() {
    return this.loteEditForm.controls;
  }

  LoadCombos(): void {
    this.GetAlmacenes();
  }

  async GetAlmacenes() {
    const form = this;
    const res = await this.maestroService.obtenerMaestros('Almacen').toPromise();
    if (res.Result.Success) {
      form.listAlmacenes = res.Result.Data;
    }
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

  SearchById(): void {
    this.spinner.show();
    this.loteService.SearchDetailsById({ LoteId: this.vId })
      .subscribe((res: any) => {
        if (res.Result.Success) {
          res.Result.Data.forEach((x: any) => {
            x.FechaIngresoAlmacenString = this.dateUtil.formatDate(new Date(x.FechaIngresoAlmacen))
          });
          this.tempRows = res.Result.Data;
          this.rows = [...this.tempRows];
          this.AutocompleteForm(res);
        }
      }, (err: any) => {
        this.spinner.hide();
      });
  }

  async AutocompleteForm(row: any) {
    await this.GetAlmacenes();
    this.loteEditForm.controls.razonSocial.setValue(row.RazonSocial);
    this.loteEditForm.controls.nroLote.setValue(row.Numero);
    this.loteEditForm.controls.direccion.setValue(row.Direccion);
    if (row.FechaRegistro && row.FechaRegistro.substring(0, 10) != "0001-01-01") {
      this.loteEditForm.controls.fecha.setValue(row.FechaRegistro.substring(0, 10));
    }
    this.loteEditForm.controls.ruc.setValue(row.Ruc);
    if (row.AlmacenId && this.listAlmacenes.find(x => x.Codigo == row.AlmacenId)) {
      this.loteEditForm.controls.almacen.setValue(row.AlmacenId);
    }
    if (row.TotalKilosNetosPesado) {
      this.loteEditForm.controls.totalPesoNeto.setValue(row.TotalKilosNetosPesado);
    }
    if (row.PromedioRendimientoPorcentaje) {
      this.loteEditForm.controls.promedioRendimiento.setValue(row.PromedioRendimientoPorcentaje);
    }
    if (row.PromedioHumedadPorcentaje) {
      this.loteEditForm.controls.promedioHumedad.setValue(row.PromedioHumedadPorcentaje);
    }
    if (row.PromedioTotalAnalisisSensorial) {
      this.loteEditForm.controls.promedioPuntajeFinal.setValue(row.PromedioTotalAnalisisSensorial);
    }
    this.spinner.hide();
  }

  Save(): void {
    if (!this.loteEditForm.invalid) {
      this.errorGeneral = { isError: false, msgError: '' };
      const form = this;
      swal.fire({
        title: '¿Estas Seguro?',
        text: `¿Está seguro de actualizar el lote "${this.loteEditForm.value.nroLote}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2F8BE6',
        cancelButtonColor: '#F55252',
        confirmButtonText: 'Si',
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger ml-1'
        },
        buttonsStyling: false,
      }).then(function (result) {
        if (result.value) {
          form.UpdateLote();
        }
      });
    } else {
      this.errorGeneral = { isError: true, msgError: 'Por favor completar los campos OBLIGATORIOS!' };
    }
  }

  UpdateLote(): void {
    this.spinner.show();
    const request = {
      LoteId: this.vId,
      AlmacenId: this.selectedAlmacen,
      Usuario: 'mruizb'
    }
    this.loteService.Update(request)
      .subscribe((res: any) => {
        this.spinner.hide();
        if (res.Result.Success) {
          this.alert.alertOkCallback("Actualizado!", "Actualizado correctamente!", () => {
            this.Cancel();
          });
        }
      }, (err: any) => {
        this.spinner.hide();
      });
  }

  Print(): void {
  }

  // async GetDataEtiquetasLotes() {
  //   this.spinner.show();
  //   const res = await this.loteService.ConsultarEtiquetasLote({ LoteId: this.vId }).toPromise();
  //   if (res.Result.Success) {

  //     const form = this;
  //     let lista: any[] = res.Result.Data;

  //     // lista = lista.splice(0,2);

  //     let idSocio: number, sumaCantidades: number = 0, obj: any, cantTotal: number = 0;
  //     let vArrIdSocios: any[] = [];
  //     lista.forEach(x => {
  //       if (!vArrIdSocios || vArrIdSocios.indexOf(x.SocioId) == -1) {
  //         vArrIdSocios.push(x.SocioId)
  //       }
  //       cantTotal = cantTotal + x.Cantidad;
  //     });
  //     let div1 = document.createElement('div');
  //     const enter = document.createElement('br');
  //     let div2 = document.createElement('div');
  //     div2.id = 'PDFHtml';
  //     div2.classList.add('container')
  //     const lblHeader = 'COOPERATIVA AGROECOLOGICA INDUSTRIAL JUAN SANTOS ATAHUALPA<br/>SISTEMA DE TRAZABILIDAD DE CALIDAD DE CAFÉ';
  //     const lblFooter = 'Este producto cumple con el reglamento técnico para productos orgánicos.';
  //     const fActual = this.dateUtil.formatDate(new Date());

  //     const bgth = "#AED6F1";

  //     for (let i = 0; i < vArrIdSocios.length; i++) {
  //       idSocio = parseInt(vArrIdSocios[i]);
  //       obj = lista.filter(x => x.SocioId == idSocio)[0];
  //       sumaCantidades = 0;
  //       lista.filter(x => x.SocioId == idSocio).forEach(x => {
  //         sumaCantidades += x.Cantidad;
  //       });

  //       for (let j = 0; j < sumaCantidades; j++) {
  //         //PRIMERA TABLA
  //         let tb1 = document.createElement('table');
  //         tb1.classList.add('border', 'border-dark', 'table');
  //         let tr1 = document.createElement('tr'); //PRIMERA FILA
  //         let td1 = document.createElement('td');
  //         td1.style.paddingBottom = '0';
  //         let img = document.createElement('img');
  //         img.src = 'http://localhost:4200/assets/img/LogoJuanSantosAtahualpa.jpg';
  //         img.width = 120;
  //         img.height = 160;
  //         td1.appendChild(img);
  //         tr1.appendChild(td1);
  //         td1 = document.createElement('td');
  //         td1.classList.add('text-center', 'align-middle', 'font-weight-bold', 'h4');
  //         td1.innerHTML = lblHeader;
  //         tr1.appendChild(td1);
  //         tb1.appendChild(tr1); //AGREGR A LA TABLA
  //         //SEGUNDA FILA
  //         tr1 = document.createElement('tr');
  //         td1 = document.createElement('td');
  //         td1.colSpan = 2;
  //         td1.style.paddingTop = '0';
  //         td1.style.paddingBottom = '0';

  //         //SEGUNDA TABLA
  //         let tb2 = document.createElement('table');
  //         tb2.classList.add('table', 'border', 'table-sm', 'border-dark', 'table-bordered');
  //         tb2.style.height = '555px';
  //         tb2.style.marginBottom = '0';

  //         //FILA 1
  //         let tr2 = document.createElement('tr');
  //         let th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.textContent = "LOTE"
  //         th.style.background = bgth;
  //         tr2.appendChild(th);
  //         let td2 = document.createElement('td');
  //         td2.classList.add('text-center', 'align-middle', 'h6');
  //         // td2.textContent = obj.Numero;
  //         td2.textContent = j.toString();
  //         tr2.appendChild(td2);
  //         th = document.createElement('th');
  //         th.classList.add('align-middle', 'text-center');
  //         th.textContent = "CÓDIGO";
  //         th.style.background = bgth;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('text-center', 'align-middle', 'h6');
  //         td2.textContent = obj.CodigoSocio;
  //         tr2.appendChild(td2);
  //         th = document.createElement('th');
  //         th.classList.add('align-middle', 'text-center');
  //         th.style.background = bgth;
  //         th.textContent = 'AGENCIA CERTIFICADORA';
  //         th.colSpan = 2;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('text-center', 'align-middle', 'h6');
  //         td2.textContent = obj.AgenciaCertificadora;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 2
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = 'FECHA';
  //         th.colSpan = 2;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.textContent = fActual;
  //         td2.colSpan = 5;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 3
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = 'PRODUCTOR';
  //         th.colSpan = 2;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.colSpan = 5;
  //         td2.textContent = obj.Socio;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 4
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = 'ZONA';
  //         th.colSpan = 2;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.colSpan = 5;
  //         td2.textContent = obj.Zona.trim();
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 5
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = 'FINCA';
  //         th.colSpan = 2;
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.colSpan = 5;
  //         td2.textContent = obj.Finca;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 6
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = "HUMEDAD";
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('text-right', 'align-middle', 'h6');
  //         td2.textContent = obj.PromedioHumedadPorcentaje
  //         tr2.appendChild(td2);
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = "RENDIMIENTO";
  //         th.colSpan = 2;
  //         th.classList.add('text-center')
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.colSpan = 3;
  //         td2.textContent = obj.PromedioRendimientoPorcentaje;
  //         td2.classList.add('text-right', 'align-middle', 'h6');
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 7
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle');
  //         th.style.background = bgth;
  //         th.textContent = "SACOS";
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.colSpan = 3;
  //         td2.classList.add('text-right', 'align-middle', 'h6');
  //         td2.textContent = cantTotal.toString();
  //         tr2.appendChild(td2);
  //         th = document.createElement('th');
  //         th.classList.add('align-middle', 'text-center');
  //         th.style.background = bgth;
  //         th.textContent = "KILOS BRUTOS";
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('text-right', 'align-middle', 'h6');
  //         td2.textContent = obj.TotalKilosBrutosPesado
  //         td2.colSpan = 2;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 8
  //         tr2 = document.createElement('tr');
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle');
  //         td2.colSpan = 7;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 9
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle', 'text-center');
  //         th.style.background = bgth;
  //         th.colSpan = 3;
  //         th.textContent = 'TIPO DE PRODUCCIÓN';
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.textContent = obj.TipoProduccion
  //         td2.colSpan = 4;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         //FILA 10
  //         tr2 = document.createElement('tr');
  //         th = document.createElement('th');
  //         th.classList.add('align-middle', 'text-center');
  //         th.style.background = bgth;
  //         th.colSpan = 2;
  //         th.textContent = 'CERTIFICACIÓN';
  //         tr2.appendChild(th);
  //         td2 = document.createElement('td');
  //         td2.classList.add('align-middle', 'h6');
  //         td2.colSpan = 5;
  //         td2.textContent = obj.Certificacion;
  //         tr2.appendChild(td2);
  //         tb2.appendChild(tr2);

  //         td1.appendChild(tb2);
  //         tr1.appendChild(td1);
  //         tb1.appendChild(tr1);
  //         tr1 = document.createElement('tr');
  //         td1 = document.createElement('td');
  //         td1.colSpan = 2;
  //         td1.classList.add('text-center', 'font-weight-bold', 'h5');
  //         td1.innerHTML = lblFooter;
  //         tr1.appendChild(td1);
  //         tb1.appendChild(tr1);
  //         div2.appendChild(tb1);
  //       }
  //     }
  //     div1.appendChild(div2);
  //     document.getElementsByTagName('body')[0].append(div1);
  //     console.log(div1.innerHTML);

  //     html2canvas(div2).then(function (canvas) {

  //       // console.log(canvas);
  //       let contentWidth = canvas.width;
  //       let contentHeight = canvas.height;
  //       //One page of pdf displays the height of canvas generated by html page;
  //       let pageHeight = contentWidth / 592.28 * 841.89;
  //       //Height of html page without pdf generated
  //       let leftHeight = contentHeight;
  //       //Page offset
  //       let position = 0;
  //       //The size of a4 paper [595.28,841.89], the width and height of the canvas generated by the html page in the pdf
  //       let imgWidth = 595.28;
  //       let imgHeight = 592.28 / contentWidth * contentHeight;

  //       let pageData = canvas.toDataURL('image/jpeg', 1);

  //       // let pdf = new jsPDF('p','pt','a4');
  //       let pdf = new jsPDF();
  //       pdf.setProperties({
  //         title: 'Etiquetas Lotes'
  //       });

  //       //There are two heights to be distinguished, one is the actual height of the html page, and the height of the page that generates the pdf (841.89)
  //       //When the content does not exceed the range displayed on one page of the pdf, no need to page
  //       if (leftHeight < pageHeight) {
  //         pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
  //       } else {// Paging
  //         while (leftHeight > 0) {
  //           pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
  //           leftHeight -= pageHeight;
  //           position -= 841.89;
  //           //Avoid adding blank pages
  //           if (leftHeight > 0) {
  //             pdf.addPage();
  //           }
  //         }
  //       }
  //       pdf.save(`EtiquetasLotes_${new Date().toISOString()}.pdf`);
  //       form.spinner.hide();
  //     }, function (err) {
  //       console.log(err);
  //     });
  //     document.getElementById('PDFHtml').remove();
  //   } else {
  //     this.spinner.hide();
  //   }
  // }

  Cancel(): void {
    this.router.navigate(['/acopio/operaciones/lotes-list']);
  }
}
