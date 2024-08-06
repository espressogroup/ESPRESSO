import csv
from sys import argv
import os

    
def extractmedhistory(csvfileaddress,column,nametemplate,resultdir):
    os.makedirs(resultdir,exist_ok=True)
    with open(csvfileaddress, newline='') as csvfile:
        infotable= csv.reader(csvfile)
        i=0
        for row in infotable:
            text=row[column]
            filename=resultdir+nametemplate+str(i)+'.txt'
            i=i+1
            with open(filename,'w') as f:
                f.write(text)

    
    
if __name__ == '__main__' :
    csvfileaddress=argv[1]
    column=int(argv[2])
    nametemplate=argv[3]
    resultdir=argv[4]

    extractmedhistory(csvfileaddress,column,nametemplate,resultdir)