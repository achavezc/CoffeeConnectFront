import { ClassGetter } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import * as Excel from 'exceljs/dist/exceljs.min.js';
import * as FileSaver from 'file-saver';

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

  public ExportJSONAsExcel(pCols: string[], dataJSON: any[],
    excelFileName: string): void {

    if (pCols.length > 0 && dataJSON != null && dataJSON.length > 0
      && excelFileName.trim().length > 0) {

      let vArrCols: any[] = [];
      let wb = new Excel.Workbook(options);
      let ws = wb.addWorksheet("Data");

      for (let i = 0; i < pCols.length; i++) {
        vArrCols.push({
          header: pCols[i],
          key: "Col" + i.toString(),
          style: {
            font: {
              bold: true
            }
          }
        });
      }

      if (vArrCols.length > 0) {
        ws.columns = vArrCols;
        ws.addRows(dataJSON, "n");

        let wSheet = wb.getWorksheet(1);

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
