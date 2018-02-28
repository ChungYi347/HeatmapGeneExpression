import random, csv

with open("../static/data/gene_data.csv", "w") as wf:
    csv_writer = csv.writer(wf, delimiter=',')
    gene_num = 50
    cond = 10
    gene_name = ["gene" + str(i) for i in range(0, gene_num)]
    cond_name = ["cond" + str(i) for i in range(0, cond)]
    gene_list = []
    for i in range(0, gene_num):
        gene = []
        for j in range(0, cond):
            gene.append(round(random.random() * 10000, 3))
        gene_list.append(gene)

    for i in gene_list:
        csv_writer.writerow(i)