#!/bin/zsh

echo "Running antlr..."
yarn antlr4ts
echo "antlr complete!"

echo "Building backend..."
yarn build
echo "Backend successfully built!"

cd dist

yarn unlink

yarn link

cd ../../CS4215-frontend

echo "Linking to frontend..."
yarn unlink "calc-slang"
yarn link "calc-slang"
echo "Frontend successfully built!..."

cd ../calc-slang

echo "Backend successfully built and linked!"
echo "========================================"
