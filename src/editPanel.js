import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  HStack,
  VStack,
  Button,
  useOutsideClick,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
} from "@chakra-ui/react";
import * as Tone from "tone";
function NoteBar(props) {
  const barRef = useRef();
  useOutsideClick({
    enabled: true,
    ref: barRef,
    handler: (e) => {
      //console.log(e.target.tagName);
      if (
        e.target.classList.contains("edit-right") ||
        e.target.classList.contains("playbtn") ||
        e.target.tagName == "FORM" ||
        e.target.tagName == "LABEL" ||
        e.target.tagName == "INPUT" ||
        e.target.tagName == "SELECT"
      ) {
        return;
      }
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
        props.selectedFunction(props.idx, barRef.current);
      }}
    ></Box>
  );
}
function EditPanel(props) {
  const [selectedNote, setSelectedNote] = useState(-1);
  const [update, toggleUpdate] = useState(false);
  const visRef = useRef();
  const selectedElem = useRef();
  const containerRef = useRef();
  const scrollX = useRef();
  const scrollY = useRef();

  const [tempEditArr, settempEditArr] = useState(
    JSON.parse(JSON.stringify(props.editArr))
  );
  const setSelected = (i, elem) => {
    selectedElem.current = elem;
    setSelectedNote(i);
  };
  useEffect(() => {
    visRef.current.scrollLeft = scrollX.current;
    containerRef.current.scrollTop = scrollY.current;
  }, [update]);
  useEffect(() => {
    settempEditArr(props.editArr);
  }, [props.editArr]);
  const startplay = () => {
    Tone.start();

    //console.log(props.notesArr);
    for (let i = 0; i < tempEditArr.arr.length; i++) {
      let now = Tone.now();
      const synth = new Tone.Synth().toDestination();

      let note = tempEditArr.arr[i];

      //console.log(note);

      synth.triggerAttackRelease(
        note.pitch,
        note.duration / 1000,
        now + note.start / 1000
      );
    }
  };
  let xlim =
    Math.max(4000, Math.ceil(tempEditArr.duration / 1000) * 1000) * 0.1;
  //console.log(Math.ceil(tempEditArr.duration / 1000) * 1000);
  return tempEditArr ? (
    <VStack>
      <div>
        <Button
          className="playbtn"
          onClick={() => {
            startplay();
          }}
        >
          play
        </Button>
      </div>

      <HStack alignItems="stretch">
        <div
          className="editPanelContainer"
          ref={containerRef}
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
                            selectedFunction={(p1, p2) => {
                              setSelected(p1, p2);
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
        <div
          key={JSON.stringify(tempEditArr.arr[selectedNote])}
          className="edit-right"
        >
          {selectedNote >= 0 ? (
            <VStack alignItems="stretch">
              <section>
                <label htmlFor="pitch-select">Pitch</label>
                <Select
                  id="pitch-select"
                  className="edit-mode"
                  onChange={(e) => {
                    tempEditArr.arr[selectedNote].pitch = e.target.value;
                    scrollX.current = visRef.current.scrollLeft;
                    scrollY.current = containerRef.current.scrollTop;
                    toggleUpdate(!update);
                  }}
                >
                  {props.pitches.map((p) => {
                    return (
                      <option
                        value={p}
                        key={`select-${p}`}
                        selected={tempEditArr.arr[selectedNote].pitch == p}
                      >
                        {p}
                      </option>
                    );
                  })}
                </Select>
              </section>
              <section>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollX.current = visRef.current.scrollLeft;
                    scrollY.current = containerRef.current.scrollTop;
                    toggleUpdate(!update);
                  }}
                >
                  <label htmlFor="duration">duration(ms)</label>

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
              <section>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    scrollX.current = visRef.current.scrollLeft;
                    scrollY.current = containerRef.current.scrollTop;
                    toggleUpdate(!update);
                  }}
                >
                  <label htmlFor="stime-edit">Start Time(ms)</label>

                  <NumberInput
                    id="stime-edit"
                    step={1}
                    defaultValue={(tempEditArr.arr[
                      selectedNote
                    ]?.start).toFixed(0)}
                    min={0}
                    onChange={(e) => {
                      tempEditArr.arr[selectedNote].start = Number(e);
                    }}
                    onBlur={(e) => {
                      scrollX.current = visRef.current.scrollLeft;
                      scrollY.current = containerRef.current.scrollTop;
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
    </VStack>
  ) : (
    ""
  );
}
export default EditPanel;
