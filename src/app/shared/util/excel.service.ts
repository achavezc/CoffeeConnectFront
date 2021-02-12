import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public ExportJSONAsExcel(json: any[], excelFileName: string): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    const excelBuffer: any = XLSX.write(wb, { bookType: EXCEL_EXTENSION, type: 'array' });
    this.SaveExcelFile(excelBuffer, excelFileName);
  }

  public ExportTableAsExcel(idElement: string, excelFileName: string): void {
    let element = document.getElementById(idElement);
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    const excelBuffer: any = XLSX.write(wb, { bookType: EXCEL_EXTENSION, type: 'array' });
    this.SaveExcelFile(excelBuffer, excelFileName);
  }

  private SaveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.${EXCEL_EXTENSION}`);
  }
}
