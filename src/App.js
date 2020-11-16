import React from 'react'
import ExecutionSimulator from 'components/vm-translator/execution-simulator'
import { DivRefProvider } from
  'components/vm-translator/execution-simulator/providers/divRefProvider'

function App () {
  return (
    <DivRefProvider>
      <ExecutionSimulator />
    </DivRefProvider>
  )
}

export default App
