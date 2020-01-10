$(document).ready(function() {

    // Older browsers might not implement mediaDevices at all, so we set an empty object first
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    $("#start").on("click",function () {startRecording();});
    $("#stop").on("click",function () {stopRecording();});

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.sampleRate = 44100;
    const biquadFilter = audioCtx.createBiquadFilter();
    biquadFilter.type = "lowshelf";
    const analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;
    analyser.fftSize = 256;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);

    function stopRecording() {
     audioCtx.suspend();
    }

    function startRecording(){
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia (
                // constraints - only audio needed for this app
                {
                    audio: true
                })

            // Success callback
                .then(function(stream) {
                    console.log("Success");
                    audioCtx.resume().then(()=> {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        // microphone.connect(analyser);
                        microphone.connect(biquadFilter);
                        biquadFilter.connect(analyser);
                        // analyser.connect(audioCtx.destination);
                        v();
                    });
                })

                // Error callback
                .catch(function(err) {
                        console.log('The following getUserMedia error occured: ' + err);
                    }
                );
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    const notes = {
        11:"C", 22:"C",44:"C", 45:"C", 78:"C", 112:"C",
        23:"C#", 46:"C#", 47:"C#", 48:"C#", 83:"C#", 119:"C#",
        12:"D", 73:"D", 24:"D", 49:"D", 50:"D", 51:"D", 74:"D", 75:"D",
        26:"D#", 25:"D#", 53:"D#", 54:"D#",
        13:"E",27:"E", 28:"E", 55:"E", 56:"E",
        14:"F",29:"F", 30:"F", 58:"F",59:"F", 60:"F", 61:"F",
        15:"F#",31:"F#", 32:"F#", 62:"F#", 63 :"F#", 141:"F#",
        16:"G", 33:"G",66:"G",  67:"G", 92:"G",
        17:"G#", 34:"G#",35:"G#", 36:"G#", 69:"G#",68:"G#", 101:"G#",
        9:"A", 18:"A", 19:"A", 37:"A", 38:"A", 70:"A", 71:"A", 85:"A", 94:"A",
        10:"A#", 20:"A#",39:"A#", 40:"A#", 72:"A#",79:"A#",80:"A#",89:"A#",90:"A#", 100:"A#", 131:"A#",132:"A#",
        21:"B",41:"B",  42:"B", 43:"B", 84:"B", 106:"B"
    };

function v(){
    const HEIGHT = 100;
    const WIDTH = 300;
    analyser.fftSize = 4096;
    bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);
    const fDataArray = new Float32Array(bufferLength);

    const canvas = document.getElementById('canvas');
    const canvasCtx = canvas.getContext('2d');
    console.log(canvasCtx);
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    let drawVisual;
    const draw1 = function() {

        drawVisual = requestAnimationFrame(draw1);
        analyser.getByteFrequencyData(dataArray);
        analyser.getFloatFrequencyData(fDataArray);
        // console.log(getMax(fDataArray));
        // console.log(getMax(dataArray));
        console.log("freq " + getIndexOfMax(fDataArray));
        console.log("freq " + getIndexOfMax(dataArray));
        let f = getIndexOfMax(fDataArray);
        console.log(notes[f]);
        $("#note").text(notes[f]);
        canvasCtx.fillStyle = 'rgb(0, 0, 0)';
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        let barWidth = (WIDTH / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (var i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i];

            canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
            canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

            x += barWidth + 1;
        }
    };
    draw1();
}

// IDEA: Get the first 3-5 spikes and return the lowest one

    function getMax(data) {
        return data.reduce((max, p) => p > max ? p : max, data[0]);
    }

    function getIndexOfMax(data){
        let max, smax, k1=0, k2=0;
        max = data[0] > data[1] ? data[0] : data[1];
        smax = data[0] > data[1] ? data[1] : data[0];
        for (let i = 2; i < data.length; i++){
            let val = data[i];
            if(val>max){
                const tmp = max;
                max = val;
                smax = tmp;
                k2 = k1;
                k1 = i;

            }
            else if (val > smax){
                smax = val;
                k2 = i;
            }
        }

        return k1 > k2 ? k2 : k1;
    }

    function enumerateDevices(){
        navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                devices.forEach(function(device) {
                    console.log(device.kind + ": " + device.label +
                        " id = " + device.deviceId);
                });
            })
            .catch(function(err) {
                console.log(err.name + ": " + err.message);
            });
    }

});
