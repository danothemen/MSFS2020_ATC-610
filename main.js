const {
  open,
  Protocol,
  SimConnectDataType,
  SimConnectPeriod,
  SimConnectConstants,
} = require("node-simconnect");

const POSITION_DATA = 1;
const REQUEST_ID_POSITION_DATA = 1;
const EVENT_ID_PAUSE = 1;

open("My app", Protocol.FSX_SP2)
  .then(function ({ recvOpen, handle }) {
    console.log("Connected to", recvOpen.applicationName);

    handle.addToDataDefinition(
      POSITION_DATA,
      "Airspeed Indicated",
      "mph",
      SimConnectDataType.FLOAT64,
      0.0,
      SimConnectConstants.UNUSED
    );
    handle.requestDataOnSimObject(
      REQUEST_ID_POSITION_DATA,
      POSITION_DATA,
      SimConnectConstants.OBJECT_ID_USER,
      SimConnectPeriod.VISUAL_FRAME,
      0,
      0,
      0,
      0
    );
    handle.subscribeToSystemEvent(EVENT_ID_PAUSE, "Pause");

    handle.on("event", function (recvEvent) {
      switch (recvEvent.eventID) {
        case EVENT_ID_PAUSE:
          console.log(recvEvent.data === 1 ? "Sim paused" : "Sim unpaused");
          break;
      }
    });

    handle.on("simObjectData", function (recvSimObjectData) {
      switch (recvSimObjectData.requestID) {
        case POSITION_DATA:
          console.log({
            indicated_airspeed: recvSimObjectData.data.readFloat64(),
          });
          break;
      }
    });
    handle.on("quit", function () {
      console.log("Quit");
    });
  })
  .catch(function (error) {
    console.log("Connection failed:", error);
  });
