// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener'

import { NumberContext } from './CalcParser'
import { ParenthesesContext } from './CalcParser'
import { PowerContext } from './CalcParser'
import { MultiplicationContext } from './CalcParser'
import { DivisionContext } from './CalcParser'
import { AdditionContext } from './CalcParser'
import { SubtractionContext } from './CalcParser'
import { StartContext } from './CalcParser'
import { ExpressionContext } from './CalcParser'
import { DeclarationContext } from './CalcParser'
import { DeclarationSpecifiersContext } from './CalcParser'
import { DeclarationSpecifierContext } from './CalcParser'
import { InitDeclaratorListContext } from './CalcParser'
import { InitDeclaratorContext } from './CalcParser'
import { InitializerContext } from './CalcParser'
import { AssignmentExpressionContext } from './CalcParser'
import { TypeSpecifierContext } from './CalcParser'
import { DeclaratorContext } from './CalcParser'
import { DirectDeclaratorContext } from './CalcParser'
import { AssignmentOperatorContext } from './CalcParser'

/**
 * This interface defines a complete listener for a parse tree produced by
 * `CalcParser`.
 */
export interface CalcListener extends ParseTreeListener {
  /**
   * Enter a parse tree produced by the `Number`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterNumber?: (ctx: NumberContext) => void
  /**
   * Exit a parse tree produced by the `Number`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitNumber?: (ctx: NumberContext) => void

  /**
   * Enter a parse tree produced by the `Parentheses`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterParentheses?: (ctx: ParenthesesContext) => void
  /**
   * Exit a parse tree produced by the `Parentheses`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitParentheses?: (ctx: ParenthesesContext) => void

  /**
   * Enter a parse tree produced by the `Power`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterPower?: (ctx: PowerContext) => void
  /**
   * Exit a parse tree produced by the `Power`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitPower?: (ctx: PowerContext) => void

  /**
   * Enter a parse tree produced by the `Multiplication`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterMultiplication?: (ctx: MultiplicationContext) => void
  /**
   * Exit a parse tree produced by the `Multiplication`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitMultiplication?: (ctx: MultiplicationContext) => void

  /**
   * Enter a parse tree produced by the `Division`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterDivision?: (ctx: DivisionContext) => void
  /**
   * Exit a parse tree produced by the `Division`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitDivision?: (ctx: DivisionContext) => void

  /**
   * Enter a parse tree produced by the `Addition`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterAddition?: (ctx: AdditionContext) => void
  /**
   * Exit a parse tree produced by the `Addition`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitAddition?: (ctx: AdditionContext) => void

  /**
   * Enter a parse tree produced by the `Subtraction`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterSubtraction?: (ctx: SubtractionContext) => void
  /**
   * Exit a parse tree produced by the `Subtraction`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitSubtraction?: (ctx: SubtractionContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.start`.
   * @param ctx the parse tree
   */
  enterStart?: (ctx: StartContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.start`.
   * @param ctx the parse tree
   */
  exitStart?: (ctx: StartContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.expression`.
   * @param ctx the parse tree
   */
  enterExpression?: (ctx: ExpressionContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.expression`.
   * @param ctx the parse tree
   */
  exitExpression?: (ctx: ExpressionContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.declaration`.
   * @param ctx the parse tree
   */
  enterDeclaration?: (ctx: DeclarationContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.declaration`.
   * @param ctx the parse tree
   */
  exitDeclaration?: (ctx: DeclarationContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.declarationSpecifiers`.
   * @param ctx the parse tree
   */
  enterDeclarationSpecifiers?: (ctx: DeclarationSpecifiersContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.declarationSpecifiers`.
   * @param ctx the parse tree
   */
  exitDeclarationSpecifiers?: (ctx: DeclarationSpecifiersContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.declarationSpecifier`.
   * @param ctx the parse tree
   */
  enterDeclarationSpecifier?: (ctx: DeclarationSpecifierContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.declarationSpecifier`.
   * @param ctx the parse tree
   */
  exitDeclarationSpecifier?: (ctx: DeclarationSpecifierContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.initDeclaratorList`.
   * @param ctx the parse tree
   */
  enterInitDeclaratorList?: (ctx: InitDeclaratorListContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.initDeclaratorList`.
   * @param ctx the parse tree
   */
  exitInitDeclaratorList?: (ctx: InitDeclaratorListContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.initDeclarator`.
   * @param ctx the parse tree
   */
  enterInitDeclarator?: (ctx: InitDeclaratorContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.initDeclarator`.
   * @param ctx the parse tree
   */
  exitInitDeclarator?: (ctx: InitDeclaratorContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.initializer`.
   * @param ctx the parse tree
   */
  enterInitializer?: (ctx: InitializerContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.initializer`.
   * @param ctx the parse tree
   */
  exitInitializer?: (ctx: InitializerContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.assignmentExpression`.
   * @param ctx the parse tree
   */
  enterAssignmentExpression?: (ctx: AssignmentExpressionContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.assignmentExpression`.
   * @param ctx the parse tree
   */
  exitAssignmentExpression?: (ctx: AssignmentExpressionContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.typeSpecifier`.
   * @param ctx the parse tree
   */
  enterTypeSpecifier?: (ctx: TypeSpecifierContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.typeSpecifier`.
   * @param ctx the parse tree
   */
  exitTypeSpecifier?: (ctx: TypeSpecifierContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.declarator`.
   * @param ctx the parse tree
   */
  enterDeclarator?: (ctx: DeclaratorContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.declarator`.
   * @param ctx the parse tree
   */
  exitDeclarator?: (ctx: DeclaratorContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.directDeclarator`.
   * @param ctx the parse tree
   */
  enterDirectDeclarator?: (ctx: DirectDeclaratorContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.directDeclarator`.
   * @param ctx the parse tree
   */
  exitDirectDeclarator?: (ctx: DirectDeclaratorContext) => void

  /**
   * Enter a parse tree produced by `CalcParser.assignmentOperator`.
   * @param ctx the parse tree
   */
  enterAssignmentOperator?: (ctx: AssignmentOperatorContext) => void
  /**
   * Exit a parse tree produced by `CalcParser.assignmentOperator`.
   * @param ctx the parse tree
   */
  exitAssignmentOperator?: (ctx: AssignmentOperatorContext) => void
}
