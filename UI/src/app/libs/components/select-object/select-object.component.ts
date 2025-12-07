import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { take } from 'rxjs';
import { HttpService } from '../../../core/services/http/http.service';
import { v4 as uuidv4 } from 'uuid';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { LoadingComponent } from '../loading/loading.component';
import { ErrorMessageComponent } from "../error-message/error-message.component";

@Component({
  selector: 'app-select-object',
  imports: [MatButtonModule, MatIconModule, MatInputModule, MatProgressSpinnerModule, MatCardModule, MatListModule,
    MatSelectModule, MatCheckboxModule, MatTooltipModule, FormsModule, MatDatepickerModule, CommonModule, LoadingComponent, ErrorMessageComponent],
  templateUrl: './select-object.component.html',
  styleUrl: './select-object.component.scss'
})
export class SelectObjectComponent implements OnInit, OnChanges {
  private httpService = inject(HttpService);
  @Input() url: string = "";
  @Input() labelProperty: string = "name";
  @Input() keyProperty: string = "id";
  @Input() initialValue: string | string[] = "";
  @Input() type: "search" | "select" | "datalist" = "select";
  isLoaded: boolean = false;
  loading: boolean = false;
  error: boolean = false;
  error_message: string = "";
  objects: any[] = []
  selectedItem: string | string[] = ""
  @Input() timestamp: string = ""
  @Output() selectionChanged = new EventEmitter();

  @Input() selection_mode: "single" | "singles" | "multiple" = "single";
  search_param: string = "";
  dataListId: string = "";
  @Input() fieldLabel: string = "";
  @Input() embedSearchResults: boolean = false;
  searchRan: boolean = false;
  selectedSearchItems: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (this.type === "datalist" && !this.dataListId.trim()) {
      this.dataListId = uuidv4();
    }
    if (((changes['url']?.currentValue !== changes['url']?.previousValue)
      || (changes['type']?.currentValue !== changes['type']?.previousValue))
      && (this.type === "datalist" || this.type === "select")) {
      this.getData();
    }
  }
  ngOnInit(): void {
    // this.getData()
  }



  getData() {
    this.loading = true;

    this.httpService.get<any>(this.url).pipe(take(1))
      .subscribe({
        next: (data: any) => {
          //console.log(data.records);
          //in some rare cases the data is returned as the result, not in the data prop
          this.objects = data.data || data;
          if (this.initialValue) {
            this.selectedItem = this.initialValue
          }
          this.isLoaded = true;
          this.error = false;
          this.loading = false;
        },
        error: (err) => {
          this.error = true;
          this.isLoaded = false;
          this.error_message = err;
          this.loading = false;

        }
      });
  }

  selectionMade() {
    this.selectionChanged.emit(this.selectedItem);
  }


  search() {
    this.loading = true;
    this.searchRan = false;
    const searchUrl = this.url + `?param=${this.search_param}`;
    this.httpService.get<any>(searchUrl).pipe(take(1))
      .subscribe({
        next: (data: any) => {
          //in some rare cases the data is returned as the result, not in the data prop
          this.objects = data.data || data;
          if (this.initialValue) {
            this.selectedItem = this.initialValue
          }
          if (this.objects.length === 1) {
            this.selectionChanged.emit(this.objects[0])
          }
          this.isLoaded = true;
          this.error = false;
          this.searchRan = true;
        },
        error: (err) => {
          this.error = true;
          this.isLoaded = false;
          this.error_message = err;
          this.searchRan = true;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  saveSearchSelection() {
    this.selectionChanged.emit(this.selectedSearchItems);
    this.objects = [];
    this.search_param = "";
  }
}
