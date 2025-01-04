#!/bin/bash

if command -v python3 &>/dev/null; then
    PYTHON_CMD="python3"
elif command -v python &>/dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Neither python3 nor python is installed."
    exit 1
fi

$PYTHON_CMD -m http.server 8000
