import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as Highcharts from 'highcharts';
import { HighchartsChartModule } from 'highcharts-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-popover',
  standalone: true,
  imports: [HighchartsChartModule, CommonModule, FormsModule],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss'
})
export class PopoverComponent implements OnInit {

  Highcharts = Highcharts;
  @Output() closeEventEmitter: EventEmitter<any> = new EventEmitter();
  @Input('popoverType') popoverType: string = 'stats';
  @Input('mistakesDistri') mistakesDistri: any = {};
  @Input() doNotShowHelpAgain: boolean = false;
  @Input() darkMode: boolean = false;
  mistakesStats: any = {
    "wins": 0,
    "losses": 0,
    "mistakes_0": 0,
    "mistakes_1": 0,
    "mistakes_2": 0,
    "mistakes_3": 0,
    "mistakes_4": 0,
    "winPercent": '0%',
    "totalPlayed": 0
  };
  chartOptions: Highcharts.Options = {
    chart: {
      type: 'bar',
      height: 300
    },
    title: {
      text: 'Mistakes distribution',
    },
    xAxis: {
      min: 0,
      max: 4,
      tickInterval: 1,
      labels: {
        enabled: true,
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        enabled: false,
      },
    },
    legend: {
      enabled: false,
    },
    tooltip: {
      enabled: false
    },
    plotOptions: {
      series: {
        color: '#b3a7fe',
        dataLabels: {
          enabled: true,
          inside: true,
          align: 'right',
          x: -10,
          style: {
            fontWeight: 'bold',
            color: 'black',
            fontSize: '16px',
            textOutline: 'none'
          },
          formatter: function () {
            return this.y !== 0 ? this.y : null;
          }
        }
      },
    },
    credits: {
      enabled: false
    }
  };

  ngOnInit(): void {
    this.mistakesStats['wins'] = Number(this.mistakesDistri['wins']);
    this.mistakesStats['losses'] = Number(this.mistakesDistri['losses']);
    this.mistakesStats['mistakes_0'] = Number(this.mistakesDistri['mistakes_0']);
    this.mistakesStats['mistakes_1'] = Number(this.mistakesDistri['mistakes_1']);
    this.mistakesStats['mistakes_2'] = Number(this.mistakesDistri['mistakes_2']);
    this.mistakesStats['mistakes_3'] = Number(this.mistakesDistri['mistakes_3']);
    this.mistakesStats['mistakes_4'] = Number(this.mistakesDistri['mistakes_4']);
    this.mistakesStats['totalPlayed'] = Number(this.mistakesStats['wins']) + Number(this.mistakesStats['losses']);
    if(this.mistakesStats['totalPlayed']) {
      this.mistakesStats['winPercent'] = String( Math.round((this.mistakesStats['wins'] / this.mistakesStats['totalPlayed']) * 100) ) + '%';
    }
    this.chartOptions.series = [{
      type: 'bar',
      data: [this.mistakesStats['mistakes_0'], this.mistakesStats['mistakes_1'], this.mistakesStats['mistakes_2'], this.mistakesStats['mistakes_3'], this.mistakesStats['mistakes_4']],
      pointWidth: 30,
    }];

    this.applyHighchartsTheme();
  }

  closePopover() {
    if(this.popoverType == 'howToPlay') {
      this.closeEventEmitter.emit({
        doNotShowHelpAgain: this.doNotShowHelpAgain
      });
    } else {
      this.closeEventEmitter.emit({});
    }
  }

  startTour() {
    this.closeEventEmitter.emit({
      doNotShowHelpAgain: this.doNotShowHelpAgain,
      startTour: true
    });
  }

  applyHighchartsTheme() {
    this.chartOptions.chart!.backgroundColor = this.darkMode ? '#121212' : '#FFFFFF';
    this.chartOptions.title!.style = { color: this.darkMode ? '#FFFFFF' : '#000000' };
  
    const xAxis = this.chartOptions.xAxis as Highcharts.XAxisOptions;
    if (xAxis.labels) {
      xAxis.labels.style = { color: this.darkMode ? '#FFFFFF' : '#000000' };
    }
  
    this.chartOptions.yAxis = {
      ...this.chartOptions.yAxis,
      gridLineColor: this.darkMode ? '#444444' : '#DDDDDD',
    };
  
    this.chartOptions.plotOptions!.series!.color = this.darkMode ? '#8A7FFF' : '#b3a7fe';
  
    const dataLabels = this.chartOptions.plotOptions!.series!.dataLabels as Highcharts.PlotSeriesDataLabelsOptions;
    if (dataLabels) {
      dataLabels.style = { color: this.darkMode ? '#FFFFFF' : '#000000' };
    }
  }
}
