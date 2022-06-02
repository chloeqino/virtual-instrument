import React, { useState, useEffect } from "react";
import Track from "./track";
import { Box } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useDisclosure } from "@chakra-ui/react";

export default function PlayList(props) {
  const [tracks, setTracks] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editArr, setEditArr] = useState({ arr: [], duration: 0 });
  const [editDuration, setEditDuraton] = useState(0);
  useEffect(() => {
    console.log("new track!!");
    console.log(props.tracks);
    //setTracks(props.tracks);
    updatetracks();
  }, props.tracks);
  function updatetracks() {
    let currentTracks = [];
    for (let i = 0; i < props.tracks.length; i++) {
      currentTracks.push(
        <Track
          title={`Recording ${i + 1}`}
          notesArr={props.tracks[i].notes}
          duration={props.tracks[i].duration}
          editFunction={openModal}
          index={i}
          key={i}
        />
      );
    }
    setTracks(currentTracks);
  }
  const openModal = (arr, d) => {
    if (!arr) {
      return;
    }
    console.log(arr);
    onOpen();
    let o = {};
    o.arr = arr;
    o.duration = d;
    setEditArr(o);
  };
  const editPanel = () => {
    let xlim = Math.max(4000, Math.ceil(editArr.duration / 1000) * 1000) * 0.1;
    console.log(Math.ceil(editArr.duration / 1000) * 1000);
    return (
      <div className="editPanelContainer">
        <HStack position="relative">
          <VStack className="y-axis">
            {props.pitches.map((e) => {
              return (
                <Box className="y-label">
                  {e}
                  <hr width="4px" />
                </Box>
              );
            })}
          </VStack>
          <VStack id="vis">
            {props.pitches.map((e) => {
              return (
                <Box w={`${xlim}px`} className={`y-bar pitch-${e}`}>
                  {editArr.arr
                    .filter((note) => note.pitch == e)
                    .map((bar) => {
                      return (
                        <Box
                          className="note-bar"
                          left={`${bar.start * 0.1}px`}
                          w={`${bar.duration * 0.1}px`}
                          key={bar.pitch}
                        ></Box>
                      );
                    })}
                </Box>
              );
            })}
          </VStack>
        </HStack>
      </div>
    );
  };
  return (
    <div>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        key={editArr.arr.map((e) => {
          return JSON.stringify(e);
        })}
      >
        <ModalOverlay />
        <ModalContent className="editModalWindow">
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{editPanel()}</ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="ghost">Secondary Action</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <h2>Your Recordings</h2>
      {tracks.length ? (
        <TableContainer
          className={`tracklist updating`}
          key={props.tracks.length}
        >
          <Table variant="simple" w="70%" margin="auto">
            <Thead>
              <Tr>
                <Th className="idx">#</Th>
                <Th>Title</Th>
                <Th className="right">Duration(s)</Th>
                <Th>&nbsp;</Th>
              </Tr>
            </Thead>
            <Tbody>{tracks}</Tbody>
          </Table>
        </TableContainer>
      ) : (
        <Box bg="#e7e7e8" w="40%" margin="2px auto" p="40px">
          You don't any recorded performance yet. Click on the "Start Recording"
          button and start playing!
        </Box>
      )}
    </div>
  );
}
