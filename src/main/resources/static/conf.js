$(document).ready(function() {
    var peerConnection;

    // Setup 'leaveButton' button function.
    $('#leaveButton').on('click', function() {
        console.log('Ending call');
        peerConnection.close();
        signalingWebsocket.close();
    });


    var signalingWebsocket = new WebSocket("ws://" + window.location.host + "/signal");
    signalingWebsocket.onmessage = function(msg) {
        console.log("Got message", msg.data);
        var signal = JSON.parse(msg.data);
        switch (signal.type) {
            case "offer":
                handleOffer(signal);
                break;
            case "answer":
                handleAnswer(signal);
                break;
            // In local network, ICE candidates might not be generated.
            case "candidate":
                handleCandidate(signal);
                break;
            default:
                break;
        }
    };

    signalingWebsocket.onopen = init;

    function sendSignal(signal) {
        if (signalingWebsocket.readyState == 1) {
            signalingWebsocket.send(JSON.stringify(signal));
        }
    }

    // Initialize
    function init() {
        console.log("Connected to signaling endpoint. Now initializing.");
        preparePeerConnection();
        displayLocalStreamAndSignal(true);
    }

    // Prepare RTCPeerConnection & setup event handlers.
    function preparePeerConnection() {
        // Using free public google STUN server.
        const configuration = {
            iceServers: [{
                urls: 'stun:stun.l.google.com:19302'
            }]
        };

        // Prepare peer connection object
        peerConnection = new RTCPeerConnection(configuration);
        peerConnection.onnegotiationneeded = async () => {
            console.log('onnegotiationneeded');
            sendOfferSignal();
        };
        peerConnection.onicecandidate = function(event) {
            if (event.candidate) {
                sendSignal(event);
            }
        };

        // Track other participant's remote stream & display in UI when available.
        peerConnection.addEventListener('track', displayRemoteStream);
    }

    // Display my local webcam & audio on UI.
    async function displayLocalStreamAndSignal(firstTime) {
        console.log('Requesting local stream');
        const localVideo = $('#localVideo')[0];
        let localStream;
        try {
            // Capture local video & audio stream & set to local <video> DOM element
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            console.log('Received local stream');
            localVideo.srcObject = stream;
            localStream = stream;
            logVideoAudioTrackInfo(localStream);

            // For first time, add local stream to peer connection.
            if (firstTime) {
                setTimeout(
                    function() {
                        addLocalStreamToPeerConnection(localStream);
                    }, 2000);
            }

            // Send offer signal to signaling server endpoint.
            sendOfferSignal();

        } catch (e) {
            alert(`getUserMedia() error: ${e.name}`);
            throw e;
        }
        console.log('Start complete');
    }

    // Add local webcam & audio stream to peer connection so that other participant's UI will be notified using 'track' event.
    async function addLocalStreamToPeerConnection(localStream) {
        console.log('Starting addLocalStreamToPeerConnection');
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
        console.log('localStream tracks added');
    }

    // Display remote webcam & audio in UI.
    function displayRemoteStream(e) {
        console.log('displayRemoteStream');
        const remoteVideo = $('#remoteVideo')[0];
        if (remoteVideo.srcObject !== e.streams[0]) {
            remoteVideo.srcObject = e.streams[0];
            console.log('pc2 received remote stream');
        }
    }

    // Send offer to signaling server.
    function sendOfferSignal() {
        peerConnection.createOffer(function(offer) {
            sendSignal(offer);
            peerConnection.setLocalDescription(offer);
        }, function(error) {
            alert("Error creating an offer");
        });
    }

    // Handle the offer sent by other participant & send back answer to complete the handshake.
    function handleOffer(offer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        // create and send an answer to an offer
        peerConnection.createAnswer(function(answer) {
            peerConnection.setLocalDescription(answer);
            sendSignal(answer);
        }, function(error) {
            alert("Error creating an answer");
        });
    }

    // Finish the handshake by receiving the answer. Now Peer-to-peer connection is established between my browser & other participant's browser.
    function handleAnswer(answer) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("connection established successfully!!");
    }

    // Add received ICE candidate to connection.
    function handleCandidate(candidate) {
        alert("handleCandidate");
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    // Logs names of your webcam & microphone to console.
    function logVideoAudioTrackInfo(localStream) {
        const videoTracks = localStream.getVideoTracks();
        const audioTracks = localStream.getAudioTracks();
        if (videoTracks.length > 0) {
            console.log(`Using video device: ${videoTracks[0].label}`);
        }
        if (audioTracks.length > 0) {
            console.log(`Using audio device: ${audioTracks[0].label}`);
        }
    }
});