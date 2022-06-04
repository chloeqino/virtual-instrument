import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  HStack,
  VStack,
  useOutsideClick,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
function NoteBar(props) {
  const barRef = useRef();
  useOutsideClick({
    enabled: false,
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
  const [update, toggleUpdate] = useState(false);
  const visRef = useRef();
  const scrollX = useRef();

  const [tempEditArr, settempEditArr] = useState(
    JSON.parse(JSON.stringify(props.editArr))
  );
  const setSelected = (i) => {
    //console.log("s" + i);
    setSelectedNote(i);
  };
  useEffect(() => {
    visRef.current.scrollLeft = scrollX.current;
  }, [update]);
  useEffect(() => {
    settempEditArr(props.editArr);
  }, [props.editArr]);
  let xlim =
    Math.max(4000, Math.ceil(tempEditArr.duration / 1000) * 1000) * 0.1;
  //console.log(Math.ceil(tempEditArr.duration / 1000) * 1000);
  return tempEditArr ? (
    <HStack>
      <div
        className="editPanelContainer"
        key={`${JSON.stringify(tempEditArr)}-${update}`}
      >
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
          <VStack id="vis" ref={visRef}>
            {props.pitches.map((e) => {
              return (
                <Box
                  w={`${xlim}px`}
                  className={`y-bar pitch-${e}`}
                  key={`pitchbar-${e}`}
                >
                  {tempEditArr.arr
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
      <div key={JSON.stringify(tempEditArr.arr[selectedNote])}>
        {selectedNote >= 0 ? (
          <VStack>
            <section>
              <h3>pitch</h3>
              {tempEditArr.arr[selectedNote]?.pitch}
            </section>
            <section>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  scrollX.current = visRef.current.scrollLeft;
                  toggleUpdate(!update);
                }}
              >
                <label htmlFor="duration">duration</label>

                <NumberInput
                  id="duration"
                  step={1}
                  defaultValue={(tempEditArr.arr[
                    selectedNote
                  ]?.duration).toFixed(0)}
                  min={0}
                  onChange={(e) => {
                    tempEditArr.arr[selectedNote].duration = Number(e);
                  }}
                  onSubmit={(e) => {
                    scrollX.current = visRef.current.scrollLeft;
                    toggleUpdate(!update);
                  }}
                  onBlur={(e) => {
                    scrollX.current = visRef.current.scrollLeft;
                    toggleUpdate(!update);
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </form>
            </section>
          </VStack>
        ) : (
          <Box>None</Box>
        )}
      </div>
    </HStack>
  ) : (
    ""
  );
}
export default EditPanel;
