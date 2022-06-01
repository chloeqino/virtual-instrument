import React, { useState, useEffect } from "react";
import * as Tone from "tone";
import { Tr, Td } from "@chakra-ui/react";

export default function Track(props) {
  const [playing, togglePlaying] = useState(false);

  const startplay = () => {
    Tone.start();

    //console.log(props.notesArr);
    for (let i = 0; i < props.notesArr.length; i++) {
      let now = Tone.now();
      const synth = new Tone.Synth().toDestination();
      let note = props.notesArr[i];

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
      <Td>{props.title}</Td>
      <Td isNumeric className="right">
        {(props.duration / 1000).toFixed(2)}
      </Td>
      <Td>
        <button
          onClick={() => {
            props.editFunction(props.notesArr, props.duration);
          }}
        >
          edit
        </button>
      </Td>
    </Tr>
  );
}
