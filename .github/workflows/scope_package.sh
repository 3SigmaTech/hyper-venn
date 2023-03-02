#!/usr/bin/env bash

YOUR_FILE='package.json'
FINDTEXT="\\\"name\\\": \\\"hyper-venn\\\""
SUBSTEXT="\\\"name\\\": \\\"@3SigmaTech\/hyper-venn\\\""

# Syntax for Linux
sed -i $YOUR_FILE "s/$FINDTEXT/$SUBSTEXT/"