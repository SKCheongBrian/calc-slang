// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT

import { ATN } from 'antlr4ts/atn/ATN'
import { ATNDeserializer } from 'antlr4ts/atn/ATNDeserializer'
import { ParserATNSimulator } from 'antlr4ts/atn/ParserATNSimulator'
import { NotNull } from 'antlr4ts/Decorators'
import { Override } from 'antlr4ts/Decorators'
import { FailedPredicateException } from 'antlr4ts/FailedPredicateException'
import * as Utils from 'antlr4ts/misc/Utils'
import { NoViableAltException } from 'antlr4ts/NoViableAltException'
import { Parser } from 'antlr4ts/Parser'
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext'
import { RecognitionException } from 'antlr4ts/RecognitionException'
import { RuleContext } from 'antlr4ts/RuleContext'
import { Token } from 'antlr4ts/Token'
import { TokenStream } from 'antlr4ts/TokenStream'
import { ParseTreeListener } from 'antlr4ts/tree/ParseTreeListener'
import { ParseTreeVisitor } from 'antlr4ts/tree/ParseTreeVisitor'
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from 'antlr4ts/tree/TerminalNode'
import { Vocabulary } from 'antlr4ts/Vocabulary'
import { VocabularyImpl } from 'antlr4ts/VocabularyImpl'

import { CalcListener } from './CalcListener'
import { CalcVisitor } from './CalcVisitor'

export class CalcParser extends Parser {
  public static readonly T__0 = 1
  public static readonly T__1 = 2
  public static readonly T__2 = 3
  public static readonly T__3 = 4
  public static readonly POW = 5
  public static readonly MUL = 6
  public static readonly DIV = 7
  public static readonly ADD = 8
  public static readonly SUB = 9
  public static readonly ASSIGN = 10
  public static readonly SEMI = 11
  public static readonly INT = 12
  public static readonly NUMBER = 13
  public static readonly WHITESPACE = 14
  public static readonly IDENTIFIER = 15
  public static readonly RULE_start = 0
  public static readonly RULE_expression = 1
  public static readonly RULE_declaration = 2
  public static readonly RULE_declarationSpecifiers = 3
  public static readonly RULE_declarationSpecifier = 4
  public static readonly RULE_initDeclaratorList = 5
  public static readonly RULE_initDeclarator = 6
  public static readonly RULE_initializer = 7
  public static readonly RULE_assignmentExpression = 8
  public static readonly RULE_typeSpecifier = 9
  public static readonly RULE_declarator = 10
  public static readonly RULE_directDeclarator = 11
  public static readonly RULE_assignmentOperator = 12
  // tslint:disable:no-trailing-whitespace
  public static readonly ruleNames: string[] = [
    'start',
    'expression',
    'declaration',
    'declarationSpecifiers',
    'declarationSpecifier',
    'initDeclaratorList',
    'initDeclarator',
    'initializer',
    'assignmentExpression',
    'typeSpecifier',
    'declarator',
    'directDeclarator',
    'assignmentOperator'
  ]

