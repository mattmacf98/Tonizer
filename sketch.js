var mic, fft;

var notes = ['C0','C#0','D0','D#0','E0','F0','F#0','G0','G#0','A0','A#0','B0',
            'C1','C#1','D1','D#1','E1','F1','F#1','G1','G#1','A1','A#1','B1',
            'C2','C#2','D2','D#2','E2','F2','F#2','G2','G#2','A2','A#2','B2',
            'C3','C#3','D3','D#3','E3','F3','F#3','G3','G#3','A3','A#3','B3',
            'C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4',
            'C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5','A5','A#5','B5',
            'C6','C#6','D6','D#6','E6','F6','F#6','G6','G#6','A6','A#6','B6',
            'C7','C#7','D7','D#7','E7','F7','F#7','G7','G#7','A7','A#7','B7',
            'C8','C#8','D8','D#8','E8','F8','F#8','G8','G#8','A8','A#8','B8']
var frequencies = [16.35, 17.32, 18.35, 19.45, 20.60, 21.83, 23.12, 24.50, 25.96, 27.50, 29.14, 30.87,
                   32.70, 34.65, 36.71, 38.89, 41.20, 43.65, 46.25, 49.00, 51.91, 55.00, 58.27, 61.74,
                   65.41, 69.30, 73.42, 77.78, 82.41, 87.31, 92.50, 98.00, 103.83, 110.00, 116.54, 123.47,
                   130.81, 138.59, 146.83, 155.56, 164.81, 174.61, 185.00, 196.00, 207.65, 220.00, 233.08, 246.94,
                   261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88,
                   523.25, 554.37, 587.33, 622.25, 659.25, 698.46, 739.99, 783.99, 830.61, 880.00, 932.33, 987.77,
                   1046.50, 1108.73, 1174.66, 1244.51, 1318.51, 1396.91, 1479.98, 1567.98, 1661.22, 1760.00, 1864.66, 1975.53,
                   2093.00, 2217.46, 2349.32, 2489.02, 2637.02, 2793.83, 2959.96, 3134.96, 3322.44, 3520.00, 3728.31, 3951.07,
                   4186.01, 4434.92, 4698.63, 4978.03, 5274.04, 5587.65, 5919.91, 6271.93, 6644.88, 7040.00, 7458.62, 7902.13]

var note;
var current = 0;
var listening = true;
var lastChange = 0;
var noteInitiated = false;
var startnote = 0;
var observedNote = '';

function setup() {
  createCanvas(710,400);
   noFill();

   mic = new p5.AudioIn();
   mic.start();
   fft = new p5.FFT();
   fft.setInput(mic);
   
   document.body.onkeypress = function(e){
    if(e.key === " ") {
      listening = !listening;
    } else if (e.key == 'p') {
      play();
    } else if (e.key == 'b') {
      backspace();
    } else if (e.key == 'a') {
      current = current - 1;
      changeNoteChain();
    } else if (e.key == 'd') {
      current = current + 1;
      changeNoteChain();
    } else if (e.key == 'w') {
      changeKeySelected(true);
    } else if (e.key == 's') {
      changeKeySelected(false);
    } else if (e.key == 'c') {
      cutNote();
    }
  }
}

function draw() {
  background(200);

   var spectrum = fft.analyze();
   var freq = getLoudestFrequency(spectrum);
   if (freq != -1) {
    note = getNote(freq);
    document.getElementById("freq").innerHTML = "Frequency: " + freq + " hz ";
    document.getElementById("note").innerHTML = "Note: " + note;
    
    if (listening && noteInitiated  && note == observedNote) {
      if (new Date().getTime() -  startnote >750) {
        var noteChainText = document.getElementById("noteChain");
        noteChainText.innerHTML = noteChainText.innerHTML + " " + note;
        noteInitiated = false;
        observedNote = '';
        startnote = new Date().getTime();
      }

    } else if(note != "N/A") {
      noteInitiated = true;
      observedNote = note;
      startnote = new Date().getTime();
    }
   } else {
     note = "N/A";
     document.getElementById("freq").innerHTML = "Frequency:  NOT LOUD ENOUGH";
     document.getElementById("note").innerHTML = "Note: " + note;
     noteInitiated = false;
     observedNote = '';
     startnote = new Date().getTime();
   }
   


   beginShape();
   for (i = 0; i<spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 255, height, 0) );
   }
   endShape();
}

