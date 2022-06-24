import logo from "./logo.svg";
import "./App.css";
import * as Tone from "tone";
import React, { useState, useEffect, useRef } from "react";
import PlayList from "./playlist";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
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
    function handler(e) {
      if (props.keyDisabled) {
        return;
      }
      if (e.key.toLocaleLowerCase() == props.char) {
        if (!playing) {
          attack();
        }
      }
    }
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [props.char]);
  useEffect(() => {
    function handler(e) {
      if (props.keyDisabled) {
        return;
      }
      if (e.key.toLocaleLowerCase() == props.char) {
        if (playing) {
          release();
        }
      }
    }
    document.addEventListener("keyup", handler);
    return () => {
      document.removeEventListener("keyup", handler);
    };
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
    playing = false;
    btn.current.classList.remove("active");
    setStartTime(tempstart);
    setStopTime(performance.now());

    synth.triggerRelease(now);
  };
  return (
    <VStack spacing={1} className="keynote">
      <Button
        className="key"
        ref={btn}
        disabled={props.keyDisabled}
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
      <Box className="label">{props.char.toUpperCase()}</Box>
    </VStack>
  );
}
function App() {
  let recordings = [];
  let r_start = 0;
  let r_end = 0;
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
  const currentSythns = useRef([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const newTrack = useRef(null);
  const [keyboardDisabled, setkeyboardDisabled] = useState(false);
  const [updatetracks, toggleTracks] = useState(false);
  useEffect(() => {
    function handler(e) {
      if (e.keyCode == 32 && record != "stop") {
        stopRecording();
        // console.log("space");
      }
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });
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
      r_end = endTime;
    } else {
      if (startTime <= r_start) {
        r_start = startTime;
      }
      if (endTime >= r_end) {
        r_end = endTime;
      }
    }
    note["pitch"] = pitch;
    note["duration"] = endTime - startTime;
    note["start"] = startTime;
    note["attack"] = 0.005;
    note["decay"] = 0.1;
    note["sustain"] = 0.3;
    note["release"] = 1;
    recordings.push(note);
    //console.log(recordings);
  };
  const startRecord = () => {
    if (record == "stop") {
      setRecord("start");
    }
  };
  const stopRecording = () => {
    if (recordings.length == 0) {
      setRecord("stop");
      r_start = 0;
      return;
    }
    for (let i = 0; i < recordings.length; i++) {
      recordings[i].start = recordings[i].start - r_start;
      recordings[i].idx = i;
    }
    setRecord("stop");
    let newrecording = {};
    newrecording.duration = r_end - r_start + 1;
    newrecording.notes = recordings;
    newrecording.title = "Untitled Recording " + (tracks.length + 1);
    console.log("new title" + newrecording.title);
    newTrack.current = newrecording;
    setkeyboardDisabled(true);
    onOpen();
    // setTracks([...tracks, newrecording]);
    //r_start = 0;
    //r_end = 0;
    //recordings = [];
  };
  const playPreview = () => {
    //console.log(props.notesArr);
    for (let i = 0; i < newTrack.current.notes.length; i++) {
      let now = Tone.now();
      let note = newTrack.current.notes[i];
      let synth = new Tone.Synth({
        envelope: {
          attack: note.attack,
          decay: note.decay,
          sustain: note.sustain,
          release: note.release,
        },
      }).toDestination();
      currentSythns.current.push(synth);
      //console.log(note);
      Tone.Transport.schedule((time) => {
        synth.triggerAttackRelease(
          note.pitch,
          note.duration / 1000,
          now + note.start / 1000
        );
      });
    }
    Tone.Transport.start();
  };
  useEffect(() => {
    if (isOpen) {
      console.log("entering");
      setTimeout(() => {
        document.getElementById("newtrack-title").focus();
      }, 100);
    }
  }, [isOpen]);
  return (
    <div className="App">
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        key={isOpen}
        autoFocus={false}
        closeOnOverlayClick={false}
        isCentered
      >
        <ModalOverlay />
        {isOpen ? (
          <ModalContent>
            <ModalHeader>New Track</ModalHeader>

            <ModalBody>
              <label htmlFor="newtrack-title">title</label>
              <Input
                id="newtrack-title"
                defaultValue={newTrack.current.title}
                onFocus={(e) => {
                  if (/Untitled Recording[ \d]*/.test(e.target.value)) {
                    e.target.select();
                    e.target.setSelectionRange(0, e.target.value.length);
                  }
                }}
                onChange={(e) => {
                  console.log(e.target.value);
                  newTrack.current.title = e.target.value;
                }}
              />
              <Button
                onClick={() => {
                  playPreview();
                }}
              >
                Play
              </Button>
            </ModalBody>

            <ModalFooter justifyContent="space-evenly">
              <Button
                colorScheme="blue"
                onClick={() => {
                  setTracks([
                    ...tracks,
                    JSON.parse(JSON.stringify(newTrack.current)),
                  ]);
                  r_start = 0;
                  r_end = 0;
                  recordings = [];
                  newTrack.current = null;
                  onClose();
                  setkeyboardDisabled(false);
                }}
              >
                Save
              </Button>
              <Button
                className="discardBtn"
                variant="ghost"
                onClick={() => {
                  r_start = 0;
                  r_end = 0;
                  recordings = [];
                  newTrack.current = null;
                  for (let i = 0; i < currentSythns.current.length; i++) {
                    currentSythns.current[i].dispose();
                  }
                  currentSythns.current = [];
                  onClose();
                  setkeyboardDisabled(false);
                }}
              >
                Discard
              </Button>
            </ModalFooter>
          </ModalContent>
        ) : (
          ``
        )}
      </Modal>
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
          key={record}
          onClick={() => {
            startRecord();
          }}
        >
          Start Recording
        </Button>
      ) : (
        <Button
          key={record}
          variant="solid"
          className="primary"
          onClick={() => {
            stopRecording();
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
              key={`pitches#${i}disabled${keyboardDisabled}`}
              startTime={now}
              keyDisabled={keyboardDisabled}
              char={keys.length > i ? keys[i] : null}
            />
          );
        })}
      </HStack>
      <PlayList
        tracks={tracks}
        key={tracks.length}
        pitches={pitches.slice().reverse()}
      />
    </div>
  );
}

export default App;
