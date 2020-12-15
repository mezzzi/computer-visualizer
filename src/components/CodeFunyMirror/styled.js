import { TealButton } from 'components/Buttons'
import styled, { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  .react-codemirror2.code-mirror {
    height: 600px;
    width: 500px;
  }
  
  .CodeMirror.cm-s-material {
    height: 100%;
  }
`

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const Header = styled.span`
  font-size: 20px;
  margin-bottom: 30px;
`

export const ContentWrapper = styled.div`
  display: grid;
  grid-gap: 100px;
  grid-template-columns: 250px 500px 250px;
  margin-bottom: 25px;
`

export const StartButton = styled(TealButton)`
  width: 500px;
  height: 50px;
  font-size: 16px;
  text-align: center
`
