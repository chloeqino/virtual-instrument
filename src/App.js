import logo from "./logo.svg";
import "./App.css";
import * as Tone from "tone";
import React, { useState, useEffect } from "react";
import PlayList from "./playlist";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

function Note(props) {
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();
  const [startTime, setStartTime] = useState(0);
  const [stopTime, setStopTime] = useState(0);
  let playing = false;
  let tempstart = 0;
  useEffect(() => {
    //console.log(props);
    props.recording(props.pitch, startTime, stopTime);
  }, [stopTime]);
  return (
    <button
      onMouseDown={() => {
        if (!playing) {
          playing = true;
          if (Tone.context.state !== "running") {
            Tone.context.resume();
          }
          // setStartTime(performance.now());

          tempstart = performance.now();
          synth.triggerAttack(props.pitch, now);
        }
        //console.log("start" + performance.now());
      }}
      onMouseUp={() => {
        //console.log("end" + performance.now());
        if (playing) {
          setStartTime(tempstart);
          setStopTime(performance.now());
          playing = false;
          synth.triggerRelease(now);
        }
      }}
      onMouseOut={() => {
        //console.log("end" + performance.now());
        if (playing) {
          setStartTime(tempstart);
          setStopTime(performance.now());
          playing = false;
          synth.triggerRelease(now);
        }
      }}
    >
      {props.pitch}
    </button>
  );
}
function App() {
  let recordings = [];
  let r_start = 0;
  const now = Tone.now();
  async function startTone() {
    await Tone.start();
  }
  const [record, setRecord] = useState("stop");
  const [tracks, setTracks] = useState([]);
  const [updatetracks, toggleTracks] = useState(false);
  useEffect(() => {
    console.log(tracks);
  }, [updatetracks]);
  const addtoRecording = (pitch, startTime, endTime) => {
    if (!(endTime - startTime)) {
      return;
    }
    if (record == "stop") {
      return;
    }
    let note = {};
    note["pitch"] = pitch;
    note["duration"] = endTime - startTime;
    if (recordings.length) {
      note["start"] = startTime - r_start;
    } else {
      note["start"] = 0;
      r_start = startTime;
    }

    recordings.push(note);
    //console.log(recordings);
  };
  return (
    <div className="App">
      <button
        onClick={() => {
          startTone();
        }}
      >
        Start
      </button>
      <br />
      {record == "stop" ? (
        <Button
          className="primary"
          variant="solid"
          onClick={() => {
            setRecord("start");
          }}
        >
          Start Recording
        </Button>
      ) : (
        <Button
          variant="solid"
          className="primary"
          onClick={() => {
            setRecord("stop");
            r_start = 0;

            // let currentTrack = tracks;
            // currentTrack.push(recordings);
            //setTracks(null);
            setTracks([...tracks, recordings]);
            recordings = [];
            //toggleTracks(!updatetracks);
          }}
        >
          Stop Recording
        </Button>
      )}

      <br />
      <div id="keyboard">
        <Note pitch="C4" startTime={now} recording={addtoRecording} />
        <Note pitch="C#4" startTime={now} recording={addtoRecording} />
        <Note pitch="D4" startTime={now} recording={addtoRecording} />
        <Note pitch="D#4" startTime={now} recording={addtoRecording} />
        <Note pitch="E4" startTime={now} recording={addtoRecording} />
        <Note pitch="E#4" startTime={now} recording={addtoRecording} />
        <Note pitch="F4" startTime={now} recording={addtoRecording} />
        <Note pitch="F#4" startTime={now} recording={addtoRecording} />
        <Note pitch="G4" startTime={now} recording={addtoRecording} />
        <Note pitch="G#4" startTime={now} recording={addtoRecording} />
        <Note pitch="A4" startTime={now} recording={addtoRecording} />
        <Note pitch="A#4" startTime={now} recording={addtoRecording} />
        <Note pitch="B4" startTime={now} recording={addtoRecording} />
      </div>
      <PlayList tracks={tracks} key={tracks.length} />
    </div>
  );
}

export default App;
