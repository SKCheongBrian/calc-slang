grammar Calc;

/*
 * Tokens (terminal)
 */
MUL: '*';
DIV: '/';
MODULO: '%';
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
COMMA: ',';
QUESTION: '?';
EXCLAM: '!';
COLON: ':';
SEMI: ';';
INT: 'int';
VOID: 'void';
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
start: statement*;

statement: expressionStatement | declaration;

declaration:
	declSpec = declarationSpecifier initDecls = initDeclaratorList SEMI;

declarationSpecifier: typeSpec = typeSpecifier;

typeSpecifier: type = (VOID | INT);

initDeclaratorList: initDeclarator (COMMA initDeclarator)*;

initDeclarator: decl = declarator (ASSIGN init = initializer)?;

declarator: dirDecl = directDeclarator;

directDeclarator: id = IDENTIFIER;

initializer: assignExpr = assignmentExpression;

assignmentExpression: expr = expression;

expressionStatement: expression SEMI;

expression:
	NUMBER														# Number
	| IDENTIFIER												# Identifier
	| OPEN_PARENTHESIS inner = expression CLOSED_PARENTHESIS	# Parentheses

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
	| left = expression operator = ADD right = expression		# Addition
	| left = expression operator = SUB right = expression		# Subtraction
	| left = expression operator = MODULO right = expression	# Modulo
	| left = expression operator = MUL right = expression		# Multiplication
	| left = expression operator = DIV right = expression		# Division

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
	| test = expression QUESTION cons = expression COLON alt = expression # Conditional;
