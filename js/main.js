$(document).ready(function () {

    function getSong() {
        // let notes = "c c d c f e c c d c g f c c c a f e d b b a f g f";
        let notes = "C4 C4 D4 C4 F4 E4 C4 C4 D4 C4 G4 F4 C4 C4 C5 A4 F4 E4 D4 B4 B4 A4 F4 G4 F4";
        // notes = notes.toUpperCase();
        let newNotes = [];
        let prev = {"A": "G", "B": "A", "C": "B", "D": "C", "E": "D", "F": "E", "G": "F",};
        // let flats = "a b d e";
        let flats = "b";
        flats = flats.toUpperCase();
        flats = flats.split(" ");
        notes = notes.split(" ");
        console.log(flats);
        console.log(notes);
        for (let note of notes) {
            console.log(note);
            if (flats.includes(note[0])) {
                note = prev[note[0]] + "#" + note[1];
            }
            newNotes.push(note);
        }
        console.log(notes);
        console.log(newNotes);
        return newNotes;
    }

    let running = false;
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

    $("#start").on("click", function () {
        startRecording();
    });
    $("#stop").on("click", function () {
        stopRecording();
    });

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.sampleRate = 44100;
    // const biquadFilter = audioCtx.createBiquadFilter();
    // biquadFilter.type = "lowshelf";
    const analyser = audioCtx.createAnalyser();

    analyser.smoothingTimeConstant = 0.9;
    let bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    let dataArray = new Uint8Array(bufferLength);
    let frequencies = {};
    let notes = {};
    analyser.fftSize = 4096;
    const bandSize = audioCtx.sampleRate / analyser.fftSize;


    function mapFrequencies(notes, frequencies) {
        const a = Math.pow(2, 1 / 12);
        const note_names = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];
        frequencies[57] = 440;
        notes[440] = "A4";
        let k = 58;
        let note = 1;
        for (let i = 4; i < 9;) {
            frequencies[k] = frequencies[k - 1] * a;
            notes[frequencies[k]] = note_names[note] + i.toString();
            k++;
            note++;
            if (note === 3)
                i++;
            if (note === 12)
                note = 0;
        }
        k = 56;
        note = 11;
        for (let i = 4; i >= 0;) {
            frequencies[k] = frequencies[k + 1] / a;
            notes[frequencies[k]] = note_names[note] + i.toString();
            k--;
            note--;
            if (note === 2)
                i--;
            if (note < 0)
                note = 11;
        }

        console.log(notes);
        console.log(frequencies);
    }

    // Audio Buffer - to access the raw PCM data (in case we need it)
    // let myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate, audioCtx.sampleRate);

    function stopRecording() {
        audioCtx.suspend().then(() => {
            running = false;
        })

    }

    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices.getUserMedia(
                // constraints - only audio needed for this app
                {audio: true})
                // Success callback
                .then(function (stream) {
                    console.log("Success");
                    running = true;
                    mapFrequencies(notes, frequencies);
                    audioCtx.resume().then(() => {
                        const microphone = audioCtx.createMediaStreamSource(stream);
                        microphone.connect(analyser);
                        // microphone.connect(biquadFilter);
                        // biquadFilter.connect(analyser);
                        // analyser.connect(audioCtx.destination);
                        start();
                    });
                })
                // Error callback
                .catch(function (err) {
                    console.log('The following getUserMedia error occurred: ' + err);
                });
        } else {
            console.log('getUserMedia not supported on your browser!');
        }
    }

    function binarySearch(frequencies, min, max) {
        var size = Object.keys(frequencies).length;
        let start = 0, end = size - 1;
        while (start <= end) {
            let mid = Math.floor((start + end) / 2);
            let elem = frequencies[mid];
            if (elem >= min && elem <= max)
                return elem;
            else if (elem < min) {
                start = mid + 1;
            } else {
                end = mid - 1;
            }
        }
        return "idk";
    }

    function zcr(signal) {
        let sum = 0;
        for (let i = 0; i < signal.length; i++) {
            sum += parseInt(signal[i], 10); //don't forget to add the base
        }

        let avg = sum / signal.length;
        console.log("AVG = ", avg);
        let zcr = 0;
        // should be mean value, not 0
        let zero = avg;
        for (let i = 1; i < signal.length; i++) {
            if ((signal[i - 1] >= zero && signal[i] < zero) ||
                (signal[i - 1] < zero && signal[i] >= zero)) {
                zcr++;
            }
        }

        return zcr;

    }

    function energy(signal) {
        let energy = 0;
        for (let i = 0; i < signal.length; i++) {
            energy += Math.pow(Math.abs(signal[i]), 2);
        }

        return energy / 1000;
    }

    function start() {
        const HEIGHT = 100;
        const WIDTH = 300;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        const fDataArray = new Float32Array(bufferLength);

        const canvas = document.getElementById('canvas');
        const canvasCtx = canvas.getContext('2d');
        canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
        let len = 0;
        let note = "";

        let drawVisual;
        const frame = function () {
            if (running)
                drawVisual = requestAnimationFrame(frame);
            analyser.getByteFrequencyData(dataArray);
            analyser.getFloatFrequencyData(fDataArray);


            let z = zcr(fDataArray);
            console.log("ZCR = ", z);
            // let threshold = 100;
            // if (z>threshold)
            //     return;

            let e = energy(dataArray);
            console.log("ENERGY = ", e);
            if (e < 500)
                return;

            let indexOfMax = getIndexOfMax(fDataArray);
            let min = indexOfMax * bandSize;
            let max = min + bandSize;
            let frequency = binarySearch(frequencies, min, max);
            console.log("NEW FRAME");
            console.log(indexOfMax);
            console.log(bandSize);
            console.log(min);
            console.log(max);
            console.log(frequency);
            let crtNote = notes[frequency];
            console.log(crtNote);

            if (crtNote === note){
                len++;
                if (len>3){
                    // display the note
                    $("#note").text(crtNote);
                }
            }
            else {
                len = 1;
                note = crtNote;
            }

            // song finished
            if (crtNote === song[crt]) {
                crt_song.append(" " + crtNote);
                crt++;
                if (crt >= song.length) {
                    $("#congrats").css("visibility", "visible");
                    stopRecording();
                }
            }

            canvasCtx.fillStyle = 'rgb(255, 255, 255)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

            let barWidth = (WIDTH / bufferLength) * 4;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];

                // canvasCtx.fillStyle = 'rgb(0,0,' + (barHeight + 100) + ')';
                canvasCtx.fillStyle = 'rgb(15,31,35)';
                canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        };
        frame();
    }


    function getMax(data) {
        return data.reduce((max, p) => p > max ? p : max, data[0]);
    }

