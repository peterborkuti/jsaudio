/* Requires jQuery */

$.ajaxSetup({ cache: true }); /* http://forum.jquery.com/topic/jquery-turn-off-cache-busting-in-getscript */
//$.getScript("/AudioContextMonkeyPatch.js");
//$.getScript("/recorder.js");
/* http://stackoverflow.com/questions/1130921/is-the-callback-on-jquerys-getscript-unreliable-or-am-i-doing-something-wrong */
$.ajax({url:"AudioContextMonkeyPatch.js",dataType:'script',async:false}); 
$.ajax({url:"recorder.js",dataType:'script',async:false});


var theStream, recorder, recording = 0, fftSize = 2048;
var audioContext; 
var buf = new Uint8Array( fftSize );
var colors = ['blue', 'blue',
    'green', 'green', 'green', 'green', 'green', 'green','green', 'red'];

function getUserMedia(dictionary, extraCallback) {
  try {
      audioContext = new AudioContext();
      if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia;
      error = function(){alert('Stream generation failed.')};
      navigator.getUserMedia(dictionary, function(stream){gotUserMediaStream(stream), extraCallback(stream)}, error);
  } catch (e) {
      console.log('getUserMedia threw exception :' + e);
  }
}

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);
    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

function gotUserMediaStream(stream) {
  theStream = stream;

  // Create an AudioNode from the stream.
  var mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // Connect recorder
  recorder = new Recorder(mediaStreamSource);

  // Connect it to the destination
  analyser = audioContext.createAnalyser();
  analyser.fftSize = fftSize;
  convertToMono( mediaStreamSource ).connect( analyser );

  redrawAnalysis();
}

function redrawAnalysis( time ) {
  analyser.getByteTimeDomainData( buf );
  var min = 1000;
  var max = 0;
  for (var i=0; i<fftSize; i++) {
    if (min > buf[i]) min = buf[i];
    if (max < buf[i]) max = buf[i];
  }
  var maxVolume = Math.max(128 - min, max - 128);
  var percent = Math.floor(maxVolume * 100 / 128) - 1;
  var colorIndex = Math.floor(percent / 10);

  progressElem.css('width', percent + '%');
  progressElem.css('background-color', colors[colorIndex]);

  if (!window.requestAnimationFrame)
        window.requestAnimationFrame = window.webkitRequestAnimationFrame;
  rafID = window.requestAnimationFrame( redrawAnalysis );

  return 0;
}

var progressElem;
var ajaxErrorHandler;

function startRecording() {
    if (recorder) {recorder.clear();recorder.record();}
    recording = 1;
}

function initAudioBackend(progressBarId, fnAjaxErrorHandler) {
    progressElem = $(progressBarId);
    ajaxErrorHandler = fnAjaxErrorHandler;
}

function stopRecording(playerElem) {
    recording = 0;
    recorder.stop();
    recorder.exportWAV(function(s) {
      $(playerElem).get(0).src = window.URL.createObjectURL(s);
      $(playerElem).data("blob",s);
    }, 'audio/wav');
}

function sendBlob(num) {
  recorder.exportWAV(function(blob) {
    form = new FormData();
    form.append('num', num);
    form.append('blob',blob);

     $.ajax({
        url :  "testaudio.php",
        type: 'POST',
        data: form,
        contentType: false,
        processData: false,
        success: function(data) {
        },
        error: ajaxErrorHandler
      });
    })

/*
    request = new XMLHttpRequest();

    request.onreadystatechange=function()
        {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
    }
  }
    request.open(
            "POST",
            "testaudio.php",
            true
            );
    request.send(form);
  });

*/


}
