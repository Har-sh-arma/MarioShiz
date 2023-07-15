
let lc = null;
let dc;
let flag = 0
    
const start = ()=>{
    // dc = lc.createDataChannel("Channel");
    
    // dc.onopen=()=>{console.log("Connection Opened!!!~~~");}
    
    // dc.onmessage=(e)=>{
    //     document.getElementById("message").innerText = e.data;}
    
    
    lc.onicecandidate=()=>{
        // document.getElementById("sdp").innerText = JSON.stringify(lc.localDescription)
        if (flag === 0) {
            flag = 1
            
            let offr = lc.localDescription
            console.log(offr.sdp)
            offr.sdp = sdpFilterCodec('video', "default", offr.sdp);
            offr.video_transform = "none"
            console.log(offr.sdp)
            axios.post("/offer", JSON.stringify(offr)).then((res)=>{
                lc.setRemoteDescription(res.data)
            })}}
    
    lc.createOffer().then(
        o=>{lc.setLocalDescription(o)}).then(
            ()=>{console.log("Local desc set!!!")})
        }
    
window.navigator.mediaDevices.getUserMedia({video: true}).then((stream)=>{
    lc = new RTCPeerConnection();

    stream.getTracks().forEach(track => {
        console.log(track);
        lc.addTrack(track, stream)
        return start();
    })
}, (err)=>{console.log(`FAAAck :: ${err}`);})


function sdpFilterCodec(kind, codec, realSdp) {
    var allowed = []
    var rtxRegex = new RegExp('a=fmtp:(\\d+) apt=(\\d+)\r$');
    var codecRegex = new RegExp('a=rtpmap:([0-9]+) ' + escapeRegExp(codec))
    var videoRegex = new RegExp('(m=' + kind + ' .*?)( ([0-9]+))*\\s*$')
    
    var lines = realSdp.split('\n');

    var isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }

        if (isKind) {
            var match = lines[i].match(codecRegex);
            if (match) {
                allowed.push(parseInt(match[1]));
            }

            match = lines[i].match(rtxRegex);
            if (match && allowed.includes(parseInt(match[2]))) {
                allowed.push(parseInt(match[1]));
            }
        }
    }

    var skipRegex = 'a=(fmtp|rtcp-fb|rtpmap):([0-9]+)';
    var sdp = '';

    isKind = false;
    for (var i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('m=' + kind + ' ')) {
            isKind = true;
        } else if (lines[i].startsWith('m=')) {
            isKind = false;
        }

        if (isKind) {
            var skipMatch = lines[i].match(skipRegex);
            if (skipMatch && !allowed.includes(parseInt(skipMatch[2]))) {
                continue;
            } else if (lines[i].match(videoRegex)) {
                sdp += lines[i].replace(videoRegex, '$1 ' + allowed.join(' ')) + '\n';
            } else {
                sdp += lines[i] + '\n';
            }
        } else {
            sdp += lines[i] + '\n';
        }
    }

    return sdp;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
