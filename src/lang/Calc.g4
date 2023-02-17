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
OPEN_PARENTHESIS: '(';
CLOSED_PARENTHESIS: ')';
COMMA: ',';
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
	| OPEN_PARENTHESIS inner = expression CLOSED_PARENTHESIS	# Parentheses
	| left = expression operator = POW right = expression		# Power
	| left = expression operator = MUL right = expression		# Multiplication
	| left = expression operator = DIV right = expression		# Division
	| left = expression operator = ADD right = expression		# Addition
	| left = expression operator = SUB right = expression		# Subtraction;
