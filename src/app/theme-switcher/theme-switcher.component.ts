import { Component, Input } from '@angular/core';
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-theme-switcher',
  standalone: true,
  imports: [
    FormsModule
  ],
  templateUrl: './theme-switcher.component.html',
  styleUrl: './theme-switcher.component.css'
})
export class ThemeSwitcherComponent {
  @Input() theme: boolean = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

  constructor() {
    if (localStorage.getItem('theme') === undefined) localStorage.setItem('theme', this.theme.toString());
    this.theme = localStorage.getItem('theme') === 'true';
  }

  themeChange() {
    localStorage.setItem('theme', this.theme.toString());
  }
}
