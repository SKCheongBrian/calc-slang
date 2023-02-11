// Generated from ./src/lang/Calc.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class CalcLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly POW = 5;
	public static readonly MUL = 6;
	public static readonly DIV = 7;
	public static readonly ADD = 8;
	public static readonly SUB = 9;
	public static readonly ASSIGN = 10;
	public static readonly SEMI = 11;
	public static readonly INT = 12;
	public static readonly NUMBER = 13;
	public static readonly WHITESPACE = 14;
	public static readonly IDENTIFIER = 15;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "POW", "MUL", "DIV", "ADD", "SUB", "ASSIGN", 
		"SEMI", "INT", "NUMBER", "WHITESPACE", "IDENTIFIER", "IDENTIFIER_NON_DIGIT", 
		"NON_DIGIT", "DIGIT",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'('", "')'", "','", "'void'", "'^'", "'*'", "'/'", "'+'", 
		"'-'", "'='", "';'", "'int'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, "POW", "MUL", "DIV", 
		"ADD", "SUB", "ASSIGN", "SEMI", "INT", "NUMBER", "WHITESPACE", "IDENTIFIER",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(CalcLexer._LITERAL_NAMES, CalcLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return CalcLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(CalcLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "Calc.g4"; }

	// @Override
	public get ruleNames(): string[] { return CalcLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return CalcLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return CalcLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return CalcLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x11^\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r" +
		"\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12" +
		"\x04\x13\t\x13\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x03\b" +
		"\x03\b\x03\t\x03\t\x03\n\x03\n\x03\v\x03\v\x03\f\x03\f\x03\r\x03\r\x03" +
		"\r\x03\r\x03\x0E\x06\x0EF\n\x0E\r\x0E\x0E\x0EG\x03\x0F\x06\x0FK\n\x0F" +
		"\r\x0F\x0E\x0FL\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x07\x10T\n\x10" +
		"\f\x10\x0E\x10W\v\x10\x03\x11\x03\x11\x03\x12\x03\x12\x03\x13\x03\x13" +
		"\x02\x02\x02\x14\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07" +
		"\r\x02\b\x0F\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E" +
		"\x1B\x02\x0F\x1D\x02\x10\x1F\x02\x11!\x02\x02#\x02\x02%\x02\x02\x03\x02" +
		"\x05\x03\x022;\x05\x02\v\f\x0F\x0F\"\"\x05\x02C\\aac|\x02^\x02\x03\x03" +
		"\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02\x02\x02\x02\t\x03" +
		"\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02\x02\x02\x0F\x03\x02" +
		"\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02\x02\x02\x15\x03\x02" +
		"\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02\x02\x02\x1B\x03\x02" +
		"\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02\x02\x03\'\x03\x02" +
		"\x02\x02\x05)\x03\x02\x02\x02\x07+\x03\x02\x02\x02\t-\x03\x02\x02\x02" +
		"\v2\x03\x02\x02\x02\r4\x03\x02\x02\x02\x0F6\x03\x02\x02\x02\x118\x03\x02" +
		"\x02\x02\x13:\x03\x02\x02\x02\x15<\x03\x02\x02\x02\x17>\x03\x02\x02\x02" +
		"\x19@\x03\x02\x02\x02\x1BE\x03\x02\x02\x02\x1DJ\x03\x02\x02\x02\x1FP\x03" +
		"\x02\x02\x02!X\x03\x02\x02\x02#Z\x03\x02\x02\x02%\\\x03\x02\x02\x02\'" +
		"(\x07*\x02\x02(\x04\x03\x02\x02\x02)*\x07+\x02\x02*\x06\x03\x02\x02\x02" +
		"+,\x07.\x02\x02,\b\x03\x02\x02\x02-.\x07x\x02\x02./\x07q\x02\x02/0\x07" +
		"k\x02\x0201\x07f\x02\x021\n\x03\x02\x02\x0223\x07`\x02\x023\f\x03\x02" +
		"\x02\x0245\x07,\x02\x025\x0E\x03\x02\x02\x0267\x071\x02\x027\x10\x03\x02" +
		"\x02\x0289\x07-\x02\x029\x12\x03\x02\x02\x02:;\x07/\x02\x02;\x14\x03\x02" +
		"\x02\x02<=\x07?\x02\x02=\x16\x03\x02\x02\x02>?\x07=\x02\x02?\x18\x03\x02" +
		"\x02\x02@A\x07k\x02\x02AB\x07p\x02\x02BC\x07v\x02\x02C\x1A\x03\x02\x02" +
		"\x02DF\t\x02\x02\x02ED\x03\x02\x02\x02FG\x03\x02\x02\x02GE\x03\x02\x02" +
		"\x02GH\x03\x02\x02\x02H\x1C\x03\x02\x02\x02IK\t\x03\x02\x02JI\x03\x02" +
		"\x02\x02KL\x03\x02\x02\x02LJ\x03\x02\x02\x02LM\x03\x02\x02\x02MN\x03\x02" +
		"\x02\x02NO\b\x0F\x02\x02O\x1E\x03\x02\x02\x02PU\x05!\x11\x02QT\x05!\x11" +
		"\x02RT\x05%\x13\x02SQ\x03\x02\x02\x02SR\x03\x02\x02\x02TW\x03\x02\x02" +
		"\x02US\x03\x02\x02\x02UV\x03\x02\x02\x02V \x03\x02\x02\x02WU\x03\x02\x02" +
		"\x02XY\x05#\x12\x02Y\"\x03\x02\x02\x02Z[\t\x04\x02\x02[$\x03\x02\x02\x02" +
		"\\]\t\x02\x02\x02]&\x03\x02\x02\x02\x07\x02GLSU\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!CalcLexer.__ATN) {
			CalcLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(CalcLexer._serializedATN));
		}

		return CalcLexer.__ATN;
	}

}

