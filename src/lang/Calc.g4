grammar Calc;

/*
 * Tokens (terminal)
 */

// Symbols
MUL: '*';
DIV: '/';
MOD: '%';
ADD: '+';
SUB: '-';

INC: '++';
DEC: '--';

EQ: '==';
NEQ: '!=';
SLT: '<';
SGT: '>';
LTE: '<=';
GTE: '>=';

ASSIGN: '=';
ASSIGN_ADD: '+=';
ASSIGN_SUB: '-=';
ASSIGN_MUL: '*=';
ASSIGN_DIV: '/=';
ASSIGN_MOD: '%=';
ASSIGN_SHL: '<<=';
ASSIGN_SHR: '>>=';
ASSIGN_OR: '|=';
ASSIGN_XOR: '^=';
ASSIGN_AND: '&=';

BITWISE_AND: '&';
BITWISE_XOR: '^';
BITWISE_OR: '|';
BITWISE_CMPL: '~';

LOGICAL_AND: '&&';
LOGICAL_OR: '||';

SHL: '<<';
SHR: '>>';

OPEN_PARENTHESIS: '(';
CLOSED_PARENTHESIS: ')';
LEFT_BRACE: '{';
RIGHT_BRACE: '}';
COMMA: ',';
QUESTION: '?';
EXCLAM: '!';
COLON: ':';
SEMI: ';';

// Types
INT: 'int';
VOID: 'void';

// Keywords
CASE: 'case';
DEFAULT: 'default';
IF: 'if';
ELSE: 'else';
SWITCH: 'switch';
WHILE: 'while';
DO: 'do';
FOR: 'for';
CONTINUE: 'continue';
BREAK: 'break';
RETURN: 'return';

// Fragments
NUMBER: [0-9]+;
WHITESPACE: [ \r\n\t]+ -> skip;
IDENTIFIER:
	IDENTIFIER_NON_DIGIT (IDENTIFIER_NON_DIGIT | DIGIT)*;

fragment IDENTIFIER_NON_DIGIT:
	NON_DIGIT; //|   // other implementation-defined characters...

fragment NON_DIGIT: [a-zA-Z_];

fragment DIGIT: [0-9];

/*
 * Productions
 */
start: (statement | functionDefinition)*;

statement:
	labeledStatement
	| compoundStatement
	| declaration
	| expressionStatement
	| selectionStatement
	| iterationStatement
	| jumpStatement;

// Function definition =======================================

functionDefinition:
	declSpec = declarationSpecifier decl = declarator body = compoundStatement;

parameterList:
	parameterDeclaration (COMMA parameterDeclaration)*;

parameterDeclaration: declarationSpecifier decl = declarator;

// Labeled statement =======================================

labeledStatement:
	// TODO
	CASE test = expression COLON body = statement	# CaseStatement
	| DEFAULT COLON body = statement				# DefaultStatement;

// Compound statement =======================================

compoundStatement:
	LEFT_BRACE blockItems = blockItemList? RIGHT_BRACE;

blockItemList: statement+;

// Declaration =======================================

declaration:
	declSpec = declarationSpecifier initDecls = initDeclaratorList SEMI;

declarationSpecifier: typeSpec = typeSpecifier;

typeSpecifier: type = (VOID | INT);

initDeclaratorList: initDeclarator (COMMA initDeclarator)*;

initDeclarator: decl = declarator (ASSIGN init = initializer)?;

declarator: dirDecl = directDeclarator;

directDeclarator:
	id = IDENTIFIER
	// Function definition
	| dirDecl = directDeclarator OPEN_PARENTHESIS params = parameterList? CLOSED_PARENTHESIS;

initializer: assignExpr = assignmentExpression;

assignmentExpression: expr = expression;

// Expression statement =======================================

expressionStatement: expression SEMI;

