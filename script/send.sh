#!/bin/bash

PREVIOUS_CONTENT=""

while true; do
    CURRENT_CONTENT=$(xclip -selection clipboard -o)

    if [ "$CURRENT_CONTENT" != "$PREVIOUS_CONTENT" ]; then
        curl -X POST -d "$CURRENT_CONTENT" $TARGET_REMOTE

        PREVIOUS_CONTENT="$CURRENT_CONTENT"
    fi

    sleep 1
done