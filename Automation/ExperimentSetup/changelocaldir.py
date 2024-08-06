import rdflib
from urllib.parse import urljoin

# Load the RDF file
input_file_path = '/Users/ragab/Downloads/ESPRESSO/Automation/ExperimentSetup/wwwj0partexp.ttl'  
output_file_path = '/Users/ragab/Downloads/ESPRESSO/Automation/ExperimentSetup/wwwj0partexpragab.ttl'  
g = rdflib.Graph()
g.parse(input_file_path, format='turtle')

# Define the namespace and predicate
ns1 = rdflib.Namespace("http://example.org/SOLIDindex/")
predicate = ns1.LocalAddress

# Define the old and new base directories
old_base_dir = "/Users/yurysavateev/ESPRESSO/ESPRESSOExperiments/medhist/"
new_base_dir = "/Users/ragab/Downloads/medhistragab/"

# Iterate over the triples in the graph and replace values
for s, p, o in list(g):
    if p == predicate and o.startswith(rdflib.Literal(old_base_dir)):
        # Extract the filename and extension
        filename = o.split('/')[-1]
        new_object = rdflib.Literal(urljoin(new_base_dir, filename))
        g.remove((s, p, o))
        g.add((s, p, new_object))

# Save the modified graph to a new file
g.serialize(output_file_path, format='turtle')
