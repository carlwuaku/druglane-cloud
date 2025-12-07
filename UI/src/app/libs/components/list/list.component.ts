import { SelectionModel } from '@angular/cdk/collections';
import { Component, ContentChildren, EventEmitter, Input, OnInit, Output, QueryList, TemplateRef } from '@angular/core';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, takeUntil } from 'rxjs';
import { getLabelFromKey, openHtmlInNewWindow, replaceSpaceWithUnderscore } from '../../utils/helper';
import { FieldTemplateDirective } from '../form-generator/form-generator.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from 'primeng/image';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { EditableColumn } from '../table/table.component';
import { TableLegendType } from '../table/tableLegend.model';
@Component({
  selector: 'app-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatSelectModule,
    CommonModule,
    MatMenuModule,
    RouterLink,
    MatIconModule,
    ImageModule,
    MatInputModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @Input() columnLabels?: { [key: string]: string };
  @Input() rowSelection: "single" | "multiple" | undefined = "multiple";
  @Input() displayedColumns: string[] = [];
  @Input() editableColumns: EditableColumn[] = [];
  @Input() enableInlineEditing: boolean = false;
  @Input() specialClasses: { [key: string]: string } = {};
  @Input() customClassRules: { [key: string]: (row: any) => boolean } = {};
  @Input() offset: number = 0;
  @Input() showActions: boolean = true;
  @Input() customClassLegends: TableLegendType[] = [];
  @Input() titleField: string = ''; // Main field to show as card title
  @Input() excludeFields: string[] = ['select', 'actions', 'edit-actions', '#']; // Fields to exclude from content

  selection = new SelectionModel<any>(true, []);
  destroy$: Subject<boolean> = new Subject();

  @Output() onSelect = new EventEmitter();
  @Output() onCellValueChange = new EventEmitter<{ row: any, field: string, oldValue: any, newValue: any }>();
  @Output() onRowSave = new EventEmitter<{ row: any, changes: any }>();

  @ContentChildren(FieldTemplateDirective) fieldTemplates!: QueryList<FieldTemplateDirective>;

  private templateMap = new Map<string, TemplateRef<any>>();
  editingRows = new Set<any>();
  originalValues = new Map<any, any>();
  editableColumnMap = new Map<string, EditableColumn>();
  replaceSpaceWithUnderscore = replaceSpaceWithUnderscore;

  ngOnInit(): void {
    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.onSelect.emit(data.source.selected);
    });

    this.editableColumns.forEach(col => {
      this.editableColumnMap.set(col.field, col);
    });

    // Set up template map
    if (this.fieldTemplates) {
      this.fieldTemplates.forEach(item => {
        this.templateMap.set(item.fieldName, item.template);
      });
    }

  }

  getContentColumns(): string[] {
    let contentColumns = this.displayedColumns.filter(col =>
      !this.excludeFields.includes(col) && col !== this.titleField
    );

    return contentColumns;
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(event: MatCheckboxChange): void {
    event.checked ? this.selection.select(...this.dataSource.data) : this.selection.clear();
  }

  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row`;
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
    const htmlRegex = /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i;
    return htmlRegex.test(content);
  }

  getRowClasses(row: any) {
    const classes: { [key: string]: boolean } = {
      'strikethrough': row.deleted_at
    };

    for (const className in this.customClassRules) {
      classes[className] = this.customClassRules[className](row);
    }

    return classes;
  }

  viewHtml(html: string): void {
    openHtmlInNewWindow(html);
  }

  public clearSelection(): void {
    this.selection.clear();
  }

  getCustomTemplate(fieldName: string): TemplateRef<any> | null {
    return this.templateMap.get(fieldName) || null;
  }

  // Editable functionality
  isColumnEditable(column: string): boolean {
    return this.editableColumnMap.has(column) && this.enableInlineEditing;
  }

  isRowEditing(row: any): boolean {
    return this.editingRows.has(row);
  }

  startEditRow(row: any): void {
    this.originalValues.set(row, { ...row });
    this.editingRows.add(row);
  }

  saveRow(row: any): void {
    const originalRow = this.originalValues.get(row);
    const changes: any = {};

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
      Object.assign(row, originalRow);
    }

    this.editingRows.delete(row);
    this.originalValues.delete(row);
  }

  onCellEdit(row: any, field: string, newValue: any): void {
    const oldValue = row[field];
    const editableColumn = this.editableColumnMap.get(field);

    if (editableColumn?.validator && !editableColumn.validator(newValue)) {
      return;
    }

    row[field] = newValue;
    if (editableColumn?.onChange) {
      editableColumn.onChange(newValue, row);
    }
    this.onCellValueChange.emit({ row, field, oldValue, newValue });
  }

  getEditableColumnConfig(field: string): EditableColumn | undefined {
    return this.editableColumnMap.get(field);
  }

  getSelectOptions(field: string): { value: any; label: string }[] {
    const config = this.editableColumnMap.get(field);
    return config?.options || [];
  }

}
