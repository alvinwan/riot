import numpy as np
from scipy.linalg import lstsq
import json
import sys


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
                yield [network['mac'] for network in sample], \
                    [network['signal_level'] for network in sample], label


def bag_of_words(all_networks, all_strengths, ordering):
    """Apply bag-of-words encoding to categorical variables.

    >>> samples = bag_of_words(
    ...     [['a', 'b'], ['b', 'c'], ['a', 'c']],
    ...     [[1, 2], [2, 3], [1, 3]],
    ...     ['a', 'b', 'c'])
    >>> next(samples)
    [1, 2, 0]
    >>> next(samples)
    [0, 2, 3]
    """
    for networks, strengths in zip(all_networks, all_strengths):
        yield [int(strengths[networks.index(network)])
            if network in networks else 0
            for network in ordering]


def create_dataset(classpaths, ordering=None):
    """Create dataset from a list of paths to JSON files."""
    networks, strengths, labels = zip(*get_all_samples(classpaths))
    if ordering is None:
        ordering = list(sorted(set(flatten(networks))))
    X = np.array(list(bag_of_words(networks, strengths, ordering)))
    Y = np.array(list(labels))
    return X, Y, ordering


def softmax(x):
    """Convert one-hotted outputs into probability distribution"""
    x = np.exp(x)
    return x / np.sum(x)


def predict(X, w):
    """Predict using model parameters"""
    return np.argmax(softmax(X.dot(w)), axis=1)


def evaluate(X, Y, w):
    """Evaluate model w on samples X and labels Y."""
    Y_pred = predict(X, w)
    accuracy = (Y == Y_pred).sum() / X.shape[0]
    return accuracy


def main():
    classes = sys.argv[1:]

    train_paths = sorted(['data/{}_train.json'.format(name) for name in classes])
    test_paths = sorted(['data/{}_test.json'.format(name) for name in classes])
    X_train, Y_train, ordering = create_dataset(train_paths)
    X_test, Y_test, _ = create_dataset(test_paths, ordering=ordering)

    Y_train_oh = np.eye(len(classes))[Y_train]
    w, _, _, _ = lstsq(X_train, Y_train_oh)
    train_accuracy = evaluate(X_train, Y_train, w)
    validation_accuracy = evaluate(X_test, Y_test, w)

    print('Train accuracy ({}%), Validation accuracy ({}%)'.format(train_accuracy*100, validation_accuracy*100))
    np.save('w.npy', w)
    np.save('ordering.npy', np.array(ordering))
    sys.stdout.flush()


if __name__ == '__main__':
    main()
