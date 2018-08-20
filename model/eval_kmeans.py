import numpy as np
import sys
import json
import os
import json
import pickle

from train_kmeans import predict
from train_kmeans import create_dataset
from train_kmeans import evaluate
from sklearn.cluster import KMeans
from sklearn.externals import joblib

def main():
    ordering = np.load('kmeans_ordering.npy')
    with open('kmeans_mapping.pkl', 'rb') as f:
        mapping = pickle.load(f)

    classpaths = [sys.argv[1]]
    X, _, _ = create_dataset(classpaths, ordering)

    kmeans = joblib.load('kmeans_model.pkl')
    y = predict(kmeans, mapping, X)[0]

    distances = np.array([np.linalg.norm(X - center) for center in kmeans.cluster_centers_])
    distances = distances / np.sum(distances)
    sorted_distances = sorted(distances)

    confidence = 1
    if len(sorted_distances) > 1:
        confidence = round(sorted_distances[-1] - sorted_distances[-2], 2)

    category = get_datasets()[y]
    print(json.dumps({"category": category, "confidence": confidence}))


def get_datasets():
    """Extract dataset names."""
    return sorted(list({path.split('_')[0] for path in os.listdir('./data')
        if '.DS' not in path}))

if __name__ == '__main__':
    main()
