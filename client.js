let flag = true;
let pc = null;

var dc = null, dcInterval = null;
let accelerometer = null;
let message = ""
let selected_cam = null;
let currentStream;

const negotiate = () => {
    return pc.createOffer().then((o) => {
        console.log(`Created Offer : ${o}`);
        pc.setLocalDescription(o);
    }, (err) => {
        console.error(`Error [Set Local Desc]:${err}`);
    }).then(() => {
        return new Promise((resolve, reject) => {
            if (pc.iceGatheringState === 'complete') {
                resolve("Ice Gathering Complete")
            }
            else {
                checkState = () => {
                    if (pc.iceGatheringState === 'complete') {
                        pc.removeEventListener('icegatheringstatechange', checkState)
                        resolve('Ice Gathering Complete !!!')
                    }
                    else {
                        console.log("Gathering Candidates ...");
                    }
                }
                pc.addEventListener('icegatheringstatechange', checkState)
            }
        })
    }).then(() => {
        let offer = pc.localDescription;
        return axios.post('/offer', { sdp: offer.sdp, type: offer.type, video_transform: 'none' })
    }).then((res) => {
        pc.setRemoteDescription(res.data)
        console.log(pc.remoteDescription);
    })
}

const start = () => {
    pc = new RTCPeerConnection();

    try {
        // accelerometer = new Accelerometer({ referenceFrame: "device" });
        accelerometer = new LinearAccelerationSensor({ frequency: 60 });
        accelerometer.addEventListener("error", (event) => {
            // Handle runtime errors.
            if (event.error.name === "NotAllowedError") {
                // Branch to code for requesting permission.
            } else if (event.error.name === "NotReadableError") {
                console.log("Cannot connect to the sensor.");
            }
        });
        dc = pc.createDataChannel('chat');
        dc.onclose = function () {
            clearInterval(dcInterval);
        };
        dc.onopen = function () {
            dcInterval = setInterval(function () {
                dc.send(message);
            }, 50);
        };
        accelerometer.addEventListener("reading", () => {
            message = `${accelerometer.x.toFixed(2)} ${accelerometer.y.toFixed(2)} ${accelerometer.z.toFixed(2)}`
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
    if (typeof currentStream !== 'undefined') {
        stopMediaTracks(currentStream);
      }

    navigator.mediaDevices.getUserMedia({ video: {deviceId:selected_cam}, audio: false}).then(
        (stream) => {
            stream.getTracks().forEach(
                (track) => {
                    pc.addTrack(track, stream);
                }
            );
            return negotiate();
        }, (err) => {
            console.error(`Error getting UserMedia: ${err}`)
        }
    )
}


function stopMediaTracks(stream) {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  }
  


let video = document.getElementsByTagName("video")[0]
let camopt = document.getElementById("camoptions")
navigator.mediaDevices.enumerateDevices().then((mediaDevices)=>{
    mediaDevices.forEach((mediaDevice)=>{
        if(mediaDevice.kind === "videoinput"){
            let but = document.createElement("button");
            but.innerText = mediaDevice.deviceId;
            but.onclick = (event)=>{
                if (typeof currentStream !== 'undefined') {
                    stopMediaTracks(currentStream);
                  }
                selected_cam = event.target.innerText;
                console.log(selected_cam);
                navigator.mediaDevices.getUserMedia({ video: {"deviceId":selected_cam}, audio:false}).then(
                    (stream) =>{
                        currentStream = stream
                        video.srcObject = stream
                        console.log("Src object set");
                  }).catch((err)=>{console.log(err);})
            }
            camopt.appendChild(but)
        }
    })
});


