import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { QRCodeModule } from 'angularx-qrcode';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { iconoirQrCode, iconoirCopy } from '@ng-icons/iconoir';
import { LoadingComponent } from "./loading/loading.component";
import { ThemeSwitcherComponent } from "./theme-switcher/theme-switcher.component";
import { ModalComponent } from "./modal/modal.component";
import { GlobalService } from "../global.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingComponent,
    ThemeSwitcherComponent,
    ModalComponent,
    QRCodeModule,
    NgIconComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [provideIcons({ iconoirQrCode, iconoirCopy })],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class AppComponent {
  title = 'telepo-to';

  @ViewChild('welcomeModal') welcomeModal: ModalComponent | undefined;

  constructor(
    protected global: GlobalService
  ) {}

  ngAfterViewInit() {
    if (!this.global.getWelcomeModalShown()) this.welcomeModal?.showModal(); // Show the welcome modal if it hasn't been shown yet
  }

  protected readonly window = window;
  protected readonly navigator = navigator;
}
