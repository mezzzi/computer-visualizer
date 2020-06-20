import HVMCommand from './HVMCommand'
import { OP_CODE } from './Utils'
import ProgramException from './ProgramException'

/** @type {string[]} */
let commandCodes = []
/** @type {HVMCommand[]} */
let commandObjects = []

describe('arithmetic and logical commands', () => {
  beforeEach(() => {
    commandCodes = [
      OP_CODE.ADD,
      OP_CODE.SUBTRACT,
      OP_CODE.AND,
      OP_CODE.OR,
      OP_CODE.GREATER_THAN,
      OP_CODE.LESS_THAN,
      OP_CODE.EQUAL,
      OP_CODE.NEGATE
    ]
    commandObjects = commandCodes.map(code => new HVMCommand(code))
  })

  test('getOpcode method ', () => {
    const collectedOpCodes = commandObjects.map(command => command.getOpCode())
    expect(commandCodes).toEqual(collectedOpCodes)
  })

  test('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(commandCodes)
  })

  test('getArg2 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg2()).toThrow(ProgramException)
    })
  })

  test('toString method', () => {
    const formattedInstructions = commandObjects.map(command => command.toString())
    expect(formattedInstructions).toEqual(commandCodes)
  })
})

describe('memory access commands', () => {
  const segments = ['local', 'temp']
  const indexes = [0, 3]
  beforeEach(() => {
    commandCodes = [
      OP_CODE.PUSH,
      OP_CODE.POP
    ]
    commandObjects = commandCodes.map(
      (code, i) => new HVMCommand(code, segments[i], indexes[i]))
  })

  test('getOpcode method ', () => {
    const collectedOpCodes = commandObjects.map(command => command.getOpCode())
    expect(commandCodes).toEqual(collectedOpCodes)
  })

  test('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(segments)
  })

  test('getArg2 method ', () => {
    const collectedArg2s = commandObjects.map(command => command.getArg2())
    expect(collectedArg2s).toEqual(indexes)
  })

  test('toString method', () => {
    const formattedInstructions = commandObjects.map(command => command.toString())
    const expectedStrings = commandCodes.map(
      (code, i) => `${code} ${segments[i]} ${indexes[i]}`
    )
    expect(formattedInstructions).toEqual(expectedStrings)
  })
})

describe('function commands', () => {
  const functions = ['doThis', 'Class.doThat']
  const localAndArgs = [4, 6]
  beforeEach(() => {
    commandCodes = [
      OP_CODE.FUNCTION,
      OP_CODE.CALL
    ]
    commandObjects = commandCodes.map(
      (code, i) => new HVMCommand(code, functions[i], localAndArgs[i]))
  })

  test('getOpcode method ', () => {
    const collectedOpCodes = commandObjects.map(command => command.getOpCode())
    expect(commandCodes).toEqual(collectedOpCodes)
  })

  test('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(functions)
  })

  test('getArg2 method ', () => {
    const collectedArg2s = commandObjects.map(command => command.getArg2())
    expect(collectedArg2s).toEqual(localAndArgs)
  })

  test('toString method', () => {
    const formattedInstructions = commandObjects.map(command => command.toString())
    const expectedStrings = commandCodes.map(
      (code, i) => `${code} ${functions[i]} ${localAndArgs[i]}`
    )
    expect(formattedInstructions).toEqual(expectedStrings)
  })
})

describe('control flow commands', () => {
  const labels = ['heaven', 'paradise', 'joy']
  beforeEach(() => {
    commandCodes = [
      OP_CODE.LABEL,
      OP_CODE.GOTO,
      OP_CODE.IF_GOTO
    ]
    commandObjects = commandCodes.map(
      (code, i) => new HVMCommand(code, labels[i]))
  })

  test('getOpcode method ', () => {
    const collectedOpCodes = commandObjects.map(command => command.getOpCode())
    expect(commandCodes).toEqual(collectedOpCodes)
  })

  test('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(labels)
  })

  test('getArg2 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg2()).toThrow(ProgramException)
    })
  })

  test('toString method', () => {
    const formattedInstructions = commandObjects.map(command => command.toString())
    const expectedStrings = commandCodes.map(
      (code, i) => `${code} ${labels[i]}`
    )
    expect(formattedInstructions).toEqual(expectedStrings)
  })
})

describe('return command', () => {
  beforeEach(() => {
    commandCodes = [
      OP_CODE.RETURN
    ]
    commandObjects = commandCodes.map(
      code => new HVMCommand(code)
    )
  })

  test('getOpcode method ', () => {
    const collectedOpCodes = commandObjects.map(command => command.getOpCode())
    expect(commandCodes).toEqual(collectedOpCodes)
  })

  test('getArg1 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg1()).toThrow(ProgramException)
    })
  })

  test('getArg2 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg2()).toThrow(ProgramException)
    })
  })

  test('toString method', () => {
    const formattedInstructions = commandObjects.map(command => command.toString())
    expect(formattedInstructions).toEqual(commandCodes)
  })
})
