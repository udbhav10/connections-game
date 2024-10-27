import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

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
  @Input() isLoggedIn: boolean = false;
  @Input() isGameOver: boolean = false;
  @Input() layoverHeight: number = 0;
  @Output() playEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(public _apiService: ApiService) { }

  play() {
    this.playEventEmitter.emit();
  }

}
