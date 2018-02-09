import sys, numpy, scipy, csv, pandas
import scipy.cluster.hierarchy as hier
import scipy.spatial.distance as dist
import scipy.stats as stats


class HierarchyCluster(object):
    def __init__(self, data, param, axis, delimiter):
        self.data = data
        self.param = param
        self.axis = axis
        self.delimiter = delimiter

    def chk_log2(self, avg_quan_val):
        if (avg_quan_val[.99] > 100) or (avg_quan_val[1.0] - avg_quan_val[0.0] > 50 \
        and avg_quan_val[0.25] > 0) or (avg_quan_val[0.25] > 0 and avg_quan_val[0.25] < 1 \
        and avg_quan_val[0.75] > 1 and avg_quan_val[0.75] < 2):
            return True
        return False

    def cluster(self):
        data_matrix, row_headers, col_headers = self.data['data_matrix'], self.data['row_headers'], self.data['col_headers']

        # Detect whether log2 transform and tranform data using log2
        express_value = pandas.DataFrame(numpy.log2(data_matrix))
        express_value = express_value.fillna(0)
        qunant_val = express_value.quantile([0., 0.25, 0.5, 0.75, 0.99, 1.0])
        avg_quan_val = (qunant_val[0] + qunant_val[1] + qunant_val[2] + qunant_val[3]) / 4
        if self.chk_log2(avg_quan_val):
            # log2 transform
            data_matrix = numpy.log2(data_matrix)
            # convert native data array into a numpy array
            # col_data_matrix = numpy.log2(col_data_matrix)

        # Zscore transform in order to make normal distribution
        data_matrix = stats.zscore(data_matrix, 1, 1)
        #col_data_matrix = stats.zscore(col_data_matrix, 1, 1)

        # calculate distance matrix
        distance_matrix = dist.pdist(data_matrix)
        distance_square_matrix = dist.squareform(distance_matrix)
        linkage_matrix = hier.linkage(distance_square_matrix)

        heatmap_order = hier.leaves_list(linkage_matrix)
        ordered_data_matrix = data_matrix[heatmap_order, :]

        row_headers = numpy.array(row_headers)
        ordered_row_headers = row_headers[heatmap_order]
        matrix_output = []
        row = 0
        for row_data in ordered_data_matrix:
            col = 0
            row_output = []
            for col_data in row_data:
                row_output.append([col_data, row, col])
                col += 1
            matrix_output.append(row_output)
            row += 1

        print('var maxData = ' + str(numpy.amax(data_matrix)) + ";")
        print('var minData = ' + str(numpy.amin(data_matrix)) + ";")
        print('var data = ' + str(matrix_output) + ";")
        print('var cols = ' + str(col_headers) + ";")
        print('var rows = ' + str([x for x in ordered_row_headers]) + ";")


def clustering(input_path=None, output_path=None, param="single", axis="both", delimiter="csv"):
    if delimiter == "csv":
        delimiter = ","
    elif delimiter == "tsv":
        delimiter = "\t"

    if input_path == None:
        # open data csv file
        with open("../static/data/data.csv", "r") as rf:
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
            data_matrix = numpy.array(data_matrix)

            data = {
                "data_matrix" : data_matrix,
                "row_headers" : row_headers,
                "col_headers" : col_headers
            }
    HierarchyCluster(data, param, axis, delimiter).cluster()

if __name__ == "__main__":
    clustering()