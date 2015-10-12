function scanSensor(){

  Session.set('device_found', []);
  Session.set('msg', 'Scanning..');

  async.auto(
    {

      isScanning: function(cb){

        bluetoothle.isScanning(function(obj){

          cb(false, obj.isScanning);

        });

      },

      stopScan: ['isScanning', function(cb, results){

        if(results.isScanning){

          bluetoothle.stopScan(
            function(obj){
              cb(false, obj.status == "scanStopped")
            },
            function(obj){
              cb(obj);
            }
          );

        }
        else {
          cb(false);
        }

      }]

    },
    function(err, results){

      bluetoothle.startScan(
        function(obj){

          console.log('Start scan..',obj)

          if (obj.status == "scanResult")
          {

            var device_found = Session.get('device_found');

            if(!_.findWhere(device_found, {address: obj.address})){
              device_found.push(obj)
            }

            Session.set('device_found', device_found);

          }
          else if (obj.status == "scanStarted")
          {
            Session.set('msg', 'Scan Started');

            Meteor.setTimeout(function(){
              bluetoothle.stopScan();
              Session.set('msg', 'Scan Stopped');
            }, 15000)

          }
          else
          {
            Session.set('msg', 'Unexpected Start Scan Status');
          }

        },
        function(obj){

          Session.set('msg', 'Scan error');

        },
        {
          serviceUuids: [
            //"180D", // heart rate service
            //"180F"  // battery service
          ],
          allowDuplicates: false
        }
      );

    }
  )

}

function startMonitor(paramsObj){

  async.auto(
    {
      'service': function(cb){

        bluetoothle.services(
          function(obj){

            if (obj.status == "services")
            {
              cb(false);
            }
            else
            {
              cb("Unexpected Services Status");
            }
          },
          function(obj){
            cb("Services Error : " + JSON.stringify(obj));
          },
          _.extend(paramsObj, {
            serviceUuids:[]
          })
        );

      },

      characteristics: ['service', function(cb, results){

        bluetoothle.characteristics(
          function(obj){

            if (obj.status == "characteristics")
            {
              cb(false);
            }
            else
            {
              cb("Unexpected Characteristics Status");
            }
          },
          function(obj){
            cb("Characteristics Error : " + JSON.stringify(obj));
          },
          _.extend(paramsObj, {
            serviceUuid: '180d',
            characteristicUuids:[]
          })
        );

      }]

    }
    ,
    function(err, results){

      if(err){
        Session.set('msg', err);
        return;
      }

      bluetoothle.subscribe(
        function(obj){

          if (obj.status == "subscribedResult")
          {

            var bytes = bluetoothle.encodedStringToBytes(obj.value);
            if (bytes.length === 0)
            {
              return;
            }

            var flag = bytes[0];
            var offset = 1;
            if ((flag & 0x01) == 1)
            {

            }
            else {
              var u8bytesHr = bytes.buffer.slice(offset, offset + 1);
              var u8Hr = new Uint8Array(u8bytesHr)[0];
              console.log('u8Hr: ', u8Hr);
              HeartRate.insert({
                rate: u8Hr,
                dt: new Date()
              });
            }

          }
          else if (obj.status == "subscribed")
          {
            Session.set('msg', "Subscribed");
          }
          else
          {
            Session.set('msg', "Unexpected Subscribe Status");
          }
        },
        function(obj){
          Session.set('msg', "Subscribe Error : " + JSON.stringify(obj));
        },
        _.extend(paramsObj, {
          serviceUuid: "180d",
          characteristicUuid: "2a37"
        })
      );

    }
  )

}

