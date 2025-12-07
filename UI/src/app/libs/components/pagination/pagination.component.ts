import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  imports: [MatIconModule, CommonModule, MatFormFieldModule, FormsModule, MatButtonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  //get the url from the parent component
  buttons: any[] = [];
  // @Input() url;
  @Input() limit: number = 1000;
  @Input() offset: number = 0;
  @Input() total: number = 0;
  @Input() current_page: number = 1
  @Input() limits: number[] = [25, 50, 100, 250, 500, 1000, 1500, 2500, 5000]
  dropdown_pages: number[] = []
  last_page: number = 0;

  //some urls have some params attached. in this case we
  //append the offset with &offset= instead of ?offset=
  // @Input() url_has_params:string = "no"
  loading: boolean = false;
  error: boolean = false;
  num_of_btns: number = 0;
  @Output() pageChanged = new EventEmitter<number>();
  @Output() limitChanged = new EventEmitter<number>();
  page_number: any;

  constructor() {

  }

  ngOnInit() {
    this.prep();
    this.prepSelect()
    // this.setCurrent()
  }

  ngOnChanges() {
    this.prep();
    this.prepSelect()
    // this.setCurrent()
  }

  prep() {
    // console.log("offset "+this.offset)
    // console.log("total "+this.total)
    this.buttons = []
    this.offset = 0;
    this.num_of_btns = Math.floor(this.total / this.limit);
    //if there is a remainder, add an extra btn.
    if (this.total % this.limit > 0) {
      this.num_of_btns++;
    }

    for (var i = 0; i < this.num_of_btns; i++) {
      var offset = i * this.limit;
      var next = offset + this.limit;
      var end = next > this.total ? this.total : next;
      this.buttons.push({ name: "Page " + i, offset: offset, end: end, current: false })

    }

    //set the first one to active.
    if (this.buttons.length > 0) {
      this.buttons[0].current = true;
    }
  }

  //get the pages for the dropdown style
  prepSelect() {

    this.dropdown_pages = []
    var total = Math.floor(this.total / this.limit);
    //if there is a remainder, add an extra page.
    if (this.total % this.limit > 0) {
      total += 1;
    }
    this.last_page = total;
    //get how many pages to place before and after the current page
    //before
    var x = this.current_page - 5;
    if (x > 1) {

      //add page 1
      this.dropdown_pages.push(1)
      for (var i = x; i < this.current_page; i++) {
        this.dropdown_pages.push(i)
      }
    }
    else {
      for (var i = 1; i < this.current_page; i++) {
        this.dropdown_pages.push(i);
      }
    }

    //insert the current page itself
    this.dropdown_pages.push(this.current_page)

    //after
    // we do *1 to convert the string to number
    var y = this.current_page * 1 + 5;
    if (y < total) {
      for (var j = this.current_page * 1 + 1; j <= y; j++) {
        this.dropdown_pages.push(j);
      }
      //add the last page
      this.dropdown_pages.push(total)
    }
    else {
      for (var j = this.current_page * 1 + 1; j <= total; j++) {
        this.dropdown_pages.push(j);
      }
    }


  }

  changePage() {
    this.pageChanged.emit(this.current_page);
    this.prepSelect()
    // this.setCurrent(btn);
  }

  nextPage() {
    this.current_page = this.current_page * 1 + 1;
    this.pageChanged.emit(this.current_page);
    this.prepSelect()
  }

  previousPage() {
    this.current_page -= 1;
    this.pageChanged.emit(this.current_page);
    this.prepSelect()
  }

  lastPage() {
    this.current_page = this.last_page;
    this.pageChanged.emit(this.current_page);
    this.prepSelect()
  }

  firstPage() {
    this.current_page = 1;
    this.pageChanged.emit(this.current_page);
    this.prepSelect()
  }


  changeLimit() {
    this.limitChanged.emit(this.limit)
  }

}
