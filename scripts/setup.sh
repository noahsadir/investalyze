#! /bin/bash

# basic setup
mkdir ./investalyze
cd ./investalyze

# clone files
git clone https://github.com/noahsadir/investalyze
mv investalyze cloned_files

# configure node and react
npx create-react-app react_app --template typescript
npm install express
npm i --save-dev @types/express
npm install typescript

cd ./react_app
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @fontsource/open-sans
cd ..

# replace backend config
cp ./cloned_files/tsconfig.json ./
cp ./cloned_files/package.json ./

# replace react files
rm -r ./react_app/src/
rm -r ./react_app/build/
cp -r ./cloned_files/react_app/src/ ./react_app/
cp -r ./cloned_files/react_app/build/ ./react_app/
cp -r ./cloned_files/src/ ./src/
cp ./cloned_files/tsconfig.json ./
cp ./cloned_files/package.json ./
