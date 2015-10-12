var chart;

Template.dashboard.helpers({

  heart_rate: function(){

    return HeartRate.findOne({},{sort: {dt: -1}})

  }

});

Template.dashboard.onCreated(function() {
  var self = this;

  self.autorun(function() {
    self.subscribe('heart_rate');
  });
});

Template.dashboard.onRendered(function(){

  var self = this;

  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'ch-chart',
      type: 'areaspline'
    },
    title: {
      text: ''
    },
    xAxis: {
      categories: [],
      min: 0.5,
      max: 15-1.5,
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0
    },
    yAxis: {
      title: {
        text: ''
      },
      labels: {
        enabled: false
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' bpm'
    },
    legend: {
      enabled: false
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.5,
        marker: {
          enabled: false
        }
      }
    },
    series: [{
      name: 'Heart rate',
      data: []
    }]
  });

  self.autorun(function(){

    var hrs = HeartRate.find({}, {sort: {dt: 1}}).fetch();

    var dt = _.pluck(hrs,  'dt');

    dt = _.map(dt, function(d){ return moment(d).format("H:mm:ss") });

    chart.xAxis[0].setCategories(dt);
    chart.series[0].setData(_.pluck(hrs,  'rate'));

  })

  //chart.update

})
