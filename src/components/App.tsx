import React, { useState } from "react";

import styled from "styled-components";

import BoxInTheBox from "@app/components/BoxInTheBox";

export default function App(): React.ReactElement {
  const [red, setRed] = useState(true);
  return (
    <>
      <Container>
        {red && <StyledBoxInTheBox color={"red"} />}
        <StyledBoxInTheBox color={"green"} />
        <StyledBoxInTheBox color={"blue"} />
      </Container>
      <Container>
        <button
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            setRed((p) => !p);
          }}
        >
          Toggle Red
        </button>
      </Container>
    </>
  );
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-grow: 1;
  align-items: stretch;
  justify-content: space-around;
`;

const StyledBoxInTheBox = styled(BoxInTheBox)`
  flex: 1;
  width: 100%;
  height: 80vh;
`;
