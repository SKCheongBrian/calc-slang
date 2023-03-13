/* tslint:disable:max-classes-per-file */
import { CharStreams, CommonTokenStream, ParserRuleContext } from 'antlr4ts'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { RuleNode } from 'antlr4ts/tree/RuleNode'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import _ from 'lodash'

import { CalcLexer } from '../lang/CalcLexer'
import {
  AdditionAssignmentContext,
  AdditionContext,
  ArgumentExpressionListContext,
  ArrayDeclaratorContext,
  AssignmentContext,
  AssignmentExpressionContext,
  BitwiseAndAssignmentContext,
  BitwiseAndContext,
  BitwiseComplementContext,
  BitwiseOrAssignmentContext,
  BitwiseOrContext,
  BitwiseXorAssignmentContext,
  BitwiseXorContext,
  BlockItemListContext,
  BreakStatementContext,
  CalcParser,
  CallContext,
  CaseStatementContext,
  CompoundStatementContext,
  ConditionalContext,
  ContinueStatementContext,
  DeclarationContext,
  DeclarationSpecifierContext,
  DeclaratorContext,
  DecrementPostfixContext,
  DecrementPrefixContext,
  DefaultStatementContext,
  DereferenceContext,
  DirectDeclaratorContext,
  DivisionAssignmentContext,
  DivisionContext,
  DoWhileStatementContext,
  EqualsContext,
  ExpressionContext,
  ExpressionStatementContext,
  FactorialContext,
  ForStatementContext,
  FunctionDeclaratorContext,
  FunctionDefinitionContext,
  GreaterThanOrEqualsContext,
  IdentifierContext,
  IfStatementContext,
  IncrementPostfixContext,
  IncrementPrefixContext,
  InitDeclaratorContext,
  InitDeclaratorListContext,
  InitializerContext,
  IterationStatementContext,
  JumpStatementContext,
  LabeledStatementContext,
  LessThanOrEqualsContext,
  LogicalAndContext,
  LogicalOrContext,
  ModuloAssignmentContext,
  ModuloContext,
  MultiplicationAssignmentContext,
  MultiplicationContext,
  NegativeContext,
  NotEqualsContext,
  NumberContext,
  ParameterDeclarationContext,
  ParameterListContext,
  ParenthesesContext,
  PointerContext,
  PositiveContext,
  ReferenceContext,
  ReturnStatementContext,
  SelectionStatementContext,
  ShiftLeftAssignmentContext,
  ShiftLeftContext,
  ShiftRightAssignmentContext,
  ShiftRightContext,
  StartContext,
  StatementContext,
  StrictlyGreaterThanContext,
  StrictlyLessThanContext,
  SubtractionAssignmentContext,
  SubtractionContext,
  SwitchCaseStatementContext,
  TypeSpecifierContext,
  VariableDeclaratorContext,
  WhileStatementContext
} from '../lang/CalcParser'
import { CalcVisitor } from '../lang/CalcVisitor'
// import * as cs from 'estree'
import * as cs from '../tree/ctree'
import { TypeChecker } from '../typechecker/typechecker'
import {
  Context,
  ErrorSeverity,
  ErrorType,
  FunctionType,
  Pointer,
  Primitive,
  SArray,
  SourceError,
  Type
} from '../types'
import { variableDeclarator } from '../utils/astCreator'
import { stripIndent } from '../utils/formatters'

export class DisallowedConstructError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public nodeType: string

  constructor(public node: cs.Node) {
    this.nodeType = this.formatNodeType(this.node.type)
  }

  get location() {
    return this.node.loc!
  }

  public explain() {
    return `${this.nodeType} are not allowed`
  }

  public elaborate() {
    return stripIndent`
      You are trying to use ${this.nodeType}, which is not allowed (yet).
    `
  }

  /**
   * Converts estree node.type into english
   * e.g. ThisExpression -> 'this' expressions
   *      Property -> Properties
   *      EmptyStatement -> Empty Statements
   */
  private formatNodeType(nodeType: string) {
    switch (nodeType) {
      case 'ThisExpression':
        return "'this' expressions"
      case 'Property':
        return 'Properties'
      default: {
        const words = nodeType.split(/(?=[A-Z])/)
        return words.map((word, i) => (i === 0 ? word : word.toLowerCase())).join(' ') + 's'
      }
    }
  }
}

