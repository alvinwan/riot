import numpy as np
from scipy.linalg import lstsq
import json


def create_dataset(class0path, class1path, ordering=None):
    with open(class0path)  as f:
        class0 = json.load(f)['samples']

    with open(class1path) as f:
        class1 = json.load(f)['samples']

    if ordering is None:
        macs = set()
        for sample in class0 + class1:
            for network in sample:
                macs.add(network['mac'])

        ordering = list(macs)
        print('Unique networks:', len(macs))

    X0, Y0 = create_samples(class0, [1, 0], ordering)
    X1, Y1 = create_samples(class1, [0, 1], ordering)

    X = np.array(X0 + X1)
    Y = np.array(Y0 + Y1)
    return X, Y, ordering

def create_samples(samples, cls, ordering):
    X = []
    Y = []

    for sample in samples:
        sample_macs = {network['mac'] for network in sample}
        Y.append(cls)
        X.append([int(mac in sample_macs) for mac in ordering])
    return X, Y

def main():
    X_train, Y_train_oh, ordering = create_dataset('livingroom.json', 'bedroom.json')
    results = lstsq(X_train, Y_train_oh)
    w = results[0]
    np.save('w.npy', w)
    np.save('ordering.npy', np.array(ordering))

    X_test, Y_test_oh, _ = create_dataset('livingroom_test.json', 'bedroom_test.json', ordering=ordering)
    Y_test_pred_oh = X_test.dot(w)
    Y_test = np.argmax(Y_test_oh, axis=1)
    Y_test_pred = np.argmax(Y_test_pred_oh, axis=1)

    n = 24.
    print('Accuracy:', (n - (Y_test - Y_test_pred).sum()) / n)


if __name__ == '__main__':
    main()
