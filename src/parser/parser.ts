/* tslint:disable:max-classes-per-file */
import { CharStreams, CommonTokenStream, ParserRuleContext } from 'antlr4ts'
import { ErrorNode } from 'antlr4ts/tree/ErrorNode'
import { ParseTree } from 'antlr4ts/tree/ParseTree'
import { RuleNode } from 'antlr4ts/tree/RuleNode'
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'

// import * as cs from 'estree'
import * as cs from '../tree/ctree'
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
  CallContext,
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
  visitStart?: ((ctx: StartContext) => cs.Statement[]) | undefined

  visit(tree: ParseTree): cs.Statement[] {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.Statement[] {
    const stmtGenerator: StatementGenerator = new StatementGenerator()
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
  // Function definition =======================================
  visitFunctionDefinition(ctx: FunctionDefinitionContext): cs.Statement {
    const dirDecl: DirectDeclaratorContext = ctx._decl._dirDecl

    // Parse id
    const id: cs.Identifier = {
      type: 'Identifier',
      name: dirDecl._dirDecl._id.text as string
    }

    // Parse params
    const params: cs.Pattern[] = []
    const paramList = dirDecl._params
    if (paramList) {
      for (let i = 0; i < paramList.childCount; i += 2) {
        const paramDecl = paramList.getChild(i) as ParameterDeclarationContext
        const paramId: cs.Identifier = {
          type: 'Identifier',
          name: paramDecl._decl._dirDecl._id.text as string
        }
        params.push(paramId)
      }
    }

    // Parse body
    const body: cs.BlockStatement = this.visit(ctx._body) as cs.BlockStatement

    return {
      type: 'FunctionDeclaration',
      id,
      params,
      body
    }
  }

  // Compound statement =======================================
  visitCompoundStatement(ctx: CompoundStatementContext): cs.Statement {
    const startGenerator: StartGenerator = new StartGenerator()
    return {
      type: 'BlockStatement',
      body: ctx._blockItems?.accept(startGenerator) ?? []
    }
  }

  // Declaration =======================================
  visitDeclaration(ctx: DeclarationContext): cs.Statement {
    const generator: DeclarationGenerator = new DeclarationGenerator()
    return ctx.accept(generator)
  }

  // Expression statement =======================================
  visitExpressionStatement(ctx: ExpressionStatementContext): cs.Statement {
    const generator: ExpressionStatementGenerator = new ExpressionStatementGenerator()
    return ctx.accept(generator)
  }

  // Selection statements =======================================

  visitIfStatement(ctx: IfStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'IfStatement',
      test: ctx._test.accept(exprGenerator),
      consequent: this.visit(ctx._cons),
      alternate: ctx._alt ? this.visit(ctx._alt) : undefined
    }
  }

  // Iteration statements =======================================

  visitWhileStatement(ctx: WhileStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'WhileStatement',
      test: ctx._test.accept(exprGenerator),
      body: this.visit(ctx._body)
    }
  }

  visitDoWhileStatement(ctx: DoWhileStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'DoWhileStatement',
      body: this.visit(ctx._body),
      test: ctx._test.accept(exprGenerator)
    }
  }

  // Jump statements =======================================

  visitContinueStatement(ctx: ContinueStatementContext): cs.Statement {
    return {
      type: 'ContinueStatement'
    }
  }

  visitBreakStatement(ctx: BreakStatementContext): cs.Statement {
    return {
      type: 'BreakStatement'
    }
  }

  visitReturnStatement(ctx: ReturnStatementContext): cs.Statement {
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    return {
      type: 'ReturnStatement',
      argument: ctx._argument?.accept(exprGenerator)
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
  visitDeclaration(ctx: DeclarationContext): cs.Declaration {
    const initDecls = ctx._initDecls
    const initDeclGenerator = new InitDeclaratorGenerator()
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
      datatype: {
        kind: 'primitive',
        name: 'void'
      }
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
  visitInitDeclarator?: ((ctx: InitDeclaratorContext) => cs.VariableDeclarator) | undefined

  visit(tree: ParseTree): cs.VariableDeclarator {
    return tree.accept(this)
  }

  visitChildren(node: InitDeclaratorContext): cs.VariableDeclarator {
    const name: string = node._decl._dirDecl._id.text as string
    const exprGenerator: ExpressionGenerator = new ExpressionGenerator()
    const expression: cs.Expression = node._init?._assignExpr._expr.accept(exprGenerator)
    return {
      type: 'VariableDeclarator',
      id: {
        type: 'Identifier',
        name
      },
      init: expression
    }
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

class ExpressionStatementGenerator implements CalcVisitor<cs.ExpressionStatement> {
  visitExpressionStatement?:
    | ((ctx: ExpressionStatementContext) => cs.ExpressionStatement)
    | undefined

  visit(tree: ParseTree): cs.ExpressionStatement {
    return tree.accept(this)
  }

  visitChildren(node: RuleNode): cs.ExpressionStatement {
    const generator: ExpressionGenerator = new ExpressionGenerator()
    // First child is an expression
    const expression: cs.Expression = node.getChild(0).accept(generator)
    return {
      type: 'ExpressionStatement',
      expression
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
  visitNumber(ctx: NumberContext): cs.Expression {
    console.log('LALALALALALALALA')
    return {
      type: 'Literal',
      value: parseInt(ctx.text),
      raw: ctx.text,
      datatype: {
        kind: 'primitive',
        name: 'int'
      },
      loc: contextToLocation(ctx)
    }
  }

  visitIdentifier(ctx: IdentifierContext): cs.Expression {
    console.log('mimimimimimimimimimimi')
    return {
      type: 'Identifier',
      name: ctx.text,
      datatype: {
        kind: 'variable',
        type: {
          kind: 'primitive',
          name: 'int'
        },
        name: ctx.text
      },
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
      name: ctx._id.text as string
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
      arguments: args
    }
  }

  // Update expressions =======================================

  visitIncrementPrefix(ctx: IncrementPrefixContext): cs.Expression {
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPrefix(ctx: DecrementPrefixContext): cs.Expression {
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitIncrementPostfix(ctx: IncrementPostfixContext): cs.Expression {
    return {
      type: 'UpdateExpression',
      operator: '++',
      argument: this.visit(ctx._argument),
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  visitDecrementPostfix(ctx: DecrementPostfixContext): cs.Expression {
    return {
      type: 'UpdateExpression',
      operator: '--',
      argument: this.visit(ctx._argument),
      prefix: false,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) arithmetic expressions =======================================

  visitPositive(ctx: PositiveContext): cs.Expression {
    return {
      type: 'UnaryExpression',
      operator: '+',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  visitNegative(ctx: NegativeContext): cs.Expression {
    return {
      type: 'UnaryExpression',
      operator: '-',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) bitwise expression =======================================

  visitBitwiseComplement(ctx: BitwiseComplementContext): cs.Expression {
    return {
      type: 'UnaryExpression',
      operator: '~',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Unary) logical expression =======================================

  visitFactorial(ctx: FactorialContext): cs.Expression {
    return {
      type: 'UnaryExpression',
      operator: '!',
      argument: this.visit(ctx._argument),
      prefix: true,
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) arithmetic expressions =======================================

  visitMultiplication(ctx: MultiplicationContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '*',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitDivision(ctx: DivisionContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '/',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitModulo(ctx: ModuloContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '%',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitAddition(ctx: AdditionContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '+',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitSubtraction(ctx: SubtractionContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '-',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Shift expressions =======================================

  visitShiftLeft(ctx: ShiftLeftContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<<',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitShiftRight(ctx: ShiftRightContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>>',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Relation expressions =======================================

  visitEquals(ctx: EqualsContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '==',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitNotEquals(ctx: NotEqualsContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '!=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyLessThan(ctx: StrictlyLessThanContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLessThanOrEquals(ctx: LessThanOrEqualsContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '<=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitStrictlyGreaterThan(ctx: StrictlyGreaterThanContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitGreaterThanOrEquals(ctx: GreaterThanOrEqualsContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '>=',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) bitwise expressions =======================================

  visitBitwiseOr(ctx: BitwiseOrContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '|',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseXor(ctx: BitwiseXorContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '^',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitBitwiseAnd(ctx: BitwiseAndContext): cs.Expression {
    return {
      type: 'BinaryExpression',
      operator: '&',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // (Binary) logical expressions =======================================

  visitLogicalAnd(ctx: LogicalAndContext): cs.Expression {
    return {
      type: 'LogicalExpression',
      operator: '&&',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  visitLogicalOr(ctx: LogicalOrContext): cs.Expression {
    return {
      type: 'LogicalExpression',
      operator: '||',
      left: this.visit(ctx._left),
      right: this.visit(ctx._right),
      loc: contextToLocation(ctx)
    }
  }

  // Conditional expression =======================================

  visitConditional(ctx: ConditionalContext): cs.Expression {
    return {
      type: 'ConditionalExpression',
      test: this.visit(ctx._test),
      consequent: this.visit(ctx._cons),
      alternate: this.visit(ctx._alt),
      loc: contextToLocation(ctx),
    }
  }

  // Assignment expressions =======================================

  visitAssignment(ctx: AssignmentContext): cs.Expression {
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

  visitAdditionAssignment(ctx: AdditionAssignmentContext): cs.Expression {
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

  visitSubtractionAssignment(ctx: SubtractionAssignmentContext): cs.Expression {
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

  visitMultiplicationAssignment(ctx: MultiplicationAssignmentContext): cs.Expression {
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

  visitDivisionAssignment(ctx: DivisionAssignmentContext): cs.Expression {
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

  visitModuloAssignment(ctx: ModuloAssignmentContext): cs.Expression {
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

  visitShiftLeftAssignment(ctx: ShiftLeftAssignmentContext): cs.Expression {
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

  visitShiftRightAssignment(ctx: ShiftRightAssignmentContext): cs.Expression {
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

  visitBitwiseOrAssignment(ctx: BitwiseOrAssignmentContext): cs.Expression {
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

  visitBitwiseXorAssignment(ctx: BitwiseXorAssignmentContext): cs.Expression {
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

  visitBitwiseAndAssignment(ctx: BitwiseAndAssignmentContext): cs.Expression {
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

function convertStart(start: StartContext): Array<cs.Statement> {
  const generator = new StartGenerator()
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
