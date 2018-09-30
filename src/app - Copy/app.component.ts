
import { Component, Input, OnInit, AfterViewInit, ElementRef, OnChanges, AfterViewChecked, Output, EventEmitter, ViewChild} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
  
export class ColumnDefinition {
  public name: string = "";
  public value: string = "";
  public sort: boolean = true;
  public filter: boolean = true;
  public export: boolean;
  public cssClass: string = "";
  public filterText: string = "";
  public cType: string = "S"; // S: String, N: Numeric
  public sortBy: string = '';
  public headerClass: string = '';
}

export class AppComponent implements OnInit, OnChanges {
  constructor(private eleRef: ElementRef) { }

  _columns: Array<ColumnDefinition>;
  __columns: Array<ColumnDefinition>;

  _rows: any[];
  rowsFiltered: any[];
  rowsPaged: any[];
  @ViewChild('divMainTable') divMainTable: ElementRef;

  celminWidthsAssigned = [];

  @Input() showFilter: boolean = false;
  @Input() fixedHdrConfig: any = {
    minCellWidth: 75,
    columnAlign: "left"
  };

  @Input() showPaging: boolean;
  @Input() pageSize: number = 10;
  @Input() showFooter: boolean;
  @Input() layoutMode: string = "G";
  @Input() blockViewTmpl: any;
  @Input() fhTopHeight: string = "35px";
  @Input() IsWrapText: boolean = false;
  @Input() isClientSidePagging = true; // for client and server side paging
  @Output() changePageIndex = new EventEmitter();
  @Input() recordCount = 0;
  @Input() isPagingCall = false;
  @Input() isFixedHeader: boolean = true;
  @Output() changePage = new EventEmitter();
  
  whiteSpace: string = 'nowrap';
  pages: number = 5;
  defaultPageSize: number = 9999;
  pageNumber: number = 0;
  currentIndex: number = 1;
  pagesIndex: Array<number>;
  pageStart: number = 1;
  inputName: string = '';
  isCheckSelected: boolean;
  isRowsAvailable: boolean = false;
  @Input() showSort: boolean = false;
  sortDirection: string = "asc";
  @Output() rowClick = new EventEmitter();
  checkboxSelected: boolean = false;
  bDisableNext: boolean = false;
  bDisablePrev: boolean = true;

  ngOnInit() {
    this.whiteSpace = this.IsWrapText ? 'normal' : 'nowrap';
  }

  modelChanged: Subject<string> = new Subject<string>();

  @Input() set columns(val: any) {
    if (typeof (val) != 'undefined' && val.length > 0) {
      this.setDefaultColProp(val);
    }
    this._columns = val;
  }

  get columns(): any {
    return this._columns;
  }

  setDefaultColProp(columns) {
    var id = 0;
    this.fixedHdrConfig.customWidths = {};

    for (const column of columns) {
      column.popUpTimeOut = "";
      id += 1;
      column.id = id;

      if (column.hasOwnProperty("width"))
        this.fixedHdrConfig.customWidths[column["value"]] = column["width"];

      column["headerClass"] = "";
      if (column.hasOwnProperty("sort")) {
        if (column.sort) {
          column.sort = true;
          //by default sorting icon(both arrow) will be shown
          if (this.showSort && column.sort)
            column["headerClass"] = "sorting ";
        }
      } else {
        //if sort property does not exist then by default sorting will be there.
        column.sort = true;
        //by default sorting icon(both arrow) will be shown
        if (this.showSort && column.sort)
          column["headerClass"] = "sorting ";
      }

      if (!column.hasOwnProperty("sortBy"))
        column.sortBy = '';

      if (!column.hasOwnProperty("footer"))
        column.footer = false;

      if (!column.hasOwnProperty("filter")) //&& (column.name != "Cancel" || column.name != "Action"))
      {
        column.filter = true;
        column.filterText = "";
        if (column.cType == "S") {
          column.placeholdername = "filter by " + column.name;
        }
        else {
          column.placeholdername = "eg. >500 or <500";
        }
      }

      if (!column.hasOwnProperty("cssClass"))
        column.cssClass = "";

      if (typeof (column["cssClass"] == "undefined" || column["cssClass"] == ""))
        column["cType"] == "N" ? column["cssClass"] = "taR" : column["cssClass"] = "taL";

      column["cType"] == "N" ? column["headerClass"] += "taR" : column["headerClass"] += "taL";

    }
  }

  ngOnChanges(changes: any) {
    if (changes.showFilter && !changes.showFilter.firstChange) {
     
      if (!changes.showFilter.currentValue) {
        this.rowsFiltered = this._rows;
        this.init();
      }
    }
  }


  @Input() set rows(val: any) {
    this._rows = val;
    if (typeof (this._rows) != 'undefined' && this._rows.length > 0) {
      this.__columns = this._columns;
      this.isRowsAvailable = true;
      this.rowsFiltered = this._rows;
      if (!this.isClientSidePagging) {
        if (this.currentIndex == 1)
          this.init();
       
      }
      else {
        if (this.__columns != undefined && this.__columns.length > 0) {
          for (const column of this.__columns) {
            if (column.filter && column.filterText != undefined && column.filterText.length > 0) {
              //this.rowsFiltered = this.rowFilterProcess(this.rowsFiltered, column.filterText, column);
            }
          }
        }
        //this.currentIndex = 1;
        this.init();
      }
   
      if (this.divMainTable)
        this.divMainTable.nativeElement.scrollTop = 0;
    }
    else {
      this.rowsPaged = [];
      this.isRowsAvailable = false;
    }
  }

  get rows(): any {
    return this._rows;
  }

  init() {
    //this.currentIndex = 1;
    //this.pageStart = 1;
    //this.pages = 20;
    let rowCount = 0;
    this.pages = 5;
    if (this.isClientSidePagging) {
      rowCount = this.rowsFiltered.length;
      this.currentIndex = 1;
    }
    else {
      rowCount = this.recordCount;
    }

    if (this.showPaging) {
      this.defaultPageSize = this.pageSize;
    }

    this.pageNumber = parseInt("" + (rowCount / this.defaultPageSize));
    if (this.rowsFiltered.length % this.defaultPageSize != 0) {
      this.pageNumber++;
    }

    if (this.pageNumber < this.pages) {
      this.pages = this.pageNumber;
    }
    this.pageStart = 1;//In case of row changes by ngOnChanges, always start paging by 1st index.
    this.bDisablePrev = true;//By Default PrevPage Arrow is Disabled (in declaration it is true but if rows changes by ngOnChange() then it is was remaining false thus forcefully making true);
  }
}
