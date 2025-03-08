import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Event, RouterOutlet } from '@angular/router';
import { ApiService } from './services/api.service';
import { LayoverComponent } from './components/layover/layover.component';
import { PopoverComponent } from './components/popover/popover.component';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { trigger, transition, style, animate } from '@angular/animations';
import { ShepherdService } from 'angular-shepherd';
import { tourSteps, defaultStepOptions, loginStep, accountStep } from './models/tour-data';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule, LayoverComponent, PopoverComponent, NgbDropdownModule],
  providers: [ApiService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('slide', [
      transition(':enter', [
        style({ top: '135%' }),
        animate('200ms ease', style({ top: '50%' }))
      ]),
      transition(':leave', [
        style({ top: '50%' }),
        animate('200ms ease', style({ top: '135%' }))
      ])
    ]),
    trigger('sheenMove', [
      transition(':enter', [
        style({ transform: 'translateX({{startX}})' }),
        animate('1250ms ease-in-out', style({ transform: 'translateX({{endX}})' }))
      ], { params: { startX: '-50px', endX: '100%' } })
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  istDate: string = '';
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
  allocatedMistakes: Array<number> = [0, 0, 0, 0];
  emojis: Array<any> = [];
  isGameOver: boolean = false;
  gameJustGotOver: boolean = false;
  guessesMade: Array<Array<number>> = [];
  alertMessage: string = '';
  shareMessage: string = '';
  showAlert: boolean = false;
  showLayover: boolean = true;
  showPopover: boolean = false;
  popoverType: string = '';
  isLoggedIn: boolean = false;
  layoverHeight: number = 0;
  attempts: number = 0;
  resultFlag: boolean | null = null;
  mistakesDistri: any = {};
  dataIsLoading = true;
  greetingMessage: string = "Please log in to save your progress!";
  buttonText: string = "Play";
  showSheen: boolean = false;
  isShuffling: boolean = false;
  alertTimeout: any = undefined;
  doNotShowHelpAgain: boolean | null = null;
  showHint: boolean = false;
  yellowHint: number | null = null;
  greenHint: number | null = null;
  blueHint: number | null = null;
  purpleHint: number | null = null;
  
  constructor(public _apiService: ApiService, private shepherdService: ShepherdService) {
    this.fetchTodayDate();
    this.fetchConnections();
    this.detectDevice();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getLayoverHeight();
    }, 10)
   }

  ngAfterViewInit(): void {
    this.shepherdService.defaultStepOptions = defaultStepOptions;
    this.shepherdService.modal = true;
    this.shepherdService.confirmCancel = false;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.width = this.detectDevice();
    this.getLayoverHeight();
  }

  fetchTodayDate() {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(new Date().getTime() + istOffset);
    this.istDate = istNow.toLocaleDateString('en-US', options);
    this.shareMessage = "Connections\n" + this.istDate + "\n";
  }

  detectDevice() {
    const width = window.innerWidth;
    this.isMobile = width < 577;
    this.isTablet = width >= 577 && width < 769;
    return width;
  }

  getLayoverHeight() {
    const headerHeight = document.getElementById('navbar')?.offsetHeight || 0;
    const footerHeight = document.getElementById('footer')?.offsetHeight || 0;
    const totalHeight = document.getElementById('main-container')?.offsetHeight || 0;
    this.layoverHeight = totalHeight - (headerHeight + footerHeight);
  }

  adjustFontSizeAndWidth(word: string): string {
    var maxWordLength = word.length;
    if(word.includes(" ")) {
      const subWords = word.split(" ");
      maxWordLength = subWords.reduce((max, subWord) => Math.max(max, subWord.length), 0);
    }
    if(this.width < 350) {
        if(maxWordLength == 8) {
          return 'font-variation-width-85 font-size-md-sm-22';
        } else if(maxWordLength == 9) {
            return 'font-variation-width-85 font-size-md-sm-20';
        } else if(maxWordLength == 10) {
            return 'font-variation-width-85 font-size-md-sm-18';
        } else if(maxWordLength > 10) {
            return 'font-variation-width-85 font-size-md-sm-16';
        } 
    } else if(this.width < 370) {
        if(maxWordLength == 8) {
          return 'font-variation-width-85 font-size-md-sm-22';
        } else if(maxWordLength == 9) {
            return 'font-variation-width-85 font-size-md-sm-20';
        } else if(maxWordLength == 10) {
            return 'font-variation-width-85 font-size-md-sm-18';
        } else if(maxWordLength > 10) {
            return 'font-variation-width-85 font-size-md-sm-16';
        } 
    } else if (this.isMobile) {
        if(maxWordLength >= 8 && maxWordLength <= 9) {
            return 'font-variation-width-85 font-size-md-sm-22';
        } else if(maxWordLength == 10) {
            return 'font-variation-width-85 font-size-md-sm-20';
        } else if(maxWordLength == 11) {
            return 'font-variation-width-85 font-size-md-sm-18';
        } else if(maxWordLength > 11) {
            return 'font-variation-width-85 font-size-md-sm-17';
        }     
    } else if(this.isTablet) {
        if(maxWordLength >= 13 && maxWordLength <= 14) {
            return 'font-variation-width-85 font-size-md-sm-22';
        } else if(maxWordLength > 14 && maxWordLength <= 16) {
            return 'font-variation-width-85 font-size-md-sm-20';
        } else if(maxWordLength > 16) {
            return 'font-variation-width-85 font-size-md-sm-16';
        }
    } else {
        if(maxWordLength >= 10 && maxWordLength < 12) {
            return 'font-variation-width-85 font-size-md-sm-22';
        } else if(maxWordLength >= 12 && maxWordLength < 14) {
            return 'font-variation-width-85 font-size-md-sm-20';
        } else if(maxWordLength >= 14) {
            return 'font-variation-width-85 font-size-md-sm-16';
        }
    }
    return 'font-size-md-sm-22';
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
          this.message =  this.apiResponse['value']['greetingMessage'] || "Create four groups of four!";
          this.yellowHint = this.apiResponse['value']?.['hints']?.['yellow'] ?? this.yellow['answers'][Math.floor(Math.random() * this.yellow['answers'].length)];
          this.greenHint = this.apiResponse['value']?.['hints']?.['green'] ?? this.green['answers'][Math.floor(Math.random() * this.green['answers'].length)];
          this.blueHint = this.apiResponse['value']?.['hints']?.['blue'] ?? this.blue['answers'][Math.floor(Math.random() * this.blue['answers'].length)];
          this.purpleHint = this.apiResponse['value']?.['hints']?.['purple'] ?? this.purple['answers'][Math.floor(Math.random() * this.purple['answers'].length)];

        } catch(err) {

        }
      },
      error: (error) => {
        console.error(error);
        this.dataIsLoading = false;
      },
      complete: () => { 
        this.fetchLoginStatus();
      }
    } );
  }

  fetchLoginStatus() {
    this.apiResponse = this._apiService.getLoginStatus().subscribe({
      next: (res) => {
        try {
          this.isLoggedIn = res.isLoggedIn;
        } catch(err) {

        }
      },
      error: (error) => {
        console.error(error);
        this.dataIsLoading = false;
      },
      complete: () => {
        this.addStepsToTour();
        const sessionData = this.getCookie('gameProgress');
        const configuration = this.getCookie('configuration');
        if(this.isLoggedIn) {
          this.getData(sessionData);
        } else {
          if(sessionData) {
            this.getSessionData(sessionData);
          }
          if (configuration) {
            try {
              const configObj = JSON.parse(configuration);
              if (configObj && configObj.doNotShowHelpAgain !== undefined) {
                this.doNotShowHelpAgain = configObj.doNotShowHelpAgain;
              }
            } catch (err) {
              console.error('Error parsing configuration cookie:', err);
            }
          }
          this.dataIsLoading = false;
        }
      }
    } );
  }

  logout() {
    this._apiService.logout().subscribe({
      next: (res) => {
        document.cookie = "gameProgress=; path=/;";
        window.location.reload();
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => { }
    });
  }

  toggleSelection(item: number) {
    if(this.selectedWords.length !== 4 && !this.selectedWords.includes(item)) {
      this.selectedWords.push(item);
    } else if(this.selectedWords.includes(item)) {
      this.selectedWords = this.selectedWords.filter(num => num !== item);
    }
  }

  blink(): Promise<void> {

    return new Promise((resolve) => {
      const wordTiles = document.querySelectorAll('.wordTile span');
      wordTiles.forEach(span => {
        span.classList.add('fadeOut');
      });
      setTimeout(() => {
        this.shuffle();
        wordTiles.forEach(span => {
          span.classList.add('fadeIn');
        });
      }, 205);
      setTimeout(() => {
        resolve();
      }, 410);
    })
  }

  shuffle(): void {
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

  async shuffleAndBlink() {
    this.isShuffling = true;
    await this.blink();
    this.isShuffling = false;
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
      if(this.alertTimeout) {
        this.showAlert = false;
        clearTimeout(this.alertTimeout);
      }
      setTimeout(() => {
        this.showAlert = true;
      }, 5);
      this.alertTimeout = setTimeout(() => {
        this.showAlert = false;
      }, 3000)
    } else {
      this.guessesMade.push(selectedWordsMapped);
      this.modifyShareMessage(selectedWordsMapped);
      this.attempts++;
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

        const totalDuration = this.selectedWords.length * 100 + 450;
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
            }, 450);
          }, i * 100);
        }
    
        setTimeout(() => {
          resolve();
        }, totalDuration + 150);
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

  async growAndShrink(): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lastRevealedGroup = this.groupsFound[this.groupsFound.length - 1]['class'];
        const groupId = 'group-' + lastRevealedGroup;
        const element = document.getElementById(groupId);
        element?.classList.add('growAndShrink');
      }, 10);
      setTimeout(() => {
        resolve();
      }, 510);
    })
  }

  async fadeMistakeCircles(): Promise<void> {
    return new Promise((resolve, reject) => {
      const mistakeCircles = document.querySelectorAll('.mistake-circle-fill');
      mistakeCircles[this.mistakesRemaining.length].classList.add('fadeFill');
      setTimeout(() => {
        resolve();
      }, 500);
    })
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
    await this.growAndShrink();
    this.selectedWords = [];
    if(this.groupsFound.length == 4 && this.mistakesRemaining.length > 0) {
      setTimeout(() => {
        this.gameOver('victory');
      }, 500)
    } else if(this.mistakesRemaining.length) {
      this.shareMessage += '\n';
      this.storeData();
    }
  }

  async wrongGuess(message: string) {
    await this.bounce();
    if (message == 'one away') {
      this.alertMessage = 'One away';
      if(this.alertTimeout) {
        this.showAlert = false;
        clearTimeout(this.alertTimeout);
      }
      setTimeout(() => {
        this.showAlert = true;
      }, 5);
      this.alertTimeout = setTimeout(() => {
        this.showAlert = false;
      }, 3000)
    }
    await this.shake();
    this.mistakesRemaining.pop();
    this.fadeMistakeCircles();
    if(this.mistakesRemaining.length == 0) {
      await this.gameOver('loss');
    } else {
      this.shareMessage += '\n';
      this.storeData();
    }
  }

  async gameOver(result: string) {
    if(result == 'victory') {
      this.message = "You won!";
      this.isGameOver = true;
      this.resultFlag = true;
      this.gameJustGotOver = true;
      this.showSheen = true;
      setTimeout(() => {
        this.showSheen = false;
      }, 1250)
    } else {
      this.selectedWords = [];
      let groupsRemaining = [this.yellow, this.green, this.blue, this.purple];
      this.resultFlag = false;
      for (let group of this.groupsFound) {
          const index = groupsRemaining.findIndex(g => g.class === group.class);
          if (index !== -1) {
              groupsRemaining.splice(index, 1);
          }
      }
      for(let index = 0; index < groupsRemaining.length; index++) {
        const group = groupsRemaining[index];
        this.selectedWords = group['answers'];
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, index === 0 ? 1000 : 250)
        })
        await this.correctGuess(group);
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            if(this.groupsFound.length == 4) {
              this.message = "Better luck next time!";
              this.isGameOver = true;
              this.gameJustGotOver = true;
            }
            resolve();
          }, 350)
        })
      }

    }
    this.storeData();
  }

  toggleHint() {
    this.showHint = !this.showHint;
    if (this.showHint) {
      this.selectedWords = []; 
    }
  }

  getHintClass(item: any): string {
    if (item === this.yellowHint) return 'yellow-overlay';
    if (item === this.greenHint) return 'green-overlay';
    if (item === this.blueHint) return 'blue-overlay';
    if (item === this.purpleHint) return 'purple-overlay';
    return '';
  }

  modifyShareMessage(guess: Array<String>) {
    let guessPattern = "";
    for(let word of guess) {
      Object.keys(this.words).forEach((key) => {
        if(this.words[key] == word) {
          if(this.yellow['answers'].includes(Number(key))) {
            guessPattern += '🟨';
          } else if(this.green['answers'].includes(Number(key))) {
            guessPattern += '🟩';
          } else if(this.blue['answers'].includes(Number(key))) {
            guessPattern += '🟦';
          } else if(this.purple['answers'].includes(Number(key))) {
            guessPattern += '🟪';
          }
        }
      })
    }
    this.shareMessage += guessPattern;
  }

  async share() {
    try {
      await navigator.clipboard.writeText(this.shareMessage);
  
      if (navigator.share) {
        await navigator.share({
          title: "Share your guesses!",
          text: this.shareMessage,
        });
      } else {
        alert("Message copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to share:", error);
    }
  }

  setActiveTouch(icon: HTMLElement) {
    icon.classList.add('active-touch');
  }

  removeActiveTouch(icon: HTMLElement) {
    icon.classList.remove('active-touch');
  }

  setActiveMouse(icon: HTMLElement) {
    if(!this.detectTouchDevice()) {
      icon.classList.add('active-mouse');
    }
  }

  removeActiveMouse(icon: HTMLElement) {
    if(!this.detectTouchDevice()) {
      icon.classList.remove('active-mouse');
    }
  }

  detectTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  storeData() {

    const progressData = {
      groupsFound: this.groupsFound,
      mistakesRemaining: this.mistakesRemaining,
      isGameOver: this.isGameOver,
      guessesMade: this.guessesMade,
      shareMessage: this.shareMessage,
      message: this.message,
      order: this.order
    };
    const attempts = this.attempts;
    const resultFlag = this.resultFlag;

    const now = new Date();
    
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset);
    
    const todayDate = this.istDate;

    const sessionData = { progressData, attempts, resultFlag, todayDate };
    const cookieValue = encodeURIComponent(JSON.stringify(sessionData));

    const expireTime = new Date(istNow.getTime() + 24 * 60 * 60 * 1000);

    document.cookie = `gameProgress=${cookieValue}; path=/; expires=${expireTime.toUTCString()};`;

    if(this.isLoggedIn) {
      
      this._apiService.saveProgressData(progressData, attempts, resultFlag).subscribe({
        next: (response) => {
          console.log('Progress data saved:', response);
        },
        error: (error) => {
          console.error('Error saving progress data:', error);
        },
        complete: () => {
          if (this.gameJustGotOver) {
            this.getMistakes();
          }
        }
      }); 

    }
  }

  getSessionData(sessionData: any) {

      try {
        const { progressData, attempts, resultFlag, todayDate } = JSON.parse(sessionData);

        if (todayDate !== this.istDate) {

          document.cookie = "gameProgress=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          // console.log('Cookie destroyed as the date does not match.');
          return;
      }
  
        this.attempts = attempts;
        this.resultFlag = resultFlag === null ? null : Boolean(resultFlag);
        this.groupsFound = progressData.groupsFound;
        this.guessesMade = progressData.guessesMade;
        this.isGameOver = progressData.isGameOver;
        this.message = progressData.message;
        this.mistakesRemaining = progressData.mistakesRemaining;
        this.order = progressData.order;
        this.shareMessage = progressData.shareMessage;

        this.getLayoverContent();

      } catch (e) {
        console.error('Error parsing session storage data:', e);
      }
    
  }
  
  getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  getData(sessionData: any) {
    this._apiService.getProgressData().subscribe({
      next: (res: any) => {
        if (Object.keys(res).length > 0) {
          this.attempts = res.attempts;
          this.resultFlag = res.result_flag === null ? null : Boolean(res.result_flag);
          this.groupsFound = res.progressData.groupsFound;
          this.guessesMade = res.progressData.guessesMade;
          this.isGameOver = res.progressData.isGameOver;
          this.message = res.progressData.message;
          this.mistakesRemaining = res.progressData.mistakesRemaining;
          this.order = res.progressData.order;
          this.shareMessage = res.progressData.shareMessage;
        } else {
          if(sessionData) {
            this.getSessionData(sessionData);
            this.storeData();
          }
        }
      },
      error: (error) => {
        if(sessionData) {
          this.getSessionData(sessionData);
          this.storeData();
        }
        this.dataIsLoading = false;
      },
      complete: () => {
        this.getMistakes();
        this.getLayoverContent();
      }
    })
  }

  getMistakes() {
    this._apiService.getMistakesData().subscribe({
      next: (res: any) => {
        if (Object.keys(res).length > 0) {
          this.mistakesDistri = res['mistakesDistri'];
        }
      },
      error: (error) => {
        console.error('Error getting mistakes data:', error);
        this.dataIsLoading = false;
      },
      complete: () => {
        this.getConfiguration();
      }
    })
  }

  getConfiguration() {
    this._apiService.getUserConfiguration().subscribe({
      next: (res: any) => {
        if(res['configuration']['doNotShowHelpAgain']) {
          this.doNotShowHelpAgain = res['configuration']['doNotShowHelpAgain'];
        }
      },
      error: (error) => {
        console.error('Error getting user configuration:', error);
      },
      complete: () => {
        this.dataIsLoading = false;
      }
    })
  }

  saveConfiguration() {
    if(this.isLoggedIn) {
      
      this._apiService.saveUserConfiguration(this.doNotShowHelpAgain ?? false).subscribe({
        next: (response) => {
          console.log('User config saved:', response);
        },
        error: (error) => {
          console.error('Error saving user config:', error);
        },
        complete: () => {
          
        }
      }); 

    }
  }

  getLayoverContent() {
    const loginPrompt = this.isLoggedIn ? "" : " Please log in to save your progress.";
    if(this.resultFlag === null) {
      if(this.groupsFound.length > 0 || this.mistakesRemaining.length < 4) {
        this.greetingMessage = `You have found ${this.groupsFound.length}/4 connections!`;
        this.buttonText = 'Continue';
      } else {
        this.greetingMessage = `Solve today's connections and build your streak!`;
        this.buttonText = 'Play';
      }
    } else if(this.resultFlag === false) {
      this.greetingMessage = 'Better luck next time!';
      this.buttonText = 'Admire Puzzle';
    } else if(this.resultFlag === true) {
      this.greetingMessage = "Well done on solving today's connections!";
      this.buttonText = 'Admire Puzzle';
    }
    this.greetingMessage += loginPrompt;
  }

  openStats() {
    this.popoverType = 'stats';
    this.showPopover = true;
  }
  
  openHowToPlay() {    
    this.popoverType = 'howToPlay';
    this.showPopover = true;
  }

  play() {
    this.showLayover = false;
    setTimeout(() => {
      const mistakeCircles = document.querySelectorAll('.mistake-circle-fill');
      for(let i = 0; i < (4 - this.mistakesRemaining.length); i++) {
        mistakeCircles[3 - i].classList.remove('mistake-circle-fill');
        mistakeCircles[3 - i].classList.add('mistake-circle');
      }
    }, 10);
    if ( !this.doNotShowHelpAgain ) {
      setTimeout(() => {
        this.openHowToPlay();
      }, 500);
    }
  }

  closePopover(event: any) {
    if(event.hasOwnProperty('doNotShowHelpAgain')) {
      if(this.doNotShowHelpAgain !== event['doNotShowHelpAgain']) {
        this.doNotShowHelpAgain = event['doNotShowHelpAgain'];
        if(this.isLoggedIn) {
          this.saveConfiguration();
        } else {
          const configuration = {
            "doNotShowHelpAgain": this.doNotShowHelpAgain
          };
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          document.cookie = `configuration=${JSON.stringify(configuration)}; path=/; expires=${expiryDate.toUTCString()};`;
        }
      }
    }
    if(event.hasOwnProperty('startTour')) {
      this.shepherdService.start();
    }
    this.showPopover = false;
  }

  addStepsToTour() {
    if(this.isLoggedIn) {
      tourSteps.push(accountStep);
    } else {
      tourSteps.push(loginStep);
    }
    this.shepherdService.addSteps(tourSteps);
  }
  
  ngOnDestroy(): void { }

}