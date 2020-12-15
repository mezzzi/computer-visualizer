import React from 'react'
import { UnControlled as CodeMirror } from 'react-codemirror2'
import { Link } from 'react-router-dom'
import CodeSnippet from 'components/CodeSnippet'
import { ROUTINGS } from 'constants/routing'
import { ContentWrapper, GlobalStyle, Header, Wrapper, StartButton } from './styled'
import { JACK_FRAGMENT_CODES } from './util'
import { useMainContextActions, useMainContextStates } from 'contexts'

const CodeMirrorComponent = () => {
  const { jackCode } = useMainContextStates()
  const { setJackCode } = useMainContextActions()

  return (
    <Wrapper>
      <GlobalStyle />
      <Header>Jack Program</Header>
      <ContentWrapper>
        <CodeSnippet upCode={JACK_FRAGMENT_CODES.printInt} downCode={JACK_FRAGMENT_CODES.printStirng} />
        <CodeMirror
          className='code-mirror'
          autoCursor={false}
          value={jackCode}
          options={{
            mode: 'java',
            theme: 'material',
            lineNumbers: true
          }}
          onChange={(editor, data, value) => setJackCode(value)}
        />
        <CodeSnippet upCode={JACK_FRAGMENT_CODES.printStirng} downCode={JACK_FRAGMENT_CODES.printInt} />
      </ContentWrapper>
      <Link to={ROUTINGS.COMPILER_FIRST_STAGE}><StartButton>Start Compilation</StartButton></Link>
    </Wrapper>
  )
}

export default CodeMirrorComponent
