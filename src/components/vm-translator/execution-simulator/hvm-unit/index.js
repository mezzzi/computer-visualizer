import React, { useEffect, useContext, useRef } from 'react'
import './index.css'
import Box from '../box'
import Stack from '../stack'

import { DivRefContext } from '../providers/divRefProvider'
import { GeneralContext } from '../providers/generalProvider'

const HvmUnit = ({
  currentVmCommand,
  isVmCodeExhausted,
  vmCommands,
  provideNextVmCmd,
  isSimulating
}) => {
  const { divSetters } = useContext(DivRefContext)
  const {
    state: { isCurrentAsmBatchExhausted, vmFileIndex },
    setters: { vmFileIndex: setVmFileIndex },
    resetVmFile
  } = useContext(GeneralContext)
  const currentVmCmdRef = useRef(null)

  useEffect(() => {
    divSetters.currentVmCmdDiv(currentVmCmdRef.current)
  }, [])
  const editHandler = (index, value) => {
    const vmCommandsNew = [...vmCommands]
    vmCommandsNew[index] = value.trim()
    resetVmFile(vmCommandsNew.join('\n'))
  }

  return (
    <Box
      width='25%'
      title='VM Code'
      setContentBoundingDiv={divSetters.vmStackBoundingDiv}
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
        name='hvm'
        content={vmCommands}
        highlightTop={false}
        hasAction
        onAction={provideNextVmCmd}
        actionName='NEXT'
        actionDisabled={isSimulating || !isCurrentAsmBatchExhausted || isVmCodeExhausted}
        editable
        editHandler={editHandler}
        setBottomInvisibleDiv={divSetters.bottomVmInvisibleDiv}
      />
      <div className='vmFileSelector'>
        <label htmlFor='files'>Vm Codes:</label>
        <select
          name='files' id='files'
          disabled={isSimulating}
          onChange={(event) => setVmFileIndex(parseInt(event.target.value))}
          value={vmFileIndex}
        >
          <option value='0'>Simple Add</option>
          <option value='1'>Stack Test</option>
          <option value='2'>Basic Test</option>
          <option value='3'>Pointer Test</option>
          <option value='4'>Static Test</option>
          <option value='5'>Basic Loop</option>
        </select>
        <button
          className='resetButton'
          onClick={() => resetVmFile()}
        >
          {'<<'}
        </button>
      </div>
    </Box>
  )
}

export default HvmUnit