expression:
	NUMBER														# Number
	| IDENTIFIER												# Identifier
	| OPEN_PARENTHESIS inner = expression CLOSED_PARENTHESIS	# Parentheses

	// (Function) call expression
	| id = IDENTIFIER OPEN_PARENTHESIS args = argumentExpressionList? CLOSED_PARENTHESIS # Call

	// Update expressions
	| argument = expression operator = INC	# IncrementPostfix
	| argument = expression operator = DEC	# DecrementPostfix
	| operator = INC argument = expression	# IncrementPrefix
	| operator = DEC argument = expression	# DecrementPrefix

	// (Unary) arithmetic expressions
	| operator = ADD argument = expression	# Positive
	| operator = SUB argument = expression	# Negative

	// (Unary) bitwise expression
	| operator = BITWISE_CMPL argument = expression # BitwiseComplement

	// (Unary) logical expression
	| operator = EXCLAM argument = expression # Factorial

	// (Binary) arithmetic expressions
	| left = expression operator = MUL right = expression	# Multiplication
	| left = expression operator = DIV right = expression	# Division
	| left = expression operator = MOD right = expression	# Modulo
	| left = expression operator = ADD right = expression	# Addition
	| left = expression operator = SUB right = expression	# Subtraction

	// Shift expressions
	| left = expression operator = SHL right = expression	# ShiftLeft
	| left = expression operator = SHR right = expression	# ShiftRight

	// Relational expressions
	| left = expression operator = EQ right = expression	# Equals
	| left = expression operator = NEQ right = expression	# NotEquals
	| left = expression operator = SLT right = expression	# StrictlyLessThan
	| left = expression operator = LTE right = expression	# LessThanOrEquals
	| left = expression operator = SGT right = expression	# StrictlyGreaterThan
	| left = expression operator = GTE right = expression	# GreaterThanOrEquals

	// (Binary) bitwise expressions
	| left = expression operator = BITWISE_OR right = expression	# BitwiseOr
	| left = expression operator = BITWISE_XOR right = expression	# BitwiseXor
	| left = expression operator = BITWISE_AND right = expression	# BitwiseAnd

	// (Binary) logical expressions
	| left = expression operator = LOGICAL_OR right = expression	# LogicalOr
	| left = expression operator = LOGICAL_AND right = expression	# LogicalAnd

	// Conditional expression
	| test = expression QUESTION cons = expression COLON alt = expression # Conditional

	// Assignment expressions
	| left = IDENTIFIER operator = ASSIGN right = expression		# Assignment
	| left = IDENTIFIER operator = ASSIGN_ADD right = expression	# AdditionAssignment
	| left = IDENTIFIER operator = ASSIGN_SUB right = expression	# SubtractionAssignment
	| left = IDENTIFIER operator = ASSIGN_MUL right = expression	# MultiplicationAssignment
	| left = IDENTIFIER operator = ASSIGN_DIV right = expression	# DivisionAssignment
	| left = IDENTIFIER operator = ASSIGN_MOD right = expression	# ModuloAssignment
	| left = IDENTIFIER operator = ASSIGN_SHL right = expression	# ShiftLeftAssignment
	| left = IDENTIFIER operator = ASSIGN_SHR right = expression	# ShiftRightAssignment
	| left = IDENTIFIER operator = ASSIGN_OR right = expression		# BitwiseOrAssignment
	| left = IDENTIFIER operator = ASSIGN_XOR right = expression	# BitwiseXorAssignment
	| left = IDENTIFIER operator = ASSIGN_AND right = expression	# BitwiseAndAssignment;

argumentExpressionList: expression (COMMA expression)*;

// Selection statements =======================================

selectionStatement:
	IF OPEN_PARENTHESIS test = expression CLOSED_PARENTHESIS cons = statement (
		ELSE alt = statement
	)? # IfStatement
	// TODO
	| SWITCH OPEN_PARENTHESIS disc = expression CLOSED_PARENTHESIS cases = statement #
		SwitchCaseStatement;

// Iteration statements =======================================

iterationStatement:
	WHILE OPEN_PARENTHESIS test = expression CLOSED_PARENTHESIS body = statement			# WhileStatement
	| DO body = statement WHILE OPEN_PARENTHESIS test = expression CLOSED_PARENTHESIS SEMI	#
		DoWhileStatement
	// TODO
	| FOR OPEN_PARENTHESIS SEMI SEMI CLOSED_PARENTHESIS body = statement # ForStatement;

// Jump statements =======================================

jumpStatement:
	CONTINUE SEMI							# ContinueStatement
	| BREAK SEMI							# BreakStatement
	| RETURN argument = expression? SEMI	# ReturnStatement;
