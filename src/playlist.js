import React, { useState, useEffect } from "react";
import Track from "./track";
import { Box } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from "@chakra-ui/react";
export default function PlayList(props) {
  const [tracks, setTracks] = useState([]);
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
          index={i}
          key={i}
        />
      );
    }
    setTracks(currentTracks);
  }
  return (
    <div>
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
