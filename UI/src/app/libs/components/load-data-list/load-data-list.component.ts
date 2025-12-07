import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule, DatePipe } from '@angular/common';
import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, input, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../core/services/http/http.service';
import { ApiResponseObject } from '../../types/ApiResponse.type';
import { DataActionsButton } from '../../types/DataAction.type';
import { isArray, getLabelFromKey, replaceSpaceWithUnderscore, openHtmlInNewWindow } from '../../utils/helper';
import { DialogFormComponent } from '../dialog-form/dialog-form.component';
import { IFormGenerator } from '../form-generator/form-generator.interface';
import { MatTableDataSource } from '@angular/material/table';
import { TableComponent } from '../table/table.component';
import { TableLegendType } from '../table/tableLegend.model';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../loading/loading.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { FormGeneratorComponent } from '../form-generator/form-generator.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { SectionContainerComponent } from '../section-container/section-container.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { FilterEmptyValuesPipe } from '../../pipes/filter-empty-values.pipe';
import { ListComponent } from '../list/list.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AlertComponent } from "../alert/alert.component";


@Component({
  selector: 'app-load-data-list',
  imports: [TableComponent, MatIconModule, MatDialogModule, LoadingComponent, MatFormFieldModule, MatChipsModule, MatInputModule, MatButtonModule,
    FormGeneratorComponent, MatSelectModule, FormsModule, CommonModule, SectionContainerComponent, PaginationComponent, FilterEmptyValuesPipe, ListComponent, MatRadioModule, AlertComponent],
  templateUrl: './load-data-list.component.html',
  styleUrl: './load-data-list.component.scss'
})
export class LoadDataListComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('sortDialog') sortDialog!: TemplateRef<any>;
  @ViewChild('filtersContainer') filtersContainer!: ElementRef;

  is_loading = false;
  // pagination things
  total: number = 0;
  @Input() offset: number = 0;
  @Input() limit = 100;
  @Input() totalRows = 0;
  @Input() currentPage: any = 1;

  destroy$: Subject<boolean> = new Subject();
  @Input() url: string = "";
  @Input() loading: boolean = false;
  @Input() error: boolean = false;
  @Input() error_message: string = "";
  @Input() module = "admin"
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([])
  @Input() timestamp: string = ""

  @Output() dataDownloaded = new EventEmitter();
  @Input() columnLabels?: { [key: string]: string };
  @Input() rowSelection: "single" | "multiple" | undefined = "multiple"

  @Input() image_keys = ['picture', 'qr_code']

  @Input() selectedItems: any[] = [];
  @Output() onSelect = new EventEmitter();
  @Input() exclusionKeys = ['id', 'created_by', 'modified_on', 'deleted',
    'deleted_by', 'password_hash', 'last_ip']
  showTable: boolean = false;
  @Input() displayedColumns: string[] = [];
  sortColumns: string[] = [];
  // @Input() actions: DataActionsButton[] = [];
  @Input() getActions: (row: any) => DataActionsButton[] = (row: any) => [];
  @Input() searchParam = "";
  selection = new SelectionModel<any>(true, []);
  @Input() withDeleted: boolean = false;
  /**if true, the data will be fetched from the api. else, not. Don't forget to set the displayedColumns if false, including the #, selection and actions */
  @Input() preload: boolean = true;
  /**this contains a key-value pair of classnames that should be given to contents of the table cell based
   * on the value of the key. For example, if the key is "status" and the value is "Alive", the classname
   * could be "badge badge-success". This is used in the template. the classnames must exist in the global
   * style.css or be defined perhaps another css file in the assets. it cannot be defined in the component.
   */
  @Input() specialClasses: { [key: string]: string } = {};
  replaceSpaceWithUnderscore = replaceSpaceWithUnderscore;
  @Input() showPagination: boolean = true;
  @Input() showExport: boolean = true;
  @Input() showSearch: boolean = true;
  @Input() showInfo: boolean = false;

  @Input() sortBy: string = "";
  @Input() sortOrder: string = "asc";
  @Input() filters: IFormGenerator[] = [];
  @Input() tableTitle: string = "";
  @ContentChild('header') header!: TemplateRef<any>;
  @ContentChild('selectionOptions') selectionOptions!: TemplateRef<any>;
  @ContentChild('tableHeaderOptions') tableHeaderOptions!: TemplateRef<any>;
  @Input() showDeleted: boolean = true;
  @Input() showFilterButton: boolean = true;
  @Input() showSort: boolean = true;
  @Input() hint: string = "";
  @Input() showReset: boolean = true;
  @Input() emitDownload: boolean = false;
  @Input() showPrint: boolean = true;
  /** in some cases the array to display is nested in the data key of the response. this key shows what that key
   *  is
   */
  @Input() dataKey: string = "data";
  /** */
  urlFilterKeys: string[] = [];
  @Input() customClassRules: { [key: string]: (row: any) => boolean } = {};

  @Input() showAllFilters: boolean = false;
  @Input() onFilterSubmitted: ((params: string) => void) | ((params: IFormGenerator[]) => void) = () => { };
  @Input() filterFormType: "filter" | "emit" = "filter";
  queryParams: { [key: string]: string } = {};
  isOverflowing: boolean = false;
  @Input() filtersLayout: "vertical" | "horizontal" | "grid" = "grid";
  @Input() useResponseFilters: boolean = true;
  @Input() showTableTitle: boolean = false;
  @Input() apiCallMethod: "get" | "post" = "get";
  @Input() apiCallData: any = {};
  @ViewChild('table') table!: TableComponent;
  @Input() showSelectionContainer: boolean = false;
  //make sure the filter is set only once per url
  filterSet: boolean = false;
  @Input() customClassLegends: TableLegendType[] = [];
  @Output() totalChanged = new EventEmitter<number>();
  isMobile$: Observable<boolean>;
  listTitleField = input.required<string>();

  // Accept custom template as input
  @Input() customTemplate?: TemplateRef<any>;

  // Or accept it as content projection
  @ContentChild('customItemTemplate') contentTemplate?: TemplateRef<any>;
  @Input() customTemplateContainerClass: string = "";
  @Input() showActions: boolean = true;
  @Input({
    required: true
  }) emptyMessage: string = "No data found";

  constructor(private dbService: HttpService, private dialog: MatDialog, private ar: ActivatedRoute,
    private router: Router, private datePipe: DatePipe, private breakpointObserver: BreakpointObserver) {

    //show the list instead of table when on mobile
    this.isMobile$ = this.breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small
    ]).pipe(
      map(result => result.matches)
    );

  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnInit(): void {

    // if (this.useResponseFilters) {

    // }

    // Add resize observer to check overflow on container size changes
    // if (typeof ResizeObserver !== 'undefined') {
    //   const resizeObserver = new ResizeObserver(() => {
    //     this.checkOverflow();
    //   });

    //   // Start observing after view init
    //   setTimeout(() => {
    //     if (this.filtersContainer) {
    //       resizeObserver.observe(this.filtersContainer.nativeElement);
    //     }
    //   });
    // }
  }

  ngAfterViewInit() {
    if (this.searchParam.trim()) {
      this.search();
    }

    // this.checkOverflow();
    if (this.table) {
      this.selection = this.table.selection;
    }

    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.onSelect.emit(data.source.selected)
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.preload) {
      this.offset = 0;
      this.currentPage = 1;
      this.getData();
    }
    if (changes['apiCallMethod'] || changes['apiCallData']) {// if the data is provided don't use the filters
      this.offset = 0;
      this.currentPage = 1;
      this.getData(this.url);
    }

  }



  setPage(args: number) {
    this.currentPage = args;
    this.offset = (args - 1) * this.limit;
    // const url = updateUrlQueryParamValue(this.url, "page", this.offset.toString());
    this.getData();
  }

  setLimit(args: number) {
    this.limit = args;
    this.currentPage = 1;
    this.offset = 0;
    // let url = updateUrlQueryParamValue(this.url, "page", this.offset.toString());
    // url = updateUrlQueryParamValue(url, "limit", this.limit.toString());
    this.getData();
  }

  paramInputChanged() {
    //when cleared, load everything
    if (!this.searchParam.trim()) {
      this.offset = 0;
      this.getData();
    }
  }

  search() {
    this.offset = 0;
    this.currentPage = 1;
    this.getData();
  }

  clearSearch() {
    this.offset = 0;
    this.currentPage = 1;
    this.searchParam = "";
    this.getData();
  }

  prepUrl(): string {
    let extra = `page=${this.offset}&limit=${this.limit}`;
    if (this.searchParam.trim()) {
      extra += `&param=${this.searchParam}`
    }
    if (this.withDeleted) {
      extra += `&withDeleted=yes`
    }

    //if sorting
    if (this.sortBy) {
      extra += `&sortBy=${this.sortBy}&sortOrder=${this.sortOrder}`
    }
    if (this.filters.length > 0) {
      this.filters.forEach(filter => {

        //add the filter to the url if it's not already in the url query params
        if (filter.value && !this.queryParams[filter.name] && !this.queryParams[`child_${filter.name}`]) {

          extra += filter.type === "date" ? `&${filter.name}=${this.formatDate(filter.value)}` : `&${filter.name}=${filter.value}`
        }
      });
    }
    return this.url.indexOf("?") == -1 ? this.url + '?' + extra : this.url + `&${extra}`;
  }


  public getData(url?: string) {
    this.loading = true;
    this.showTable = false;
    //the api call may be passed in from the parent component if it's something other than a get request

    if (!url) {
      url = this.prepUrl();
    }
    const splitUrl = url.split("?");
    let tableTitleArray: string[] = [];
    //splitUrl should return a string like param=123&limit=10&page=1. apart from page and limit,
    //split every key=value into key: value, separated by commas.

    const params = splitUrl[1].split("&").filter(param => !param.includes("page=") && !param.includes("limit=")
      && !param.includes("sortBy=") && !param.includes("sortOrder=")).map(x => x.split("="));
    params.map(param => {
      tableTitleArray.push(this.getColumnLabel(param[0]) + ": " + param[1]);
    })
    this.tableTitle = tableTitleArray.join(", ");
    let apiCall = this.dbService.get<ApiResponseObject<any>>(url);
    if (this.apiCallMethod == "post") {
      apiCall = this.dbService.post<ApiResponseObject<any>>(url, this.apiCallData);
    }

    apiCall.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const data: { [key: string]: any }[] = this.dataKey && !isArray(response.data) ? response.data[this.dataKey] : response.data;
          data.map(item => {
            item['actions'] = this.getActions(item);
          })
          if (this.emitDownload) {
            this.dataDownloaded.emit(response);
          }
          this.dataSource = new MatTableDataSource(data);

          this.error = false;
          this.totalRows = response.total;
          this.sortColumns = response.displayColumns;
          //if the displayedColumns is empty, use the response displayColumns.
          if (!this.displayedColumns || this.displayedColumns.length == 0) {
            this.displayedColumns = ['#'];
            if (this.rowSelection == 'multiple') {
              this.displayedColumns.push('select');
            }
            if (this.showActions) {
              this.displayedColumns.push('actions');
            }
            this.displayedColumns.push(...response.displayColumns)
          }
          else {
            const defaultColumns = ['#'];
            if (this.rowSelection == 'multiple') {
              defaultColumns.push('select');
            }
            if (this.showActions) {
              defaultColumns.push('actions');
            }
            this.displayedColumns.unshift(...defaultColumns);

          }
          //remove any duplicate columns
          this.displayedColumns = Array.from(new Set(this.displayedColumns));
          this.columnLabels = response.columnLabels
          this.showTable = true;
          this.totalChanged.emit(response.total);
          if (this.useResponseFilters && response.columnFilters && response.columnFilters.length > 0 && !this.filterSet) {
            //merge the filters from the server with the filters from the parent component, preserving the parent component's values
            this.filters = response.columnFilters.map(filter => {
              const existingFilter = this.filters.find(x => x.name == filter.name);
              if (existingFilter) {
                filter.value = existingFilter.value;
              }

              //check if any of the fiter fields is set in the url query params
              if (this.queryParams[filter.name]) {
                filter.value = this.queryParams[filter.name];
              }
              //filters cannot be required
              filter.required = false;
              return filter;
            });
            this.filterSet = true;

          }
          //clear the selection
          this.selection.clear();
        },
        error: (err) => {
          console.error(err)
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  getColumnLabel(column: string): string {
    if (this.columnLabels && this.columnLabels[column]) {
      return this.columnLabels[column];
    }

    return getLabelFromKey(column, false);
  }




  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // /** Whether the number of selected elements matches the total number of rows. */
  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.dataSource.data.length;
  //   return numSelected === numRows;
  // }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // toggleAllRows(event: MatCheckboxChange) {
  //   event.checked ? this.selection.select(...this.dataSource.data) : this.selection.clear();
  //   // if (this.isAllSelected()) {
  //   //   this.selection.clear();
  //   //   return;
  //   // }

  //   // this.selection.select(...this.dataSource.data);
  // }

  // /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: any): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  // }


  getColumnClass(columnAndValue: string): string {
    return this.specialClasses[columnAndValue] || columnAndValue;
  }

  setFilters(args: IFormGenerator[]) {
    this.filters = args;

    this.getData();
  }

  showFilterDialog() {
    const dialogRef = this.dialog.open(DialogFormComponent, {
      data: {
        title: "Filter",
        fields: this.filters,
        formType: "filter"
      },
      width: '50vw'
    });
    dialogRef.afterClosed().subscribe((result: IFormGenerator[] | false) => {

      if (result) {
        this.setFilters(result);
        //for those that are dates, format them

      }

    });
  }

  sortChanged() {
    this.offset = 0;
    this.currentPage = 1;
    this.clearSelection();
    this.getData();
  }

  removeFilter(filter: IFormGenerator) {
    filter.value = "";
    this.getData();
  }

  reset() {
    window.location.reload();
  }

  public reload() {
    if (this.preload) {
      this.offset = 0;
      this.currentPage = 1;
      this.getData();
      this.clearSelection();
    }
  }

  public clearSelection() {
    this.selection.clear();
  }

  isLink(content: string | null): boolean {
    return content && typeof content === 'string' ? content.startsWith('http') || content.startsWith('www') : false;
  }

  isHtml(content: string): boolean {
    const containsHtmlTagsRegex = /<[a-z][\s\S]*>/i;

    // Method 2: More complete HTML tag regex
    const htmlRegex = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i;

    // Method 3: Check for common HTML tags or entities
    const commonHtmlElements = /<(html|body|div|span|h[1-6]|p|br|table|tr|td|ul|ol|li|a|img)[^>]*>|&[a-z]+;/i;

    // Method 4: Check for doctype declaration
    const docType = /<!DOCTYPE html>/i;

    // Method 5: Check for specific HTML structure elements
    const htmlStructure = /<html[^>]*>[\s\S]*<\/html>/i;

    return htmlRegex.test(content);
    // containsHtmlTagsRegex.test(str)  ||
    // commonHtmlElements.test(str) ||
    // docType.test(str) ||
    // htmlStructure.test(str);
  }

  getRowClasses(row: any) {
    const classes: { [key: string]: boolean } = {
      'strikethrough': row.deleted_at
    };

    // Apply custom rules from parent
    for (const className in this.customClassRules) {
      classes[className] = this.customClassRules[className](row);
    }

    return classes;
  }

  formatDate(date: Date): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  filterSubmitted(params: string | IFormGenerator[]) {
    if (typeof params === 'string' || Array.isArray(params)) {
      this.onFilterSubmitted(params as any);
    }
  }

  /**
   *
   * @param filter the object that contains the filter details
   * @param value the value of the filter
   * @returns the value of the filter in the format that the form generator expects
   */
  parseFilterValue(filter: IFormGenerator, value: any) {
    if (filter.type === "date-range") {
      //change the format of the date to the format that the form generator expects
      const dateRange = value.split(" to ");
      return {
        startDate: this.formatDate(new Date(dateRange[0])),
        endDate: this.formatDate(new Date(dateRange[1]))
      }
    }
    return value;
  }

  // checkOverflow() {
  //   if (this.filtersContainer) {
  //     const element = this.filtersContainer.nativeElement;
  //     this.isOverflowing = element.scrollWidth > element.clientWidth;
  //   }
  // }

  viewHtml(html: string) {
    openHtmlInNewWindow(html);
  }

  filterIsInQueryParams(key: string): boolean {
    return Object.keys(this.queryParams).includes(key) || Object.keys(this.queryParams).includes(`child_${key}`);
  }

  selectionChanged(event: any) {
    this.onSelect.emit(event);
  }

  get templateToUse() {
    return this.customTemplate || this.contentTemplate;
  }

}
