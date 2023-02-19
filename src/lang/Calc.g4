grammar Calc;

/*
 * Tokens (terminal)
 */
POW: '^';
MUL: '*';
DIV: '/';
MODULO: '%';
ADD: '+';
SUB: '-';
INC: '++';
DEC: '--';
ASSIGN: '=';
BITWISE_AND: '&';
BITWISE_OR: '|';
LOGICAL_AND: '&&';
LOGICAL_OR: '||';
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
	NUMBER																	# Number
	| IDENTIFIER															# Identifier
	| OPEN_PARENTHESIS inner = expression CLOSED_PARENTHESIS				# Parentheses
	| operator = ADD argument = expression									# Positive
	| operator = SUB argument = expression									# Negative
	| operator = EXCLAM argument = expression								# Factorial
	| operator = INC argument = expression									# IncrementPrefix
	| operator = DEC argument = expression									# DecrementPrefix
	| argument = expression operator = INC									# IncrementPostfix
	| argument = expression operator = DEC									# DecrementPostfix
	| left = expression operator = POW right = expression					# Power
	| left = expression operator = MUL right = expression					# Multiplication
	| left = expression operator = DIV right = expression					# Division
	| left = expression operator = MODULO right = expression				# Modulo
	| left = expression operator = ADD right = expression					# Addition
	| left = expression operator = SUB right = expression					# Subtraction
	| test = expression QUESTION cons = expression COLON alt = expression	# Conditional;
