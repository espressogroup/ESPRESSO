import CSSaccess, rdfindex
from rdflib import URIRef, BNode, Literal, Graph, Namespace

def crawl(address, CSSa, indexaddress):
    filedict= dict()
    data = CSSa.get_file(address)
    print(data)
    g=Graph().parse(data=data,publicID=address)
    #q1='''
    #prefix ldp: <http://www.w3.org/ns/ldp#>
    
    #SELECT ?s ?p ?o WHERE{
    #   ?s ?p ?o .
    #}
    #'''
    #for r in g.query(q1):
    #    print(r)
    q='''
    prefix ldp: <http://www.w3.org/ns/ldp#>
    
    SELECT ?f WHERE{
        ?a ldp:contains ?f.
    }
    '''
    for r in g.query(q):
        print(r["f"])
        f=str(r["f"])
        if f[-1]=='/':
            d=crawl(f,CSSa,indexaddress)
            filedict|=d
        elif f!=indexaddress:
            filedict[f]=CSSa.get_file(f)
        else:
            pass

    return filedict