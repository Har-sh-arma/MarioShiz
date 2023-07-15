let flag = true;
let pc = null;

var dc = null, dcInterval = null;
let accelerometer = null;



const negotiate = ()=>{
    return pc.createOffer().then((o)=>{
        console.log(`Created Offer : ${o}`);
        pc.setLocalDescription(o);
    },(err)=>{
        console.error(`Error [Set Local Desc]:${err}`);
    }).then(()=>{
        return new Promise((resolve, reject) => {
            if (pc.iceGatheringState === 'complete') {
                resolve("Ice Gathering Complete")
            }
            else{
                checkState = ()=>{
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState)
                        resolve('Ice Gathering Complete !!!')
                    }
                    else{
                        console.log("Gathering Candidates ...");
                    }     
                }
                pc.addEventListener('icegatheringstatechange', checkState)
            }
        })
    }).then(()=>{
        let offer = pc.localDescription;
        return axios.post('/offer', {sdp:offer.sdp, type:offer.type, video_transform :'none'}, {baseURL: "http://192.168.0.103:8000"})
    }).then((res)=>{
        pc.setRemoteDescription(res.data)
        console.log(pc.remoteDescription);
    })
}

const start = ()=>{
    pc = new RTCPeerConnection();

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
              }, 0);
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
      
    navigator.mediaDevices.getUserMedia({video:true, audio:false}).then(
        (stream)=>{
            stream.getTracks().forEach(
                (track)=>{
                    pc.addTrack(track, stream); 
                }
            );
            return negotiate();
        },(err)=>{
            console.error(`Error getting UserMedia: ${err}`)
        }
    )
}


start()