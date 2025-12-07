import { Component, input, OnInit, signal } from '@angular/core';
import { getCountryCode } from '../../utils/helper';

@Component({
  selector: 'app-country-flag',
  imports: [],
  templateUrl: './country-flag.component.html',
  styleUrl: './country-flag.component.scss'
})
export class CountryFlagComponent implements OnInit {
  country = input.required<string>();
  code = signal<string>('');
  getCountryCode = getCountryCode
  constructor() { }

  ngOnInit(): void {
    if (!this.code()) {
      this.code.set(this.getCountryCode(this.country()) || '');
    }
  }
}