if(Meteor.isCordova){

  Template.settings.helpers({

    device_found: function(){

      return Session.get('device_found');

    },

    device_connected: function(){

      return Session.get('device_connected');

    }

  });

  Template.settings.events({

    'click [xaction=scanSensor]': function(tpl, e){

      scanSensor();

    },

    'click [xaction=connect]': function(){

      var paramsObj = {
        address: this.address
      };

      Session.set('msg', "Connect : " + JSON.stringify(paramsObj));

      bluetoothle.connect(
        function(obj){
          Session.set('msg', "Connect Success : " + JSON.stringify(obj));

          if(obj.status == "connected")
          {
            Session.set('msg', "Connected");
            Session.set('device_connected', obj);
          }
          else if (obj.status == "connecting")
          {
            Session.set('msg', "Connecting");
          }
          else
          {
            Session.set('msg', "Unexpected Connect Status");
          }
        },
        function(obj){
          Session.set('msg', "Connect Error : " + JSON.stringify(obj));
        },
        paramsObj
      );

    },

    'click [xaction=disconnect]': function(){

      var paramsObj = {
        address: this.address
      };

      Session.set('msg', "Disconnect : " + JSON.stringify(paramsObj));

      bluetoothle.disconnect(
        function(obj){
          Session.set('msg', "Disconnect Success : " + JSON.stringify(obj));

          if (obj.status == "disconnected")
          {
            Session.set('msg', "Disconnected");
          }
          else if (obj.status == "disconnecting")
          {
            Session.set('msg', "Disconnecting");
          }
          else
          {
            Session.set('msg', "Unexpected Disconnect Status");
          }
        },
        function(obj){
          Session.set('msg', "Disconnect Error : " + JSON.stringify(obj));
        },
        paramsObj
      );

      return false;

    },

    'click [xaction=reconnect]': function(){

      var paramsObj = {
        address: this.address
      };

      Session.set('msg', "Reconnect : " + JSON.stringify(paramsObj));

      bluetoothle.reconnect(
        function(obj){
          Session.set('msg', "Reconnect Success : " + JSON.stringify(obj));

          if (obj.status == "connected")
          {
            Session.set('msg', "Connected");
          }
          else if (obj.status == "connecting")
          {
            Session.set('msg', "Connecting");
          }
          else
          {
            Session.set('msg', "Unexpected Reconnect Status");
          }
        },
        function(obj){
          Session.set('msg', "Reconnect Error : " + JSON.stringify(obj));
        },
        paramsObj
      );

      return false;

    },

    'click [xaction=close]': function(){

      var paramsObj = {
        address: this.address
      };

      Session.set('msg', "Close : " + JSON.stringify(paramsObj));

      bluetoothle.close(
        function(obj){
          Session.set('msg', "Close Success : " + JSON.stringify(obj));

          if (obj.status == "closed")
          {
            Session.set('msg', "Closed");
          }
          else
          {
            Session.set('msg', "Unexpected Close Status");
          }
        },
        function(obj){
          Session.set('msg', "Close Error : " + JSON.stringify(obj));
        },
        paramsObj
      );

      return false;

    },

    'click [xaction=startMonitor]': function(){

      var paramsObj = {
        address: this.address
      };

      startMonitor(paramsObj);

    },

    'click [xaction=stopMonitor]': function(){

      var paramsObj = {
        address: this.address,
        serviceUuid: "180d",
        characteristicUuid: "2a37"
      };

      Session.set('msg', "Unsubscribe");

      bluetoothle.unsubscribe(
        function(obj){

          if (obj.status == "unsubscribed")
          {
            Session.set('msg', "Unsubscribed");
          }
          else
          {
            Session.set('msg', "Unexpected Unsubscribe Status");
          }
        },
        function(obj){
          Session.set('msg', "Unsubscribe Error : " + JSON.stringify(obj));
        },
        paramsObj
      );

      return false;

    }

  });

}

Template.action_dd.onRendered(function(){

  $('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false, // Does not change width of dropdown to that of the activator
      hover: false, // Activate on hover
      gutter: 0, // Spacing from edge
      belowOrigin: false, // Displays dropdown below the button
      alignment: 'left' // Displays dropdown with edge aligned to the left of button
    }
  );

});