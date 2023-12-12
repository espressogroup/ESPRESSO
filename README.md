# ESPRESSO Search System

### Efficient Search over Personal Repositories - Secure and Sovereign!

The ESPRESSO project researches, develops and evaluates decentralised algorithms, meta-information data structures, and indexing techniques to enable large-scale data search across personal online datastores, taking into account varying access rights and caching requirements.


## ESPRESSO System Architecture

The ESPRESSO system (Figure below) contains the following components that are installed alongside each Solid server in the network:

* The indexing app (Brewmaster), indexes the pods and creates and maintains the pod indices, along with the meta-index for the server (see below). 

* The search app (CoffeeFilter), performs the local search on the server. 

* The overlay network (the prototype system uses a custom build of
[GaianDB](https://github.com/gaiandb/gaiandb)) connects the servers, routes, and propagates the queries.

* The user interface app (Barista) receives queries from the user and presents the search results.

![](./Documentation/imgs/ESPRESSOArchitecture.png)

## Limitations & Challenges Ahead
At this staage, ESPRESSO has the following limiations:

* It covers only keyword-based searches. Enabling structured queries is on the plan.
* To enable top-k search in ESPRESSO, decentralized ranking algorithms must be developed.


## Requirements

* [Node.js](https://nodejs.org/en/) _(16 or higher)_
* [Python](https://www.python.org/downloads/release/python-3110/)_(3.11 or higher)_
* [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

## Installation

* **Data Splitter**: Having a textual dataset composed of a single file (or more), the dataset splitter chunks the datset into a specified number of files of a rquired size.

```python3 main.py```

* **Infrastructure and Deployment**: (Solid Servers and  Pods creation per each Solid server)

- Solid Servers 

<pre>TEST</pre>

- Pods creation:

* **(Keyword-based) Indexing**:

Housing Pods withe the generated files 

Generating indexes at each Pod.

Acl Specifications for Files and Indexes.

Validating Access to Files and Indexes ```Penny or Postman``` or ```curl http:...```.

* GaianDb and Search App Installation:

- Hints about Source Code and Build of GaianDB

- Automating Cloning GaianDB and Search App on Servers.

- Running Search App with Parameters on Specified number of Solid servers.



## Experiments (Quick Satrt):



## Publications
[WISE 2023](https://doi.org/10.1007/978-981-99-7254-8_28)
    Mohamed Ragab, Yury Savateev, Reza Moosaei, Thanassis Tiropanis, Alexandra Poulovassilis, Adriane Chapman, and George Roussos. 2023. ESPRESSO: A Framework for&nbsp;Empowering Search on&nbsp;Decentralized Web. In Web Information Systems Engineering – WISE 2023: 24th International Conference, Melbourne, VIC, Australia, October 25–27, 2023, Proceedings. Springer-Verlag, Berlin, Heidelberg, 360–375.

[INWES 2021](https://eprints.soton.ac.uk/453937/)
    Tiropanis, Thanassis, Poulovassilis, Alexandra, Chapman, Age and Roussos, George (2021) Search in a Redecentralised Web. In Computer Science Conference Proceedings: 12th International Conference on Internet Engineering &amp; Web Services (InWeS 2021).


## Authors/Contacts
* [Mohamed Ragab](https://mohamedragabanas.github.io/), University of southampton, ragab.mohamed@soton.ac.uk.
* Yury Savateeve, University of southampton, y.savateev@soton.ac.uk.
* Helen Olviver, University of southampton, h.oliver@bbk.ac.uk.
* Reza Moosaei, Queen Mary University of London, r.moosaei@bbk.ac.uk.
* Thanassis Tiropanis, University of southampton. 
* Age Chapman, University of southampton, adriane.chapman@soton.ac.uk.
* Alex Poulovassilis, Birkbeck, University of London, a.poulovassilis@bbk.ac.uk.
* George Roussos, Birkbeck, University of London, g.roussos@bbk.ac.uk.

## License
ESPRESSO is written and developed by the [ESPRESSO project](https://espressoproject.org/) 
This code is released under the [AGPL-3.0 license](https://github.com/espressogroup/ESPRESSO/blob/main/LICENSE)