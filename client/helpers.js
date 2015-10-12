Template.registerHelper('is_cordova', function(){

  return Meteor.isCordova;

});

Template.registerHelper('msg', function(){

  return Session.get('msg');

});