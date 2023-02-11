// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT

import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor'

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
 * This interface defines a complete generic visitor for a parse tree produced
 * by `CalcParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface CalcVisitor<Result> extends ParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by the `Number`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitNumber?: (ctx: NumberContext) => Result

  /**
   * Visit a parse tree produced by the `Parentheses`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParentheses?: (ctx: ParenthesesContext) => Result

  /**
   * Visit a parse tree produced by the `Power`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitPower?: (ctx: PowerContext) => Result

  /**
   * Visit a parse tree produced by the `Multiplication`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitMultiplication?: (ctx: MultiplicationContext) => Result

  /**
   * Visit a parse tree produced by the `Division`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDivision?: (ctx: DivisionContext) => Result

  /**
   * Visit a parse tree produced by the `Addition`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAddition?: (ctx: AdditionContext) => Result

  /**
   * Visit a parse tree produced by the `Subtraction`
   * labeled alternative in `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitSubtraction?: (ctx: SubtractionContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.start`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitStart?: (ctx: StartContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.expression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExpression?: (ctx: ExpressionContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.declaration`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDeclaration?: (ctx: DeclarationContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.declarationSpecifiers`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDeclarationSpecifiers?: (ctx: DeclarationSpecifiersContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.declarationSpecifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDeclarationSpecifier?: (ctx: DeclarationSpecifierContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.initDeclaratorList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitInitDeclaratorList?: (ctx: InitDeclaratorListContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.initDeclarator`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitInitDeclarator?: (ctx: InitDeclaratorContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.initializer`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitInitializer?: (ctx: InitializerContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.assignmentExpression`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAssignmentExpression?: (ctx: AssignmentExpressionContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.typeSpecifier`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTypeSpecifier?: (ctx: TypeSpecifierContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.declarator`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDeclarator?: (ctx: DeclaratorContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.directDeclarator`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitDirectDeclarator?: (ctx: DirectDeclaratorContext) => Result

  /**
   * Visit a parse tree produced by `CalcParser.assignmentOperator`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitAssignmentOperator?: (ctx: AssignmentOperatorContext) => Result
}
