import numpy as np
from sklearn.cluster import KMeans
import json
import sys
import os
import pickle
from sklearn.externals import joblib


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


def predict(model, mapping, X):
    return [mapping[y_pred] for y_pred in model.predict(X)]


def evaluate(Y, Y_pred):
    """Evaluate model w on samples X and labels Y."""
    accuracy = (Y == Y_pred).sum() / Y.shape[0]
    return accuracy


def majority_vote(Y_pred, Y):
    pred_to_true = {}
    for y_pred, y in zip(Y_pred, Y):
        y_pred = np.asscalar(y_pred)
        pred_to_true[y_pred] = pred_to_true.get(y_pred, [])
        pred_to_true[y_pred].append(y)
    for y_pred, labels in pred_to_true.items():
        pred_to_true[y_pred] = np.bincount(labels).argmax()
    return pred_to_true


def main():
    if not os.path.exists('data'):
         raise UserWarning('Could not find ./data/ directory. Have you created a '
             'directory for data and collected data yet?')
    classes = sys.argv[1:]

    train_paths = sorted(['data/{}_train.json'.format(name) for name in classes])
    test_paths = sorted(['data/{}_test.json'.format(name) for name in classes])
    X_train, Y_train, ordering = create_dataset(train_paths)
    X_test, Y_test, _ = create_dataset(test_paths, ordering=ordering)

    Y_train_oh = np.eye(len(classes))[Y_train]
    kmeans = KMeans(n_clusters=len(classes)).fit(X_train)
    mapping = majority_vote(kmeans.predict(X_train), Y_train)
    params = kmeans.get_params()
    train_accuracy = evaluate(Y_train, predict(kmeans, mapping, X_train))
    validation_accuracy = evaluate(Y_test, predict(kmeans, mapping, X_test))

    print('Train accuracy ({}%), Validation accuracy ({}%)'.format(train_accuracy*100, validation_accuracy*100))
    np.save('kmeans_ordering.npy', np.array(ordering))

    joblib.dump(kmeans, 'kmeans_model.pkl')
    with open('kmeans_mapping.pkl', 'wb') as f:
        pickle.dump(mapping, f)
    sys.stdout.flush()


if __name__ == '__main__':
    main()
