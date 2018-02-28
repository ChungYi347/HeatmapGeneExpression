from clusters import *

cluster_param = ["single", "complete", "average", "weighted", "centroid", "median", "ward"]
axis = ["both", "x", "y"]
data_file = "Spellman_30.csv"
input_path = "../static/data/" + data_file
for i in cluster_param:
    for j in axis:
        if j == "both":
            output_path = "../static/data/output" + "_" + i + ".json"
        else:
            output_path = "../static/data/output" + "_" + i + "_" + j + ".json"
        clustering(input_path, output_path, i, j, "csv")