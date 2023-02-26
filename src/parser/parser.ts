/* tslint:disable:max-classes-per-file */
import { CharStreams, CommonTokenStream, ParserRuleContext } from 'antlr4ts'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { RuleNode } from 'antlr4ts/tree/RuleNode'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import * as es from 'estree'

import { CalcLexer } from '../lang/CalcLexer'
import {
  AdditionAssignmentContext,
  AdditionContext,
  AssignmentContext,
  BitwiseAndAssignmentContext,
  BitwiseAndContext,
  BitwiseComplementContext,
  BitwiseOrAssignmentContext,
  BitwiseOrContext,
  BitwiseXorAssignmentContext,
  BitwiseXorContext,
  BreakStatementContext,
  CalcParser,
  CompoundStatementContext,
  ConditionalContext,
  ContinueStatementContext,
  DeclarationContext,
  DecrementPostfixContext,
  DecrementPrefixContext,
  DirectDeclaratorContext,
  DivisionAssignmentContext,
  DivisionContext,
  DoWhileStatementContext,
  EqualsContext,
  ExpressionContext,
  ExpressionStatementContext,
  FactorialContext,
  FunctionDefinitionContext,
  GreaterThanOrEqualsContext,
  IdentifierContext,
  IfStatementContext,
  IncrementPostfixContext,
  IncrementPrefixContext,
  InitDeclaratorContext,
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
  ParenthesesContext,
  PositiveContext,
  ReturnStatementContext,
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
  WhileStatementContext
} from '../lang/CalcParser'
import { CalcVisitor } from '../lang/CalcVisitor'
import { Context, ErrorSeverity, ErrorType, SourceError } from '../types'
import { variableDeclarator } from '../utils/astCreator'
import { stripIndent } from '../utils/formatters'

export class DisallowedConstructError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public nodeType: string

  constructor(public node: es.Node) {
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
  public constructor(public location: es.SourceLocation, public message: string) {}

  public explain() {
    return this.message
  }

  public elaborate() {
    return 'There is a syntax error in your program'
  }
}

export class MissingSemicolonError implements SourceError {
  public type = ErrorType.SYNTAX
  public severity = ErrorSeverity.ERROR
  public constructor(public location: es.SourceLocation) {}

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
  public constructor(public location: es.SourceLocation) {}

  public explain() {
    return 'Trailing comma'
  }

  public elaborate() {
    return 'Please remove the trailing comma'
  }
}

