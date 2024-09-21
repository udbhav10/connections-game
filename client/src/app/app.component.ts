import { Component, HostListener } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule],
  providers: [ApiService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  date: string = '';
  message: string = '';
  isMobile: boolean = false;
  isTablet: boolean = false;
  apiResponse: any = {};
  words: Array<string> = [];
  width: number = window.innerWidth;
  
  constructor(private _apiService: ApiService) {
    this.fetchConnections();
    this.fetchTodayDate();
    this.getMessage();
    this.detectDevice();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.width = this.detectDevice();
  }

  fetchTodayDate() {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    this.date = new Date().toLocaleDateString('en-US', options);
  }

  getMessage() {
    this.message = "Create four groups of four!";
  }

  detectDevice() {
    const width = window.innerWidth;
    this.isMobile = width < 576;
    this.isTablet = width >= 576 && width < 768;
    return width;
  }

  adjustFontSizeAndWidth(word: string): string {
    if(this.width < 370) {
      if(word?.length >= 10 && word?.length < 12) {
        return 'font-variation-width-85 font-size-md-sm-20';
      } else if(word?.length >= 12) {
        return 'font-variation-width-85 font-size-md-sm-17';
      }
    } else if (this.isMobile) {
      if(word?.length >= 12 && word?.length < 14) {
        return 'font-variation-width-85 font-size-md-sm-20';
      } else if(word?.length >= 14) {
        return 'font-variation-width-85 font-size-md-sm-17';
      }     
    } else if(this.isTablet) {
      if(word?.length >= 13) {
        return 'font-variation-width-85 font-size-md-sm-20';
      }
    } else {
      if(word?.length >= 11 && word?.length < 13) {
        return 'font-variation-width-85 font-size-md-sm-20';
      } else if(word?.length >= 13) {
        return 'font-variation-width-85 font-size-md-sm-17';
      }
    }
    return 'font-size-md-sm-20';
  }

  fetchConnections() {
    this.apiResponse = this._apiService.getTodaysWords().subscribe({
      next: (res) => {
        try {
          this.apiResponse = res[0];
          this.words = this.apiResponse['value']['words'].map( (obj: any) => obj.word );
        } catch(err) {

        }
      },
      error: (error) => {
        console.error(error);
      }
    } );
  }
}