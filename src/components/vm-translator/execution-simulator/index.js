import React, { useContext } from 'react'
import './index.css'
import Box from './box'
import Stack from './stack'
import StackBox from './stackbox'
import ArithmeticUnit from './arithmetic-unit'

import useSimulator from './hooks/useSimulator'

import { DivRefContext } from './providers/divRefProvider'

const ExecutionSimulator = () => {
  const { divs, divRefSetters } = useContext(DivRefContext)

  const {
    vmCommands,
    currentVmCommand,
    vmCodeSetters,
    asmGenerator,
    globalStack,
    segments,
    segmentSetters,
    isSimulationModeOn,
    isAsmSimulationOn,
    isSimulating,
    modeSetters,
    arithmetic,
    vmFileIndex,
    setVmFileIndex
  } = useSimulator()

  const provideNextVmCmd = () => {
    vmCodeSetters.shouldProvideNextVmCmd(true)
  }

  const getGstackSize = () => {
    if (!divs.topGstackInvisibleDiv) return {}
    const boundingRect = divs.topGstackInvisibleDiv.getBoundingClientRect()
    return {
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

  const getVmStackSize = () => {
    if (!divs.topVmInvisibleDiv) return {}
    const boundingRect = divs.topVmInvisibleDiv.getBoundingClientRect()
    return {
      left: `${boundingRect.left}px`,
      width: `${boundingRect.width}px`,
      height: `${boundingRect.height}px`
    }
  }

  return (
    <div
      className='simulatorContainer'
    >
      <Box
        border={{ right: 1, bottom: 1 }}
        width='25%'
        title='VM Code'
        setContentBoundingDiv={divRefSetters.setVmStackBoundingDiv}
        customContentStyle={{
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <div
            style={{
              padding: '5px',
              fontFamily: 'monospace',
              fontSize: 'small',
              color: 'yellow'
            }}
          >
            Current Command
          </div>
          <div
            className='currentVmCommand'
            style={{
              ...getVmStackSize(),
              position: 'absolute',
              top: '75px'
            }}
          >
            {currentVmCommand ? currentVmCommand.toString() : ''}
          </div>
        </div>
        <Stack
          width='90%'
          height='60%'
          outerHeight='85%'
          outer
          content={vmCommands.map(com => com.toString())}
          hasAction
          onAction={provideNextVmCmd}
          actionName='NEXT'
          actionDisabled={isSimulating}
          setBottomInvisibleDiv={divRefSetters.setTopVmInvisibleDiv}
          setFirstStackItemDiv={divRefSetters.setTopVmCommandDiv}
        />
        <div
          style={{
            height: '15%',
            width: '70%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 'small',
            fontFamily: 'monospace'
          }}
        >
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
      <Box border={{ bottom: 1 }} width='75%'>
        <Box
          height='100%'
          title='Hack Assembly'
          width='20%'
          border={{ right: 1 }}
          setContentBoundingDiv={divRefSetters.setAsmStackBoundingDiv}
        >
          <Stack
            outerWidth='90%'
            width='80%'
            bottomGrowing
            content={asmGenerator.assembly}
            setTopInvisibleDiv={divRefSetters.setTopAsmInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopAsmCommandDiv}
          />
        </Box>
        <Box height='100%' width='80%' title='Hack CPU'>
          ASM Notes and Diagrams
        </Box>
      </Box>
      <Box width='75%'>
        {
          [
            'temp', 'local', 'argument', 'this', 'that', 'pointer', 'static'
          ].map((name, index) => (
            <StackBox
              key={index}
              boxProps={{ title: name.toUpperCase() }}
              stackProps={{
                name,
                setBottomInvisibleDiv: segmentSetters[`${name}BottomInvisibleDiv`],
                content: segments[name]
              }}
            />
          ))
        }
        <Box
          width='10.5%'
          height='100%'
          title='Global Stack'
          border={{ right: 1 }}
          setContentBoundingDiv={divRefSetters.setGlobalStackBoundingDiv}
        >
          <Stack
            width='100%'
            outerWidth='80%'
            content={globalStack}
            setTopInvisibleDiv={divRefSetters.setTopGstackInvisibleDiv}
            setBottomInvisibleDiv={divRefSetters.setBottomGstackInvisibleDiv}
            setFirstStackItemDiv={divRefSetters.setTopGlobalStackDiv}
          />
        </Box>
        <Box
          height='100%'
          title='RAM'
          width='16%'
          border={{ right: 1 }}
        >
          <Stack
            width='100%'
            outerWidth='80%'
            content={[]}
          />
        </Box>
      </Box>
      <Box width='25%'>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%'
          }}
        >
          <div style={{ width: '100%', height: '60%' }}>
            <ArithmeticUnit
              itemSize={getGstackSize()}
              arithmetic={arithmetic}
              titleHeight='25%'
            />
          </div>
          <div
            style={{
              width: '100%',
              height: '40%',
              display: 'flex',
              justifyContent: 'center',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Box
              title='Non Simulated Features'
              titleHeight='40%'
              width='100%'
              height='100%'
              customContentStyle={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                width: '80%',
                selfJustify: 'center',
                flexWrap: true
              }}
            >
              <span>
                <input
                  type='checkbox' checked={!isSimulationModeOn} value='all' name='all'
                  disabled={isSimulating}
                  onChange={() => modeSetters.isSimulationModeOn(!isSimulationModeOn)}
                />
                <label htmlFor='all'>all</label>
              </span>
              <span>
                <input type='checkbox' value='hvm' name='hvm' />
                <label htmlFor='hvm'>hvm</label>
              </span>
              <span>
                <input
                  type='checkbox' value='asm' name='asm'
                  disabled={isSimulating}
                  checked={!isAsmSimulationOn}
                  onChange={() => modeSetters.isAsmSimulationOn(!isAsmSimulationOn)}
                />
                <label htmlFor='asm'>asm</label>
              </span>
              <span>
                <input type='checkbox' value='push' name='push' />
                <label htmlFor='push'>push</label>
              </span>
              <span>
                <input type='checkbox' value='pop' name='pop' />
                <label htmlFor='pop'>pop</label>
              </span>
              <span>
                <input type='checkbox' value='cpu' name='cpu' />
                <label htmlFor='cpu'>cpu</label>
              </span>
            </Box>
          </div>
        </div>
      </Box>
    </div>
  )
}

export default ExecutionSimulator
