import React from 'react'
import './index.css'
import HVMParser from 'abstractions/software/vm-translator/parser'

const StackTest = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/StackArithmetic/StackTest/StackTest.vm

// Executes a sequence of arithmetic and logical operations
// on the stack. 
push constant 17
push constant 17
eq
push constant 17
push constant 16
eq
push constant 16
push constant 17
eq
push constant 892
push constant 891
lt
push constant 891
push constant 892
lt
push constant 891
push constant 891
lt
push constant 32767
push constant 32766
gt
push constant 32766
push constant 32767
gt
push constant 32766
push constant 32766
gt
push constant 57
push constant 31
push constant 53
add
push constant 112
sub
neg
and
push constant 82
or
not
`

const SimpleAdd = `
// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/07/StackArithmetic/SimpleAdd/SimpleAdd.vm

// Pushes and adds two constants.
push constant 7
push constant 8
add
`

const ExecutionSimulator = () => {
  const vms = [StackTest, SimpleAdd]
  const parser = new HVMParser([{
    className: StackTest,
    file: vms[0]
  }])
  const commands = parser.getCommands()
  return (
    <div
      className='simulatorContainer'
      style={{
        width: `${window.innerWidth}px`,
        height: `${window.innerHeight}px`
      }}
    >
      <div className='quarterBox'>
        <div className='halfBox romWrapper'>
          <div className='romContainer'>
            {
              commands.map((command, index) => (
                <div className='hvmCommand' key={index}>{command.toString()}</div>
              ))
            }
          </div>
          <div className='stackBottom' />
          <button className='romButton'>Next</button>
        </div>
        <div className='halfBox'>CurrentInstruction</div>
      </div>
      <div className='quarterBox'>CPU</div>
      <div className='quarterBox'>SEGMENT</div>
      <div className='quarterBox'>STACK</div>
    </div>
  )
}

export default ExecutionSimulator
