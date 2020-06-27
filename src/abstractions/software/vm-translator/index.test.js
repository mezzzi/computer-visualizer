import HVMTranslator from '.'

/**
 * Sample VM files taken from chapter 07 and chapter 08 of the Nand2Tetris book
 * These are programs given by the authors to test the various features of the
 * VMTranslator
 */
const vms = {
  StackTest: `
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
  `,
  SimpleAdd: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/07/StackArithmetic/SimpleAdd/SimpleAdd.vm
  
  // Pushes and adds two constants.
  push constant 7
  push constant 8
  add
  `,
  BasicTest: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/07/MemoryAccess/BasicTest/BasicTest.vm
  
  // Executes pop & push commands using the virtual memory segments.
  push constant 10
  pop local 0
  push constant 21
  push constant 22
  pop argument 2
  pop argument 1
  push constant 36
  pop this 6
  push constant 42
  push constant 45
  pop that 5
  pop that 2
  push constant 510
  pop temp 6
  push local 0
  push that 5
  add
  push argument 1
  sub
  push this 6
  push this 6
  add
  sub
  push temp 6
  add
  `,
  PointerTest: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/07/MemoryAccess/PointerTest/PointerTest.vm
  
  // Executes pop and push commands using the 
  // pointer, this, and that segments.
  push constant 3030
  pop pointer 0
  push constant 3040
  pop pointer 1
  push constant 32
  pop this 2
  push constant 46
  pop that 6
  push pointer 0
  push pointer 1
  add
  push this 2
  sub
  push that 6
  add
  `,
  StaticTest: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/07/MemoryAccess/StaticTest/StaticTest.vm
  
  // Executes pop and push commands using the static segment.
  push constant 111
  push constant 333
  push constant 888
  pop static 8
  pop static 3
  pop static 1
  push static 3
  push static 1
  sub
  push static 8
  add
  `
}

/**
 * The following are Hack assembly programs that have passed the comparison test
 * given in the book. If you have doubts, verify for yourself that they are indeed
 * correct results. You can do so by following instructions given at the end of
 * chapter 07 and 08 in the Nand2Tetris book
 */
const asms = {
  SimpleAdd: `
@256
D=A
@SP
M=D
@7
D=A
@SP
A=M
M=D
@SP
M=M+1
@8
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1    
      `,
  StackTest: `
@256
D=A
@SP
M=D
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line30
D;JEQ
D=0
@line32
0;JMP
(line30)
D=-1
(line32)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
@16
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line65
D;JEQ
D=0
@line67
0;JMP
(line65)
D=-1
(line67)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@16
D=A
@SP
A=M
M=D
@SP
M=M+1
@17
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line100
D;JEQ
D=0
@line102
0;JMP
(line100)
D=-1
(line102)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@892
D=A
@SP
A=M
M=D
@SP
M=M+1
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line135
D;JLT
D=0
@line137
0;JMP
(line135)
D=-1
(line137)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
@892
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line170
D;JLT
D=0
@line172
0;JMP
(line170)
D=-1
(line172)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
@891
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line205
D;JLT
D=0
@line207
0;JMP
(line205)
D=-1
(line207)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line240
D;JGT
D=0
@line242
0;JMP
(line240)
D=-1
(line242)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@32767
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line275
D;JGT
D=0
@line277
0;JMP
(line275)
D=-1
(line277)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@32766
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
D=M-D
@line310
D;JGT
D=0
@line312
0;JMP
(line310)
D=-1
(line312)
@SP
A=M-1
A=A-1
M=D
@SP
M=M-1
@57
D=A
@SP
A=M
M=D
@SP
M=M+1
@31
D=A
@SP
A=M
M=D
@SP
M=M+1
@53
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
@112
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M-D
@SP
M=M-1
@SP
A=M-1
M=-M
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M&D
@SP
M=M-1
@82
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M|D
@SP
M=M-1
@SP
A=M-1
M=!M  
  `,
  BasicTest: `
@256
D=A
@SP
M=D
@10
D=A
@SP
A=M
M=D
@SP
M=M+1
@0
D=A
@LCL
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@21
D=A
@SP
A=M
M=D
@SP
M=M+1
@22
D=A
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@ARG
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@1
D=A
@ARG
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@36
D=A
@SP
A=M
M=D
@SP
M=M+1
@6
D=A
@THIS
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@42
D=A
@SP
A=M
M=D
@SP
M=M+1
@45
D=A
@SP
A=M
M=D
@SP
M=M+1
@5
D=A
@THAT
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@2
D=A
@THAT
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@510
D=A
@SP
A=M
M=D
@SP
M=M+1
@6
D=A
@R5
D=A+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@0
D=A
@LCL
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@5
D=A
@THAT
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
@1
D=A
@ARG
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M-D
@SP
M=M-1
@6
D=A
@THIS
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@6
D=A
@THIS
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M-D
@SP
M=M-1
@6
D=A
@R5
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
`,
  PointerTest: `
  @256
D=A
@SP
M=D
@3030
D=A
@SP
A=M
M=D
@SP
M=M+1
@0
D=A
@R3
D=A+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@3040
D=A
@SP
A=M
M=D
@SP
M=M+1
@1
D=A
@R3
D=A+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@32
D=A
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@THIS
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@46
D=A
@SP
A=M
M=D
@SP
M=M+1
@6
D=A
@THAT
D=M+D
@R13
M=D
@SP
A=M-1
D=M
@R13
A=M
M=D
@SP
M=M-1
@0
D=A
@R3
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@1
D=A
@R3
A=A+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
@2
D=A
@THIS
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M-D
@SP
M=M-1
@6
D=A
@THAT
A=M+D
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1
  `,
  StaticTest: `
@256
D=A
@SP
M=D
@111
D=A
@SP
A=M
M=D
@SP
M=M+1
@333
D=A
@SP
A=M
M=D
@SP
M=M+1
@888
D=A
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@StaticTest.8
M=D
@SP
M=M-1
@SP
A=M-1
D=M
@StaticTest.3
M=D
@SP
M=M-1
@SP
A=M-1
D=M
@StaticTest.1
M=D
@SP
M=M-1
@StaticTest.3
D=M
@SP
A=M
M=D
@SP
M=M+1
@StaticTest.1
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M-D
@SP
M=M-1
@StaticTest.8
D=M
@SP
A=M
M=D
@SP
M=M+1
@SP
A=M-1
D=M
@SP
A=M-1
A=A-1
M=M+D
@SP
M=M-1  
  `
}

/**
 * Test runner for the VMTranslator, compares translated assembly files
 * with expected (generated by external tool) files
 * @param {{className: string, file: string}[]} fileInfos an array of HVM files
 * and their class names
 */
const runTest = (fileInfos, asmKey) => {
  const translator = new HVMTranslator(fileInfos)
  const result = translator.translate()
  const expected = asms[asmKey]
  expect(result.trim()).toBe(expected.trim())
}

test('Chapter 07 / Arithmetic and Memory Access Commands', () => {
  const stageOne = ['StackTest', 'SimpleAdd', 'BasicTest', 'PointerTest', 'StaticTest']
  stageOne.forEach(key => {
    runTest([{ className: key, file: vms[key] }], key)
  })
})
