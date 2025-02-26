import { Component, OnInit, Input } from '@angular/core';
import { ChartService } from '../../../shared/services/chart.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TransServiceService } from '../../../shared/services/trans-service.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
declare var OpenLayers: any;

@Component({
  selector: 'epic-explorer-graph-list',
  templateUrl: './graph-list.component.html',
  styleUrls: ['./graph-list.component.css'],
})
export class GraphListComponent implements OnInit {
  @Input()
  viewchart: boolean = true;
  public linearGraphData: any = [];
  public areaGraphData: any = [];
  public doubleareaGraphData: any = [];
  public barGraphData: any = [];
  public barGraphIntevalData: any = [];
  public blockGraphData: any = [];
  public bubbleGraphdData: any = [];
  public feeGraphData: any = [];
  public growthGraphData: any = [];
  public heatMapGrowthData: any = [];
  public transcationGraphData: any = [];
  public stackGraphData: any = [];
  public pieGraphData: any = [];
  public linearTotalGraphData: any = [];
  public currenyIntervalDate: any;
  public showcurrentIntervalDate: any;
  public showcurrentIntervalDatetimestamp: any;
  public todaydate = new Date().setDate(new Date().getDate() - 1);

  public lg_last: any;
  public ag_last: any = '';
  public dg_last: any = '';
  public brg_last: any = '';
  public bg_last: any = '';
  public bubg_last: any = '';
  public fg_last: any = '';
  public gg_last: any = '';
  public tg_last: any = '';
  public hg_last: any = '';
  public sg_last: any = '';
  public pg_last: any = '';
  public blockinteval_last: any = '';

  public selectedItem: Number = 6;
  public selectedItem3: Number = 1;
  public selectedItem2: Number = 3;
  public selectedItem4: Number = 3;
  public selectedItem5: Number = 3;
  public selectedItem7: Number = 3;
  public selectedItem8: Number = 3;
  public selectedItem81: Number = 1;
  public selectedItem9: Number = 3;
  public selectedItem10: Number = 3;
  public selectedItem11: Number = 3;
  public selectedItem12: Number = 4;
  public selectedTarget: Number = 6;
  public selectedTarget12: Number = 4;
  public selectedInteverval: Number = 1;

  public tInput: any;
  public tOutput: any;
  public tKernal: any;
  public tDate: any;
  public tHour: any;
  public Type: any = 'all';
  public difficultyRange: any = '1 day';
  public TdifficultyRange: any = '1 day';

  viewchartvar: boolean;
  public getJSONData: any;// = (geoData as any).default;
  public map;
  constructor(private chartService: ChartService, private http: HttpClient, public translate: TransServiceService, private router: Router,
  ) {
    if (this.router.url == '/all') {
      this.viewchartvar = true;
    } else {
      this.viewchartvar = true;
    }
  }

  ngOnInit() {
    /* Total Difficulty and blocks chart fetching */
    this.Difficultyreq('target');
    this.Difficultyreq('total');
    this.blockreq();

    this.Blockintervalreq();

    /* Transcation fee chart fetching */
    this.Transcationreq();

    /* Growth chart fetching */
    this.Growthreq();

    /* Blockspersec chart fetching */
    this.Blockspersecreq();

    /* Blockmined chart fetching */
    this.Blockminedreq();

    /* Transactionheatmap chart fetching */
    this.Transactionheatmapreq();

    /* Transactionline chart fetching */
    this.Transactionlinechartreq();

    /* Transaction2line chart fetching */
    // this.Transactiondoublelinechartreq();

    /* Stack chart fetching */
    this.stackchartreq();

    /* Pie chart fetching */
    // this.piechartreq();
    /*
    this.chartService.apiGetRequest({}, '/blockchain_kernel/getpeerslocation')
      .subscribe(res => {
        if (res['status'] == 200) {
          const ips = res.response.dataJson.locations;
          const map = new OpenLayers.Map({
            div: 'mapdiv'
          });

          map.addLayer(new OpenLayers.Layer.OSM(
            'OpenStreetMap',
            // Official OSM tileset as protocol-independent URLs
            [
              '//a.tile.openstreetmap.org/${z}/${x}/${y}.png',
              '//b.tile.openstreetmap.org/${z}/${x}/${y}.png',
              '//c.tile.openstreetmap.org/${z}/${x}/${y}.png'
            ], null));
          const markers = new OpenLayers.Layer.Markers('Markers');
          const zoom = 1;
          map.addLayer(markers);

          if (ips.length > 0) {
            for (let i = 0; i < ips.length; i++) {
              const lonLat = new OpenLayers.LonLat(ips[i].longitude, ips[i].latitude)
                .transform(
                  new OpenLayers.Projection('EPSG:4326'), // transform from WGS 1984
                  map.getProjectionObject() // to Spherical Mercator Projection
                );
              markers.addMarker(new OpenLayers.Marker(lonLat));
            }
          }

          map.setCenter(new OpenLayers.LonLat(0, 0), zoom);
          map.zoomToMaxExtent();
        }
      },
      error => { },
    );
    */
  }