function contextToLocation(ctx: ParserRuleContext): es.SourceLocation {
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

class StartGenerator implements CalcVisitor<es.Statement[]> {
  visitStart?: ((ctx: StartContext) => es.Statement[]) | undefined

  visit(tree: ParseTree): es.Statement[] {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Statement[] {
    const stmtGenerator: StatementGenerator = new StatementGenerator()
    const statements: es.Statement[] = []
    for (let i = 0; i < node.childCount; i++) {
      statements.push(node.getChild(i).accept(stmtGenerator))
    }
    return statements
  }

  visitTerminal(node: TerminalNode): es.Statement[] {
    throw new Error('Method not implemented.')
  }

  visitErrorNode(node: ErrorNode): es.Statement[] {
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

class StatementGenerator implements CalcVisitor<es.Statement> {
  // Function definition =======================================
  visitFunctionDefinition(ctx: FunctionDefinitionContext): es.Statement {
    const dirDecl: DirectDeclaratorContext = ctx._decl._dirDecl

    // Parse id
    const id: es.Identifier = {
      type: 'Identifier',
      name: dirDecl._dirDecl._id.text as string
    }

    // Parse params
    const params: es.Pattern[] = []
    const paramList = dirDecl._params
    if (paramList) {
      for (let i = 0; i < paramList.childCount; i += 2) {
        const paramDecl = paramList.getChild(i) as ParameterDeclarationContext
        const paramId: es.Identifier = {
          type: 'Identifier',
          name: paramDecl._decl._dirDecl._id.text as string
        }
        params.push(paramId)
      }
    }

    // Parse body
    const body: es.BlockStatement = this.visit(ctx._body) as es.BlockStatement

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body
    }
  }

  // Compound statement =======================================
  visitCompoundStatement(ctx: CompoundStatementContext): es.Statement {
    const startGenerator: StartGenerator = new StartGenerator()
    return {
      type: 'BlockStatement',
      body: ctx._blockItems?.accept(startGenerator) ?? []
    }
  }

  // Declaration =======================================
  visitDeclaration(ctx: DeclarationContext): es.Statement {
    const generator: DeclarationGenerator = new DeclarationGenerator()
    return ctx.accept(generator)
  }

  // Expression statement =======================================
  visitExpressionStatement(ctx: ExpressionStatementContext): es.Statement {
    const generator: ExpressionStatementGenerator = new ExpressionStatementGenerator()
    return ctx.accept(generator)
  }

  // Selection statements =======================================

  visitIfStatement(ctx: IfStatementContext): es.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'IfStatement',
      test: ctx._test.accept(exprGenerator),
      consequent: this.visit(ctx._cons),
      alternate: ctx._alt ? this.visit(ctx._alt) : undefined
    }
  }

  // Iteration statements =======================================

  visitWhileStatement(ctx: WhileStatementContext): es.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'WhileStatement',
      test: ctx._test.accept(exprGenerator),
      body: this.visit(ctx._body)
    }
  }

  visitDoWhileStatement(ctx: DoWhileStatementContext): es.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'DoWhileStatement',
      body: this.visit(ctx._body),
      test: ctx._test.accept(exprGenerator)
    }
  }

  // Jump statements =======================================

  visitContinueStatement(ctx: ContinueStatementContext): es.Statement {
    return {
      type: 'ContinueStatement'
    }
  }

  visitBreakStatement(ctx: BreakStatementContext): es.Statement {
    return {
      type: 'BreakStatement'
    }
  }

  visitReturnStatement(ctx: ReturnStatementContext): es.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'ReturnStatement',
      argument: ctx._argument?.accept(exprGenerator)
    }
  }

  // ==============================================================

  visitStatement?: ((ctx: StatementContext) => es.Statement) | undefined

  visit(tree: ParseTree): es.Statement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Statement {
    // First child is the statement
    return this.visit(node.getChild(0))
  }

  visitTerminal(node: TerminalNode): es.Statement {
    throw new Error('Method not implemented.')
  }

  visitErrorNode(node: ErrorNode): es.Statement {
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

class DeclarationGenerator implements CalcVisitor<es.Declaration> {
  visitDeclaration(ctx: DeclarationContext): es.Declaration {
    const initDecls = ctx._initDecls
    const initDeclGenerator = new InitDeclaratorGenerator()
    const varDeclarators: es.VariableDeclarator[] = []
    for (let i = 0; i < initDecls.childCount; i++) {
      const child: ParseTree = initDecls.getChild(i)
      if (child instanceof TerminalNode) continue
      varDeclarators.push(initDecls.getChild(i).accept(initDeclGenerator))
    }
    return {
      type: 'VariableDeclaration',
      declarations: varDeclarators,
      kind: 'let'
    }
  }

  visit(tree: ParseTree): es.Declaration {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Declaration {
    throw new Error('Method not implemented.')
  }

  visitTerminal(node: TerminalNode): es.Declaration {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.Declaration {
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

class InitDeclaratorGenerator implements CalcVisitor<es.VariableDeclarator> {
  visitInitDeclarator?: ((ctx: InitDeclaratorContext) => es.VariableDeclarator) | undefined

  visit(tree: ParseTree): es.VariableDeclarator {
    return tree.accept(this)
  }

  visitChildren(node: InitDeclaratorContext): es.VariableDeclarator {
    const name: string = node._decl._dirDecl._id.text as string
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    const expression: es.Expression = node._init?._assignExpr._expr.accept(exprGenerator)
    return {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name
      },
      init: expression
    }
  }

  visitTerminal(node: TerminalNode): es.VariableDeclarator {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.VariableDeclarator {
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

class ExpressionStatementGenerator implements CalcVisitor<es.ExpressionStatement> {
  visitExpressioStatement?:
    | ((ctx: ExpressionStatementContext) => es.ExpressionStatement)
    | undefined

  visit(tree: ParseTree): es.ExpressionStatement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.ExpressionStatement {
    const generator: ExpressionGenerator = new ExpressionGenerator()
    // First child is an expression
    const expression: es.Expression = node.getChild(0).accept(generator)
    return {
      type: 'ExpressionStatement',
      expression
    }
  }

  visitTerminal(node: TerminalNode): es.ExpressionStatement {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.ExpressionStatement {
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

class ExpressionGenerator implements CalcVisitor<es.Expression> {
  visitNumber(ctx: NumberContext): es.Expression {
    return {
      type: 'Literal',
      value: parseInt(ctx.text),
      raw: ctx.text,
      loc: contextToLocation(ctx)
    }
  }

  visitIdentifier(ctx: IdentifierContext): es.Expression {
    return {
      type: 'Identifier',
      name: ctx.text,
      loc: contextToLocation(ctx)
    }
  }

  visitParentheses(ctx: ParenthesesContext): es.Expression {
    return this.visit(ctx.expression())
  }

  // Update expressions =======================================

  visitIncrementPrefix(ctx: IncrementPrefixContext): es.Expression {
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPrefix(ctx: DecrementPrefixContext): es.Expression {
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitIncrementPostfix(ctx: IncrementPostfixContext): es.Expression {
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument: this.visit(ctx._argument),
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPostfix(ctx: DecrementPostfixContext): es.Expression {
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument: this.visit(ctx._argument),
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) arithmetic expressions =======================================

  visitPositive(ctx: PositiveContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '+',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitNegative(ctx: NegativeContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '-',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) bitwise expression =======================================

  visitBitwiseComplement(ctx: BitwiseComplementContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '~',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) logical expression =======================================

  visitFactorial(ctx: FactorialContext): es.Expression {
    return {
      type: 'UnaryExpression',
      operator: '!',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) arithmetic expressions =======================================

  visitMultiplication(ctx: MultiplicationContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '*',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitDivision(ctx: DivisionContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '/',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitModulo(ctx: ModuloContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '%',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitAddition(ctx: AdditionContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '+',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtraction(ctx: SubtractionContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '-',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Shift expressions =======================================

  visitShiftLeft(ctx: ShiftLeftContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<<',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftRight(ctx: ShiftRightContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>>',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Relation expressions =======================================

  visitEquals(ctx: EqualsContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '==',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitNotEquals(ctx: NotEqualsContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '!=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyLessThan(ctx: StrictlyLessThanContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLessThanOrEquals(ctx: LessThanOrEqualsContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyGreaterThan(ctx: StrictlyGreaterThanContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitGreaterThanOrEquals(ctx: GreaterThanOrEqualsContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) bitwise expressions =======================================

  visitBitwiseOr(ctx: BitwiseOrContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '|',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseXor(ctx: BitwiseXorContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '^',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseAnd(ctx: BitwiseAndContext): es.Expression {
    return {
      type: 'BinaryExpression',
      operator: '&',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) logical expressions =======================================

  visitLogicalAnd(ctx: LogicalAndContext): es.Expression {
    return {
      type: 'LogicalExpression',
      operator: '&&',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLogicalOr(ctx: LogicalOrContext): es.Expression {
    return {
      type: 'LogicalExpression',
      operator: '||',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Conditional expression =======================================

  visitConditional(ctx: ConditionalContext): es.Expression {
    return {
      type: 'ConditionalExpression',
      test: this.visit(ctx._test),
      consequent: this.visit(ctx._cons),
      alternate: this.visit(ctx._alt),
      loc: contextToLocation(ctx)
    }
  }

  // Assignment expressions =======================================

  visitAssignment(ctx: AssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitAdditionAssignment(ctx: AdditionAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '+=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtractionAssignment(ctx: SubtractionAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '-=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitMultiplicationAssignment(ctx: MultiplicationAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '*=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitDivisionAssignment(ctx: DivisionAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '/=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitModuloAssignment(ctx: ModuloAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '%=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftLeftAssignment(ctx: ShiftLeftAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '<<=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftRightAssignment(ctx: ShiftRightAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '>>=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseOrAssignment(ctx: BitwiseOrAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '|=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseXorAssignment(ctx: BitwiseXorAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '^=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseAndAssignment(ctx: BitwiseAndAssignmentContext): es.Expression {
    return {
      type: 'AssignmentExpression',
      operator: '&=',
      left: {
        type: 'Identifier',
        name: ctx._left.text as string
      },
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // ==============================================================

  visitExpression?: ((ctx: ExpressionContext) => es.Expression) | undefined

  visit(tree: ParseTree): es.Expression {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): es.Expression {
    const expressions: es.Expression[] = []
    for (let i = 0; i < node.childCount; i++) {
      expressions.push(node.getChild(i).accept(this))
    }
    return {
      type: 'SequenceExpression',
      expressions
    }
  }

  visitTerminal(node: TerminalNode): es.Expression {
    return node.accept(this)
  }

  visitErrorNode(node: ErrorNode): es.Expression {
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

function convertStart(start: StartContext): Array<es.Statement> {
  const generator = new StartGenerator()
  return start.accept(generator)
}

function convertSource(start: StartContext): es.Program {
  return {
    type: 'Program',
    sourceType: 'script',
    body: convertStart(start)
  }
}

export function parse(source: string, context: Context) {
  let program: es.Program | undefined

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
      if (error instanceof FatalSyntaxError) {
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
