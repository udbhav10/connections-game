import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-layover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layover.component.html',
  styleUrl: './layover.component.scss'
})
export class LayoverComponent implements OnInit {
  @Input() istDate: string = '';
  @Input() isMobile: boolean = false;
  @Input() isLoggedIn: boolean = false;
  @Input() isGameOver: boolean = false;
  @Input() layoverHeight: number = 0;
  @Input() dataIsLoading: boolean = false;
  @Input() resultFlag: boolean | null = null;
  @Input() groupsFound: number = 0;
  @Input() mistakesRemaining: number = 4;
  @Input() greetingMessage: string = "Please log in to save your progress!";
  @Input() buttonText: string = "Play";
  @Output() playEventEmitter: EventEmitter<any> = new EventEmitter();

  constructor(public _apiService: ApiService) { }

  ngOnInit(): void {
  }

  play() {
    this.playEventEmitter.emit();
  }

}
