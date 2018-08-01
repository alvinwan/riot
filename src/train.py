import numpy as np
from scipy.linalg import lstsq
import json
import sys


def create_dataset(*classpaths, ordering=None):
    classes = []
    for classpath in classpaths:
        with open(classpath) as f:
            classes.append(json.load(f)['samples'])
    d = len(classpaths)

    if ordering is None:
        macs = set()
        for sample in sum(classes, []):
            for network in sample:
                macs.add(network['mac'])

        ordering = list(macs)

    Xs, Ys = zip(*[create_samples(class_, np.eye(d)[i], ordering)
        for i, class_ in enumerate(classes)])

    X = np.array(sum(Xs, []))
    Y = np.array(sum(Ys, []))
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
    classnames = sys.argv[1:]

    X_train, Y_train_oh, ordering = create_dataset(
        *['data/{}_train.json'.format(name) for name in classnames])
    results = lstsq(X_train, Y_train_oh)
    w = results[0]
    np.save('w.npy', w)
    np.save('ordering.npy', np.array(ordering))

    X_test, Y_test_oh, _ = create_dataset(
        *['data/{}_test.json'.format(name) for name in classnames], ordering=ordering)

    Y_train = np.argmax(Y_train_oh, axis=1)
    train_accuracy = evaluate(X_train, Y_train, w)

    Y_test = np.argmax(Y_test_oh, axis=1)
    test_accuracy = evaluate(X_test, Y_test, w)

    print('Train accuracy ({}%), Validation accuracy ({}%)'.format(train_accuracy*100, test_accuracy*100))
    sys.stdout.flush()


def evaluate(X, Y, w):
    n = X.shape[0]
    Y_pred_oh = X.dot(w)
    Y_pred = np.argmax(Y_pred_oh, axis=1)
    accuracy = (n - (Y - Y_pred).sum()) / n
    return accuracy



if __name__ == '__main__':
    main()
