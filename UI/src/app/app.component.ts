import { Component, computed, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from './core/services/auth/auth.service';
import { AppService } from './app.service';
import { ToastModule } from 'primeng/toast';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from './core/models/user.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink, ToastModule, MatTooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);

  appName = 'Management System';
  title = '';

  // user = this.authService.currentUser;
  logo: string = "";
  user = computed(() => this.data()?.['userData'] as User | null);
  isLoggedIn = false;
  constructor() {

    this.router.events.subscribe((event) => {

      if (event instanceof NavigationEnd) {
        let root: ActivatedRouteSnapshot = this.router.routerState.snapshot.root;
        let titles = [];
        while (root) {
          if (root.data['title']) { titles.push(root.data['title']); }

          root = root.firstChild!;
        }
        this.title = titles.join('/ ');
      }
    });
  }
  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe({
      next: data => {
        this.isLoggedIn = data;
      },
      error: error => {
        console.error(error)
      }
    })

  }


  logout() {
    this.authService.logout();
    //send user to login page
    this.router.navigate(['login']);
  }

  goBack() {
    window.history.back();
  }
}