export class FatalSyntaxError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: cs.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a syntax error in your program'
  }
}

export class FatalTypeError implements SourceError {
  public type = ErrorType.TYPE
  public severity = ErrorSeverity.ERROR
  public constructor(public location: cs.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a type error in your program'
  }
}

export class MissingSemicolonError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: cs.SourceLocation) {}

  public explain() {
    return 'Missing semicolon at the end of statement'
  }

  public elaborate() {
    return 'Every statement must be terminated by a semicolon.'
  }
}

export class TrailingCommaError implements SourceError {
  public type: ErrorType.SYNTAX
  public severity: ErrorSeverity.WARNING
  public constructor(public location: cs.SourceLocation) {}

  public explain() {
    return 'Trailing comma'
  }

  public elaborate() {
    return 'Please remove the trailing comma'
  }
}

function contextToLocation(ctx: ParserRuleContext): cs.SourceLocation {
  return {
    start: {
      line: ctx.start.line,
      column: ctx.start.charPositionInLine
    },
    end: {
      line: ctx.stop ? ctx.stop.line : ctx.start.line,
      column: ctx.stop ? ctx.stop.charPositionInLine : ctx.start.charPositionInLine
    }
  }
}

class StartGenerator implements CalcVisitor<cs.Statement[]> {
  typeGenerator: TypeGenerator

  constructor(typeGenerator: TypeGenerator) {
    this.typeGenerator = typeGenerator
  }

  visitStart?: ((ctx: StartContext) => cs.Statement[]) | undefined

