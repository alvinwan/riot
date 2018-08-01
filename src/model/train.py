import numpy as np
from scipy.linalg import lstsq
import json
import sys


ordering = None


def flatten(list_of_lists):
    """Flatten a list of lists to make a list.
    >>> flatten([[1], [2], [3, 4]])
    [1, 2, 3, 4]
    """
    return sum(list_of_lists, [])


def get_all_samples(paths):
    """Load all samples from JSON files."""
    for label, path in enumerate(paths):
        with open(path) as f:
            for sample in json.load(f)['samples']:
                yield [network['mac'] for network in sample], label


def one_hot(samples, ordering):
    """Apply one-hot encoding to categorical variables.

    >>> samples = one_hot([['a', 'b'], ['b', 'c'], ['a', 'c']], ['a', 'b', 'c'])
    >>> next(samples)
    [1, 1, 0]
    >>> next(samples)
    [0, 1, 1]
    """
    for sample in samples:
        yield [int(key in sample) for key in ordering]


def create_dataset(classpaths, ordering=None):
    """Create dataset from a list of paths to JSON files."""
    samples, labels = zip(*get_all_samples(classpaths))
    if ordering is None:
        ordering = list(sorted(set(flatten(samples))))
    X = np.array(list(one_hot(samples, ordering)))
    Y = np.array(list(labels))
    return X, Y, ordering


def main():
    classes = sys.argv[1:]

    train_paths = sorted(['data/{}_train.json'.format(name) for name in classes])
    test_paths = sorted(['data/{}_test.json'.format(name) for name in classes])
    X_train, Y_train, ordering = create_dataset(train_paths)
    X_test, Y_test, _ = create_dataset(test_paths, ordering=ordering)

    Y_train_oh = np.eye(len(classes))[Y_train]
    w, _, _, _ = lstsq(X_train, Y_train_oh)
    train_accuracy = evaluate(X_train, Y_train, w)
    test_accuracy = evaluate(X_test, Y_test, w)

    print('Train accuracy ({}%), Validation accuracy ({}%)'.format(train_accuracy*100, test_accuracy*100))
    np.save('w.npy', w)
    np.save('ordering.npy', np.array(ordering))
    sys.stdout.flush()


def evaluate(X, Y, w):
    """Evaluate model w on samples X and labels Y."""
    Y_pred = np.argmax(X.dot(w), axis=1)
    accuracy = (Y == Y_pred).sum() / X.shape[0]
    return accuracy


if __name__ == '__main__':
    main()
