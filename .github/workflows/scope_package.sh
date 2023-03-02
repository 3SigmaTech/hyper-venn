#!/usr/bin/env bash

YOUR_FILE='package.json'

if [[ "$OSTYPE" == "darwin"* ]]; then
  FINDTEXT="\\\"name\\\": \\\"hyper-venn\\\""
  SUBSTEXT="\\\"name\\\": \\\"@3SigmaTech\/hyper-venn\\\""
  sed -i "" "s/$FINDTEXT/$SUBSTEXT/g" $YOUR_FILE
else
  sed -i $YOUR_FILE '0,/hyper-venn/{s/hyper-venn/@3SigmaTech\/hyper-venn/}'
fi