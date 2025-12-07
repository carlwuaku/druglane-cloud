import { Component, input } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { Params } from "@angular/router";
import { DataActionsButton } from '../../types/DataAction.type';
import { ApiCountComponent } from "../api-count/api-count.component";
import { MenuAlert, MenuDataPoint } from '../../types/MenuItem.interface';
import { SecureImageComponent } from '../secure-image/secure-image.component';

@Component({
    selector: 'app-dashboard-tile',
    standalone: true,
    imports: [
        RouterModule,
        RouterLink,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatMenuModule,
        ApiCountComponent,
        SecureImageComponent
    ],
    templateUrl: './dashboard-tile.component.html',
    styleUrl: './dashboard-tile.component.scss'
})
export class DashboardTileComponent {
    title = input.required<string>();
    url = input.required<string>();
    image = input.required<string>();
    description = input<string>();
    urlParams = input<Params>();
    actions = input<DataActionsButton[]>();
    alerts = input<MenuAlert[]>();
    dataPoints = input<MenuDataPoint[]>();

    constructor() { }

    // Check if image is an external URL (starts with http:// or https://)
    isExternalUrl(imageUrl: string): boolean {
        return !imageUrl.includes("file-server");
    }

    // Handle action button clicks and prevent navigation when card has a URL
    onActionClick(event: Event, action: DataActionsButton): void {
        event.preventDefault();
        event.stopPropagation();
        if (action.onClick) {
            action.onClick();
        }
    }

}
