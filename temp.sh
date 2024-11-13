#!/bin/bash

MIN_UPTIME=300
RESTART_DELAY=300
HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

while true; do
	start_time=$(date +%s)

	bun "$HERE/dist/main.mjs"
	end_time=$(date +%s)
	runtime=$((end_time - start_time))
	if [ $runtime -lt $MIN_UPTIME ]; then
		echo "Bot crashed too quickly"
		sleep $RESTART_DELAY
	else
		echo "Bot did good, but died, rest in peace you beautiful fuck"
		sleep 3
	fi
done

