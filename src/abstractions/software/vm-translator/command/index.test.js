import HVMCommand from './index'
import { COMMAND } from './types'
import { isArithmeticCommand } from '../utils'
import CommandException from './exception'

/** @type {string[]} */
let commandTypes = []
/** @type {HVMCommand[]} */
let commandObjects = []

describe('arithmetic and logical commands', () => {
  beforeEach(() => {
    commandTypes = Object.keys(COMMAND).filter(
      command => isArithmeticCommand(command))
    commandObjects = commandTypes.map(type => new HVMCommand(type))
  })

  it('getCommandType method ', () => {
    const collectedTypes = commandObjects.map(
      command => command.getCommandType())
    expect(commandTypes).toEqual(collectedTypes)
  })

  it('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(commandTypes)
  })

  it('getArg2 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg2()).toThrow(CommandException)
    })
  })

  it('toString method', () => {
    const stringifiedCommands = commandObjects.map(command => command.toString())
    expect(stringifiedCommands).toEqual(commandTypes)
  })
})

describe('memory access commands', () => {
  const segments = ['local', 'temp']
  const indexes = [0, 3]
  beforeEach(() => {
    commandTypes = [
      COMMAND.PUSH,
      COMMAND.POP
    ]
    commandObjects = commandTypes.map(
      (type, i) => new HVMCommand(type, segments[i], indexes[i]))
  })

  it('getCommandType method ', () => {
    const collectedTypes = commandObjects.map(
      command => command.getCommandType())
    expect(commandTypes).toEqual(collectedTypes)
  })

  it('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(segments)
  })

  it('getArg2 method ', () => {
    const collectedArg2s = commandObjects.map(command => command.getArg2())
    expect(collectedArg2s).toEqual(indexes)
  })

  it('toString method', () => {
    const stringifiedCommands = commandObjects.map(
      command => command.toString())
    const expectedStrings = commandTypes.map(
      (type, i) => `${type} ${segments[i]} ${indexes[i]}`
    )
    expect(stringifiedCommands).toEqual(expectedStrings)
  })
})

describe('function commands', () => {
  const functions = ['doThis', 'Class.doThat']
  const localAndArgs = [4, 6]
  beforeEach(() => {
    commandTypes = [
      COMMAND.FUNCTION,
      COMMAND.CALL
    ]
    commandObjects = commandTypes.map(
      (type, i) => new HVMCommand(type, functions[i], localAndArgs[i]))
  })

  it('getCommandType method ', () => {
    const collectedTypes = commandObjects.map(
      command => command.getCommandType())
    expect(commandTypes).toEqual(collectedTypes)
  })

  it('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(functions)
  })

  it('getArg2 method ', () => {
    const collectedArg2s = commandObjects.map(command => command.getArg2())
    expect(collectedArg2s).toEqual(localAndArgs)
  })

  it('toString method', () => {
    const stringifiedCommands = commandObjects.map(
      command => command.toString())
    const expectedStrings = commandTypes.map(
      (type, i) => `${type} ${functions[i]} ${localAndArgs[i]}`
    )
    expect(stringifiedCommands).toEqual(expectedStrings)
  })
})

describe('control flow commands', () => {
  const labels = ['heaven', 'paradise', 'joy']
  beforeEach(() => {
    commandTypes = [
      COMMAND.LABEL,
      COMMAND.GOTO,
      COMMAND.IF_GOTO
    ]
    commandObjects = commandTypes.map(
      (type, i) => new HVMCommand(type, labels[i]))
  })

  it('getCommandType method ', () => {
    const collectedTypes = commandObjects.map(
      command => command.getCommandType())
    expect(commandTypes).toEqual(collectedTypes)
  })

  it('getArg1 method ', () => {
    const collectedArg1s = commandObjects.map(command => command.getArg1())
    expect(collectedArg1s).toEqual(labels)
  })

  it('getArg2 method ', () => {
    commandObjects.forEach(command => {
      expect(() => command.getArg2()).toThrow(CommandException)
    })
  })

  it('toString method', () => {
    const stringifiedCommands = commandObjects.map(
      command => command.toString())
    const expectedStrings = commandTypes.map(
      (type, i) => `${type} ${labels[i]}`
    )
    expect(stringifiedCommands).toEqual(expectedStrings)
  })
})

describe('return command', () => {
  const returnCommandObj = new HVMCommand(COMMAND.RETURN)

  it('getCommandType method ', () => {
    const collectedType = returnCommandObj.getCommandType()
    expect(collectedType).toEqual(COMMAND.RETURN)
  })

  it('getArg1 method ', () => {
    expect(() => returnCommandObj.getArg1()).toThrow(CommandException)
  })

  it('getArg2 method ', () => {
    expect(() => returnCommandObj.getArg2()).toThrow(CommandException)
  })

  it('toString method', () => {
    const stringifiedCommand = returnCommandObj.toString()
    expect(stringifiedCommand).toEqual('return')
  })
})

describe('HVMCommand class', () => {
  it('should create instance: constructor method', () => {
    expect(1).toBe(1)
  })

  it('should set arg1: setArg1 method', () => {
    // correct usage
    let commandObj = new HVMCommand(COMMAND.PUSH)
    commandObj.setArg1('local')
    expect(commandObj.getArg1()).toBe('local')
    // incorrect segment name
    expect(() => commandObj.setArg1('whatever')).toThrow(CommandException)
    // incorrect command type
    commandObj = new HVMCommand(COMMAND.ADD)
    expect(() => commandObj.setArg1('whatever')).toThrow(CommandException)
    // incorrect arg1 type
    commandObj = new HVMCommand(COMMAND.PUSH)
    expect(() => commandObj.setArg1(1)).toThrow(CommandException)
  })

  it('should set arg2: setArg2 method', () => {
    expect(1).toBe(1)
  })

  it('should update number of args: updateNumberOfArgs method', () => {
    expect(1).toBe(1)
  })

  it('should set string arg: setStringArg method', () => {
    expect(1).toBe(1)
  })
})
