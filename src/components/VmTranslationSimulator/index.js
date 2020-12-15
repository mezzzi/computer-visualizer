import React from 'react'
import { DivRefProvider } from
  'components/VmTranslationSimulator/contexts/divRefContext'
import { GeneralProvider } from
  'components/VmTranslationSimulator/contexts/generalContext'
import { ModeProvider } from
  'components/VmTranslationSimulator/contexts/modeContext'

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
