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
INT : 'int';
NUMBER: [0-9]+;
WHITESPACE: [ \r\n\t]+ -> skip;
IDENTIFIER
    :   IDENTIFIER_NON_DIGIT
        (   IDENTIFIER_NON_DIGIT
        |   DIGIT
        )*
    ;

fragment
IDENTIFIER_NON_DIGIT
    :   NON_DIGIT
    //|   // other implementation-defined characters...
    ;

fragment
NON_DIGIT
    :   [a-zA-Z_]
    ;

fragment
DIGIT
    :   [0-9]
    ;

/*
 * Productions
 */
start : declaration;

expression
   : NUMBER                                         # Number
   | '(' inner=expression ')'                       # Parentheses
   | left=expression operator=POW right=expression  # Power
   | left=expression operator=MUL right=expression  # Multiplication
   | left=expression operator=DIV right=expression  # Division
   | left=expression operator=ADD right=expression  # Addition
   | left=expression operator=SUB right=expression  # Subtraction
   ;

declaration
   : declarationSpecifiers initDeclaratorList? ';'
   ;

declarationSpecifiers
   : declarationSpecifier+
   ;

declarationSpecifier
   : typeSpecifier
   ;

initDeclaratorList
   : initDeclarator (',' initDeclarator)*
   ;

initDeclarator
   : declarator ('=' initializer)?
   ;

initializer
   : assignmentExpression
   ;
    
assignmentExpression
   : NUMBER 
   ;

typeSpecifier
   : ('void'
   | 'int')
   ;

declarator
   : directDeclarator
   ;

directDeclarator
   : IDENTIFIER
   ;

assignmentOperator
   : '='
   ;
