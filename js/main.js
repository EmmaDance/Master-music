$(document).ready(function() {
    // const fs = require('fs');
    // function readSong() {
    //     let notes = [];
    //     let prev = {"A":"G", "B":"A","C":"B","D":"C","E":"D","F":"E","G":"F",};
    //     fs.readFile('song.txt', 'utf-8', (err, data) => {
    //         if (err) throw err;
    //         const alterations = data[0].split(" ");
    //         notes = data[1].split(" ");
    //         for (let note of notes){
    //             if (note in alterations){
    //                 note = prev[note] + "#";
    //             }
    //         }
    //     });
    //     return notes;
    // }


    function getSong(){
        // let notes = "b c c c c c c c a a b c c c b c c b a a f";
        let notes = "c c d c f e c c d c g f c c c a f e d b b a f g f";
        notes=notes.toUpperCase();
        let newNotes=[];
        let prev = {"A":"G", "B":"A","C":"B","D":"C","E":"D","F":"E","G":"F",};
        // let flats = "a b d e";
        let flats = "b";
        flats = flats.toUpperCase();
        flats = flats.split(" ");
        notes = notes.split(" ");
        console.log(flats);
        console.log(notes);
        for (let note of notes){
            console.log(note);
            if (flats.includes(note)){
                note = prev[note] + "#";
            }
            newNotes.push(note);
        }
        console.log(notes);
        console.log(newNotes);
        return newNotes;
    }

    let running = false;

    // let song = readSong();
    let song = getSong();
    let init_song = $("#init-song");
    for (let note of song)
        init_song.append(note + " ");
    let crt = 0;

    let crt_song = $("#crt-song");

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
    analyser.maxDecibels = -20;
    analyser.smoothingTimeConstant = 0.89;
    analyser.fftSize = 256;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);

    function stopRecording() {
        audioCtx.suspend().then(()=>{
            running = false;
        })

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
                    running = true;
                    audioCtx.resume().then(()=> {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        // microphone.connect(biquadFilter);
                        // biquadFilter.connect(analyser);
                        // analyser.connect(audioCtx.destination);
                        v();
                    });
                })

                // Error callback
                .catch(function(err) {
                        console.log('The following getUserMedia error occurred: ' + err);
                    }
                );
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    const notes = {
        11:"C", 22:"C",43:"C", 44:"C", 45:"C", 78:"C", 112:"C", 202:"C", 248:"C",
        23:"C#", 46:"C#", 47:"C#", 48:"C#", 83:"C#",95:"C#", 119:"C#",
        12:"D", 87:"D",88:"D", 24:"D",25:"D", 49:"D", 50:"D", 51:"D",227:"D",240:"D",266:"D",
        26:"D#", 27:"D#", 52:"D#", 53:"D#", 93:"D#",106:"D#",
        13:"E", 28:"E", 54:"E", 55:"E", 56:"E",57:"E",99:"E", 199:"E", 84:"E",
        14:"F",29:"F", 30:"F", 58:"F",59:"F", 60:"F", 61:"F",149:"F",
        15:"F#",31:"F#", 32:"F#", 62:"F#",63:"F#", 64 :"F#", 141:"F#",
        16:"G", 33:"G",34:"G",65:"G",66:"G",  67:"G", 92:"G",117:"G", 185:"G", 203:"G", 255:"G",
        17:"G#", 35:"G#", 36:"G#", 69:"G#",68:"G#", 75:"G#",76:"G#", 101:"G#",142:"G#",
        9:"A", 18:"A", 19:"A", 37:"A", 38:"A", 70:"A", 71:"A", 85:"A", 94:"A",150:"A",317:"A",318:"A",
        10:"A#", 20:"A#",39:"A#", 40:"A#", 72:"A#",73:"A#",79:"A#",80:"A#",89:"A#",90:"A#", 131:"A#",132:"A#",
        21:"B", 41:"B", 42:"B",86:"B",115:"B", 116:"B", 125:"B",126:"B",136:"B",137:"B",252:"B",253:"B",
    };

    function v(){
        const HEIGHT = 100;
        const WIDTH = 300;
        analyser.fftSize = 4096;
        bufferLength = analyser.frequencyBinCount;
        // console.log(bufferLength);
        dataArray = new Uint8Array(bufferLength);
        const fDataArray = new Float32Array(bufferLength);

        const canvas = document.getElementById('canvas');
        const canvasCtx = canvas.getContext('2d');
        // console.log(canvasCtx);
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

        let drawVisual;
        const draw1 = function() {
            if (running)
                drawVisual = requestAnimationFrame(draw1);
            analyser.getByteFrequencyData(dataArray);
            analyser.getFloatFrequencyData(fDataArray);
            // console.log(getMax(fDataArray));
            // console.log(getMax(dataArray));
            // console.log("freq " + getIndexOfMax(dataArray));
            let f = getIndexOfMax(fDataArray);
            console.log("freq " + f);
            console.log(notes[f]);
            $("#note").text(notes[f]);

            if(notes[f]===song[crt]){
                crt_song.append(" " + notes[f]);
                crt++;
                if (crt >= song.length)
                    stopRecording();
            }


            canvasCtx.fillStyle = 'rgb(0, 0, 0)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',100,100)';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        };
        draw1();
    }


    function getMax(data) {
        return data.reduce((max, p) => p > max ? p : max, data[0]);
    }

// Get the highest 2 spikes and return the lowest one
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
