let accelerometer = null;
try {
  accelerometer = new Accelerometer({ referenceFrame: "device" });
  accelerometer.addEventListener("error", (event) => {
    // Handle runtime errors.
    if (event.error.name === "NotAllowedError") {
      // Branch to code for requesting permission.
    } else if (event.error.name === "NotReadableError") {
      console.log("Cannot connect to the sensor.");
    }
  });
  accelerometer.addEventListener("reading", () => {
    dc = pc.createDataChannel('chat', parameters);
    dc.onclose = function() {
        clearInterval(dcInterval);
    };
    dc.onopen = function() {
        dcInterval = setInterval(function() {
            var message = `x: ${accelerometer.x} ||  y: ${accelerometer.y} ||  z: ${accelerometer.z}</p>`
            dc.send(message);
        }, 1000);
    };
    // document.getElementById("acc").innerHTML = `<p>x: ${accelerometer.x}</p><p>y: ${accelerometer.y}</p><p>z: ${accelerometer.z}</p>`
});
  accelerometer.start();
} catch (error) {
  // Handle construction errors.
  if (error.name === "SecurityError") {
    // See the note above about permissions policy.
    console.log("Sensor construction was blocked by a permissions policy.");
  } else if (error.name === "ReferenceError") {
    console.log("Sensor is not supported by the User Agent.");
  } else {
    throw error;
  }
}
