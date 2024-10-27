import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layover.component.html',
  styleUrl: './layover.component.scss'
})
export class LayoverComponent {
  @Input() date: string = '';
  @Input() isMobile: boolean = false;
}
