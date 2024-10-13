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
  emojis: Array<any> = [];
  isGameOver: boolean = false;
  guessesMade: Array<Array<number>> = [];
  alertMessage: string = '';
  showAlert: boolean = false;
  
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
    const selectedWordsMapped = this.selectedWords.sort().map((id) => this.words[id]);
    if (this.guessesMade.some(guess => 
        guess.length === selectedWordsMapped.length && 
        guess.every((value, index) => value === selectedWordsMapped[index])
    )) {
      this.alertMessage = 'Already guessed';
      this.showAlert = true;
      setTimeout(() => {
        this.showAlert = false;
      }, 2500)
    } else {
      this.guessesMade.push(selectedWordsMapped);
      console.log(this.guessesMade);
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

  shake(): Promise<void> {
    return new Promise((resolve) => {

      for(let id of this.selectedWords) {
        const element = document.getElementById(`word${id}`);
        element?.classList.add('shake');
        setTimeout(() => {
          element?.classList.remove('shake');
        }, 400);
      }
  
      setTimeout(() => {
        resolve();
      }, 450);
    });
  }

  bounce(): Promise<void> {

    if(this.mistakesRemaining.length > 0) {
      return new Promise((resolve) => {

        const totalDuration = this.selectedWords.length * 100 + 650;
        let idsArray = [];
        const bounceOrder = this.getAnimationOrder();
  
        for (let i = 0; i < this.selectedWords.length; i++) {
          const bounceIndex = bounceOrder.indexOf(this.selectedWords[i]);
          idsArray[bounceIndex] = this.selectedWords[i];
        }
  
        idsArray = idsArray.filter((i) => i);
  
        for(let i = 0; i < idsArray.length; i++) {
          const id = idsArray[i];
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
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100)
      })
    }
    
  }

  slide(): Promise<void> {
    const orderFlat = this.order.flat();

    let idsArray = [];
    let source = [];
    let destination = orderFlat.slice(0, 4);
    const slideOrder = this.getAnimationOrder();
    
    for (let i = 0; i < this.selectedWords.length; i++) {
      const slideIndex = slideOrder.indexOf(this.selectedWords[i]);
      idsArray[slideIndex] = this.selectedWords[i];
    }

    idsArray = idsArray.filter((i) => i);

    for (let id of idsArray) {
      if(!orderFlat.slice(0, 4).includes(id)) {
        source.push(id);
      } else {
        destination.splice(destination.indexOf(id), 1)
      }
    }
    
    const initialPositions = source.map(val => 
      document.getElementById(`word${val}`)?.getBoundingClientRect()
    );

    const finalPositions = destination.map(val => 
      document.getElementById(`word${val}`)?.getBoundingClientRect()
    );

    if(source.length) {
      return new Promise((resolve) => {
        for (let i = 0; i < initialPositions.length; i++) {
          if (initialPositions[i] && finalPositions[i]) {
            const element = document.getElementById(`word${source[i]}`);
            
            element?.style.setProperty('--initial-x', `${initialPositions[i]?.x}px`);
            element?.style.setProperty('--initial-y', `${initialPositions[i]?.y}px`);
            element?.style.setProperty('--final-x', `${(finalPositions[i]?.x ?? 0) - (initialPositions[i]?.x ?? 0)}px`);
            element?.style.setProperty('--final-y', `${(finalPositions[i]?.y ?? 0) - (initialPositions[i]?.y ?? 0)}px`);
  
            element?.classList.add('slide');
          }
        }
  
        for (let i = 0; i < finalPositions.length; i++) {
          if (initialPositions[i] && finalPositions[i]) {
            const element = document.getElementById(`word${destination[i]}`);
            
            element?.style.setProperty('--initial-x', `${finalPositions[i]?.x}px`);
            element?.style.setProperty('--initial-y', `${finalPositions[i]?.y}px`);
            element?.style.setProperty('--final-x', `${(initialPositions[i]?.x ?? 0) - (finalPositions[i]?.x ?? 0)}px`);
            element?.style.setProperty('--final-y', `${(initialPositions[i]?.y ?? 0) - (finalPositions[i]?.y ?? 0)}px`);
  
            element?.classList.add('slide');
          }
        }
  
        setTimeout(() => {
          let newOrder = [];
          for(let i = 0; i < source.length; i++) {
            let sourceIndex = orderFlat.indexOf(source[i]);
            let destIndex = orderFlat.indexOf(destination[i]);
            orderFlat[sourceIndex] = destination[i];
            orderFlat[destIndex] = source[i];
          }
          while (orderFlat.length) {
            newOrder.push(orderFlat.splice(0, 4));
          }
          this.order = newOrder;
          resolve();
        }, 750);
      });
    } else {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 250)
      })
    }
  }

  getAnimationOrder() {
    let animationOrder: Array<number> = [];
    const orderFlat = this.order.flat();
    const length = orderFlat.length;

    for (let i = 0; i < length; i += 4) {
        animationOrder.push(orderFlat[i]);
    }
    
    for (let i = 1; i < length; i += 4) {
        animationOrder.push(orderFlat[i]);
    }
    
    for (let i = 2; i < length; i += 4) {
        animationOrder.push(orderFlat[i]);
    }
    
    for (let i = 3; i < length; i += 4) {
        animationOrder.push(orderFlat[i]);
    }
    return animationOrder;
  }

  async correctGuess(color: any) {
    await this.bounce();
    await this.slide();
    this.wordsRemainingAfterGuess(color['answers']);
    this.groupsFound.push(color);
    this.selectedWords = [];
    if(this.groupsFound.length == 4 && this.mistakesRemaining.length > 0) {
      setTimeout(() => {
        this.gameOver('victory');
      }, 500)
    }
  }

  async wrongGuess(message: string) {
    await this.bounce();
    if (message == 'one away') {
      this.alertMessage = 'One away';
      this.showAlert = true;
      setTimeout(() => {
        this.showAlert = false;
      }, 3000)
    }
    await this.shake();
    this.mistakesRemaining.pop();
    if(this.mistakesRemaining.length == 0)
      await this.gameOver('loss');
  }

  async gameOver(result: string) {
    if(result == 'victory') {
      this.message = "You won!";
      this.isGameOver = true;
    } else {
      this.selectedWords = [];
      let groupsRemaining = [this.yellow, this.green, this.blue, this.purple];
      for(let group of this.groupsFound) {
        groupsRemaining.splice(groupsRemaining.indexOf(group), 1);
      }
      for(let group of groupsRemaining) {
        this.selectedWords = group['answers'];
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, 250)
        })
        await this.correctGuess(group);
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            if(this.groupsFound.length == 4) {
              this.message = "Better luck next time!";
              this.isGameOver = true;
            }
            resolve();
          }, 350)
        })
      }

    }
  }

  share() {

  }

}