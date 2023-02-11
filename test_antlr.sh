#!/bin/zsh

echo "antler"
yarn antlr4ts

echo "building..."
yarn build

cd dist

yarn unlink

yarn link

cd ../../CS4215-frontend

yarn unlink "calc-slang"

yarn link "calc-slang"

cd ../calc-slang