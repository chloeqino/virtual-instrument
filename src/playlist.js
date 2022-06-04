import React, { useState, useEffect, useRef } from "react";
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
import EditPanel from "./editPanel";

export default function PlayList(props) {
  const [tracks, setTracks] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editArr, setEditArr] = useState({ arr: [], duration: 0 });
  const [editDuration, setEditDuraton] = useState(0);
  const [update, toggleUpdate] = useState(false);
  const editIdx = useRef();
  useEffect(() => {
    console.log("new track!!");
    console.log(props.tracks);
    //setTracks(props.tracks);
    updatetracks();
  }, props.tracks);
  function updatetracks() {
    let currentTracks = [];
    console.log("updating track");
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
  useEffect(() => {
    updatetracks();
  }, [update]);
  const openModal = (arr, d, i) => {
    if (!arr) {
      return;
    }
    console.log(arr);
    onOpen();
    let o = {};
    o.arr = arr;
    o.duration = d;
    setEditArr(o);
    editIdx.current = i;
  };

  return (
    <div>
      <Modal
        isOpen={isOpen}
        closeOnOverlayClick={false}
        className="editModal"
        onClose={onClose}
        isCentered
        key={editArr.arr.map((e) => {
          return JSON.stringify(e);
        })}
      >
        <ModalOverlay />

        {
          <EditPanel
            editArr={editArr}
            pitches={props.pitches}
            closeFunction={onClose}
            saveFunction={(arr) => {
              props.tracks[editIdx.current].notes = arr.arr;
              props.tracks[editIdx.current].duration = arr.duration;
              toggleUpdate(!update);
            }}
          />
        }
      </Modal>
      <h2>Your Recordings</h2>
      {tracks.length ? (
        <TableContainer
          className={`tracklist updating`}
          key={`${props.tracks.length}#${update}`}
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
