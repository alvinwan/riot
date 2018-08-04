import numpy as np
import sys
import json
import os
import json

from train import create_dataset
from train import evaluate


def main():
    w = np.load('w.npy')
    ordering = np.load('ordering.npy')

    classpaths = [sys.argv[1]]
    X, _, _ = create_dataset(classpaths, ordering)
    y_oh = X.dot(w)
    y = np.asscalar(np.argmax(y_oh, axis=1))

    sorted_y = sorted(y_oh.flatten())
    confidence = round(sorted_y[-1] - sorted_y[-2], 2)

    category = get_datasets()[y]
    print(json.dumps({"category": category, "confidence": confidence}))


def get_datasets():
    """Extract dataset names."""
    return sorted(list({path.split('_')[0] for path in os.listdir('./data')
        if '.DS' not in path}))

if __name__ == '__main__':
    main()
