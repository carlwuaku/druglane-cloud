import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';

import { AuthService } from './core/services/auth/auth.service';
import { AppService } from './app.service';
import { ToastModule } from 'primeng/toast';
import { MatTooltipModule } from '@angular/material/tooltip';
import { toSignal } from '@angular/core/rxjs-interop';
import { User } from './core/models/user.model';
import { takeUntil } from 'rxjs';
import { SidebarNavComponent } from './libs/components/sidebar-nav/sidebar-nav.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, RouterLink, ToastModule, MatTooltipModule, MatSidenavModule, SidebarNavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  @ViewChild('drawer') drawer!: MatSidenav;

  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private breakpointObserver = inject(BreakpointObserver);
  private data = toSignal(this.route.data);

  appName = 'Druglane PMS';
  title = '';

  // user = this.authService.currentUser;
  logo: string = "druglane original logo-2.png";
  user = computed(() => this.data()?.['userData'] as User | null);
  isLoggedIn = false;
  isMobile = false;
  sidenavMode: 'side' | 'over' = 'side';

  constructor() {
    // Observe breakpoints for responsive sidebar behavior
    this.breakpointObserver.observe(['(max-width: 768px)']).subscribe(result => {
      this.isMobile = result.matches;
      this.sidenavMode = result.matches ? 'over' : 'side';
    });

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Close sidebar on mobile after navigation
        if (this.isMobile && this.drawer) {
          this.drawer.close();
        }

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

  toggleSidebar() {
    this.drawer.toggle();
  }
}
