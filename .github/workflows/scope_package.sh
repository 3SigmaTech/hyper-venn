#!/usr/bin/env bash
YOUR_FILE='package.json'
FINDTEXT="\"name\": \"hyper-venn\""
SUBSTEXT="\"name\": \"@3SigmaTech\/hyper-venn\""
sed -i "" "s/$FINDTEXT/$SUBSTEXT/" $YOUR_FILE