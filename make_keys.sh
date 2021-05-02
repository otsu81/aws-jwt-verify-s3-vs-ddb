#!/bin/bash

function rand-str {
    local DEFAULT_LENGTH=64
    local LENGTH=${1:-$DEFAULT_LENGTH}

    tr -dc A-Za-z0-9 </dev/urandom | head -c $LENGTH
}

function make-key {
    local RAND=$(rand-str 32)
    openssl genrsa -out private_keys/$RAND 2048 &>/dev/null
    openssl rsa -in private_keys/$RAND -pubout -out public_keys/${RAND}.pub &>/dev/null
}

for ((i = 1; i <= $1; i++)); do
    make-key &
done

exit 0