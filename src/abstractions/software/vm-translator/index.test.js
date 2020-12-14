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
  `,

  BasicLoop: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/ProgramFlow/BasicLoop/BasicLoop.vm
  
  // Computes the sum 1 + 2 + ... + argument[0] and pushes the 
  // result onto the stack. Argument[0] is initialized by the test 
  // script before this code starts running.
  push constant 0    
  pop local 0         // initialize sum = 0
  label LOOP_START
  push argument 0    
  push local 0
  add
  pop local 0         // sum = sum + counter
  push argument 0
  push constant 1
  sub
  pop argument 0      // counter--
  push argument 0
  if-goto LOOP_START // If counter > 0, goto LOOP_START
  push local 0
  `,

  FibonacciSeries: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/ProgramFlow/FibonacciSeries/FibonacciSeries.vm
  
  // Puts the first argument[0] elements of the Fibonacci series
  // in the memory, starting in the address given in argument[1].
  // Argument[0] and argument[1] are initialized by the test script 
  // before this code starts running.
  
  push argument 1
  pop pointer 1           // that = argument[1]
  
  push constant 0
  pop that 0              // first element = 0
  push constant 1
  pop that 1              // second element = 1
  
  push argument 0
  push constant 2
  sub
  pop argument 0          // num_of_elements -= 2 (first 2 elements are set)
  
  label MAIN_LOOP_START
  
  push argument 0
  if-goto COMPUTE_ELEMENT // if num_of_elements > 0, goto COMPUTE_ELEMENT
  goto END_PROGRAM        // otherwise, goto END_PROGRAM
  
  label COMPUTE_ELEMENT
  
  push that 0
  push that 1
  add
  pop that 2              // that[2] = that[0] + that[1]
  
  push pointer 1
  push constant 1
  add
  pop pointer 1           // that += 1
  
  push argument 0
  push constant 1
  sub
  pop argument 0          // num_of_elements--
  
  goto MAIN_LOOP_START
  
  label END_PROGRAM
  `,

  Class1: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/StaticsTest/Class1.vm
  
  // Stores two supplied arguments in static[0] and static[1].
  function Class1.set 0
  push argument 0
  pop static 0
  push argument 1
  pop static 1
  push constant 0
  return
  
  // Returns static[0] - static[1].
  function Class1.get 0
  push static 0
  push static 1
  sub
  return
  `,

  Class2: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/StaticsTest/Class2.vm
  
  // Stores two supplied arguments in static[0] and static[1].
  function Class2.set 0
  push argument 0
  pop static 0
  push argument 1
  pop static 1
  push constant 0
  return
  
  // Returns static[0] - static[1].
  function Class2.get 0
  push static 0
  push static 1
  sub
  return
  `,

  StaticSys: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/StaticsTest/Sys.vm
  
  // Tests that different functions, stored in two different 
  // class files, manipulate the static segment correctly. 
  function Sys.init 0
  push constant 6
  push constant 8
  call Class1.set 2
  pop temp 0 // Dumps the return value
  push constant 23
  push constant 15
  call Class2.set 2
  pop temp 0 // Dumps the return value
  call Class1.get 0
  call Class2.get 0
  label WHILE
  goto WHILE
  `,

  SimpleFunction: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/SimpleFunction/SimpleFunction.vm
  
  // Performs a simple calculation and returns the result.
  function SimpleFunction.test 2
  push local 0
  push local 1
  add
  not
  push argument 0
  add
  push argument 1
  sub
  return
  `,

  Sys: `
  // Sys.vm for NestedCall test.
  //
  // Copyright (C) 2013 Mark A. Armbrust.
  // Permission granted for educational use.
  
  // Sys.init() calls Sys.main(), stores the return value in temp 1,
  //  and enters an infinite loop.
  
  function Sys.init 0
  call Sys.main 0
  pop temp 1
  label LOOP
  goto LOOP
  
  // Sys.main() calls Sys.add12(123) and stores return value (135) in temp 0.
  // Returns 456.
  
  function Sys.main 0
  push constant 123
  call Sys.add12 1
  pop temp 0
  push constant 246
  return
  
  // Sys.add12(int x) returns x+12.
  // It allocates 3 words of local storage to test the deallocation of local
  // storage during the return.
  
  function Sys.add12 3
  push argument 0
  push constant 12
  add
  return
  `,

  FibonacciMain: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/FibonacciElement/Main.vm
  
  // Computes the n'th element of the Fibonacci series, recursively.
  // n is given in argument[0].  Called by the Sys.init function 
  // (part of the Sys.vm file), which also pushes the argument[0] 
  // parameter before this code starts running.
  
  function Main.fibonacci 0
  push argument 0
  push constant 2
  lt                     // check if n < 2
  if-goto IF_TRUE
  goto IF_FALSE
  label IF_TRUE          // if n<2, return n
  push argument 0        
  return
  label IF_FALSE         // if n>=2, return fib(n-2)+fib(n-1)
  push argument 0
  push constant 2
  sub
  call Main.fibonacci 1  // compute fib(n-2)
  push argument 0
  push constant 1
  sub
  call Main.fibonacci 1  // compute fib(n-1)
  add                    // return fib(n-1) + fib(n-2)
  return
  `,

  FibonacciSys: `
  // This file is part of www.nand2tetris.org
  // and the book "The Elements of Computing Systems"
  // by Nisan and Schocken, MIT Press.
  // File name: projects/08/FunctionCalls/FibonacciElement/Sys.vm
  
  // Pushes n onto the stack and calls the Main.fibonacii function,
  // which computes the n'th element of the Fibonacci series.
  // The Sys.init function is called "automatically" by the 
  // bootstrap code.
  
  function Sys.init 0
  push constant 4
  call Main.fibonacci 1   // Compute the 4'th fibonacci element
  label WHILE
  goto WHILE              // Loop infinitely
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
  `,
  StaticsTest: `
@256
D=A
@SP
M=D
@line4
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@0
D=A
@5
D=D+A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Sys.init
0;JMP
(line4)
(Class1.set)
@0
D=A
(Class1.set_localVarsInitLoop)
@Class1.set_localVarsInitDone
D;JEQ
D=D-1
@SP
A=M
M=0
@SP
M=M+1
@Class1.set_localVarsInitLoop
0;JMP
(Class1.set_localVarsInitDone)
@0
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
@Class1.0
M=D
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
@Class1.1
M=D
@SP
M=M-1
@0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP
(Class1.get)
@0
D=A
(Class1.get_localVarsInitLoop)
@Class1.get_localVarsInitDone
D;JEQ
D=D-1
@SP
A=M
M=0
@SP
M=M+1
@Class1.get_localVarsInitLoop
0;JMP
(Class1.get_localVarsInitDone)
@Class1.0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class1.1
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
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP
(Class2.set)
@0
D=A
(Class2.set_localVarsInitLoop)
@Class2.set_localVarsInitDone
D;JEQ
D=D-1
@SP
A=M
M=0
@SP
M=M+1
@Class2.set_localVarsInitLoop
0;JMP
(Class2.set_localVarsInitDone)
@0
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
@Class2.0
M=D
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
@Class2.1
M=D
@SP
M=M-1
@0
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP
(Class2.get)
@0
D=A
(Class2.get_localVarsInitLoop)
@Class2.get_localVarsInitDone
D;JEQ
D=D-1
@SP
A=M
M=0
@SP
M=M+1
@Class2.get_localVarsInitLoop
0;JMP
(Class2.get_localVarsInitDone)
@Class2.0
D=M
@SP
A=M
M=D
@SP
M=M+1
@Class2.1
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
@LCL
D=M
@5
A=D-A
D=M
@R13
M=D
@SP
A=M-1
D=M
@ARG
A=M
M=D
@ARG
D=M
@SP
M=D+1
@LCL
D=M
@1
A=D-A
D=M
@THAT
M=D
@LCL
D=M
@2
A=D-A
D=M
@THIS
M=D
@LCL
D=M
@3
A=D-A
D=M
@ARG
M=D
@LCL
D=M
@4
A=D-A
D=M
@LCL
M=D
@R13
A=M
0;JMP
(Sys.init)
@0
D=A
(Sys.init_localVarsInitLoop)
@Sys.init_localVarsInitDone
D;JEQ
D=D-1
@SP
A=M
M=0
@SP
M=M+1
@Sys.init_localVarsInitLoop
0;JMP
(Sys.init_localVarsInitDone)
@6
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
@line463
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@5
D=D+A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class1.set
0;JMP
(line463)
@0
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
@23
D=A
@SP
A=M
M=D
@SP
M=M+1
@15
D=A
@SP
A=M
M=D
@SP
M=M+1
@line541
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@2
D=A
@5
D=D+A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class2.set
0;JMP
(line541)
@0
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
@line605
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@0
D=A
@5
D=D+A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class1.get
0;JMP
(line605)
@line655
D=A
@SP
A=M
M=D
@SP
M=M+1
@LCL
D=M
@SP
A=M
M=D
@SP
M=M+1
@ARG
D=M
@SP
A=M
M=D
@SP
M=M+1
@THIS
D=M
@SP
A=M
M=D
@SP
M=M+1
@THAT
D=M
@SP
A=M
M=D
@SP
M=M+1
@0
D=A
@5
D=D+A
@SP
D=M-D
@ARG
M=D
@SP
D=M
@LCL
M=D
@Class2.get
0;JMP
(line655)
(Sys.init$WHILE)
@Sys.init$WHILE
0;JMP    
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

test('Chapter 08 / Function Calls / StaticsTest', () => {
  const vmKeys = ['Class1', 'Class2', 'StaticSys']
  const fileInfos = vmKeys.map(key => ({ className: key, file: vms[key] }))
  runTest(fileInfos, 'StaticsTest')
})