  visit(tree: ParseTree): cs.Statement[] {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Statement[] {
    const stmtGenerator: StatementGenerator = new StatementGenerator(this.typeGenerator)
    const statements: cs.Statement[] = []
    for (let i = 0; i < node.childCount; i++) {
      statements.push(node.getChild(i).accept(stmtGenerator))
    }
    return statements
  }

  visitTerminal(node: TerminalNode): cs.Statement[] {
    throw new Error('Method not implemented.')
  }

  visitErrorNode(node: ErrorNode): cs.Statement[] {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class StatementGenerator implements CalcVisitor<cs.Statement> {
  typeGenerator: TypeGenerator

  constructor(typeGenerator: TypeGenerator) {
    this.typeGenerator = typeGenerator
  }

  // Function definition =======================================
  visitFunctionDefinition(ctx: FunctionDefinitionContext): cs.Statement {
    const dirDecl = ctx._decl._dirDecl as FunctionDeclaratorContext

    // Parse params
    const params: cs.Identifier[] = []
    const paramList = dirDecl._params
    this.typeGenerator.saveNameMap()
    if (paramList) {
      // Parse each param
      for (let i = 0; i < paramList.childCount; i += 2) {
        const paramDecl = paramList.getChild(i) as ParameterDeclarationContext

        // Parse datatype
        const pointers = paramDecl._decl._pointers
        let datatype: Type = _.cloneDeep(this.typeGenerator.resolveType(paramDecl._declSpec.text))
        if (pointers) {
          for (let i = 0; i < pointers.childCount; i++) {
            datatype = this.typeGenerator.pointer(datatype)
          }
        }

        // Parse declarator
        const dirDeclGenerator: DirectDeclaratorGenerator = new DirectDeclaratorGenerator(
          this.typeGenerator,
          datatype
        )
        const id: cs.Identifier = paramDecl._decl._dirDecl.accept(dirDeclGenerator)

        this.typeGenerator.addName(id.name, id.datatype!)
        params.push(id)
      }
    }

    // Parse body
    const body: cs.BlockStatement = this.visit(ctx._body) as cs.BlockStatement

    // Type logic
    const datatype: FunctionType = this.typeGenerator.functionType(
      params.map(p => p.datatype!),
      body.datatype!
    )
    this.typeGenerator.addFunction(dirDecl._id.text!, datatype)

    // Parse id
    const id: cs.Identifier = {
      type: 'Identifier',
      name: dirDecl._id.text as string,
      datatype
    }

    this.typeGenerator.restoreNameMap()
    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body,
      datatype
    }
  }

  // Compound statement =======================================
  visitCompoundStatement(ctx: CompoundStatementContext): cs.Statement {
    const startGenerator: StartGenerator = new StartGenerator(this.typeGenerator)
    this.typeGenerator.saveNameMap()
    const body = ctx._blockItems?.accept(startGenerator) ?? []
    this.typeGenerator.restoreNameMap()
    return {
      type: 'BlockStatement',
      body,
      datatype: body.length !== 0 ? body[body.length - 1].datatype : this.typeGenerator.void()
    }
  }

  // Declaration =======================================
  visitDeclaration(ctx: DeclarationContext): cs.Statement {
    const generator: DeclarationGenerator = new DeclarationGenerator(this.typeGenerator)
    return ctx.accept(generator)
  }

  // Expression statement =======================================
  visitExpressionStatement(ctx: ExpressionStatementContext): cs.Statement {
    const generator: ExpressionStatementGenerator = new ExpressionStatementGenerator(
      this.typeGenerator
    )
    return ctx.accept(generator)
  }

  // Selection statements =======================================

  visitIfStatement(ctx: IfStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    return {
      type: 'IfStatement',
      test: ctx._test.accept(exprGenerator),
      consequent: this.visit(ctx._cons),
      alternate: ctx._alt ? this.visit(ctx._alt) : undefined
      // TODO datatype:
    }
  }

  // Iteration statements =======================================

  visitWhileStatement(ctx: WhileStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    const body = this.visit(ctx._body)
    return {
      type: 'WhileStatement',
      test: ctx._test.accept(exprGenerator),
      body,
      datatype: body.datatype
    }
  }

  visitDoWhileStatement(ctx: DoWhileStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    const body = this.visit(ctx._body)
    return {
      type: 'DoWhileStatement',
      body,
      test: ctx._test.accept(exprGenerator),
      datatype: body.datatype
    }
  }

  // Jump statements =======================================

  visitContinueStatement(ctx: ContinueStatementContext): cs.Statement {
    return {
      type: 'ContinueStatement',
      datatype: this.typeGenerator.void()
    }
  }

  visitBreakStatement(ctx: BreakStatementContext): cs.Statement {
    return {
      type: 'BreakStatement',
      datatype: this.typeGenerator.void()
    }
  }

  visitReturnStatement(ctx: ReturnStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    const argument = ctx._argument?.accept(exprGenerator)
    return {
      type: 'ReturnStatement',
      argument,
      datatype: ctx._argument ? argument.datatype : this.typeGenerator.void()
    }
  }

  // ==============================================================

  visitStatement?: ((ctx: StatementContext) => cs.Statement) | undefined

  visit(tree: ParseTree): cs.Statement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Statement {
    // First child is the statement
    return this.visit(node.getChild(0))
  }

  visitTerminal(node: TerminalNode): cs.Statement {
    throw new Error('Method not implemented.')
  }

  visitErrorNode(node: ErrorNode): cs.Statement {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class DeclarationGenerator implements CalcVisitor<cs.Declaration> {
  typeGenerator: TypeGenerator

  constructor(typeGenerator: TypeGenerator) {
    this.typeGenerator = typeGenerator
  }

  visitDeclaration(ctx: DeclarationContext): cs.Declaration {
    const initDecls = ctx._initDecls
    const datatype = this.typeGenerator.resolveType(ctx._declSpec.text)
    const initDeclGenerator = new InitDeclaratorGenerator(this.typeGenerator, datatype)
    const varDeclarators: cs.VariableDeclarator[] = []
    for (let i = 0; i < initDecls.childCount; i++) {
      const child: ParseTree = initDecls.getChild(i)
      if (child instanceof TerminalNode) continue
      varDeclarators.push(initDecls.getChild(i).accept(initDeclGenerator))
    }
    return {
      type: 'VariableDeclaration',
      declarations: varDeclarators,
      kind: 'let',
      datatype: this.typeGenerator.void()
    }
  }

  visit(tree: ParseTree): cs.Declaration {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Declaration {
    throw new Error('Method not implemented.')
  }

  visitTerminal(node: TerminalNode): cs.Declaration {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): cs.Declaration {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class InitDeclaratorGenerator implements CalcVisitor<cs.VariableDeclarator> {
  typeGenerator: TypeGenerator
  datatype: Type

  constructor(typeGenerator: TypeGenerator, datatype: Type) {
    this.typeGenerator = typeGenerator
    this.datatype = datatype
  }

  visitInitDeclarator(ctx: InitDeclaratorContext): cs.VariableDeclarator {
    // Parse datatype
    const pointers = ctx._decl._pointers
    let datatype = _.cloneDeep(this.datatype)
    if (pointers) {
      for (let i = 0; i < pointers.childCount; i++) {
        datatype = this.typeGenerator.pointer(datatype)
      }
    }

    // Parse declarator
    const dirDeclGenerator: DirectDeclaratorGenerator = new DirectDeclaratorGenerator(
      this.typeGenerator,
      datatype
    )
    const id: cs.Identifier = ctx._decl._dirDecl.accept(dirDeclGenerator)

    // Parse init
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    const expression: cs.Expression = ctx._init?._assignExpr._expr.accept(exprGenerator)

    this.typeGenerator.addName(id.name, id.datatype!)
    return {
      type: 'VariableDeclarator',
      id,
      init: expression
    }
  }

  visit(tree: ParseTree): cs.VariableDeclarator {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.VariableDeclarator {
    throw new Error('Method not implemented.')
  }

  visitTerminal(node: TerminalNode): cs.VariableDeclarator {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): cs.VariableDeclarator {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class DirectDeclaratorGenerator implements CalcVisitor<cs.Identifier> {
  typeGenerator: TypeGenerator
  datatype: Type

  constructor(typeGenerator: TypeGenerator, datatype: Type) {
    this.typeGenerator = typeGenerator
    this.datatype = datatype
  }

  visitVariableDeclarator(ctx: VariableDeclaratorContext): cs.Identifier {
    const name: string = ctx._id.text as string
    return {
      type: 'Identifier',
      name,
      datatype: this.datatype
    }
  }

  visitFunctionDeclarator?: ((ctx: FunctionDeclaratorContext) => cs.Identifier) | undefined

  visitArrayDeclarator(ctx: ArrayDeclaratorContext): cs.Identifier {
    const name: string = ctx._id.text as string
    const arrLength: number = Math.floor((ctx.childCount - 1) / 2)
    let datatype = this.datatype
    for (let i = 0; i < arrLength; i++) {
      datatype = this.typeGenerator.array(datatype)
    }
    return {
      type: 'Identifier',
      name,
      datatype
    }
  }

  visitDirectDeclarator?: ((ctx: DirectDeclaratorContext) => cs.Identifier) | undefined

  visit(tree: ParseTree): cs.Identifier {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Identifier {
    throw new Error('Method not implemented.')
  }

  visitTerminal(node: TerminalNode): cs.Identifier {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): cs.Identifier {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class ExpressionStatementGenerator implements CalcVisitor<cs.ExpressionStatement> {
  typeGenerator: TypeGenerator

  constructor(typeGenerator: TypeGenerator) {
    this.typeGenerator = typeGenerator
  }

  visitExpressionStatement?:
    | ((ctx: ExpressionStatementContext) => cs.ExpressionStatement)
    | undefined

  visit(tree: ParseTree): cs.ExpressionStatement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.ExpressionStatement {
    const generator: ExpressionGenerator = new ExpressionGenerator(this.typeGenerator)
    // First child is an expression
    const expression: cs.Expression = node.getChild(0).accept(generator)
    return {
      type: 'ExpressionStatement',
      expression,
      datatype: expression.datatype
    }
  }

  visitTerminal(node: TerminalNode): cs.ExpressionStatement {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): cs.ExpressionStatement {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class ExpressionGenerator implements CalcVisitor<cs.Expression> {
  typeGenerator: TypeGenerator

  constructor(typeGenerator: TypeGenerator) {
    this.typeGenerator = typeGenerator
  }

  visitNumber(ctx: NumberContext): cs.Expression {
    return {
      type: 'Literal',
      value: parseInt(ctx.text),
      raw: ctx.text,
      datatype: this.typeGenerator.visitNumber(ctx),
      loc: contextToLocation(ctx)
    }
  }

  visitIdentifier(ctx: IdentifierContext): cs.Expression {
    return {
      type: 'Identifier',
      name: ctx.text,
      datatype: this.typeGenerator.visitIdentifier(ctx),
      loc: contextToLocation(ctx)
    }
  }

  visitParentheses(ctx: ParenthesesContext): cs.Expression {
    return this.visit(ctx.expression())
  }

  // Call expression =======================================

  visitCall(ctx: CallContext): cs.Expression {
    // Parse callee
    const callee: cs.Identifier = {
      type: 'Identifier',
      name: ctx._id.text as string,
      datatype: this.typeGenerator.getTypeFromFunction(ctx._id.text)
    }

    // Parse args
    const args: cs.Expression[] = []
    const argsList = ctx._args
    if (argsList) {
      for (let i = 0; i < argsList.childCount; i += 2) {
        args.push(this.visit(argsList.getChild(i)))
      }
    }

    return {
      type: 'CallExpression',
      optional: false,
      callee,
      arguments: args,
      datatype: this.typeGenerator.getTypeFromFunction(ctx._id.text).returnType,
      loc: contextToLocation(ctx)
    }
  }

  // Update expressions =======================================

  visitIncrementPrefix(ctx: IncrementPrefixContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPrefix(ctx: DecrementPrefixContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitIncrementPostfix(ctx: IncrementPostfixContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument,
      datatype: argument.datatype,
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPostfix(ctx: DecrementPostfixContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument,
      datatype: argument.datatype,
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  // Pointer expressions =======================================

  visitDereference(ctx: DereferenceContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '*',
      argument,
      datatype: (argument.datatype as Pointer).type,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitReference(ctx: ReferenceContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '&',
      argument,
      datatype: this.typeGenerator.pointer(argument.datatype!),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) arithmetic expressions =======================================

  visitPositive(ctx: PositiveContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '+',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitNegative(ctx: NegativeContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '-',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) bitwise expression =======================================

  visitBitwiseComplement(ctx: BitwiseComplementContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '~',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) logical expression =======================================

  visitFactorial(ctx: FactorialContext): cs.Expression {
    const argument = this.visit(ctx._argument)
    return {
      type: 'UnaryExpression',
      operator: '!',
      argument,
      datatype: argument.datatype,
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) arithmetic expressions =======================================

  visitMultiplication(ctx: MultiplicationContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '*',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitDivision(ctx: DivisionContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '/',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitModulo(ctx: ModuloContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '%',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitAddition(ctx: AdditionContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '+',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtraction(ctx: SubtractionContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '-',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // Shift expressions =====xd==================================

  visitShiftLeft(ctx: ShiftLeftContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '<<',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftRight(ctx: ShiftRightContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '>>',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // Relation expressions =======================================

  visitEquals(ctx: EqualsContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '==',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitNotEquals(ctx: NotEqualsContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '!=',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyLessThan(ctx: StrictlyLessThanContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '<',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitLessThanOrEquals(ctx: LessThanOrEqualsContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '<=',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyGreaterThan(ctx: StrictlyGreaterThanContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '>',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitGreaterThanOrEquals(ctx: GreaterThanOrEqualsContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '>=',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) bitwise expressions =======================================

  visitBitwiseOr(ctx: BitwiseOrContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '|',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseXor(ctx: BitwiseXorContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '^',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseAnd(ctx: BitwiseAndContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'BinaryExpression',
      operator: '&',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) logical expressions =======================================

  visitLogicalAnd(ctx: LogicalAndContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'LogicalExpression',
      operator: '&&',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  visitLogicalOr(ctx: LogicalOrContext): cs.Expression {
    const left = this.visit(ctx._left)
    const right = this.visit(ctx._right)
    return {
      type: 'LogicalExpression',
      operator: '||',
      left,
      right,
      datatype: this.typeGenerator.resolveBinaryExpression(left.datatype, right.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // Conditional expression =======================================

  visitConditional(ctx: ConditionalContext): cs.Expression {
    const consequent = this.visit(ctx._cons)
    const alternate = this.visit(ctx._alt)
    return {
      type: 'ConditionalExpression',
      test: this.visit(ctx._test),
      consequent,
      alternate,
      datatype: this.typeGenerator.resolveBinaryExpression(consequent.datatype, alternate.datatype),
      loc: contextToLocation(ctx)
    }
  }

  // Assignment expressions =======================================

  visitAssignment(ctx: AssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitAdditionAssignment(ctx: AdditionAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '+=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtractionAssignment(ctx: SubtractionAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '-=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitMultiplicationAssignment(ctx: MultiplicationAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '*=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitDivisionAssignment(ctx: DivisionAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '/=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitModuloAssignment(ctx: ModuloAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '%=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftLeftAssignment(ctx: ShiftLeftAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '<<=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftRightAssignment(ctx: ShiftRightAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '>>=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseOrAssignment(ctx: BitwiseOrAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '|=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseXorAssignment(ctx: BitwiseXorAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '^=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseAndAssignment(ctx: BitwiseAndAssignmentContext): cs.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '&=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string,
        datatype: this.typeGenerator.getTypeFromName(ctx._left.text)
      },
      right: this.visit(ctx._right),
      datatype: this.typeGenerator.getTypeFromName(ctx._left.text),
      loc: contextToLocation(ctx)
    }
  }

  // ==============================================================

  visitExpression?: ((ctx: ExpressionContext) => cs.Expression) | undefined

  visit(tree: ParseTree): cs.Expression {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Expression {
    const expressions: cs.Expression[] = []
    for (let i = 0; i < node.childCount; i++) {
      expressions.push(node.getChild(i).accept(this))
    }
    return {
      type: 'SequenceExpression',
      expressions
    }
  }

  visitTerminal(node: TerminalNode): cs.Expression {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): cs.Expression {
    throw new FatalSyntaxError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid syntax ${node.text}`
    )
  }
}

class TypeGenerator implements CalcVisitor<Type> {
  prevNameMaps: { [name: string]: Type }[] = []
  currNameMap: { [name: string]: Type } = {}
  functionMap: { [name: string]: FunctionType } = {}

  int(): Primitive {
    return {
      kind: 'primitive',
      name: 'int'
    }
  }

  void(): Primitive {
    return {
      kind: 'primitive',
      name: 'void'
    }
  }

  pointer(type: Type): Pointer {
    return {
      kind: 'pointer',
      type: type
    }
  }

  functionType(parameterTypes: Type[], returnType: Type): FunctionType {
    return {
      kind: 'function',
      parameterTypes,
      returnType
    }
  }

  array(elementType: Type): SArray {
    return {
      kind: 'array',
      elementType
    }
  }

  saveNameMap(): void {
    this.prevNameMaps.push(_.cloneDeep(this.currNameMap))
  }

  restoreNameMap(): void {
    this.currNameMap = this.prevNameMaps.pop()!
  }

  addName(name: string, type: Type): void {
    this.currNameMap[name] = type
  }

  addFunction(name: string, type: FunctionType): void {
    this.functionMap[name] = type
  }

  getTypeFromName(name: string | undefined): Type {
    if (name) return this.currNameMap[name]
    throw Error('Type error')
  }

  getTypeFromFunction(name: string | undefined): FunctionType {
    if (name) return this.functionMap[name]
    throw Error('Type error')
  }

  resolveType(str: string | undefined): Type {
    switch (str) {
      case 'int':
        return {
          kind: 'primitive',
          name: 'int'
        }
      case 'void':
        return {
          kind: 'primitive',
          name: 'void'
        }
    }
    throw new Error('Type error')
  }

  resolveBinaryExpression(left: Type | undefined, right: Type | undefined): Type | undefined {
    if (TypeChecker.isEqual(left, right)) {
      return left
    }
    throw new Error('Type error')
  }

  visitNumber(ctx: NumberContext): Type {
    return this.int()
  }

  visitIdentifier(ctx: IdentifierContext): Type {
    return this.currNameMap[ctx.text]
  }

  visitParentheses?: ((ctx: ParenthesesContext) => Type) | undefined
  visitCall?: ((ctx: CallContext) => Type) | undefined
  visitIncrementPostfix?: ((ctx: IncrementPostfixContext) => Type) | undefined
  visitDecrementPostfix?: ((ctx: DecrementPostfixContext) => Type) | undefined
  visitIncrementPrefix?: ((ctx: IncrementPrefixContext) => Type) | undefined
  visitDecrementPrefix?: ((ctx: DecrementPrefixContext) => Type) | undefined
  visitPositive?: ((ctx: PositiveContext) => Type) | undefined
  visitNegative?: ((ctx: NegativeContext) => Type) | undefined
  visitBitwiseComplement?: ((ctx: BitwiseComplementContext) => Type) | undefined
  visitFactorial?: ((ctx: FactorialContext) => Type) | undefined
  visitMultiplication?: ((ctx: MultiplicationContext) => Type) | undefined
  visitDivision?: ((ctx: DivisionContext) => Type) | undefined
  visitModulo?: ((ctx: ModuloContext) => Type) | undefined
  visitAddition?: ((ctx: AdditionContext) => Type) | undefined
  visitSubtraction?: ((ctx: SubtractionContext) => Type) | undefined
  visitShiftLeft?: ((ctx: ShiftLeftContext) => Type) | undefined
  visitShiftRight?: ((ctx: ShiftRightContext) => Type) | undefined
  visitEquals?: ((ctx: EqualsContext) => Type) | undefined
  visitNotEquals?: ((ctx: NotEqualsContext) => Type) | undefined
  visitStrictlyLessThan?: ((ctx: StrictlyLessThanContext) => Type) | undefined
  visitLessThanOrEquals?: ((ctx: LessThanOrEqualsContext) => Type) | undefined
  visitStrictlyGreaterThan?: ((ctx: StrictlyGreaterThanContext) => Type) | undefined
  visitGreaterThanOrEquals?: ((ctx: GreaterThanOrEqualsContext) => Type) | undefined
  visitBitwiseOr?: ((ctx: BitwiseOrContext) => Type) | undefined
  visitBitwiseXor?: ((ctx: BitwiseXorContext) => Type) | undefined
  visitBitwiseAnd?: ((ctx: BitwiseAndContext) => Type) | undefined
  visitLogicalOr?: ((ctx: LogicalOrContext) => Type) | undefined
  visitLogicalAnd?: ((ctx: LogicalAndContext) => Type) | undefined
  visitConditional?: ((ctx: ConditionalContext) => Type) | undefined
  visitAssignment?: ((ctx: AssignmentContext) => Type) | undefined
  visitAdditionAssignment?: ((ctx: AdditionAssignmentContext) => Type) | undefined
  visitSubtractionAssignment?: ((ctx: SubtractionAssignmentContext) => Type) | undefined
  visitMultiplicationAssignment?: ((ctx: MultiplicationAssignmentContext) => Type) | undefined
  visitDivisionAssignment?: ((ctx: DivisionAssignmentContext) => Type) | undefined
  visitModuloAssignment?: ((ctx: ModuloAssignmentContext) => Type) | undefined
  visitShiftLeftAssignment?: ((ctx: ShiftLeftAssignmentContext) => Type) | undefined
  visitShiftRightAssignment?: ((ctx: ShiftRightAssignmentContext) => Type) | undefined
  visitBitwiseOrAssignment?: ((ctx: BitwiseOrAssignmentContext) => Type) | undefined
  visitBitwiseXorAssignment?: ((ctx: BitwiseXorAssignmentContext) => Type) | undefined
  visitBitwiseAndAssignment?: ((ctx: BitwiseAndAssignmentContext) => Type) | undefined
  visitWhileStatement?: ((ctx: WhileStatementContext) => Type) | undefined
  visitDoWhileStatement?: ((ctx: DoWhileStatementContext) => Type) | undefined
  visitForStatement?: ((ctx: ForStatementContext) => Type) | undefined
  visitIfStatement?: ((ctx: IfStatementContext) => Type) | undefined
  visitSwitchCaseStatement?: ((ctx: SwitchCaseStatementContext) => Type) | undefined
  visitCaseStatement?: ((ctx: CaseStatementContext) => Type) | undefined
  visitDefaultStatement?: ((ctx: DefaultStatementContext) => Type) | undefined
  visitContinueStatement?: ((ctx: ContinueStatementContext) => Type) | undefined
  visitBreakStatement?: ((ctx: BreakStatementContext) => Type) | undefined
  visitReturnStatement?: ((ctx: ReturnStatementContext) => Type) | undefined
  visitStart?: ((ctx: StartContext) => Type) | undefined
  visitStatement?: ((ctx: StatementContext) => Type) | undefined
  visitFunctionDefinition?: ((ctx: FunctionDefinitionContext) => Type) | undefined
  visitParameterList?: ((ctx: ParameterListContext) => Type) | undefined
  visitParameterDeclaration?: ((ctx: ParameterDeclarationContext) => Type) | undefined
  visitLabeledStatement?: ((ctx: LabeledStatementContext) => Type) | undefined
  visitCompoundStatement?: ((ctx: CompoundStatementContext) => Type) | undefined
  visitBlockItemList?: ((ctx: BlockItemListContext) => Type) | undefined
  visitDeclaration?: ((ctx: DeclarationContext) => Type) | undefined
  visitDeclarationSpecifier?: ((ctx: DeclarationSpecifierContext) => Type) | undefined
  visitTypeSpecifier?: ((ctx: TypeSpecifierContext) => Type) | undefined
  visitInitDeclaratorList?: ((ctx: InitDeclaratorListContext) => Type) | undefined
  visitInitDeclarator?: ((ctx: InitDeclaratorContext) => Type) | undefined
  visitDeclarator?: ((ctx: DeclaratorContext) => Type) | undefined
  visitDirectDeclarator?: ((ctx: DirectDeclaratorContext) => Type) | undefined
  visitInitializer?: ((ctx: InitializerContext) => Type) | undefined
  visitAssignmentExpression?: ((ctx: AssignmentExpressionContext) => Type) | undefined
  visitExpressionStatement?: ((ctx: ExpressionStatementContext) => Type) | undefined
  visitExpression?: ((ctx: ExpressionContext) => Type) | undefined
  visitArgumentExpressionList?: ((ctx: ArgumentExpressionListContext) => Type) | undefined
  visitSelectionStatement?: ((ctx: SelectionStatementContext) => Type) | undefined
  visitIterationStatement?: ((ctx: IterationStatementContext) => Type) | undefined
  visitJumpStatement?: ((ctx: JumpStatementContext) => Type) | undefined

  visit(tree: ParseTree): Type {
    throw new Error('Method not implemented.')
  }

  visitChildren(node: RuleNode): Type {
    throw new Error('Method not implemented.')
  }

  visitTerminal(node: TerminalNode): Type {
    throw new Error('Method not implemented.')
  }

  visitErrorNode(node: ErrorNode): Type {
    throw new FatalTypeError(
      {
        start: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine
        },
        end: {
          line: node.symbol.line,
          column: node.symbol.charPositionInLine + 1
        }
      },
      `invalid type ${node.text}`
    )
  }
}

function convertStart(start: StartContext): Array<cs.Statement> {
  const generator = new StartGenerator(new TypeGenerator())
  return start.accept(generator)
}

function convertSource(start: StartContext): cs.Program {
  return {
    type: 'Program',
    sourceType: 'script',
    body: convertStart(start)
  }
}

export function parse(source: string, context: Context) {
  let program: cs.Program | undefined

  if (context.variant === 'calc') {
    const inputStream = CharStreams.fromString(source)
    const lexer = new CalcLexer(inputStream)
    const tokenStream = new CommonTokenStream(lexer)
    const parser = new CalcParser(tokenStream)
    parser.buildParseTree = true
    try {
      const tree = parser.start()
      program = convertSource(tree)
    } catch (error) {
      if (error instanceof FatalSyntaxError || error instanceof FatalTypeError) {
        context.errors.push(error)
      } else {
        throw error
      }
    }
    const hasErrors = context.errors.find(m => m.severity === ErrorSeverity.ERROR)
    if (program && !hasErrors) {
      return program
    } else {
      return undefined
    }
  } else {
    return undefined
  }
}
