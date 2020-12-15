import React from 'react'
import { DivRefProvider } from
  'components/vm-translator/contexts/divRefContext'
import { GeneralProvider } from
  'components/vm-translator/contexts/generalContext'
import { ModeProvider } from
  'components/vm-translator/contexts/modeContext'

import ExecutionSimulator from './vm-simulator'

const VmSimulatorApp = () => {
  return (
    <GeneralProvider>
      <ModeProvider>
        <DivRefProvider>
          <ExecutionSimulator />
        </DivRefProvider>
      </ModeProvider>
    </GeneralProvider>
  )
}

export default VmSimulatorApp
