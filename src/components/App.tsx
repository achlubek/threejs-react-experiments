import React, { useState } from "react";

import styled from "styled-components";

import BoxInTheBox from "@app/components/BoxInTheBox";
import SimpleBoxFS from "@app/components/SimpleBoxFS";
import TestFS from "@app/components/TestFS";

export default function App(): React.ReactElement {
  const [red, setRed] = useState(true);
  return (
    <>
      <Container>
        {red && <StyledBoxInTheBox color={"red"} />}
        <StyledBoxInTheBox color={"green"} />
        <StyledBoxInTheBox color={"blue"} />
        <StyledTestFS />
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
      <Container>
        <StyledSimpleBoxFS />
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

const StyledTestFS = styled(TestFS)`
  flex: 1;
  width: 100%;
  height: 80vh;
`;

const StyledSimpleBoxFS = styled(SimpleBoxFS)`
  width: 320px;
  height: 140px;
  margin: 14px;
  border-radius: 100px;
  border: 1px solid black;
`;
