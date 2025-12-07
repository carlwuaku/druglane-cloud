import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef, ViewChild } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { getLabelFromKey, openHtmlInNewWindow, replaceSpaceWithUnderscore } from '../../utils/helper';
import { FieldTemplateDirective } from '../form-generator/form-generator.component';
import { MatSort } from '@angular/material/sort';
import { TableLegendType } from './tableLegend.model';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from 'primeng/image';

export interface EditableColumn {
  field: string;
  type: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: { value: any; label: string }[]; // For select type
  validator?: (value: any) => boolean;
  readonly?: boolean;
  onChange?: (value: any, row: any) => void;
}

@Component({
  selector: 'app-table',
  imports: [MatTableModule, MatButtonModule, MatFormFieldModule, MatCheckboxModule, MatDatepickerModule, MatSelectModule, CommonModule, MatMenuModule, RouterLink, MatMenuModule, MatIconModule, ImageModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit, AfterViewInit {
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([])
  @Input() columnLabels?: { [key: string]: string };
  @Input() rowSelection: "single" | "multiple" | undefined = "multiple"
  @Input() displayedColumns: string[] = [];
  @Input() editableColumns: EditableColumn[] = []; // New input for editable columns
  @Input() enableInlineEditing: boolean = false; // Toggle for edit mode
  selection = new SelectionModel<any>(true, []);
  @Input() specialClasses: { [key: string]: string } = {};
  @Input() customClassRules: { [key: string]: (row: any) => boolean } = {};
  @Input() offset: number = 0;
  destroy$: Subject<boolean> = new Subject();
  @Output() onSelect = new EventEmitter();
  @Output() onCellValueChange = new EventEmitter<{ row: any, field: string, oldValue: any, newValue: any }>();
  @Output() onRowSave = new EventEmitter<{ row: any, changes: any }>();
  @Input() showActions: boolean = true;
  @ViewChild(MatSort) sort!: MatSort;
  replaceSpaceWithUnderscore = replaceSpaceWithUnderscore;
  private templateMap = new Map<string, TemplateRef<any>>();
  @ContentChildren(FieldTemplateDirective) fieldTemplates!: QueryList<FieldTemplateDirective>;
  editingRows = new Set<any>();
  originalValues = new Map<any, any>();
  editableColumnMap = new Map<string, EditableColumn>();
  @Input() customClassLegends: TableLegendType[] = [];
  @Input() useVirtualScroll: boolean = true;
  constructor() { }
  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.fieldTemplates.forEach(item => {
      this.templateMap.set(item.fieldName, item.template);
    });
  }
  ngOnInit(): void {
    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.onSelect.emit(data.source.selected)
    })
    // Create a map for quick lookup of editable columns
    this.editableColumns.forEach(col => {
      this.editableColumnMap.set(col.field, col);
    });
  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(event: MatCheckboxChange) {
    event.checked ? this.selection.select(...this.dataSource.data) : this.selection.clear();
    // if (this.isAllSelected()) {
    //   this.selection.clear();
    //   return;
    // }

    // this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }


  getColumnClass(columnAndValue: string): string {
    return this.specialClasses[columnAndValue] || columnAndValue;
  }

  getColumnLabel(column: string): string {
    if (this.columnLabels && this.columnLabels[column]) {
      return this.columnLabels[column];
    }

    return getLabelFromKey(column, false);
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

  viewHtml(html: string) {
    openHtmlInNewWindow(html);
  }

  public clearSelection() {
    this.selection.clear();
  }

  getCustomTemplate(fieldName: string): TemplateRef<any> | null {
    return this.templateMap.get(fieldName) || null;
  }


  // New methods for editable functionality
  isColumnEditable(column: string): boolean {
    return this.editableColumnMap.has(column) && this.enableInlineEditing;
  }

  isRowEditing(row: any): boolean {
    return this.editingRows.has(row);
  }

  startEditRow(row: any): void {
    // Store original values for potential rollback
    this.originalValues.set(row, { ...row });
    this.editingRows.add(row);
  }

  saveRow(row: any): void {
    const originalRow = this.originalValues.get(row);
    const changes: any = {};

    // Find what changed
    for (const key in row) {
      if (originalRow && originalRow[key] !== row[key]) {
        changes[key] = {
          oldValue: originalRow[key],
          newValue: row[key]
        };
      }
    }

    this.editingRows.delete(row);
    this.originalValues.delete(row);

    if (Object.keys(changes).length > 0) {
      this.onRowSave.emit({ row, changes });
    }
  }

  cancelEdit(row: any): void {
    const originalRow = this.originalValues.get(row);
    if (originalRow) {
      // Restore original values
      Object.assign(row, originalRow);
    }

    this.editingRows.delete(row);
    this.originalValues.delete(row);
  }

  onCellEdit(row: any, field: string, newValue: any): void {
    const oldValue = row[field];
    const editableColumn = this.editableColumnMap.get(field);

    // Validate if validator exists
    if (editableColumn?.validator && !editableColumn.validator(newValue)) {
      return; // Don't update if validation fails
    }

    row[field] = newValue;
    //run the onChange function
    if (editableColumn?.onChange) { editableColumn.onChange(newValue, row); }
    this.onCellValueChange.emit({ row, field, oldValue, newValue });
  }

  getEditableColumnConfig(field: string): EditableColumn | undefined {
    return this.editableColumnMap.get(field);
  }

  // Helper method to get select options for a field
  getSelectOptions(field: string): { value: any; label: string }[] {
    const config = this.editableColumnMap.get(field);
    return config?.options || [];
  }

}
