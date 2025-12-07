import { Component, input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Params } from '@angular/router';

@Component({
    selector: 'app-stats-card',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule
    ],
    templateUrl: './stats-card.component.html',
    styleUrl: './stats-card.component.scss'
})
export class StatsCardComponent {
    // Required inputs
    title = input.required<string>();
    count = input.required<number | string>();
    icon = input.required<string>();

    // Optional inputs
    description = input<string>();
    url = input<string>();
    urlParams = input<Params>();
    iconBackgroundColor = input<string>('#2e7d32'); // Default green
    loading = input<boolean>(false);

    constructor(private router: Router) { }

    navigate(): void {
        const targetUrl = this.url();
        if (targetUrl) {
            const params = this.urlParams();
            if (params) {
                this.router.navigate([targetUrl], { queryParams: params });
            } else {
                this.router.navigate([targetUrl]);
            }
        }
    }
}
