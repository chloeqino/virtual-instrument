import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { Tr, Td, HStack } from "@chakra-ui/react";
import defaultImg from "./defaultcover.png";

export default function Track(props) {
  const [playing, togglePlaying] = useState(false);
  const recorder = new Tone.Recorder();

  const startplay = () => {
    Tone.start();
    recorder.start();

    //console.log(props.notesArr);
    for (let i = 0; i < props.notesArr.length; i++) {
      let now = Tone.now();
      let note = props.notesArr[i];
      const synth = new Tone.Synth({
        envelope: {
          attack: note.attack,
          decay: note.decay,
          sustain: note.sustain,
          release: note.release,
        },
      }).toDestination();

      //console.log(note);

      synth.triggerAttackRelease(
        note.pitch,
        note.duration / 1000,
        now + note.start / 1000
      );
    }
  };
  useEffect(() => {
    console.log("track class" + props);
  });
  useEffect(() => {
    console.log("p" + playing);
    if (playing) {
      setTimeout(() => {
        togglePlaying(false);
      }, props.duration + 400);
    }
  }, [playing]);
  return (
    <Tr className="track">
      <Td className="idx">
        <span
          key={`index#${playing}#${props.index}`}
          className={`index ${playing ? "dn" : ""}`}
        >
          {props.index + 1}
        </span>
        <button
          className={`playbtn ${playing ? "d" : ""}`}
          disabled={playing}
          onClick={() => {
            startplay();
            togglePlaying(true);
          }}
        >
          play
        </button>
      </Td>
      <Td>
        <HStack>
          <img src={props.coverImg} className="cover-img" />
          <span>{props.title}</span>
        </HStack>
      </Td>
      <Td isNumeric className="right">
        {(props.duration / 1000).toFixed(2)}
      </Td>
      <Td>
        <button
          className="editBtn"
          onClick={() => {
            props.editFunction(props.notesArr, props.duration, props.index);
          }}
        >
          edit
        </button>
      </Td>
    </Tr>
  );
}
