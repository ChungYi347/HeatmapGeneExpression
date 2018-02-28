# Heatmap Gene Expression Visualization
Heatmap and Dendrogram visualization of the normalized gene expression using hierarchical clustering <br />
<br />
\<Heatmap\> <br />
The gene expression data is displayed by colored squares in the heatmap. <br />
Green : Up-regulation <br />
Black : UNchanged expression <br />
Red : Down-regulation <br />
<br />
\<Dendrogram\> <br />
The dendrogram visualizes hierarchical clusting result which build a hierarchy of clusters.<br />

## Screenshot
### Parameter : Data - Spellman (30), Cluster Parameter - single, Axis - Both, Color - RGB
![Alt text](/static/img/SpellmanRBG.png)
### Parameter : Data - Spellman (30), Cluster Parameter - complete, Axis - Both, Color - ROY
![Alt text](/static/img/SpellmanROY.png)
### Parameter : Data - Spellman (30), Cluster Parameter - median, Axis - Both, Color - RWB
![Alt text](/static/img/SpellmanRWB.png)

## Setup
### Prerequisites
* Python 3.5+
* scipy 0.18.1
* pandas 0.18.1
* numpy 1.12.1

Data : <http://www.exploredata.net/Downloads/Gene-Expression-Data-Set>