// Get the highest 2 spikes and return the lowest one
    function getIndexOfMax2(data) {
        let max, smax, k1 = 0, k2 = 0;
        max = data[0] > data[1] ? data[0] : data[1];
        smax = data[0] > data[1] ? data[1] : data[0];
        for (let i = 2; i < data.length; i++) {
            let val = data[i];
            if (val > max) {
                const tmp = max;
                max = val;
                smax = tmp;
                k2 = k1;
                k1 = i;

            } else if (val > smax) {
                smax = val;
                k2 = i;
            }
        }

        return k1 > k2 ? k2 : k1;
    }

    function getMaxAndIndex(data) {
        let max, k = 0;
        max = data[0] > data[1] ? data[0] : data[1];
        for (let i = 2; i < data.length; i++) {
            let val = data[i];
            if (val > max) {
                max = val;
                k = i;
            }
        }
        return{"index": k, "value": data[k]};
    }

    function getNMax(data, n) {
        let spikes = [];
        for (let i = 0; i < n; i++) {
            let res = getMaxAndIndex(data);
            let idx = res.index;
            data[idx] = -Infinity;
            console.log("res = ",res);
            // let max = res.value;
            spikes.push(idx);
        }
        console.log("getNMax: ", spikes);
        return spikes;
    }

    function getIndexOfMax(data) {
        let spikes = getNMax(data,4);
        spikes.sort();
        console.log("getIndexOfMax: ",spikes[0]);
        return spikes[0];
    }

    function enumerateDevices() {
        navigator.mediaDevices.enumerateDevices()
            .then(function (devices) {
                devices.forEach(function (device) {
                    console.log(device.kind + ": " + device.label +
                        " id = " + device.deviceId);
                });
            })
            .catch(function (err) {
                console.log(err.name + ": " + err.message);
            });
    }


});