function getLoudestFrequency(spectrum) {
  var nyquist = sampleRate() / 2; // 22050
  var numberOfBins = spectrum.length;
  var maxAmp = 0;
  var largestBin;

  for (var i = 0; i < numberOfBins; i++) {
      var thisAmp = spectrum[i]; // amplitude of current bin
      if (thisAmp > maxAmp) {
          maxAmp = thisAmp;
          largestBin = i;
      }
  }

  var loudestFreq = largestBin * (nyquist / numberOfBins);
  if (maxAmp > 200) {
    return loudestFreq;
  } else {
    return -1;
  }
}

function getNote(freq) {
  var start = 0;
  var end = frequencies.length;
  while (end - start > 1) {
    var mid =  Math.floor((end + start)/2);
    
    if (freq >= frequencies[mid]) {
      start = mid;
    } else {
      end = mid;
    }
  }
  
  if (Math.abs(freq - frequencies[start]) < Math.abs(freq - frequencies[end])) {
    return notes[start];
  } else {
    return notes[end];
  }
}

function backspace() {
  var noteChainText = document.getElementById("noteChain");
  noteChainText.innerHTML = noteChainText.innerHTML.substring(0,noteChainText.innerHTML.lastIndexOf(" "));
}

function play() {
  //create a synth and connect it to the master output (your speakers)
 
  var synth = new Tone.Synth().toMaster();
 
  var noteChainText = document.getElementById("noteChain");
  var noteArray = noteChainText.innerHTML.replace("<strong>","").replace("</strong>","").split(" ");
  
  synth.triggerAttackRelease(noteArray[current],"16n");
  current = (current + 1);
  changeNoteChain();
}

function changeNoteChain() {
  var noteChainText = document.getElementById("noteChain");
  var noteArray = noteChainText.innerHTML.replace("<strong>","").replace("</strong>","").split(" ");
  
  if (current == -1) {
    current = noteArray.length - 1;
  }
  current = (current) % noteArray.length;
  var newText="";
  for (var i = 0; i < noteArray.length; i++) {
    if (current == (i+1)%noteArray.length){
      newText = newText + "<strong>" + noteArray[i] + "</strong> ";
    } else {
      newText = newText+noteArray[i]+" ";
    }
  }
  noteChainText.innerHTML = newText.trim();
}

function cutNote() {
  var noteChainText = document.getElementById("noteChain");
  var noteArray = noteChainText.innerHTML.replace("<strong>","").replace("</strong>","").split(" ");

  var newText="";
  
  for (var i = 0; i < noteArray.length; i++) {
    if (current == (i+1)%noteArray.length){
       //don't print it
    }  else if (current - 1 == (i+1)%noteArray.length) {
      newText = newText + "<strong>" + noteArray[i] + "</strong> "
    } else {
      newText = newText+noteArray[i]+" ";
    }
  }
  noteChainText.innerHTML = newText.trim();
}

function changeKeySelected(increase) {
  var shift = -1;
  if (increase) {
    shift = 1;
  }
  var noteChainText = document.getElementById("noteChain");
  var noteArray = noteChainText.innerHTML.replace("<strong>","").replace("</strong>","").split(" ");

  var newText="";
  var cur = current - 1;
  if (cur < 0) {
    cur = noteArray.length -1;
  }

  var indexOfCurrentNote = notes.indexOf(noteArray[cur]);
  noteArray[cur] = notes[indexOfCurrentNote + shift];
  for (var i = 0; i < noteArray.length; i++) {
    if (current == (i+1)%noteArray.length){
      newText = newText + "<strong>" + noteArray[i] + "</strong> ";
    } else {
      newText = newText+noteArray[i]+" ";
    }
  }
  noteChainText.innerHTML = newText.trim();

}


