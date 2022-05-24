import React, { useState, useEffect } from "react";
import * as Tone from "tone";
export default function Track(props) {
  const startplay = () => {
    Tone.start();
    let now = Tone.now();
    const synth = new Tone.Synth().toDestination();
    console.log(props.notesArr);
    for (let i = 0; i < props.notesArr.length; i++) {
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
  return (
    <div className="track">
      <div>{props.title}</div>
      <button onClick={startplay}>play</button>
    </div>
  );
}
