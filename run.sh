while true; do
    node index.js
    python -W ignore eval.py samples.json
done
