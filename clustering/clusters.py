import sys, scipy, csv, pandas, json
import numpy as np
import scipy.cluster.hierarchy as hier
import scipy.spatial.distance as dist
import scipy.stats as stats
import argparse

class HierarchyCluster(object):
    def __init__(self, data, param, axis, delimiter):
        self.data = data
        self.param = param
        self.axis = axis
        self.delimiter = delimiter
        self.dendrogram = []

    def chk_log2(self, avg_quan_val):
        if (avg_quan_val[.99] > 100) or (avg_quan_val[1.0] - avg_quan_val[0.0] > 50 \
        and avg_quan_val[0.25] > 0) or (avg_quan_val[0.25] > 0 and avg_quan_val[0.25] < 1 \
        and avg_quan_val[0.75] > 1 and avg_quan_val[0.75] < 2):
            return True
        return False

    def transform(self, data_matrix):
        # Detect whether log2 transform and tranform data using log2
        express_value = pandas.DataFrame(np.log2(data_matrix))
        express_value = express_value.fillna(0)
        qunant_val = express_value.quantile([0., 0.25, 0.5, 0.75, 0.99, 1.0])
        avg_quan_val = (qunant_val[0] + qunant_val[1] + qunant_val[2] + qunant_val[3]) / 4
        if self.chk_log2(avg_quan_val):
            # log2 transform
            data_matrix = np.log2(data_matrix)

        #col_data_matrix = data_matrix.transpose()

        # Zscore transform in order to make normal distribution
        data_matrix = stats.zscore(data_matrix, 1, 1)
        return data_matrix

    def make_dendrogram(self, tree, p):
        path = p[:]
        if tree.is_leaf():
            path.append(str(tree.get_id()))
            self.dendrogram.append('.'.join(path))
        else:
            path.append(str(tree.get_id()))
            self.dendrogram.append('.'.join(path))

            left = tree.get_left()
            if left:
                self.make_dendrogram(left, path)
            right = tree.get_right()
            if right:
                self.make_dendrogram(right, path)
    """
    def make_dendrogram(self, node):
        if node.is_leaf() == False:
            self.make_dendrogram(node.get_left())
            self.make_dendrogram(node.get_right())
        else:
            return [node.get_id()]

        print(self.dendrogram)
    """

    def cal_linkage(self, data_matrix, row_headers, param):
        req = {
            "ordered_data_matrix" : [],
            "ordered_row_headers" : []
        }

        # calculate distance matrix
        distance_matrix = dist.pdist(data_matrix)
        distance_square_matrix = dist.squareform(distance_matrix)
        linkage_matrix = hier.linkage(distance_square_matrix, param)

        rootnode, nodelist = hier.to_tree(linkage_matrix, rd=True)
        self.dendrogram = []
        #dendrogram = [i[1:] for i in self.make_dendrogram(rootnode, [])]
        self.make_dendrogram(rootnode, [])

        heatmap_order = hier.leaves_list(linkage_matrix)
        req["data_matrix"] = data_matrix
        req["ordered_data_matrix"] = data_matrix[heatmap_order, :]

        row_headers = np.array(row_headers)
        req["ordered_row_headers"] = row_headers[heatmap_order]
        req["dendrogram"] = self.dendrogram
        req['heatmap_order'] = heatmap_order

        return req

    def save_result(self, row_link, col_link, min_val, max_val):
        out = {
            "max" : max_val,
            "min" : min_val,
            "names" : list(row_link["ordered_row_headers"]),
            "labels": list(col_link["ordered_row_headers"]),
            "dendrogram" : row_link["dendrogram"],
            "col_dendrogram": col_link["dendrogram"]
        }
        matrix_output = []
        row = 0

        clustered_data = row_link['ordered_data_matrix']
        if self.axis == "y":
            clustered_data = row_link['data_matrix']

        col_order = col_link['heatmap_order']
        if self.axis == "x":
            col_order = [i for i in range(0, len(col_link['heatmap_order']))]

        for row_data in clustered_data:
            col = 0
            row_output = []
            for col_data in row_data:
                row_output.append([col_data, row, int(col_order[col])])
                col += 1
            matrix_output.append(row_output)
            row += 1

        out["clustered_data"] = matrix_output
        return out

    def cluster(self):
        data_matrix, row_headers, col_headers, param = \
            self.data['data_matrix'], self.data['row_headers'], self.data['col_headers'], self.param

        data_matrix = self.transform(data_matrix)
        col_data_matrix = self.transform(data_matrix.transpose())

        row = self.cal_linkage(data_matrix, row_headers, param)
        col = self.cal_linkage(col_data_matrix, col_headers, param)

        min_val = np.amin(data_matrix)
        max_val = np.amax(data_matrix)

        output = self.save_result(row, col, min_val, max_val)
        return output

def clustering(input_path=None, output_path=None, param="single", axis="both", delimiter="csv"):
    if delimiter == "csv":
        delimiter = ","
    elif delimiter == "tsv":
        delimiter = "\t"

    if input_path == None:
        # open data csv file
        with open("../static/data/Spellman_100.csv", "r") as rf:
            # read data file
            file = rf.read().splitlines()
    else:
        with open(input_path, "r") as rf:
            # read data file
            file = rf.read().splitlines()

    # store column header
    col_headers = file[0].split(delimiter)[1:]

    # define row header and data matrix
    row_headers = []
    data_matrix = []

    # read data line by line
    for line in file[1:]:
        data = line.split(",")
        # store row header and gene expression line by line
        row_headers.append(data[0])
        data_matrix.append([float(x) for x in data[1:]])

    # transform list to numpy array
    data_matrix = np.array(data_matrix)

    data = {
        "data_matrix" : data_matrix,
        "row_headers" : row_headers,
        "col_headers" : col_headers
    }
    output = HierarchyCluster(data, param, axis, delimiter).cluster()
    with open(output_path, "w") as wf:
        json.dump(output, wf)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Get some clustering parameters')
    parser.add_argument('--input', nargs='?', help='input path', default="../static/data/Spellman_100.csv")
    parser.add_argument('--output', nargs='?', help='output path', default="../static/data/output_single.json")
    parser.add_argument('--param', type=str, help='clustering parameter', default="single")
    parser.add_argument('--axis', type=str, help='clustering parameter', default="both")
    parser.add_argument('--delimiter', type=str, help='delimiter csv or tsv', default="csv")

    args = parser.parse_args()
    print(args)
    clustering(args.input, args.output, args.param, args.axis, args.delimiter)