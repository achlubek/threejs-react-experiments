import { createGlobalStyle } from "styled-components";

export const globalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #BBBBBB;
    font-family: Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    color: #222;
  }

  button {
    all: unset;
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #888;
    background-color: #BBB;
    cursor: pointer;
    &:hover {
      background-color: #CCC;
    }
  }
`;
