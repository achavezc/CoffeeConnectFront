export class HeaderExcel {
    constructor(pName: string, pAlign?: string, pFormat?: string) {
        this.Name = pName;
        this.Format = pFormat;
        this.Align = pAlign;
    }

    Name: string;
    Format?: string;
    Align?: string;
}