  private static readonly _LITERAL_NAMES: Array<string | undefined> = [
    undefined,
    "'('",
    "')'",
    "','",
    "'void'",
    "'^'",
    "'*'",
    "'/'",
    "'+'",
    "'-'",
    "'='",
    "';'",
    "'int'"
  ]
  private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'POW',
    'MUL',
    'DIV',
    'ADD',
    'SUB',
    'ASSIGN',
    'SEMI',
    'INT',
    'NUMBER',
    'WHITESPACE',
    'IDENTIFIER'
  ]
  public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(
    CalcParser._LITERAL_NAMES,
    CalcParser._SYMBOLIC_NAMES,
    []
  )

  // @Override
  // @NotNull
  public get vocabulary(): Vocabulary {
    return CalcParser.VOCABULARY
  }
  // tslint:enable:no-trailing-whitespace

  // @Override
  public get grammarFileName(): string {
    return 'Calc.g4'
  }

  // @Override
  public get ruleNames(): string[] {
    return CalcParser.ruleNames
  }

  // @Override
  public get serializedATN(): string {
    return CalcParser._serializedATN
  }

  protected createFailedPredicateException(
    predicate?: string,
    message?: string
  ): FailedPredicateException {
    return new FailedPredicateException(this, predicate, message)
  }

  constructor(input: TokenStream) {
    super(input)
    this._interp = new ParserATNSimulator(CalcParser._ATN, this)
  }
  // @RuleVersion(0)
  public start(): StartContext {
    const _localctx: StartContext = new StartContext(this._ctx, this.state)
    this.enterRule(_localctx, 0, CalcParser.RULE_start)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 26
        this.declaration()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }

  public expression(): ExpressionContext
  public expression(_p: number): ExpressionContext
  // @RuleVersion(0)
  public expression(_p?: number): ExpressionContext {
    if (_p === undefined) {
      _p = 0
    }

    const _parentctx: ParserRuleContext = this._ctx
    const _parentState: number = this.state
    let _localctx: ExpressionContext = new ExpressionContext(this._ctx, _parentState)
    let _prevctx: ExpressionContext = _localctx
    const _startState: number = 2
    this.enterRecursionRule(_localctx, 2, CalcParser.RULE_expression, _p)
    try {
      let _alt: number
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 34
        this._errHandler.sync(this)
        switch (this._input.LA(1)) {
          case CalcParser.NUMBER:
            {
              _localctx = new NumberContext(_localctx)
              this._ctx = _localctx
              _prevctx = _localctx

              this.state = 29
              this.match(CalcParser.NUMBER)
            }
            break
          case CalcParser.T__0:
            {
              _localctx = new ParenthesesContext(_localctx)
              this._ctx = _localctx
              _prevctx = _localctx
              this.state = 30
              this.match(CalcParser.T__0)
              this.state = 31
              ;(_localctx as ParenthesesContext)._inner = this.expression(0)
              this.state = 32
              this.match(CalcParser.T__1)
            }
            break
          default:
            throw new NoViableAltException(this)
        }
        this._ctx._stop = this._input.tryLT(-1)
        this.state = 53
        this._errHandler.sync(this)
        _alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx)
        while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
          if (_alt === 1) {
            if (this._parseListeners != null) {
              this.triggerExitRuleEvent()
            }
            _prevctx = _localctx
            {
              this.state = 51
              this._errHandler.sync(this)
              switch (this.interpreter.adaptivePredict(this._input, 1, this._ctx)) {
                case 1:
                  {
                    _localctx = new PowerContext(new ExpressionContext(_parentctx, _parentState))
                    ;(_localctx as PowerContext)._left = _prevctx
                    this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression)
                    this.state = 36
                    if (!this.precpred(this._ctx, 5)) {
                      throw this.createFailedPredicateException('this.precpred(this._ctx, 5)')
                    }
                    this.state = 37
                    ;(_localctx as PowerContext)._operator = this.match(CalcParser.POW)
                    this.state = 38
                    ;(_localctx as PowerContext)._right = this.expression(6)
                  }
                  break

                case 2:
                  {
                    _localctx = new MultiplicationContext(
                      new ExpressionContext(_parentctx, _parentState)
                    )
                    ;(_localctx as MultiplicationContext)._left = _prevctx
                    this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression)
                    this.state = 39
                    if (!this.precpred(this._ctx, 4)) {
                      throw this.createFailedPredicateException('this.precpred(this._ctx, 4)')
                    }
                    this.state = 40
                    ;(_localctx as MultiplicationContext)._operator = this.match(CalcParser.MUL)
                    this.state = 41
                    ;(_localctx as MultiplicationContext)._right = this.expression(5)
                  }
                  break

                case 3:
                  {
                    _localctx = new DivisionContext(new ExpressionContext(_parentctx, _parentState))
                    ;(_localctx as DivisionContext)._left = _prevctx
                    this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression)
                    this.state = 42
                    if (!this.precpred(this._ctx, 3)) {
                      throw this.createFailedPredicateException('this.precpred(this._ctx, 3)')
                    }
                    this.state = 43
                    ;(_localctx as DivisionContext)._operator = this.match(CalcParser.DIV)
                    this.state = 44
                    ;(_localctx as DivisionContext)._right = this.expression(4)
                  }
                  break

                case 4:
                  {
                    _localctx = new AdditionContext(new ExpressionContext(_parentctx, _parentState))
                    ;(_localctx as AdditionContext)._left = _prevctx
                    this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression)
                    this.state = 45
                    if (!this.precpred(this._ctx, 2)) {
                      throw this.createFailedPredicateException('this.precpred(this._ctx, 2)')
                    }
                    this.state = 46
                    ;(_localctx as AdditionContext)._operator = this.match(CalcParser.ADD)
                    this.state = 47
                    ;(_localctx as AdditionContext)._right = this.expression(3)
                  }
                  break

                case 5:
                  {
                    _localctx = new SubtractionContext(
                      new ExpressionContext(_parentctx, _parentState)
                    )
                    ;(_localctx as SubtractionContext)._left = _prevctx
                    this.pushNewRecursionContext(_localctx, _startState, CalcParser.RULE_expression)
                    this.state = 48
                    if (!this.precpred(this._ctx, 1)) {
                      throw this.createFailedPredicateException('this.precpred(this._ctx, 1)')
                    }
                    this.state = 49
                    ;(_localctx as SubtractionContext)._operator = this.match(CalcParser.SUB)
                    this.state = 50
                    ;(_localctx as SubtractionContext)._right = this.expression(2)
                  }
                  break
              }
            }
          }
          this.state = 55
          this._errHandler.sync(this)
          _alt = this.interpreter.adaptivePredict(this._input, 2, this._ctx)
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.unrollRecursionContexts(_parentctx)
    }
    return _localctx
  }
  // @RuleVersion(0)
  public declaration(): DeclarationContext {
    const _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state)
    this.enterRule(_localctx, 4, CalcParser.RULE_declaration)
    let _la: number
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 56
        this.declarationSpecifiers()
        this.state = 58
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        if (_la === CalcParser.IDENTIFIER) {
          {
            this.state = 57
            this.initDeclaratorList()
          }
        }

        this.state = 60
        this.match(CalcParser.SEMI)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public declarationSpecifiers(): DeclarationSpecifiersContext {
    const _localctx: DeclarationSpecifiersContext = new DeclarationSpecifiersContext(
      this._ctx,
      this.state
    )
    this.enterRule(_localctx, 6, CalcParser.RULE_declarationSpecifiers)
    let _la: number
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 63
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        do {
          {
            {
              this.state = 62
              this.declarationSpecifier()
            }
          }
          this.state = 65
          this._errHandler.sync(this)
          _la = this._input.LA(1)
        } while (_la === CalcParser.T__3 || _la === CalcParser.INT)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public declarationSpecifier(): DeclarationSpecifierContext {
    const _localctx: DeclarationSpecifierContext = new DeclarationSpecifierContext(
      this._ctx,
      this.state
    )
    this.enterRule(_localctx, 8, CalcParser.RULE_declarationSpecifier)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 67
        this.typeSpecifier()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public initDeclaratorList(): InitDeclaratorListContext {
    const _localctx: InitDeclaratorListContext = new InitDeclaratorListContext(
      this._ctx,
      this.state
    )
    this.enterRule(_localctx, 10, CalcParser.RULE_initDeclaratorList)
    let _la: number
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 69
        this.initDeclarator()
        this.state = 74
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        while (_la === CalcParser.T__2) {
          {
            {
              this.state = 70
              this.match(CalcParser.T__2)
              this.state = 71
              this.initDeclarator()
            }
          }
          this.state = 76
          this._errHandler.sync(this)
          _la = this._input.LA(1)
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public initDeclarator(): InitDeclaratorContext {
    const _localctx: InitDeclaratorContext = new InitDeclaratorContext(this._ctx, this.state)
    this.enterRule(_localctx, 12, CalcParser.RULE_initDeclarator)
    let _la: number
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 77
        this.declarator()
        this.state = 80
        this._errHandler.sync(this)
        _la = this._input.LA(1)
        if (_la === CalcParser.ASSIGN) {
          {
            this.state = 78
            this.match(CalcParser.ASSIGN)
            this.state = 79
            this.initializer()
          }
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public initializer(): InitializerContext {
    const _localctx: InitializerContext = new InitializerContext(this._ctx, this.state)
    this.enterRule(_localctx, 14, CalcParser.RULE_initializer)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 82
        this.assignmentExpression()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public assignmentExpression(): AssignmentExpressionContext {
    const _localctx: AssignmentExpressionContext = new AssignmentExpressionContext(
      this._ctx,
      this.state
    )
    this.enterRule(_localctx, 16, CalcParser.RULE_assignmentExpression)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 84
        this.match(CalcParser.NUMBER)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public typeSpecifier(): TypeSpecifierContext {
    const _localctx: TypeSpecifierContext = new TypeSpecifierContext(this._ctx, this.state)
    this.enterRule(_localctx, 18, CalcParser.RULE_typeSpecifier)
    let _la: number
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 86
        _la = this._input.LA(1)
        if (!(_la === CalcParser.T__3 || _la === CalcParser.INT)) {
          this._errHandler.recoverInline(this)
        } else {
          if (this._input.LA(1) === Token.EOF) {
            this.matchedEOF = true
          }

          this._errHandler.reportMatch(this)
          this.consume()
        }
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public declarator(): DeclaratorContext {
    const _localctx: DeclaratorContext = new DeclaratorContext(this._ctx, this.state)
    this.enterRule(_localctx, 20, CalcParser.RULE_declarator)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 88
        this.directDeclarator()
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public directDeclarator(): DirectDeclaratorContext {
    const _localctx: DirectDeclaratorContext = new DirectDeclaratorContext(this._ctx, this.state)
    this.enterRule(_localctx, 22, CalcParser.RULE_directDeclarator)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 90
        this.match(CalcParser.IDENTIFIER)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }
  // @RuleVersion(0)
  public assignmentOperator(): AssignmentOperatorContext {
    const _localctx: AssignmentOperatorContext = new AssignmentOperatorContext(
      this._ctx,
      this.state
    )
    this.enterRule(_localctx, 24, CalcParser.RULE_assignmentOperator)
    try {
      this.enterOuterAlt(_localctx, 1)
      {
        this.state = 92
        this.match(CalcParser.ASSIGN)
      }
    } catch (re) {
      if (re instanceof RecognitionException) {
        _localctx.exception = re
        this._errHandler.reportError(this, re)
        this._errHandler.recover(this, re)
      } else {
        throw re
      }
    } finally {
      this.exitRule()
    }
    return _localctx
  }

  public sempred(_localctx: RuleContext, ruleIndex: number, predIndex: number): boolean {
    switch (ruleIndex) {
      case 1:
        return this.expression_sempred(_localctx as ExpressionContext, predIndex)
    }
    return true
  }
  private expression_sempred(_localctx: ExpressionContext, predIndex: number): boolean {
    switch (predIndex) {
      case 0:
        return this.precpred(this._ctx, 5)

      case 1:
        return this.precpred(this._ctx, 4)

      case 2:
        return this.precpred(this._ctx, 3)

      case 3:
        return this.precpred(this._ctx, 2)

      case 4:
        return this.precpred(this._ctx, 1)
    }
    return true
  }

  public static readonly _serializedATN: string =
    '\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x11a\x04\x02' +
    '\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07' +
    '\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04' +
    '\x0E\t\x0E\x03\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03' +
    '\x03\x05\x03%\n\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03' +
    '\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x07' +
    '\x036\n\x03\f\x03\x0E\x039\v\x03\x03\x04\x03\x04\x05\x04=\n\x04\x03\x04' +
    '\x03\x04\x03\x05\x06\x05B\n\x05\r\x05\x0E\x05C\x03\x06\x03\x06\x03\x07' +
    '\x03\x07\x03\x07\x07\x07K\n\x07\f\x07\x0E\x07N\v\x07\x03\b\x03\b\x03\b' +
    '\x05\bS\n\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03' +
    '\r\x03\x0E\x03\x0E\x03\x0E\x02\x02\x03\x04\x0F\x02\x02\x04\x02\x06\x02' +
    '\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A' +
    '\x02\x02\x03\x04\x02\x06\x06\x0E\x0E\x02]\x02\x1C\x03\x02\x02\x02\x04' +
    '$\x03\x02\x02\x02\x06:\x03\x02\x02\x02\bA\x03\x02\x02\x02\nE\x03\x02\x02' +
    '\x02\fG\x03\x02\x02\x02\x0EO\x03\x02\x02\x02\x10T\x03\x02\x02\x02\x12' +
    'V\x03\x02\x02\x02\x14X\x03\x02\x02\x02\x16Z\x03\x02\x02\x02\x18\\\x03' +
    '\x02\x02\x02\x1A^\x03\x02\x02\x02\x1C\x1D\x05\x06\x04\x02\x1D\x03\x03' +
    '\x02\x02\x02\x1E\x1F\b\x03\x01\x02\x1F%\x07\x0F\x02\x02 !\x07\x03\x02' +
    '\x02!"\x05\x04\x03\x02"#\x07\x04\x02\x02#%\x03\x02\x02\x02$\x1E\x03' +
    "\x02\x02\x02$ \x03\x02\x02\x02%7\x03\x02\x02\x02&'\f\x07\x02\x02'(\x07" +
    '\x07\x02\x02(6\x05\x04\x03\b)*\f\x06\x02\x02*+\x07\b\x02\x02+6\x05\x04' +
    '\x03\x07,-\f\x05\x02\x02-.\x07\t\x02\x02.6\x05\x04\x03\x06/0\f\x04\x02' +
    '\x0201\x07\n\x02\x0216\x05\x04\x03\x0523\f\x03\x02\x0234\x07\v\x02\x02' +
    '46\x05\x04\x03\x045&\x03\x02\x02\x025)\x03\x02\x02\x025,\x03\x02\x02\x02' +
    '5/\x03\x02\x02\x0252\x03\x02\x02\x0269\x03\x02\x02\x0275\x03\x02\x02\x02' +
    '78\x03\x02\x02\x028\x05\x03\x02\x02\x0297\x03\x02\x02\x02:<\x05\b\x05' +
    '\x02;=\x05\f\x07\x02<;\x03\x02\x02\x02<=\x03\x02\x02\x02=>\x03\x02\x02' +
    '\x02>?\x07\r\x02\x02?\x07\x03\x02\x02\x02@B\x05\n\x06\x02A@\x03\x02\x02' +
    '\x02BC\x03\x02\x02\x02CA\x03\x02\x02\x02CD\x03\x02\x02\x02D\t\x03\x02' +
    '\x02\x02EF\x05\x14\v\x02F\v\x03\x02\x02\x02GL\x05\x0E\b\x02HI\x07\x05' +
    '\x02\x02IK\x05\x0E\b\x02JH\x03\x02\x02\x02KN\x03\x02\x02\x02LJ\x03\x02' +
    '\x02\x02LM\x03\x02\x02\x02M\r\x03\x02\x02\x02NL\x03\x02\x02\x02OR\x05' +
    '\x16\f\x02PQ\x07\f\x02\x02QS\x05\x10\t\x02RP\x03\x02\x02\x02RS\x03\x02' +
    '\x02\x02S\x0F\x03\x02\x02\x02TU\x05\x12\n\x02U\x11\x03\x02\x02\x02VW\x07' +
    '\x0F\x02\x02W\x13\x03\x02\x02\x02XY\t\x02\x02\x02Y\x15\x03\x02\x02\x02' +
    'Z[\x05\x18\r\x02[\x17\x03\x02\x02\x02\\]\x07\x11\x02\x02]\x19\x03\x02' +
    '\x02\x02^_\x07\f\x02\x02_\x1B\x03\x02\x02\x02\t$57<CLR'
  public static __ATN: ATN
  public static get _ATN(): ATN {
    if (!CalcParser.__ATN) {
      CalcParser.__ATN = new ATNDeserializer().deserialize(
        Utils.toCharArray(CalcParser._serializedATN)
      )
    }

    return CalcParser.__ATN
  }
}

export class StartContext extends ParserRuleContext {
  public declaration(): DeclarationContext {
    return this.getRuleContext(0, DeclarationContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_start
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterStart) {
      listener.enterStart(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitStart) {
      listener.exitStart(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitStart) {
      return visitor.visitStart(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class ExpressionContext extends ParserRuleContext {
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_expression
  }
  public copyFrom(ctx: ExpressionContext): void {
    super.copyFrom(ctx)
  }
}
export class NumberContext extends ExpressionContext {
  public NUMBER(): TerminalNode {
    return this.getToken(CalcParser.NUMBER, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterNumber) {
      listener.enterNumber(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitNumber) {
      listener.exitNumber(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitNumber) {
      return visitor.visitNumber(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class ParenthesesContext extends ExpressionContext {
  public _inner!: ExpressionContext
  public expression(): ExpressionContext {
    return this.getRuleContext(0, ExpressionContext)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterParentheses) {
      listener.enterParentheses(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitParentheses) {
      listener.exitParentheses(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitParentheses) {
      return visitor.visitParentheses(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class PowerContext extends ExpressionContext {
  public _left!: ExpressionContext
  public _operator!: Token
  public _right!: ExpressionContext
  public expression(): ExpressionContext[]
  public expression(i: number): ExpressionContext
  public expression(i?: number): ExpressionContext | ExpressionContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ExpressionContext)
    } else {
      return this.getRuleContext(i, ExpressionContext)
    }
  }
  public POW(): TerminalNode {
    return this.getToken(CalcParser.POW, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterPower) {
      listener.enterPower(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitPower) {
      listener.exitPower(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitPower) {
      return visitor.visitPower(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class MultiplicationContext extends ExpressionContext {
  public _left!: ExpressionContext
  public _operator!: Token
  public _right!: ExpressionContext
  public expression(): ExpressionContext[]
  public expression(i: number): ExpressionContext
  public expression(i?: number): ExpressionContext | ExpressionContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ExpressionContext)
    } else {
      return this.getRuleContext(i, ExpressionContext)
    }
  }
  public MUL(): TerminalNode {
    return this.getToken(CalcParser.MUL, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterMultiplication) {
      listener.enterMultiplication(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitMultiplication) {
      listener.exitMultiplication(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitMultiplication) {
      return visitor.visitMultiplication(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class DivisionContext extends ExpressionContext {
  public _left!: ExpressionContext
  public _operator!: Token
  public _right!: ExpressionContext
  public expression(): ExpressionContext[]
  public expression(i: number): ExpressionContext
  public expression(i?: number): ExpressionContext | ExpressionContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ExpressionContext)
    } else {
      return this.getRuleContext(i, ExpressionContext)
    }
  }
  public DIV(): TerminalNode {
    return this.getToken(CalcParser.DIV, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDivision) {
      listener.enterDivision(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDivision) {
      listener.exitDivision(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDivision) {
      return visitor.visitDivision(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class AdditionContext extends ExpressionContext {
  public _left!: ExpressionContext
  public _operator!: Token
  public _right!: ExpressionContext
  public expression(): ExpressionContext[]
  public expression(i: number): ExpressionContext
  public expression(i?: number): ExpressionContext | ExpressionContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ExpressionContext)
    } else {
      return this.getRuleContext(i, ExpressionContext)
    }
  }
  public ADD(): TerminalNode {
    return this.getToken(CalcParser.ADD, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterAddition) {
      listener.enterAddition(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitAddition) {
      listener.exitAddition(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitAddition) {
      return visitor.visitAddition(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
export class SubtractionContext extends ExpressionContext {
  public _left!: ExpressionContext
  public _operator!: Token
  public _right!: ExpressionContext
  public expression(): ExpressionContext[]
  public expression(i: number): ExpressionContext
  public expression(i?: number): ExpressionContext | ExpressionContext[] {
    if (i === undefined) {
      return this.getRuleContexts(ExpressionContext)
    } else {
      return this.getRuleContext(i, ExpressionContext)
    }
  }
  public SUB(): TerminalNode {
    return this.getToken(CalcParser.SUB, 0)
  }
  constructor(ctx: ExpressionContext) {
    super(ctx.parent, ctx.invokingState)
    this.copyFrom(ctx)
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterSubtraction) {
      listener.enterSubtraction(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitSubtraction) {
      listener.exitSubtraction(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitSubtraction) {
      return visitor.visitSubtraction(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class DeclarationContext extends ParserRuleContext {
  public declarationSpecifiers(): DeclarationSpecifiersContext {
    return this.getRuleContext(0, DeclarationSpecifiersContext)
  }
  public SEMI(): TerminalNode {
    return this.getToken(CalcParser.SEMI, 0)
  }
  public initDeclaratorList(): InitDeclaratorListContext | undefined {
    return this.tryGetRuleContext(0, InitDeclaratorListContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_declaration
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDeclaration) {
      listener.enterDeclaration(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDeclaration) {
      listener.exitDeclaration(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDeclaration) {
      return visitor.visitDeclaration(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class DeclarationSpecifiersContext extends ParserRuleContext {
  public declarationSpecifier(): DeclarationSpecifierContext[]
  public declarationSpecifier(i: number): DeclarationSpecifierContext
  public declarationSpecifier(
    i?: number
  ): DeclarationSpecifierContext | DeclarationSpecifierContext[] {
    if (i === undefined) {
      return this.getRuleContexts(DeclarationSpecifierContext)
    } else {
      return this.getRuleContext(i, DeclarationSpecifierContext)
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_declarationSpecifiers
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDeclarationSpecifiers) {
      listener.enterDeclarationSpecifiers(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDeclarationSpecifiers) {
      listener.exitDeclarationSpecifiers(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDeclarationSpecifiers) {
      return visitor.visitDeclarationSpecifiers(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class DeclarationSpecifierContext extends ParserRuleContext {
  public typeSpecifier(): TypeSpecifierContext {
    return this.getRuleContext(0, TypeSpecifierContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_declarationSpecifier
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDeclarationSpecifier) {
      listener.enterDeclarationSpecifier(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDeclarationSpecifier) {
      listener.exitDeclarationSpecifier(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDeclarationSpecifier) {
      return visitor.visitDeclarationSpecifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class InitDeclaratorListContext extends ParserRuleContext {
  public initDeclarator(): InitDeclaratorContext[]
  public initDeclarator(i: number): InitDeclaratorContext
  public initDeclarator(i?: number): InitDeclaratorContext | InitDeclaratorContext[] {
    if (i === undefined) {
      return this.getRuleContexts(InitDeclaratorContext)
    } else {
      return this.getRuleContext(i, InitDeclaratorContext)
    }
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_initDeclaratorList
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterInitDeclaratorList) {
      listener.enterInitDeclaratorList(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitInitDeclaratorList) {
      listener.exitInitDeclaratorList(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitInitDeclaratorList) {
      return visitor.visitInitDeclaratorList(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class InitDeclaratorContext extends ParserRuleContext {
  public declarator(): DeclaratorContext {
    return this.getRuleContext(0, DeclaratorContext)
  }
  public ASSIGN(): TerminalNode | undefined {
    return this.tryGetToken(CalcParser.ASSIGN, 0)
  }
  public initializer(): InitializerContext | undefined {
    return this.tryGetRuleContext(0, InitializerContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_initDeclarator
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterInitDeclarator) {
      listener.enterInitDeclarator(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitInitDeclarator) {
      listener.exitInitDeclarator(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitInitDeclarator) {
      return visitor.visitInitDeclarator(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class InitializerContext extends ParserRuleContext {
  public assignmentExpression(): AssignmentExpressionContext {
    return this.getRuleContext(0, AssignmentExpressionContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_initializer
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterInitializer) {
      listener.enterInitializer(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitInitializer) {
      listener.exitInitializer(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitInitializer) {
      return visitor.visitInitializer(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class AssignmentExpressionContext extends ParserRuleContext {
  public NUMBER(): TerminalNode {
    return this.getToken(CalcParser.NUMBER, 0)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_assignmentExpression
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterAssignmentExpression) {
      listener.enterAssignmentExpression(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitAssignmentExpression) {
      listener.exitAssignmentExpression(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitAssignmentExpression) {
      return visitor.visitAssignmentExpression(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class TypeSpecifierContext extends ParserRuleContext {
  public INT(): TerminalNode {
    return this.getToken(CalcParser.INT, 0)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_typeSpecifier
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterTypeSpecifier) {
      listener.enterTypeSpecifier(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitTypeSpecifier) {
      listener.exitTypeSpecifier(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitTypeSpecifier) {
      return visitor.visitTypeSpecifier(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class DeclaratorContext extends ParserRuleContext {
  public directDeclarator(): DirectDeclaratorContext {
    return this.getRuleContext(0, DirectDeclaratorContext)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_declarator
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDeclarator) {
      listener.enterDeclarator(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDeclarator) {
      listener.exitDeclarator(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDeclarator) {
      return visitor.visitDeclarator(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class DirectDeclaratorContext extends ParserRuleContext {
  public IDENTIFIER(): TerminalNode {
    return this.getToken(CalcParser.IDENTIFIER, 0)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_directDeclarator
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterDirectDeclarator) {
      listener.enterDirectDeclarator(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitDirectDeclarator) {
      listener.exitDirectDeclarator(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitDirectDeclarator) {
      return visitor.visitDirectDeclarator(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}

export class AssignmentOperatorContext extends ParserRuleContext {
  public ASSIGN(): TerminalNode {
    return this.getToken(CalcParser.ASSIGN, 0)
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState)
  }
  // @Override
  public get ruleIndex(): number {
    return CalcParser.RULE_assignmentOperator
  }
  // @Override
  public enterRule(listener: CalcListener): void {
    if (listener.enterAssignmentOperator) {
      listener.enterAssignmentOperator(this)
    }
  }
  // @Override
  public exitRule(listener: CalcListener): void {
    if (listener.exitAssignmentOperator) {
      listener.exitAssignmentOperator(this)
    }
  }
  // @Override
  public accept<Result>(visitor: CalcVisitor<Result>): Result {
    if (visitor.visitAssignmentOperator) {
      return visitor.visitAssignmentOperator(this)
    } else {
      return visitor.visitChildren(this)
    }
  }
}
