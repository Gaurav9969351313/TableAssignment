import { Component, Input, OnInit, AfterViewInit, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-reportgrid',
  templateUrl: './reportgrid.component.html',
  styleUrls: ['./reportgrid.component.css']
})

export class ReportgridComponent implements OnInit {

  @Input() tableTitle: any;
  @Input() tableHeaders: any;
  @Input() tableRows: any;
  @Input() showPaging: boolean;
  @Input() pageSize: number = 10;
  @Input() isClientSidePagging = true; // for client and server side paging

  noDataFoundMsg: string = "No Records Available";
  rowsPaged = [];

  @Output() changePageIndex = new EventEmitter();
  @Input() recordCount = 0;

  pages: number = 5;
  defaultPageSize: number = 9999;
  pageNumber: number = 0;
  currentIndex: number = 1;
  pagesIndex: Array<number>;
  pageStart: number = 1;
  @Output() changePage = new EventEmitter();

  rowsFiltered = [];

  constructor(private eleRef: ElementRef) { }

  ngOnInit() {
    this.tableTitle = this.tableTitle != undefined && this.tableTitle != null ? this.tableTitle : '';
    console.log(this.tableHeaders);
    console.log(this.tableRows);

    this.rowsPaged = this.tableRows;
    this.rowsFiltered = this.tableRows;
    this.init();
    this.refreshItems();
  }


  sortHeaderClick(column) {
    console.log(column, this.persistedSortType);
    var toggleSort = this.persistedSortType == 'ASC' ? true : false;
    toggleSort ? this.persistedSortType = 'DSC' : this.persistedSortType = 'ASC';
    this.sort(this.rowsPaged, column.accessor, this.persistedSortType, column.dataType == "S" ? false : true);
  }

  persistedSortType = "ASC";

  private sort(array: Array<any>, fieldName: string, direction: string, isNumeric: boolean) {

    this.persistedSortType = direction;

    var sortFunc = function (field, rev, primer) {
      return function (a, b) {
        a = primer(pathValue(a, field)), b = primer(pathValue(b, field));
        return ((a < b) ? -1 : ((a > b) ? 1 : 0)) * (rev ? -1 : 1);
      }
    };

    var pathValue = function (obj, path) {
      for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
        obj = obj[path[i]];
      };
      return obj;
    };

    var primer = isNumeric ?
      function (a) {
        var retValue = parseFloat(String(a).replace(/[^0-9.-]+/g, ''));
        return isNaN(retValue) ? 0.0 : retValue;
      } :
      function (a) { return String(a).toUpperCase(); };

    array.sort(sortFunc(fieldName, direction === 'DSC', primer));


  }

  onRowClick(row) {
    console.log(row);
  }

  bDisableNext: boolean = false;
  bDisablePrev: boolean = true;

  init() {
    console.log("Inside Init");

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
    this.bDisablePrev = true;
    //By Default PrevPage Arrow is Disabled 
    
    this.pagesIndex = this.fillArray();

    //By default if all pages are displayed in first attempt the disable next icon
    if (this.pagesIndex.includes(this.pageNumber))
      this.bDisableNext = true;
    else
      this.bDisableNext = false;
  }

  prevPage() {
    console.log("Inside prevPage");
    if (!this.bDisablePrev) {
      if (this.currentIndex > 1) {

        this.currentIndex = this.pagesIndex[0];

        if (!this.isClientSidePagging)
          this.changePageIndex.emit(this.currentIndex);
      }

      if (this.pageStart != 1) {
        this.pageStart = this.pagesIndex[0] - this.pages
        this.currentIndex = this.pageStart; //start of an array
        this.refreshItems();
      }

      if (this.pageStart == 1) {
        this.bDisablePrev = true
      }

      if (this.pagesIndex[this.pagesIndex.length - 1] < this.pageNumber)
        this.bDisableNext = false;
    }
    this.changePage.emit(true);
  }

  nextPage() {
    if (this.pagesIndex[this.pagesIndex.length - 1] == this.pageNumber) { }
    else {
      this.currentIndex = this.pagesIndex[this.pagesIndex.length - 1] //added new
      if (this.currentIndex < this.pageNumber) {
        this.currentIndex++;
        if (!this.isClientSidePagging)
          this.changePageIndex.emit(this.currentIndex);
      }
      if (this.currentIndex >= (this.pageStart + this.pages)) {
        // this.pageStart = this.currentIndex - this.pages + 1;
        this.pageStart = this.currentIndex; //added new
      }

      this.refreshItems();

      if (this.pagesIndex.includes(this.pageNumber))
        this.bDisableNext = true;

      if (this.pagesIndex[0] == 1) //added new
        this.bDisablePrev = true;
      else
        this.bDisablePrev = false;
      this.changePage.emit(true);
    }
  }

  setPage(index: number) {

    console.log("inside setPage");

    this.currentIndex = index;
    if (!this.isClientSidePagging)
      this.changePageIndex.emit({ pageIndex: this.currentIndex });
    this.refreshItems();

    if (this.pagesIndex[0] == 1) //added new
      this.bDisablePrev = true;

    this.changePage.emit(true);
  }

  resetPagination() {
    this.currentIndex = 1;
    this.pageStart = this.currentIndex;
    this.pagesIndex = this.fillArray();
  }

  fillArray(): any {
    var obj = new Array();
    for (var index = this.pageStart; index < this.pageStart + this.pages; index++) {
      if (index <= this.pageNumber) {
        obj.push(index);
      }
    }
    return obj;
  }

  refreshItems() {
    if (this.isClientSidePagging) {
      this.rowsPaged = this.rowsFiltered.slice((this.currentIndex - 1) * this.defaultPageSize, (this.currentIndex) * this.defaultPageSize);
    }
    else {
      this.rowsPaged = this.rowsFiltered;
    }
    this.pagesIndex = this.fillArray();
  }
}

















