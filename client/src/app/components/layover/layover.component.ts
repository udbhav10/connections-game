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
  countdownText: string = "00:00:00";
  countdownInterval: any;

  constructor(public _apiService: ApiService) { }

  ngOnInit(): void {
  }

  play() {
    this.playEventEmitter.emit();
  }

  startCountdown() {
    console.log("Inside startCountdown")
    const updateCountdown = () => {
      const now = new Date();
      const istNow = new Date(
        now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
      );
  
      const endOfDayIST = new Date(istNow);
      endOfDayIST.setHours(23, 59, 59, 999);

      console.log(endOfDayIST)
  
      const timeLeft = endOfDayIST.getTime() - istNow.getTime();
  
      if (timeLeft <= 0) {
        clearInterval(this.countdownInterval);
        this.countdownText = "00:00:00";
        return;
      }
  
      const hours = String(Math.floor(timeLeft / (1000 * 60 * 60))).padStart(2, '0');
      const minutes = String(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      const seconds = String(Math.floor((timeLeft % (1000 * 60)) / 1000)).padStart(2, '0');
  
      this.countdownText = `${hours}:${minutes}:${seconds}`;
    };
  
    this.countdownInterval = setInterval(updateCountdown, 1000);
  
    updateCountdown();
  }  

}
