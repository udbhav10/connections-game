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
  words: any = {};
  selectedWords: Array<number> = [];
  order: Array<Array<number>> = [[]];
  yellow: any = {};
  green: any = {};
  blue: any = {};
  purple: any = {};
  width: number = window.innerWidth;
  groupsFound: any = [];
  mistakesRemaining: Array<number> = [0, 0, 0, 0];
  
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
          this.words = this.apiResponse['value']['words'];
          this.order = this.apiResponse['value']['order'];
          this.yellow = this.apiResponse['value']['yellow'];
          this.green = this.apiResponse['value']['green'];
          this.blue = this.apiResponse['value']['blue'];
          this.purple = this.apiResponse['value']['purple'];
        } catch(err) {

        }
      },
      error: (error) => {
        console.error(error);
      }
    } );
  }

  toggleSelection(item: number) {
    if(this.selectedWords.length !== 4 && !this.selectedWords.includes(item)) {
      this.selectedWords.push(item);
    } else if(this.selectedWords.includes(item)) {
      this.selectedWords = this.selectedWords.filter(num => num !== item);
    }
  }

  shuffle() {

    const orderFlat = this.order.flat();
    
    for (let i = orderFlat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [orderFlat[i], orderFlat[j]] = [orderFlat[j], orderFlat[i]];
    }
  
    const shuffled = [];
    while (orderFlat.length) {
      shuffled.push(orderFlat.splice(0, 4));
    }
  
    this.order = shuffled;
  }

  wordsRemainingAfterGuess(color: Array<number>) {
    const orderFlat = this.order.flat();
    const newOrderFlat = orderFlat.filter((num) => !color.includes(num));
    let newOrder = [];
    let groupsRemaining = newOrderFlat.length / 4;
    for(let i = 0; i < groupsRemaining; i++) {
      newOrder.push(newOrderFlat.splice(0, 4));
    }
    this.order = newOrder;
  }

  deselectAll() {
    this.selectedWords = [];
  }

  submit() {
    const wordsChosen = [...this.selectedWords].sort((a: any, b: any) => a - b);
    const yellowWords = this.yellow['answers'].sort((a: any, b: any) => a - b);
    const greenWords = this.green['answers'].sort((a: any, b: any) => a - b);
    const blueWords = this.blue['answers'].sort((a: any, b: any) => a - b);
    const purpleWords = this.purple['answers'].sort((a: any, b: any) => a - b);    
    const key = this.compare(wordsChosen, yellowWords, greenWords, blueWords, purpleWords);
    switch (key) {
      case 'yellow':
        this.correctGuess(this.yellow);
        break;
      case 'green':
        this.correctGuess(this.green);
        break;
      case 'blue':
        this.correctGuess(this.blue);
        break;
      case 'purple':
        this.correctGuess(this.purple);
        break;
      case 'one away':
        this.wrongGuess('one away');
        break;
      case '':
        this.wrongGuess('');
        break;
      default:
        break;
    }
  }

  compare(wordsChosen: Array<number>, yellowWords: Array<number>, greenWords: Array<number>, blueWords: Array<number>, purpleWords: Array<number>) {

    if(this.arraysEqual(wordsChosen, yellowWords))
      return 'yellow'
    else if(this.arraysEqual(wordsChosen, greenWords))
      return 'green'
    else if(this.arraysEqual(wordsChosen, blueWords))
      return 'blue'
    else if(this.arraysEqual(wordsChosen, purpleWords))
      return 'purple'
    else if(this.checkOneAway(wordsChosen, yellowWords) || this.checkOneAway(wordsChosen, greenWords) || this.checkOneAway(wordsChosen, blueWords) || this.checkOneAway(wordsChosen, purpleWords))
      return 'one away'
    else
      return ''

  }

  arraysEqual = (chosen: Array<number>, target: Array<number>) =>
    chosen.length === target.length && chosen.every((val: number, index: number) => val === target[index]);

  checkOneAway = (chosen: Array<number>, target: Array<number>): boolean => {
    var count = 0;
    chosen.forEach(item => target.includes(item) ? count++ : '');
    if(count == 3) {
      return true;
    }
    return false;
  }

  shake() {

  }

  bounce(): Promise<void> {
    return new Promise((resolve) => {

      const totalDuration = this.selectedWords.length * 100 + 650;
  
      for (let i = 0; i < this.selectedWords.length; i++) {
        const id = this.selectedWords[i];
        setTimeout(() => {
          const element = document.getElementById(`word${id}`);
          element?.classList.add('bounce');
          setTimeout(() => {
            element?.classList.remove('bounce');
          }, 650);
        }, i * 100);
      }
  
      setTimeout(() => {
        resolve();
      }, totalDuration + 50);
    });
  }

  slide(): Promise<void> {
    return new Promise((resolve) => {
      resolve();
    })
  }

  async correctGuess(color: any) {
    await this.bounce();
    await this.slide();
    this.wordsRemainingAfterGuess(color['answers']);
    this.groupsFound.push(color);
    this.selectedWords = [];
  }

  async wrongGuess(message: string) {
    await this.bounce();
    this.shake();
    this.mistakesRemaining.pop();
    this.selectedWords = [];
    if(this.mistakesRemaining.length == 0)
      this.gameOver();
  }

  gameOver() {

  }

}