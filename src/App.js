import React from 'react'
import ExecutionSimulator from 'components/vm-translator/execution-simulator'
import { DivRefProvider } from
  'components/vm-translator/execution-simulator/providers/divRefProvider'
import { AsmStepwiseProvider } from
  'components/vm-translator/execution-simulator/providers/asmStepwiseProvider'
function App () {
  return (
    <DivRefProvider>
      <AsmStepwiseProvider>
        <ExecutionSimulator />
      </AsmStepwiseProvider>
    </DivRefProvider>
  )
}

export default App
