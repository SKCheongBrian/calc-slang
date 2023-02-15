grammar Calc;

/*
 * Tokens (terminal)
 */
POW: '^';
MUL: '*';
DIV: '/';
ADD: '+';
SUB: '-';
ASSIGN: '=';
SEMI: ';';
INT: 'int';
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

declaration:
	declSpec = declarationSpecifier initDecl = initDeclarator ';';

declarationSpecifier: typeSpec = typeSpecifier;

typeSpecifier: type = ('void' | 'int');

initDeclarator: decl = declarator (ASSIGN init = initializer)?;

declarator: dirDecl = directDeclarator;

directDeclarator: id = IDENTIFIER;

initializer: expr = assignmentExpression;

assignmentExpression: number = NUMBER;

expression:
	NUMBER													# Number
	| '(' inner = expression ')'							# Parentheses
	| left = expression operator = POW right = expression	# Power
	| left = expression operator = MUL right = expression	# Multiplication
	| left = expression operator = DIV right = expression	# Division
	| left = expression operator = ADD right = expression	# Addition
	| left = expression operator = SUB right = expression	# Subtraction;
