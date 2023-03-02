#!/usr/bin/env bash

YOUR_FILE='package.json'
FINDTEXT="\"name\": \"hyper-venn\""
SUBSTEXT="\"name\": \"@3SigmaTech\/hyper-venn\""

if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i "" "s/$FINDTEXT/$SUBSTEXT/g" $YOUR_FILE
else
  sed -i $YOUR_FILE 's/$FINDTEXT/$SUBSTEXT/g'
fi