let flag = true;
let pc = null;

var dc = null, dcInterval = null;


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
        return axios.post('/offer', {sdp:offer.sdp, type:offer.type, video_transform :'none'})
    }).then((res)=>{
        console.log(res.data.sdp);
        pc.setRemoteDescription(res.data)
        console.log(pc.remoteDescription);
    })
}

const start = ()=>{
    pc = new RTCPeerConnection();

    dc = pc.createDataChannel('chat', parameters);
        dc.onclose = function() {
            clearInterval(dcInterval);
            dataChannelLog.textContent += '- close\n';
        };
        dc.onopen = function() {
            dataChannelLog.textContent += '- open\n';
            dcInterval = setInterval(function() {
                var message = 'ping ' + current_stamp();
                dataChannelLog.textContent += '> ' + message + '\n';
                dc.send(message);
            }, 1000);
        };
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