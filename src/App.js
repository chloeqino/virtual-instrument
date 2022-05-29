import logo from "./logo.svg";
import "./App.css";
import * as Tone from "tone";
import React, { useState, useEffect, useRef } from "react";
import PlayList from "./playlist";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import FrequencyCalculator from "frequency-calculator";
import { Stack, HStack, VStack, Box } from "@chakra-ui/react";

function Note(props) {
  const synth = new Tone.Synth().toDestination();
  const now = Tone.now();
  const [startTime, setStartTime] = useState(0);
  const [stopTime, setStopTime] = useState(0);
  const btn = useRef();
  let playing = false;
  let tempstart = 0;
  useEffect(() => {
    //console.log(props);
    props.recording(props.pitch, startTime, stopTime);
  }, [stopTime]);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key.toLocaleLowerCase() == props.char) {
        if (!playing) {
          attack();
        }
      }
    });
    document.addEventListener("keyup", (e) => {
      if (e.key.toLocaleLowerCase() == props.char) {
        if (playing) {
          release();
        }
      }
    });
  }, [props.char]);
  const attack = () => {
    playing = true;
    btn.current.classList.add("active");
    if (Tone.context.state !== "running") {
      Tone.context.resume();
    }
    // setStartTime(performance.now());

    tempstart = performance.now();
    synth.triggerAttack(props.pitch, now);
  };
  const release = () => {
    btn.current.classList.remove("active");
    setStartTime(tempstart);
    setStopTime(performance.now());
    playing = false;
    synth.triggerRelease(now);
  };
  return (
    <VStack spacing={1} className="keynote">
      <Button
        className="key"
        ref={btn}
        onMouseDown={(e) => {
          if (!playing) {
            attack();
          }
          //console.log("start" + performance.now());
        }}
        onMouseUp={(e) => {
          //console.log("end" + performance.now());
          if (playing) {
            release();
          }
        }}
        onMouseOut={() => {
          //console.log("end" + performance.now());
          if (playing) {
            release();
          }
        }}
      >
        {props.pitch}
      </Button>
      <Box className="label">{props.char}</Box>
    </VStack>
  );
}
function App() {
  let recordings = [];
  let r_start = 0;
  const now = Tone.now();
  async function startTone() {
    await Tone.start();
  }
  const [keys, setKeys] = useState([
    "a",
    "w",
    "s",
    "e",
    "d",
    "f",
    "t",
    "g",
    "y",
    "h",
    "u",
    "j",
  ]);
  const [pitches, setPitch] = useState([
    "C4",
    "C#4",
    "D4",
    "D#4",
    "E4",
    "F4",
    "F#4",
    "G4",
    "G#4",
    "A4",
    "A#4",
    "B4",
  ]);
  const [record, setRecord] = useState("stop");
  const [tracks, setTracks] = useState([]);
  const [updatetracks, toggleTracks] = useState(false);

  useEffect(() => {
    console.log(pitches);
  }, []);
  const addtoRecording = (pitch, startTime, endTime) => {
    if (!(endTime - startTime)) {
      return;
    }
    if (record == "stop") {
      return;
    }
    let note = {};
    /*
    
    if (recordings.length) {
      note["start"] = startTime - r_start;
    } else {
      note["start"] = 0;
      r_start = startTime;
    }
    */
    if (recordings.length == 0) {
      r_start = startTime;
    } else {
      if (startTime <= r_start) {
        r_start = startTime;
      }
    }
    note["pitch"] = pitch;
    note["duration"] = endTime - startTime;
    note["start"] = startTime;
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

            // let currentTrack = tracks;
            // currentTrack.push(recordings);
            //setTracks(null);
            for (let i = 0; i < recordings.length; i++) {
              recordings[i].start = recordings[i].start - r_start;
            }

            setTracks([...tracks, recordings]);
            r_start = 0;
            recordings = [];
            //toggleTracks(!updatetracks);
          }}
        >
          Stop Recording
        </Button>
      )}

      <br />
      <HStack id="keyboard" align="center">
        {pitches.map((p, i) => {
          return (
            <Note
              pitch={p}
              recording={addtoRecording}
              key={`pitches#${i}`}
              startTime={now}
              char={keys.length > i ? keys[i] : null}
            />
          );
        })}
      </HStack>
      <PlayList tracks={tracks} key={tracks.length} />
    </div>
  );
}

export default App;
