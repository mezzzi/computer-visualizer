import React, { useEffect, useContext, useRef } from 'react'
import './index.css'
import Box from '../box'
import Stack from '../stack'

import HVMTranslator from 'abstractions/software/vm-translator'

import { DivRefContext } from '../providers/divRefProvider'

const HvmUnit = ({
  currentVmCommand,
  vmCommands,
  setTranslator,
  provideNextVmCmd,
  vmFileIndex,
  setVmFileIndex,
  isSimulating
}) => {
  const { divRefSetters } = useContext(DivRefContext)
  const currentVmCmdRef = useRef(null)
  useEffect(() => {
    divRefSetters.currentVmCmdDiv(currentVmCmdRef.current)
  }, [])
  const editHandler = (index, value) => {
    const vmCommandsNew = [...vmCommands]
    vmCommandsNew[index] = value.trim()
    const translator = new HVMTranslator([{
      className: 'VmClass',
      file: vmCommandsNew.join('\n')
    }])
    setTranslator(translator)
  }
  return (
    <Box
      width='25%'
      title='VM Code'
      setContentBoundingDiv={divRefSetters.setVmStackBoundingDiv}
      customContentStyle={{
        flexDirection: 'column'
      }}
    >
      <div className='currentVmCmdWrapper'>
        <div className='currentVmCmdLabel'>
          Current Command
        </div>
        <div
          ref={currentVmCmdRef}
          className='currentVmCommand'
        >
          {currentVmCommand ? currentVmCommand.toString() : ''}
        </div>
      </div>
      <Stack
        width='90%'
        height='70%'
        outerHeight='66%'
        content={vmCommands.map(com => com.toString())}
        highlightTop={false}
        hasAction
        onAction={provideNextVmCmd}
        actionName='NEXT'
        actionDisabled={isSimulating}
        editable
        editHandler={editHandler}
        setBottomInvisibleDiv={divRefSetters.setTopVmInvisibleDiv}
        setFirstStackItemDiv={divRefSetters.setTopVmCommandDiv}
      />
      <div className='vmFileSelector'>
        <label htmlFor='files'>Vm Programs:</label>
        <select
          name='files' id='files'
          disabled={isSimulating}
          onChange={(event) => setVmFileIndex(event.target.value)}
          value={vmFileIndex}
        >
          <option value='0'>Simple Add</option>
          <option value='1'>Stack Test</option>
          <option value='2'>Basic Test</option>
          <option value='3'>Pointer Test</option>
        </select>
      </div>
    </Box>
  )
}

export default HvmUnit
