import { Injectable } from '@angular/core';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';
import { HeaderExcel } from '../../Services/models/headerexcel.model';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = 'xlsx';
const options = {
  filename: './streamed-workbook.xlsx',
  useStyles: true,
  useSharedStrings: true
}

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  constructor() { }

  public ExportJSONAsExcel(pArrHeadersXls: HeaderExcel[], dataJSON: any[],
    excelFileName: string): void {

    if (pArrHeadersXls.length > 0 && dataJSON != null && dataJSON.length > 0
      && excelFileName.trim().length > 0) {

      let vArrCols: any[] = [];
      let wb = new Excel.Workbook(options);
      let ws = wb.addWorksheet("Data");

      for (let i = 0; i < pArrHeadersXls.length; i++) {
        vArrCols.push({
          header: pArrHeadersXls[i].Name,
          key: `Col${i}`,
          style: {
            font: {
              bold: true
            },
            numFmt: pArrHeadersXls[i].Format,
            alignment: {
              horizontal: pArrHeadersXls[i].Align == undefined ? 'left'
                : pArrHeadersXls[i].Align.trim() == '' ? 'left' : pArrHeadersXls[i].Align.trim().toLowerCase()
            }
          }
        });
      }

      if (vArrCols.length > 0) {
        ws.columns = vArrCols;
        ws.addRows(dataJSON, "n");

        let wSheet = wb.getWorksheet(1);
        wSheet.getRow(1).alignment = { horizontal: 'center' };

        for (let i = 0; i <= dataJSON.length; i++) {
          if (i > 0) {
            wSheet.getRow(i + 1).font = { bold: false };
          }
        }

        wb.xlsx.writeBuffer().then(function (buffer) {
          const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
          FileSaver.saveAs(data, `${excelFileName}_${new Date().getTime()}.${EXCEL_EXTENSION}`);
        });

      }
    }

  }

  // private SaveExcelFile(buffer: any, fileName: string): void {
  //   const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
  //   FileSaver.saveAs(data, `${fileName}_${new Date().getTime()}.${EXCEL_EXTENSION}`);
  // }
}
