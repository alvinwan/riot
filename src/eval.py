import numpy as np
import sys
import json
import os

with open(sys.argv[1]) as f:
    samples = json.load(f)['samples']

from train import create_samples

w = np.load('w.npy')
ordering = np.load('ordering.npy')
X, _ = create_samples(samples, None, ordering)
y_oh = np.array(X).dot(w)
y = np.asscalar(np.argmax(y_oh, axis=1))

y_second_largest = y_oh.copy()[0]
y_second_largest[y] = 0
y_second_largest = np.max(y_second_largest)
confidence = y_oh[0][y] - y_second_largest
confidence = round(confidence, 2)

def get_datasets():
    datasets = set()
    for filename in os.listdir('./data'):
        datasets.add(filename.split('_')[0])
    return sorted(list([data for data in datasets if data not in ['.DS']]))

datasets = get_datasets()
category = datasets[y]
print('{},{}'.format(category, confidence))
