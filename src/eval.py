import numpy as np
import sys
import json

with open(sys.argv[1]) as f:
    samples = json.load(f)['samples']

from train import create_samples

w = np.load('w.npy')
ordering = np.load('ordering.npy')
X, _ = create_samples(samples, None, ordering)
y_oh = np.array(X).dot(w)
y = np.asscalar(np.argmax(y_oh, axis=1))

confidence = np.abs(y_oh[0][0] - y_oh[0][1])

if y == 0:
    print('philz (confidence:{})'.format(round(confidence, 2)))
else:
    print('outdoors (confidence:{})'.format(round(confidence, 2)))
