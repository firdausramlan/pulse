Meteor.publish('heart_rate', function(){

  check(arguments,  [Match.Any]);

  var criteria = {};
  var projection = {
    sort: {
      dt: -1
    },
    limit: 15
  };

  return HeartRate.find(criteria,  projection);

});