BlazeLayout.setRoot('body');

if (Meteor.isCordova) {

  Session.setDefault('device_found', []);
  Session.setDefault('device_connected', null);

  Session.setDefault('msg', '');
  Session.setDefault('ble_initialized', false);

  Meteor.startup(function(){

    Session.set('msg', 'Initializing bluetooth');

    bluetoothle.initialize(
      function(obj){

        Session.set('ble_initialized', obj.status == "enabled");
        Session.set('msg', obj.status == "enabled" ? 'Bluetooth initialized' : 'Initialize error');

      },
      function(){

        Session.set('msg', 'Initialize error');

      },
      {
        request: true
      }
    )

  });

}