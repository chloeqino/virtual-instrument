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
  Modal,
  ModalOverlay,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  useDisclosure,
  ScaleFade,
} from "@chakra-ui/react";

import * as Tone from "tone";
import { Scale } from "tone";
function NoteBar(props) {
  const barRef = useRef();
  const leftDrag = useRef(false);
  const rightDrag = useRef(false);
  useEffect(() => {
    function handler(e) {
      if (leftDrag.current) {
        barRef.current.style.left =
          Math.max(barRef.current.offsetLeft + e.movementX, 0) + "px";
        if (barRef.current.offsetLeft >= 1) {
          barRef.current.style.width =
            Math.max(1, barRef.current.clientWidth - e.movementX) + "px";
        }
        props.updateNoteFunction(
          barRef.current.clientWidth / props.scale,
          barRef.current.offsetLeft / props.scale
        );
      } else if (rightDrag.current) {
        if (barRef.current.clientWidth >= 1) {
          barRef.current.style.width =
            Math.max(1, barRef.current.clientWidth + e.movementX) + "px";
        }
        props.updateNoteFunction(
          barRef.current.clientWidth / props.scale,
          barRef.current.offsetLeft / props.scale
        );
      }
    }
    document.addEventListener("mousemove", handler);
    return () => {
      document.removeEventListener("mousemove", handler);
    };
  });
  useEffect(() => {
    function handler(e) {
      if (leftDrag.current) {
        leftDrag.current = false;
        console.log("updating...");
      }
      if (rightDrag.current) {
        rightDrag.current = false;
      }
    }
    document.addEventListener("mouseup", handler);
    return () => {
      document.removeEventListener("mouseup", handler);
    };
  });
  useOutsideClick({
    enabled: true,
    ref: barRef,
    handler: (e) => {
      //console.log(e.target.tagName);
      if (
        e.target.classList.contains("edit-right") ||
        e.target.classList.contains("playbtn") ||
        e.target.classList.contains("adsr") ||
        e.target.parentNode.classList.contains("adsr") ||
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
    >
      <div
        className="leftdrag"
        onMouseDown={(e) => {
          console.log("leftdrag" + e.target.parentNode.offsetLeft);
          leftDrag.current = true;
        }}
      ></div>
      <div
        className="rightdrag"
        onMouseDown={(e) => {
          rightDrag.current = true;
        }}
      ></div>
    </Box>
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dropdown, toggleDropdown] = useState(false);
  const [addNew, toggleAdd] = useState(false);
  const newpitch = useRef();
  const newd = useRef(0);
  const newStart = useRef(0);
  const p_input = useRef();
  const d_input = useRef();
  const s_input = useRef();
  const dropdownRef = useRef();
  const atk_input = useRef(0.005);
  const decay_input = useRef(0.1);
  const sustain_input = useRef(0.3);
  const release_input = useRef(1);
  const [vis_size, setVisSize] = useState(0);
  const overlayRef = useRef();
  const [formUpdate, toggleFormUpdate] = useState(false);

  const [tempEditArr, settempEditArr] = useState(
    JSON.parse(JSON.stringify(props.editArr))
  );
  const setSelected = (i, elem) => {
    selectedElem.current = elem;
    if (i >= 0) {
      playNote(tempEditArr.arr[i]);
    }
    setSelectedNote(i);
  };

  useOutsideClick({
    ref: dropdownRef,
    handler: () => {
      toggleDropdown(false);
    },
  });
  const computeDuration = (arr) => {
    //console.log("cd" + arr);
    if (!arr || arr.length < 1) {
      return;
    }
    let tempStart = arr[0]?.start;
    let tempEnd = arr[0]?.start + arr[0]?.duration;
    for (let i = 1; i < arr.length; i++) {
      let o = arr[i];
      if (o.start <= tempStart) {
        tempStart = o.start;
      }
      if (o.start + o.duration >= tempEnd) {
        tempEnd = o.start + o.duration;
      }
    }
    return tempEnd - tempStart + 1;
  };
  useEffect(() => {
    console.log("add new");
    if (newd.current > 0 && props.pitches.includes(newpitch.current)) {
      let newObj = {};
      newObj.pitch = newpitch.current;
      newObj.duration = newd.current;
      newObj.start = newStart.current;
      newObj.attack = atk_input.current;
      newObj.decay = decay_input.current;
      newObj.sustain = sustain_input.current;
      newObj.release = release_input.current;
      newObj.idx = tempEditArr.arr.slice().length;
      tempEditArr.arr.push(newObj);

      scrollX.current = visRef.current.scrollLeft;
      scrollY.current = containerRef.current.scrollTop;
      newd.current = 0;
      newStart.current = 0;
      atk_input.current = 0.005;
      decay_input.current = 0.1;
      sustain_input.current = 0.3;
      release_input.current = 1;
      s_input.current.value = 0;
      playNote(newObj);
      toggleUpdate(!update);
      setSelectedNote(tempEditArr.arr.length - 1);
    }
  }, [addNew]);
  useEffect(() => {
    function handler(e) {
      console.log(e);
      if (e.keyCode == 8 && selectedNote >= 0) {
        if (e.target.tagName == "INPUT") {
          return;
        }
        scrollX.current = visRef.current.scrollLeft;
        scrollY.current = containerRef.current.scrollTop;
        tempEditArr.arr[selectedNote].duration = 0;
        setSelectedNote(-1);
        toggleUpdate(!update);
      }
    }
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  });
  useEffect(() => {
    visRef.current.scrollLeft = scrollX.current;
    containerRef.current.scrollTop = scrollY.current;
    tempEditArr.duration = computeDuration(tempEditArr.arr);
    if (visRef.current) {
      setVisSize(visRef.current.scrollWidth);
    }
    toggleDropdown(false);
  }, [update]);
  useEffect(() => {
    //console.log("width" + visRef.current.clientWidth);
    if (visRef.current) {
      setVisSize(visRef.current.scrollWidth);
    }
    window.addEventListener("resize", () => {
      //console.log("width" + visRef.current.clientWidth);
      if (visRef.current) {
        setVisSize(visRef.current.scrollWidth);
      }
    });
    console.log(visRef.current);
    visRef.current.addEventListener("scroll", (e) => {
      //console.log("scrolling" + e.target.scrollLeft);
      document.getElementById("overlay-scroll").style.left =
        e.target.scrollLeft * -1 + "px";
      //console.log("scrolling" + overlayRef.current.scrollLeft);
    });
    overlayRef.current.addEventListener("scroll", (e) => {
      console.log("scrolling" + e.target.scrollLeft);
      // overlayRef.current.scrollLeft = e.target.scrollLeft;
      //console.log("scrolling" + overlayRef.current.scrollLeft);
    });
  }, []);
  useEffect(() => {
    settempEditArr(JSON.parse(JSON.stringify(props.editArr)));
  }, [props.editArr]);
  const playNote = (note) => {
    Tone.start();
    let now = Tone.now();
    const synth = new Tone.Synth({
      envelope: {
        attack: note.attack,
        decay: note.decay,
        sustain: note.sustain,
        release: note.release,
      },
    }).toDestination();
    synth.triggerAttackRelease(note.pitch, note.duration / 1000, now);
  };
  const startplay = () => {
    Tone.start();

    //console.log(props.notesArr);
    for (let i = 0; i < tempEditArr.arr.length; i++) {
      let now = Tone.now();
      let note = tempEditArr.arr[i];
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
  const xlim = () => {
    return Math.max(4000, Math.ceil(tempEditArr.duration / 1000) * 1000) * 0.1;
  };
  //console.log(Math.ceil(tempEditArr.duration / 1000) * 1000);
  return tempEditArr ? (
    <ModalContent className="editModalWindow">
      <ModalHeader>Modal Title</ModalHeader>
      <ModalBody>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm Window</ModalHeader>
            <ModalCloseButton />
            <ModalBody>Are you sure you want to discard changes?</ModalBody>

            <ModalFooter justifyContent="space-around">
              <Button
                colorScheme="blue"
                mr={3}
                marginRight="0"
                onClick={() => {
                  props.closeFunction();
                }}
              >
                Confirm
              </Button>
              <Button
                bg="#6c58ef"
                color="white"
                className="primary"
                onClick={() => {
                  props.saveFunction(tempEditArr);
                  props.closeFunction();
                }}
              >
                Save and Close
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        <VStack>
          <HStack className="control-btns">
            <Button
              className="playbtn"
              onClick={() => {
                startplay();
              }}
            >
              play
            </Button>
            <div className="dropdownContainer">
              <Button
                onClick={() => {
                  toggleDropdown(true);
                }}
              >
                + Add New Node
              </Button>
              <ScaleFade
                className={`dropdown ${dropdown ? "show" : ""}`}
                initialScale={0.9}
                ref={dropdownRef}
                in={dropdown}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    toggleAdd(!addNew);
                  }}
                  key={`update-${addNew}`}
                >
                  <p>
                    <label htmlFor="pitch-select">Pitch</label>
                    <Select
                      id="pitch-select"
                      placeholder="select a pitch"
                      className="edit-mode"
                      ref={p_input}
                      onChange={(e) => {
                        newpitch.current = e.target.value;
                        console.log(e.target.value);
                      }}
                    >
                      {props.pitches.map((p) => {
                        return (
                          <option value={p} key={`select-${p}`}>
                            {p}
                          </option>
                        );
                      })}
                    </Select>
                  </p>
                  <label htmlFor="duration">duration(ms)</label>

                  <NumberInput
                    id="duration"
                    step={1}
                    defaultValue={0}
                    min={0}
                    onChange={(e) => {
                      newd.current = Number(e);
                      scrollX.current = visRef.current.scrollLeft;
                      scrollY.current = containerRef.current.scrollTop;
                      //tempEditArr.arr[selectedNote].duration = Number(e);
                    }}
                    onBlur={(e) => {
                      scrollY.current = containerRef.current.scrollTop;
                    }}
                  >
                    <NumberInputField ref={d_input} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <p>
                    {" "}
                    <label htmlFor="stime-new">Start Time(ms)</label>
                    <NumberInput
                      id="stime-new"
                      step={1}
                      defaultValue={0}
                      min={0}
                      onChange={(e) => {
                        newStart.current = Number(e);
                      }}
                    >
                      <NumberInputField ref={s_input} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </p>
                  <p className="adsk-new">
                    <VStack>
                      <HStack>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <label htmlFor="atk-new">Attack</label>

                          <NumberInput
                            id="atk-new"
                            step={0.001}
                            defaultValue={0.005}
                            min={0}
                            max={2}
                            onChange={(e) => {
                              atk_input.current = Number(e);
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </form>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <label htmlFor="decay-new">Decay</label>

                          <NumberInput
                            id="decay-new"
                            step={0.05}
                            defaultValue={0.1}
                            min={0}
                            max={2}
                            onChange={(e) => {
                              decay_input.current = Number(e);
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </form>
                      </HStack>
                      <HStack>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <label htmlFor="sustain-new">Sustain</label>

                          <NumberInput
                            id="sustain-new"
                            step={0.05}
                            defaultValue={0.3}
                            min={0}
                            max={1}
                            onChange={(e) => {
                              sustain_input.current = Number(e);
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </form>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                          }}
                        >
                          <label htmlFor="release-new">Release</label>

                          <NumberInput
                            id="release-new"
                            step={0.05}
                            defaultValue={1}
                            min={0}
                            max={3}
                            onChange={(e) => {
                              release_input.current = Number(e);
                            }}
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        </form>
                      </HStack>
                    </VStack>
                  </p>
                  <input className="addNote" type="submit" value="Add"></input>
                </form>
              </ScaleFade>
            </div>
          </HStack>

          <HStack alignItems="stretch" alignSelf="start">
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

                <VStack
                  id="vis"
                  ref={visRef}
                  onScroll={(e) => {
                    document.getElementById("overlay-scroll").style.left =
                      e.target.scrollLeft * -1 + "px";
                  }}
                >
                  <Box
                    id="vis-overlay"
                    key={`size-${vis_size}`}
                    w={`${vis_size}px`}
                    ref={overlayRef}
                  >
                    <div id="overlay-scroll">
                      {[...Array(Math.floor(vis_size / 100)).keys()].map(
                        (e) => {
                          return (
                            <Box w="100px" className="x-grid">
                              <span>{e}s</span>
                            </Box>
                          );
                        }
                      )}
                    </div>
                  </Box>
                  {props.pitches.map((e) => {
                    return (
                      <Box
                        w={`${xlim()}px`}
                        className={`y-bar pitch-${e}`}
                        key={`pitchbar-${e}`}
                      >
                        {tempEditArr.arr
                          .filter((note, i) => note.pitch == e)
                          .map((bar) => {
                            return (
                              <NoteBar
                                pitch={bar.pitch}
                                start={bar.start}
                                duration={bar.duration}
                                idx={bar.idx}
                                key={JSON.stringify(bar)}
                                scale={0.1}
                                updateNoteFunction={(d, s) => {
                                  /*console.log(
                                    "calling uoppdate" +
                                      JSON.stringify(tempEditArr.arr[bar.idx]) +
                                      "d" +
                                      d
                                  );*/
                                  tempEditArr.arr[bar.idx].duration = d;
                                  tempEditArr.arr[bar.idx].start = s;
                                  if (selectedNote == bar.idx) {
                                    document.getElementById(
                                      "stime-edit"
                                    ).value = s;
                                    document.getElementById(
                                      "duration-edit"
                                    ).value = d;
                                  }
                                  // toggleFormUpdate(!formUpdate);
                                }}
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
              key={
                JSON.stringify(tempEditArr.arr[selectedNote]) + "#" + formUpdate
              }
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
                      <label htmlFor="duration-edit">Duration(ms)</label>

                      <NumberInput
                        id="duration-edit"
                        step={1}
                        defaultValue={(tempEditArr.arr[
                          selectedNote
                        ]?.duration).toFixed(0)}
                        min={0}
                        onChange={(e) => {
                          tempEditArr.arr[selectedNote].duration = Number(e);
                          tempEditArr.duration = computeDuration(
                            tempEditArr.arr
                          );
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
                          tempEditArr.duration = computeDuration(
                            tempEditArr.arr
                          );
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
                  <section className="adsr">
                    <header>ADSR</header>
                    <VStack>
                      <HStack>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            scrollX.current = visRef.current.scrollLeft;
                            scrollY.current = containerRef.current.scrollTop;
                            toggleUpdate(!update);
                          }}
                        >
                          <label htmlFor="atk-edit">Attack</label>

                          <NumberInput
                            id="atk-edit"
                            step={0.001}
                            defaultValue={tempEditArr.arr[selectedNote]?.attack}
                            min={0}
                            max={2}
                            onChange={(e) => {
                              tempEditArr.arr[selectedNote].attack = Number(e);
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
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            scrollX.current = visRef.current.scrollLeft;
                            scrollY.current = containerRef.current.scrollTop;
                            toggleUpdate(!update);
                          }}
                        >
                          <label htmlFor="decay-edit">Decay</label>

                          <NumberInput
                            id="decay-edit"
                            step={0.05}
                            defaultValue={tempEditArr.arr[selectedNote]?.decay}
                            min={0}
                            max={2}
                            onChange={(e) => {
                              tempEditArr.arr[selectedNote].decay = Number(e);
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
                      </HStack>
                      <HStack>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            scrollX.current = visRef.current.scrollLeft;
                            scrollY.current = containerRef.current.scrollTop;
                            toggleUpdate(!update);
                          }}
                        >
                          <label htmlFor="sustain-edit">Sustain</label>

                          <NumberInput
                            id="sustain-edit"
                            step={0.05}
                            defaultValue={
                              tempEditArr.arr[selectedNote]?.sustain
                            }
                            min={0}
                            max={1}
                            onChange={(e) => {
                              tempEditArr.arr[selectedNote].sustain = Number(e);
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
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            scrollX.current = visRef.current.scrollLeft;
                            scrollY.current = containerRef.current.scrollTop;
                            toggleUpdate(!update);
                          }}
                        >
                          <label htmlFor="release-edit">Release</label>

                          <NumberInput
                            id="release-edit"
                            step={0.05}
                            defaultValue={
                              tempEditArr.arr[selectedNote]?.release
                            }
                            min={0}
                            max={3}
                            onChange={(e) => {
                              tempEditArr.arr[selectedNote].release = Number(e);
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
                      </HStack>
                    </VStack>
                  </section>
                </VStack>
              ) : (
                <Box
                  w="100%"
                  textAlign="center"
                  color="gray.400"
                  fontWeight="700"
                >
                  Select a node to edit
                </Box>
              )}
            </div>
          </HStack>
        </VStack>
      </ModalBody>
      <ModalFooter justifyContent="center">
        <HStack justifyContent="space-between" className="footerbtns">
          <Button
            colorScheme="gray"
            onClick={() => {
              if (
                JSON.stringify(tempEditArr.arr) ==
                JSON.stringify(props.editArr.arr)
              ) {
                props.closeFunction();
              } else {
                onOpen();
              }
            }}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => {
              props.saveFunction(tempEditArr);
              props.closeFunction();
            }}
          >
            Save
          </Button>
        </HStack>
      </ModalFooter>
    </ModalContent>
  ) : (
    ""
  );
}
export default EditPanel;
