import CSSaccess, rdfindex
from rdflib import URIRef, BNode, Literal, Graph, Namespace


def crawl(address, CSSa):
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
            d=crawl(f,CSSa)
            filedict|=d
        elif ('.' in f.rsplit('/')[-1]) and (not f.endswith('ttl')):
            filedict[f]=CSSa.get_file(f)
        else:
            pass

    return filedict



def crawllist(address, CSSa, indexaddress):
    filelist= []
    data = CSSa.get_file(address)
    #print(data)
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
            filelist+=d
        elif f!=indexaddress:
            filelist.append(f)
        else:
            pass

    return filelist