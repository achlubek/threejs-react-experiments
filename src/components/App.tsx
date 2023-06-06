import React from "react";

import styled from "styled-components";

import BoxInTheBox from "@app/components/BoxInTheBox";

export default function App(): React.ReactElement {
  return (
    <Container>
      <StyledBoxInTheBox color={"red"} />
      <StyledBoxInTheBox color={"green"} />
      <StyledBoxInTheBox color={"blue"} />
    </Container>
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
