import React, { useState, useEffect, useRef } from "react";
import { Box, HStack, VStack, useOutsideClick } from "@chakra-ui/react";
function NoteBar(props) {
  const barRef = useRef();
  useOutsideClick({
    ref: barRef,
    handler: () => {
      if (props.selected) {
        props.selectedFunction(-1);
      }
    },
  });
  return (
    <Box
      className={`note-bar ${props.selected ? "active" : ""}`}
      left={`${props.start * props.scale}px`}
      ref={barRef}
      w={`${props.duration * props.scale}px`}
      key={props.pitch}
      onClick={() => {
        props.selectedFunction(props.idx);
      }}
    ></Box>
  );
}
function EditPanel(props) {
  const [selectedNote, setSelectedNote] = useState(-1);
  const setSelected = (i) => {
    console.log("s" + i);
    setSelectedNote(i);
  };
  let xlim =
    Math.max(4000, Math.ceil(props.editArr.duration / 1000) * 1000) * 0.1;
  console.log(Math.ceil(props.editArr.duration / 1000) * 1000);
  return (
    <div>
      <div className="editPanelContainer">
        <HStack position="relative">
          <VStack className="y-axis">
            {props.pitches.map((e) => {
              return (
                <Box className="y-label" key={`ylabel${e}`}>
                  {e}
                  <hr width="4px" />
                </Box>
              );
            })}
          </VStack>
          <VStack id="vis">
            {props.pitches.map((e) => {
              return (
                <Box
                  w={`${xlim}px`}
                  className={`y-bar pitch-${e}`}
                  key={`pitchbar-${e}`}
                >
                  {props.editArr.arr
                    .filter((note) => note.pitch == e)
                    .map((bar) => {
                      return (
                        <NoteBar
                          pitch={bar.pitch}
                          start={bar.start}
                          duration={bar.duration}
                          idx={bar.idx}
                          key={JSON.stringify(bar)}
                          scale={0.1}
                          selected={bar.idx == selectedNote}
                          selectedFunction={(param) => {
                            setSelected(param);
                          }}
                        />
                      );
                    })}
                </Box>
              );
            })}
          </VStack>
        </HStack>
      </div>
    </div>
  );
}
export default EditPanel;