  piechartreq(
    fromDate = '',
    ToDate = '',
    interval = '',
  ) {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/blockpiechart')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let plabel = res.response.label;
              let pvalues = res.response.value;
              this.pg_last =
                pvalues[pvalues.length - 1];
              this.piechartFunc(
                plabel,
                pvalues,
              );
              resolve();
            }
          },

          error => { },

        );
    });
  }

  stackchartreq(
    fromDate = '',
    ToDate = '',
    interval = '',
  ) {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      this.stackGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-03 06:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }



      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      params = params.append('Interval', (interval == "all") ? "" : interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/stackblock')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let sDate = res.response.Date;
              let Cuckoo = res.response.Cuckoo;
              let ProgPow = res.response.ProgPow;
              let RandomX = res.response.RandomX;
              let today_date_index = sDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              this.sg_last = RandomX[today_date_index] + ProgPow[today_date_index] + Cuckoo[today_date_index];
              //this.sg_last = RandomX[RandomX.length - 1];
              this.stackchartFunc(
                sDate,
                Cuckoo,
                ProgPow,
                RandomX
              );
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Transactiondoublelinechartreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise((resolve, reject) => {
      let params = new HttpParams();
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      params = params.append('Interval', interval);
      // this.chartService
      //   .apiGetRequest(params, '/blockchain_block/hashrate')
      //   .subscribe(
      //     res => {
      //       if (res['status'] == 200) {
      //         let Hdate = res.response.date;
      //         let H29 = res.response.hashrate29;
      //         let H31 = res.response.hashrate31;
      //         this.hg_last = H31[H31.length - 1];
      //         this.transactiondoublelinechartFunc(Hdate, H29, H31);
      //         resolve();
      //       }
      //     },

      //     error => {},

      //   );
    });
  }

  Transactionlinechartreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();

      this.feeGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-03 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_kernel/transactionlinechart')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let Tdate = res.response.date;
              let Ttotalinput = res.response.totalinput;
              let Ttotalkernal = res.response.totalkernal;
              let Ttotaloutput = res.response.totaloutput;
              let today_date_index = Tdate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              this.tg_last = parseInt(Ttotalinput[today_date_index]) + parseInt(Ttotalkernal[today_date_index]) + parseInt(Ttotaloutput[today_date_index]);
              this.transactionlinechartFunc(
                Tdate,
                Ttotalinput,
                Ttotalkernal,
                Ttotaloutput,
              );
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Transactionheatmapreq() {
    return new Promise<void>((resolve, reject) => {
      this.chartService
        .apiGetRequest('', '/blockchain_kernel/transactionheatmap')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              this.tDate = res.response.date;
              this.tHour = res.response.hour[0];
              this.tInput = res.response.totalinput;
              this.tOutput = res.response.totaloutput;
              this.tKernal = res.response.totalkernal;
              // let transtypepassed =
              //   transtype == 'input'
              //     ? tInput
              //     : transtype == 'output'
              //     ? tOutput
              //     : transtype == 'kernal'
              //     ? tKernal
              //     : tInput;
              // let transpassed =
              //   transtype == 'input'
              //     ? 'Input'
              //     : transtype == 'output'
              //     ? 'Output'
              //     : transtype == 'kernal'
              //     ? 'Kernel'
              //     : 'Input';
              this.transactionheatmapFunc(
                this.tDate,
                this.tHour,
                this.tInput,
                'Input',
              );
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Blockminedreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();


      this.doubleareaGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-03 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);

      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/blockminedchart')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let mDate = res.response.date;
              let ProgPow = res.response.ProgPow;
              let Cuckoo = res.response.Cuckoo;
              let RandomX = res.response.RandomX;

              let ProgPowper = res.response.ProgPowper;
              let Cuckooper = res.response.Cuckooper;
              let RandomXper = res.response.RandomXper;

              let today_date_index = mDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));

              this.dg_last = ProgPow[today_date_index] + Cuckoo[today_date_index] + RandomX[today_date_index];

              //this.dg_last = RandomXper[RandomXper.length - 1];
              this.blockminedFunc(
                mDate,
                ProgPow,
                Cuckoo,
                RandomX,
                ProgPowper,
                Cuckooper,
                RandomXper,
              );
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Blockspersecreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      this.areaGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-03 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/blockspersec')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let bDate = res.response.date;
              let bPeriod = res.response.period;
              let today_date_index = bDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              this.ag_last = bPeriod[today_date_index];
              //this.ag_last = bPeriod[bPeriod.length - 1];
              this.blockspersecFunc(bDate, bPeriod);
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Growthreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();

      this.growthGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-04 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);

      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/supplygrowth')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let gDate = res.response.date;
              let gReward = res.response.total_reward_per_day;
              let gaddedreward = res.response.addedreward;
              let today_date_index = gDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              //let today_date_index = gDate.indexOf('2019-08-06');
              //this.gg_last = gReward[today_date_index];
              this.gg_last = "4";
              let range = [];
              if (gaddedreward.length == 1 && gaddedreward[0] != 0) {
                range = [(gaddedreward[0] - (gaddedreward[0] * 0.3)), (gaddedreward[0] + (gaddedreward[0] * 0.3))];
              }
              //this.gg_last = gReward[gReward.length - 1];
              this.growthFunc(gDate, gReward, gaddedreward, range);
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Transcationreq(fromDate = '', ToDate = '', interval = '') {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();


      this.transcationGraphData = []
      if (interval == "all") {
        fromDate = "2019-09-03 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);

      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_kernel/transactionfee')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let TfDate = res.response.Date;
              let TfFee = res.response.Fee;
              let today_date_index = TfDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              this.fg_last = TfFee[today_date_index];
              //this.fg_last = TfFee[TfFee.length - 1];
              this.transcationfeeFunc(TfDate, TfFee);
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Difficultyreq(
    difftype = '',
    fromDate = '',
    ToDate = '',
    interval = '',
    type = ''
  ) {

    this.Type = type != '' ? type : this.Type == '' ? 'all' : this.Type;
    // loader enable while change tab
    if (difftype == "total")
      this.linearTotalGraphData = []
    else if (difftype == "target")
      this.linearGraphData = []

    if (interval == "all") {
      // this.Type=""
      fromDate = "2019-09-03 00:00:00"
      ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
    }

    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      params = params.append('Interval', (interval == "all") ? "all" : interval);
      params = params.append('Type', this.Type);
      params = params.append('Difftype', difftype);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/totaldiff')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let DifficultychartDate = res.response.Date;
              let DifficultyCuckatoo = res.response.DifficultyCuckatoo;
              let DifficultyRandomx = res.response.DifficultyRandomx;
              let DifficultyProgpow = res.response.DifficultyProgpow;
              let data;
              switch (this.Type) {
                case 'all':
                  data =
                    [
                      {
                        x: DifficultychartDate,
                        y: DifficultyCuckatoo,
                        text: DifficultychartDate,
                        // mode: 'lines+markers',
                        type: 'scatter',
                        name: 'Cuckoo',
                        line: { color: '#f5c330' },

                        //hovertemplate: '%{text}<br> Cuckoo : %{y:,}',
                        hovertemplate: 'Cuckoo : %{y:,}',
                        hoverlabel: { namelength: 0 }

                      },

                      {
                        x: DifficultychartDate,
                        y: DifficultyProgpow,
                        text: DifficultychartDate,
                        // mode: 'lines+markers',
                        type: 'scatter',
                        name: 'ProgPoW',
                        yaxis: 'y2',
                        line: { color: '#C0C0C0' },

                        hovertemplate: 'ProgPoW : %{y:,}',
                        hoverlabel: { namelength: 0 }
                      },

                      {
                        x: DifficultychartDate,
                        y: DifficultyRandomx,
                        text: DifficultychartDate,
                        // mode: 'lines+markers',
                        type: 'scatter',
                        name: 'RandomX',
                        yaxis: 'y3',
                        line: { color: '#B87333' },

                        hovertemplate: 'RandomX : %{y:,}',
                        hoverlabel: { namelength: 0 }
                      },

                    ];
                  break;
                default:
                  let yvalue = this.Type == 'cuckatoo' ? DifficultyCuckatoo : this.Type == 'progpow' ? DifficultyProgpow : this.Type == 'randomx' ? DifficultyRandomx : []
                  data =
                    [
                      {
                        x: DifficultychartDate,
                        y: yvalue,
                        text: DifficultychartDate,
                        mode: 'lines+markers',
                        type: 'scatter',
                        name: '',
                        line: { color: '#48dc6b' },

                        hovertemplate: '%{text}<br> Difficulty : %{y:,}',
                      }];
                  break;
              }
              let range1 = [];
              let range2 = [];
              let range3 = [];              // res.response.Minrange, res.response.Maxrange
              if (DifficultychartDate.length == 1 && DifficultyCuckatoo[0] != 0 && DifficultyRandomx[0] != 0 && DifficultyProgpow[0] != 0) {
                range1 = [(DifficultyCuckatoo[0] - (DifficultyCuckatoo[0] * 0.3)), (DifficultyCuckatoo[0] + (DifficultyCuckatoo[0] * 0.3))];
                range2 = [(DifficultyRandomx[0] - (DifficultyRandomx[0] * 0.3)), (DifficultyRandomx[0] + (DifficultyRandomx[0] * 0.3))];
                range3 = [(DifficultyProgpow[0] - (DifficultyProgpow[0] * 0.3)), (DifficultyProgpow[0] + (DifficultyProgpow[0] * 0.3))];
              }
              let tickformat = res.response.tickFormat;
              // this.lg_last =
              // TargetDifficulty[TargetDifficulty.length - 1];

              switch (difftype) {
                case 'total':
                  this.totaldifficultyChartFunc(
                    DifficultychartDate,
                    data,
                    this.Type,
                    range1,
                    range2,
                    range3,
                    tickformat
                  );
                  break;
                case 'target':
                  this.difficultyChartFunc(
                    DifficultychartDate,
                    data,
                    this.Type,
                    range1,
                    range2,
                    range3,
                    tickformat
                  );
                  break;
              }
              resolve();
            }
          },

          error => { },

        );
    });
  }

  Blockintervalreq(interval = '') {
    //interval = '2019-08-11';
    if (interval == "today") {
      this.currenyIntervalDate = moment(new Date()).format('YYYY-MM-DD');
      this.showcurrentIntervalDate = moment(new Date()).format('MM-DD-YYYY');
      this.showcurrentIntervalDatetimestamp = new Date(this.showcurrentIntervalDate).getTime();
    } else if (interval == "yesterday") {
      this.currenyIntervalDate = moment(new Date()).subtract(1, "days").format("YYYY-MM-DD");
      this.showcurrentIntervalDate = moment(new Date()).subtract(1, "days").format("MM-DD-YYYY");
      this.showcurrentIntervalDatetimestamp = new Date(this.showcurrentIntervalDate).getTime();
    } else if (interval == "previous") {
      var currentdate = this.currenyIntervalDate;
      this.currenyIntervalDate = moment(currentdate).subtract(1, "days").format("YYYY-MM-DD");
      this.showcurrentIntervalDate = moment(currentdate).subtract(1, "days").format("MM-DD-YYYY");
      this.showcurrentIntervalDatetimestamp = new Date(this.showcurrentIntervalDate).getTime();
    } else if (interval == "next") {
      var currentdate = this.currenyIntervalDate;
      this.currenyIntervalDate = moment(currentdate).add(1, "days").format("YYYY-MM-DD");
      this.showcurrentIntervalDate = moment(currentdate).add(1, "days").format("MM-DD-YYYY");
      this.showcurrentIntervalDatetimestamp = new Date(this.showcurrentIntervalDate).getTime();
    } else {
      this.currenyIntervalDate = moment(new Date()).format('YYYY-MM-DD');
      this.showcurrentIntervalDate = moment(new Date()).format('MM-DD-YYYY');
      this.showcurrentIntervalDatetimestamp = new Date(this.showcurrentIntervalDate).getTime();
    }
    // console.log(this.currenyIntervalDate);
    // console.log(this.showcurrentIntervalDate);
    interval = this.currenyIntervalDate;
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/blockinterval')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let BlocksChartHeight = res.response.Blocks;
              let Blockval = res.response.alter;
              this.blockinteval_last = Blockval[Blockval.length - 1];
              var range = [BlocksChartHeight[0], BlocksChartHeight[BlocksChartHeight.length - 1]];
              this.BlocksIntevalFunc(BlocksChartHeight, Blockval, range);
              resolve();
            }
          },

          error => { },

        );
    });
  }

  blockreq(
    fromDate = '',
    ToDate = '',
    interval = '',
  ) {
    return new Promise<void>((resolve, reject) => {
      let params = new HttpParams();
      this.barGraphData = []
      if (interval == "all") {
        // this.Type=""
        fromDate = "2019-09-03 00:00:00"
        ToDate = moment(new Date()).format("YYYY-MM-DD 23:29:59")
      }

      params = params.append('Interval', (interval == "all") ? "" : interval);
      params = params.append('FromDate', fromDate);
      params = params.append('ToDate', ToDate);
      // params = params.append('Interval', interval);
      this.chartService
        .apiGetRequest(params, '/blockchain_block/blockcount')
        .subscribe(
          res => {
            if (res['status'] == 200) {
              let DifficultychartDate = res.response.Date;
              let BlocksChartDate = res.response.blockDate;
              let Blockval = res.response.Blocks;
              let today_date_index = BlocksChartDate.indexOf(moment(Date.now()).format('YYYY-MM-DD'));
              this.brg_last = Blockval[today_date_index];
              //this.brg_last = Blockval[Blockval.length - 1];
              this.totalBlocksFunc(BlocksChartDate, Blockval);
              resolve();
            }
          },

          error => { },

        );
    });
  }

  difficultyChartFunc(DifficultychartDate, data, Type, range1, range2, range3, tickformat) {
    let dtickval;
    if (tickformat == "%H-%M"){
      dtickval = ''
    }else if (DifficultychartDate.length < 21712){
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 100571){
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 200571){
      dtickval = 10 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 5 * 30 * 24 * 60 * 60 * 1000
    }

    let window_width = window.screen.width;
    let position = 0.00;
    let angle = 0;
    let domain_start = 0;
    let left_margin = 5;
    let cuckoo_position = null;
    let right_margin = 10;
    if (window_width > 700) {
      position = 0.11;
      angle = 0;
      domain_start = 0.18;
      left_margin = 5;
      cuckoo_position = null;
      right_margin = 10;
    }
    else {
      position = 0.03;
      angle = -45;
      domain_start = 0.23;
      left_margin = 25;
      cuckoo_position = 0.20;
      right_margin = 20;
    }

    // console.log('range rangerangerange',range);
    this.linearGraphData = {
      data: data,
      layout: {
        // hovermode: 'closest',
        height: 250,
        autosize: true,
        showlegend: true,
        legend: {
          "orientation": "h",
          x: 0.1, y: -0.5, font: { 'size': 10 }
        },

        xaxis: {
          tickangle: -45,
          tickformat: tickformat,
          // fixedrange: true,
          rangemode: 'nonnegative',
          domain: [domain_start, 0.9],
          tick0: DifficultychartDate[0],
          dtick: dtickval,
          // showgrid: true          
          tickfont: {
            size: 12
          }
        },

        yaxis: {
          title: 'Cuckoo',
          fixedrange: true,
          rangemode: 'nonnegative',
          // showgrid: true,
          range: range1,
          ticks: 'outside',
          // position:cuckoo_position,
          tickangle: angle,
          tickfont: {
            size: 12
          }
        },

        yaxis2: {
          title: 'ProgPoW',
          fixedrange: true,
          // showgrid: true,
          range: range3,
          overlaying: 'y',
          rangemode: 'nonnegative',
          // side: 'left',
          position: position,
          tickangle: angle,
          tickfont: {
            size: 12
          }
        },

        yaxis3: {
          title: 'RandomX',
          fixedrange: true,
          // showgrid: true,
          range: range2,
          ticks: 'outside',
          anchor: 'x',
          overlaying: 'y',
          rangemode: 'nonnegative',
          side: 'right',
          position: 0.00,
          tickangle: angle,
          tickfont: {
            size: 12
          }

        },

        margin: {
          l: left_margin,
          r: right_margin,
          b: 50,
          t: 50,
        },

      },

    };
  }

  stackchartFunc(sDate, Cuckoo, ProgPow, RandomX) {

    let dtickval;
    let tickformat = '%m-%d';
    console.log('sDate.length');
    console.log(sDate.length);
    if (sDate.length < 10){
      dtickval = 2 * 24 * 60 * 60 * 1000
    } else if (sDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    } else if (sDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    } else if (sDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    } else if (sDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000
    } else { 
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }

    this.stackGraphData = {
      data: [
        {
          x: sDate,
          y: Cuckoo,
          name: 'Cuckoo',
          type: 'bar',
          text: Cuckoo,
          hovertemplate: '%{x}<br> Cuckoo : %{text:,}',
          hoverlabel: { namelength: 0 },

          marker: {
            color: '#bf9b30',
          },
        },
        {
          x: sDate,
          y: ProgPow,
          name: 'ProgPoW',
          type: 'bar',
          text: ProgPow,
          hovertemplate: '%{x}<br> ProgPoW : %{text:,}',
          hoverlabel: { namelength: 0 },
          marker: {
            color: '#C0C0C0',
          },
        },
        {
          x: sDate,
          y: RandomX,
          name: 'RandomX',
          type: 'bar',
          text: RandomX,
          hovertemplate: '%{x}<br> RandomX : %{text:,}',
          hoverlabel: { namelength: 0 },
          marker: {
            color: '#B87333',
          },
        }
      ],
      layout: {
        hovermode: 'closest',
        //width: 350,
        height: 250,
        autosize: true,
        showlegend: true,
        legend: {
          "orientation": "h",
          x: 0.35, y: -0.5, font: { 'size': 10 }
        },

        barmode: 'relative',
        xaxis: {
          showgrid: true,
          zeroline: false,
          tickangle: -45,
          tickformat: tickformat,
          rangemode: 'nonnegative',
          fixedrange: true,
          tick0: sDate[0],
          dtick: dtickval
        },

        yaxis: {
          showline: false,
          title: 'Blocks',
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }


  piechartFunc(plabel, pvalues) {
    this.pieGraphData = {
      data: [
        {
          values: pvalues,
          labels: plabel,
          type: 'pie'
        }

      ],
      layout: {
        hovermode: 'closest',
        width: 350,
        height: 250,
        autosize: false,
        showlegend: false,
        xaxis: {
          tickangle: -45,
          tickformat: '%m-%d',
          showgrid: true,
          rangemode: 'nonnegative',
          fixedrange: true
        },

        yaxis: {
          title: 'Blocks',
          showgrid: true,
          fixedrange: true,
          rangemode: 'nonnegative'
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  BlocksIntevalFunc(BlocksChartHeight, Blockval, range) {
    this.barGraphIntevalData = {
      data: [
        {
          x: BlocksChartHeight,
          y: Blockval,
          text: Blockval,
          name: '',
          hovertemplate: 'Block #%{x}<br> Interval : %{text:,}s',
          type: 'bar',
          marker: {
            color: '#bf9b30',
            colorscale: 'Viridis',
          },

        },

        {
          name: 'Average Block Interval',
          y: [60],
          orientation: 'h',
          type: 'bar'
        }
      ],
      layout: {
        hovermode: 'closest',
        height: 250,
        autosize: true,
        showlegend: false,
        xaxis: {
          tickangle: -45,
          range: range,
          showgrid: true,
          title: 'Block Height',
          rangemode: 'nonnegative',
          fixedrange: true
        },

        yaxis: {
          title: 'Seconds',
          showgrid: true,
          fixedrange: true,
          rangemode: 'nonnegative'
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
    console.log(this.barGraphIntevalData.data)
  }


  totalBlocksFunc(DifficultychartDate, Blockval) {

    let tickformat = '%m-%d';
    let dtickval;
    if (DifficultychartDate.length < 5) {
      dtickval = 1 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }


    this.barGraphData = {
      data: [
        {
          x: DifficultychartDate,
          y: Blockval,
          text: Blockval,
          name: '',
          hovertemplate: '%{x}<br> Block : %{text:,}',
          type: 'bar',
          marker: {
            color: "#bf9b30",
            colorscale: 'Viridis',
          },

        },

      ],
      layout: {
        hovermode: 'closest',
        height: 250,
        autosize: true,
        showlegend: false,
        xaxis: {
          tickangle: -45,
          tickformat: tickformat,
          showgrid: true,
          fixedrange: true,
          rangemode: 'nonnegative',
          tick0: DifficultychartDate[0],
          dtick: dtickval
        },

        yaxis: {
          title: 'Blocks',
          rangemode: 'nonnegative',
          showgrid: true,
          fixedrange: true
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  transcationfeeFunc(TfDate, TfFee) {

    let tickformat = '%m-%d';
    let dtickval;
    if (TfDate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000;
    }else if (TfDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000;
    }else if (TfDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000;
    }else if (TfDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000;
    }else if (TfDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000;
    }else {
      tickformat = "%b %Y";
      dtickval = 5 * 30 * 24 * 60 * 60 * 1000;
    }

    this.transcationGraphData = {
      data: [
        {
          x: TfDate,
          y: TfFee,
          text: TfFee,
          name: '',
          hovertemplate: '%{x}<br> Fee : %{text:,}',
          type: 'lines',
          line: {
            color: '#bf9b30',
          },

        },

      ],
      layout: {
        hovermode: 'closest',
        height: 250,
        autosize: true,
        xaxis: {
          tickangle: -45,
          tickformat: tickformat,
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
          tick0: TfDate[0],
          dtick: dtickval,
          tickfont: {
            size: 11
          }
        },

        yaxis: {
          title: 'Tx Fee',
          rangemode: 'nonnegative',
          fixedrange: true,
          // showgrid: true,
          tickangle: -15,
          ticks: 'outside',
          // dtick :0.02,
          position: 0.0001,
          tickfont: {
            size: 11
          }
        },

        margin: {
          l: 60,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  growthFunc(gDate, gReward, gaddedreward, range) {

    let tickformat = '%m-%d';
    let dtickval;
    if (gDate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (gDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    }else if (gDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (gDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    }else if (gDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }

    this.growthGraphData = {
      data: [
        {
          x: gDate,
          y: gaddedreward,
          // type: 'line',
          //mode: 'lines',
          //fill: 'tozeroy',
          type: 'line',
          name: '',
          line: {
            color: '#bf9b30',
            width: 3,
          },

          text: gReward,
          hovertemplate:
            '%{x}<br> Supply per day : %{text:,}<br> Total supply : %{y:,}',
        },

      ],
      layout: {
        hovermode: 'closest',
        height: 250,
        autosize: true,
        xaxis: {
          linecolor: 'rgb(204,204,204)',
          linewidth: 1,
          tickformat: tickformat,
          tickangle: -45,
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
          tick0: gDate[0],
          dtick: dtickval
        },

        yaxis: {
          title: 'Total Reward Supply',
          rangemode: 'nonnegative',
          ticks: 'outside',
          fixedrange: true,
          showgrid: true,
          range: range,
          //tickformat :".0f",
          tickprefix: '                '
        },

        margin: {
          l: 60,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  blockspersecFunc(bDate, bPeriod) {
    let tickformat = '%m-%d';
    let dtickval;
    if (bDate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (bDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    }else if (bDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (bDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    }else if (bDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }
    this.areaGraphData = {
      data: [
        {
          x: bDate,
          y: bPeriod,
          text: bPeriod,
          name: '',
          hovertemplate: '%{x}<br> Seconds per Block : %{text:,}',
          fill: 'tozeroy',
          type: 'line',
          line: {
            color: '#bf9b30',
          },

        },

      ],
      layout: {
        hovermode: 'closest',
        // width: 350,
        height: 250,
        autosize: true,
        xaxis: {
          tickformat: tickformat,
          tickangle: -45,
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
          tick0: bDate[0],
          dtick: dtickval
        },

        yaxis: {
          title: 'Seconds / Block',
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  blockminedFunc(mDate, ProgPow, Cuckoo, RandomX, ProgPowper, Cuckooper, RandomXper) {

    let tickformat = '%m-%d';
    let dtickval;
    if (mDate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (mDate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    }else if (mDate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (mDate.length < 70) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    }else if (mDate.length < 90) {
      dtickval = 12 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }

    //
    this.doubleareaGraphData = {
      data: [
        {
          x: mDate,
          y: Cuckooper,
          text: Cuckoo,
          hovertemplate: 'Cuckoo : %{y} % ( %{text:,} )',
          hoverlabel: { namelength: 0 },
          name: 'Cuckoo',
          type: 'bar',
          marker: {
            color: '#bf9b30',
          },
        },
        {
          x: mDate,
          y: ProgPowper,
          text: ProgPow,
          hovertemplate: 'ProgPoW : %{y} % ( %{text:,} )',
          hoverlabel: { namelength: 0 },
          type: 'bar',
          name: 'ProgPoW',
          marker: {
            color: '#C0C0C0',
          },
        },
        {
          x: mDate,
          y: RandomXper,
          text: RandomX,
          hovertemplate: 'RandomX : %{y} % ( %{text:,} )',
          hoverlabel: { namelength: 0 },
          type: 'bar',
          name: 'RandomX',
          marker: {
            color: '#B87333',
          },
        },
      ],
      layout: {
        hovermode: 'closest',
        height: 250,
        autosize: true,
        showlegend: true,
        legend: {
          "orientation": "h",
          x: 0.35, y: -0.5, font: { 'size': 10 }
        },

        barmode: 'relative',
        xaxis: {
          tickformat: tickformat,
          tickangle: -45,
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
          tick0: mDate[0],
          dtick: dtickval
        },

        yaxis: {
          title: 'Percentage(%)',
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

      },

      options: null,
    };
  }

  transactionheatmapFunc(tDate, tHour, tInput, hovertext) {
    return new Promise<void>((resolve, reject) => {
      this.heatMapGrowthData = {
        data: [
          {
            x: tHour,
            y: tDate,
            z: tInput,
            name: '',
            text: hovertext,
            hovertemplate: hovertext + ': %{z:,} ',
            colorscale: [[0.0, "rgb(211,211,211)"],
            [0.1111111111111111, "rgb(192,192,192)"],
            [0.2222222222222222, "rgb(169,169,169)"],
            [0.3333333333333333, "rgb(255,215,0)"],
            [0.4444444444444444, "rgb(218,165,32)"],
            [0.5555555555555556, "rgb(213, 140, 75)"],
            [0.6666666666666666, "rgb(184, 115, 51)"],
            [0.7777777777777778, "rgb(156, 91, 27)"],
            [0.8888888888888888, "rgb(89, 58, 30)"],
            [1.0, "rgb(61, 40, 23)"]],
            //colors : colorRamp(c("red", "green")),
            type: 'heatmap',
            visible: true,
            colorbar: { thickness: 3 },

            xgap: 1,
            ygap: 1,
          },

        ],
        layout: {
          hovermode: 'closest',
          height: 250,
          //width: 365,
          autosize: true,
          annotations: [],
          font: {
            size: 8.5,
          },

          xaxis: {
            ticks: '',
            tickangle: screen.width < 767 ? '-90' : 360,
            side: 'top',
            autotick: false,
            showgrid: false,
            rangemode: 'nonnegative',
            fixedrange: true,
            autosize: true,
          },

          yaxis: {
            ticks: '',
            ticksuffix: ' ',
            tickformat: '%m-%d',
            autosize: true,
            showgrid: false,
            autotick: false,
            rangemode: 'nonnegative',
            fixedrange: true,
          },

          margin: {
            l: 35,
            r: 2,
            b: 50,
            t: 50,
          },

          showlegend: false,
        },

        options: null,
      };
      resolve();
    });
  }
  transactionlinechartFunc(Tdate, Ttotalinput, Ttotalkernal, Ttotaloutput) {

    let tickformat = '%m-%d';
    let dtickval;
    if (Tdate.length < 10) {
      dtickval = 2 * 24 * 60 * 60 * 1000
    } else if (Tdate.length < 20) {
      dtickval = 4 * 24 * 60 * 60 * 1000
    }else if (Tdate.length < 40) {
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (Tdate.length < 100) {
      dtickval = 8 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000;
    }

    this.feeGraphData = {
      data: [
        {
          type: 'scatter',
          mode: 'lines',
          name: 'Input',
          x: Tdate,
          y: Ttotalinput,
          text: Ttotalinput,
          hovertemplate: 'Total Input : %{text:,} ',
          hoverlabel: { namelength: 0 },

          line: { color: '#bf9b30' },

        },

        {
          type: 'scatter',
          mode: 'lines',
          name: 'Kernel',
          x: Tdate,
          y: Ttotalkernal,
          text: Ttotalkernal,
          hovertemplate: 'Total Kernel : %{text:,} ',
          hoverlabel: { namelength: 0 },

          line: { color: '#C0C0C0' },

        },

        {
          type: 'scatter',
          mode: 'lines',
          name: 'Output',
          x: Tdate,
          y: Ttotaloutput,
          text: Ttotaloutput,
          hovertemplate: 'Total Output : %{text:,} ',
          hoverlabel: { namelength: 0 },

          line: { color: '#B87333' },

        },

      ],
      layout: {
        autosize: true,
        // width: 350,
        height: 250,
        xaxis: {
          showgrid: true,
          zeroline: false,
          tickformat: tickformat,
          rangemode: 'nonnegative',
          fixedrange: true,
          tickangle: -45,
          tick0: Tdate[0],
          dtick: dtickval
        },

        yaxis: {
          showline: false,
          title: 'Transactions',
          ticks: 'outside',
          rangemode: 'nonnegative',
          fixedrange: true,
          showgrid: true,
        },

        margin: {
          l: 60,
          r: 5,
          b: 50,
          t: 50,
        },

        showlegend: true,
        legend: {
          "orientation": "h",
          x: 0.05, y: -0.5, font: { 'size': 10 }
        }
      },

      options: null,
    };
  }
  transactiondoublelinechartFunc(Hdate, H29, H31) {
    this.blockGraphData = {
      data: [
        {
          type: 'scatter',
          mode: 'lines',
          name: '',
          x: Hdate,
          y: H29,
          text: H29,
          hovertemplate: 'cuckARoo29 : %{text:,} GH/s',
          line: { color: '#2a4bf7' },

        },

        {
          type: 'scatter',
          mode: 'lines',
          name: '',
          x: Hdate,
          y: H31,
          text: H31,
          hovertemplate: 'cuckAToo31 : %{text:,} GH/s',
          line: { color: '#3ff367' },

        },

      ],
      layout: {
        autosize: false,
        //width: 350,
        height: 250,
        xaxis: {
          showgrid: false,
          zeroline: false,
          tickformat: '%m-%d',
          fixedrange: true,
          rangemode: 'nonnegative'
        },

        yaxis: {
          showline: false,
          title: 'Estimated Hashrate (GH/s)',
          showgrid: true,
          fixedrange: true,
          rangemode: 'nonnegative',
        },

        margin: {
          l: 50,
          r: 2,
          b: 50,
          t: 50,
        },

        showlegend: false,
      },

      options: null,
    };
  }
  totaldifficultyChartFunc(DifficultychartDate, data, type, range1, range2, range3, tickformat) {

    let dtickval;
    if (tickformat == "%H-%M") {
      dtickval = ''
    }else if (DifficultychartDate.length < 22712){
      dtickval = 2 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 100000){
      dtickval = 6 * 24 * 60 * 60 * 1000
    }else if (DifficultychartDate.length < 200000){
      dtickval = 10 * 24 * 60 * 60 * 1000
    }else {
      tickformat = "%b %Y";
      dtickval = 4 * 30 * 24 * 60 * 60 * 1000
    }

    let window_width = window.screen.width;
    let position = 0.00;
    let angle = 0;
    let domain_start = 0;
    let left_margin = 5;
    let tick_size = 11;
    let right_margin = 10;
    if (window_width > 700) {
      position = 0.11;
      angle = 0;
      domain_start = 0.18;
      left_margin = 5;
      tick_size = 12;
      right_margin = 10;
    }
    else {
      position = 0.17;
      angle = -45;
      domain_start = 0.34;
      left_margin = 5;
      tick_size = 10;
      right_margin = 20;
    }
    this.linearTotalGraphData = {
      data: data,
      layout: {
        // hovermode: 'closest',
        height: 250,
        autosize: true,
        showlegend: true,
        legend: {
          "orientation": "h",
          x: 0.1, y: -0.5, font: { 'size': 10 }
        },

        xaxis: {
          tickangle: -40,
          tickformat: tickformat,
          tick0: DifficultychartDate[0],
          dtick: dtickval,
          // fixedrange: true,
          domain: [domain_start, 0.9]
          // showgrid: true
        },

        yaxis: {
          title: 'Cuckoo',
          fixedrange: true,
          rangemode: 'nonnegative',
          // position: 0.33,
          range: range1,
          ticks: 'outside',
          tickangle: angle,
          tickfont: {
            size: 12
          }
        },

        yaxis2: {
          title: 'ProgPoW',
          fixedrange: true,
          // showgrid: true,
          range: range3,
          // overlaying: 'y',
          overlaying: 'y',
          rangemode: 'nonnegative',
          // side: 'right',
          position: position,
          tickangle: angle,
          tickfont: {
            size: tick_size
          }
        },

        yaxis3: {
          title: 'RandomX',
          fixedrange: true,
          // showgrid: true,
          range: range2,
          ticks: 'outside',
          rangemode: 'nonnegative',
          anchor: 'x',
          overlaying: 'y',
          side: 'right',
          position: 0.00,
          tickangle: angle,
          tickfont: {
            size: 12
          }

        },

        margin: {
          l: left_margin,
          r: right_margin,
          b: 50,
          t: 50,
        },

      },

    };
  }
}
