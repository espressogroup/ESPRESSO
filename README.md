# ESPRESSO Search System

### Efficient Search over Personal Repositories - Secure and Sovereign!

The ESPRESSO project researches, develops, and evaluates decentralised algorithms, meta-information data structures, and indexing techniques to enable large-scale data search across personal online datastores, taking into account varying access rights and caching requirements.


## ESPRESSO System Architecture

The ESPRESSO system (Figure below) contains the following components that are installed alongside each Solid server in the network:

* The indexing app (Brewmaster), indexes the pods and creates and maintains the pod indices, along with the meta-index for the server (see below). 

* The search app (CoffeeFilter), performs the local search on the server. 

* The overlay network (the prototype system uses a custom build of
[GaianDB](https://github.com/gaiandb/gaiandb)) connects the servers, and routes and propagates the queries.

* The user interface app (Barista) receives queries from the user and presents the search results.

![](./Documentation/imgs/ESPRESSOArchitecture.png)

## Limitations & Challenges Ahead
At this stage, ESPRESSO has the following limitations:

* It covers only keyword-based searches. Enabling structured queries is on the plan.
* To enable top-k search in ESPRESSO, decentralized ranking algorithms must be developed.


## Requirements

* [Node.js](https://nodejs.org/en/) _(16 or higher)_
* [Python](https://www.python.org/downloads/release/python-3110/)_(3.11 or higher)_
* [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

## Installation

* **Data Splitter**: Having a textual dataset composed of a single file (or more), the dataset splitter chunks the dataset into a specified number of files of a required size.

<pre>
cd /Automation/DatasetSplitter
python3 main.py
</pre>

* **Infrastructure and Deployment**: (Solid Servers and  Pods creation per each Solid server)

- Solid Servers:

<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  solidservers.yaml  --ask-become-pass
</pre>

Note that, The ```inventory-50VM.ini``` includes a list of the VM IPs with ```ssh``` username and password credentials.

- Pods creation: 
(To Be de-tangled from the experiments setup.)

* **(Keyword-based) Indexing**:

- Housing Pods with the generated files 

- Generating indexes at each Pod.

- Acl Specifications for Files and Indexes.

- Validating Access to Files and Indexes ```Penny or Postman``` or ```curl http:...```.

- Automating Cloning GaianDB and Search App on Servers.

You could do that by clonning and updating (pulling) the ESPRESSO repo on the machines automatically using the following ansible playbook.
<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  espressorepos.yaml  --ask-become-pass
</pre>

- Hints about Source Code and Build of GaianDB

In the ```GaianDB``` directory, you can find two sub-directorories:

(1) ```GaianDB_Keyword_Search_SourceCode``` for the source code of our GaianDB inclusing the ```solid-gaian``` connector. 

(2) ```GaianDB_Keyword_Search_Build``` is the build version of the source code, including all necessary ```jar``` files for running the service.

You could clone this source code (in ```GaianDB_Keyword_Search_SourceCode```) for further developments. Make sure to build your developements using any build tool such as (```maven``` or ```ant```). Please make sure that you add the generated build jars to the ```lib``` directory of the ```GaianDB_Keyword_Search_Build``` directory.


- Starting GaianDb Service on Servers:

<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  startGaianServers.yaml  --ask-become-pass
</pre>

- Running Search App with Parameters on a Specified number of Solid servers.

<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  startSearcherServers.yaml  --ask-become-pass
</pre>

- Stpooing GaianDB service and Search App on Serevrs:

Stop GaianDB service:
<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  stopGaianServers.yaml  --ask-become-pass
</pre>

Stop Search App:
<pre>
cd /Automation/CSS_Automation/
ansible-playbook -i inventory-50VM.ini  stopSearcherServers.yaml  --ask-become-pass
</pre>


## Experiments (Quick Start):

There is a unified experiment setup called ```flexexperiment```. 
By default creates pods, populates them with files, crawls the pods, indexes them, and uploads the indices through the Solid interface.

![](./Documentation/imgs/ExperimentSetup1.png)


To create an experiment

<pre>
cd /Automation/ExperimentSetup
python3 flexexperiment.py podname firstserver lastserver sourcedir expsavedir numberofpods numberoffiles
</pre>

Where

```podname``` is the common part name of the pod names to be created. On each server there will be pods ```podname0, podname1,``` etc.

```firstserver```the number of the first server used.

```lastserver```the number of the last server used plus 1. The servers are from a hardcoded list of servers currently.

```sourcedir``` local path to the local directory containing all the files for the experiment.

```expsavedir``` path to the local directory where the experiment will be stored.

```numberofpods``` total number of pods in the experiment.

```numberoffiles``` total number of files in the experiment

There are other variants that do the experiment slightly differently: onr creates pods, populates them with files, crawls the pods, creates and stores all the pod indices locally, and then uploads them.
There is also capability for each pod to create a zip file that contains all the files in the pod and another zip file with the index, and upload the zip files to the servers via ssh, where they need to be unzipped to pods.

![](./Documentation/imgs/ExperimentSetup2.png)


## Publications
[WISE 2023](https://doi.org/10.1007/978-981-99-7254-8_28)
    Mohamed Ragab, Yury Savateev, Reza Moosaei, Thanassis Tiropanis, Alexandra Poulovassilis, Adriane Chapman, and George Roussos. 2023. ESPRESSO: A Framework for&nbsp;Empowering Search on&nbsp;Decentralized Web. In Web Information Systems Engineering – WISE 2023: 24th International Conference, Melbourne, VIC, Australia, October 25–27, 2023, Proceedings. Springer-Verlag, Berlin, Heidelberg, 360–375.

[INWES 2021](https://eprints.soton.ac.uk/453937/)
    Tiropanis, Thanassis, Poulovassilis, Alexandra, Chapman, Age, and Roussos, George (2021) Search in a Redecentralised Web. In Computer Science Conference Proceedings: 12th International Conference on Internet Engineering &amp; Web Services (InWeS 2021).


## Authors/Contacts
* [Mohamed Ragab](https://mohamedragabanas.github.io/), University of southampton, ragab.mohamed@soton.ac.uk.
* [Yury Savateev](https://www.southampton.ac.uk/people/629xpd/doctor-yury-savateev), University of Southampton, y.savateev@soton.ac.uk.
* [Helen Olviver](https://www.bbk.ac.uk/our-staff/profile/9437297/helen-oliver), University of Southampton, h.oliver@bbk.ac.uk.
* [Reza Moosaei](https://www.linkedin.com/in/reza-moosa-b6209a77/), Queen Mary University of London, r.moosaei@bbk.ac.uk.
* [Thanassis Tiropanis](https://www.southampton.ac.uk/people/5x5rrv/professor-thanassis-tiropanis), University of Southampton, t.tiropanis@soton.ac.uk. 
* [Adriane Chapman](https://www.southampton.ac.uk/people/5xhdw9/professor-age-chapman), University of Southampton, adriane.chapman@soton.ac.uk.
* [Alex Poulovassilis](https://www.dcs.bbk.ac.uk/~ap/), Birkbeck, University of London, a.poulovassilis@bbk.ac.uk.
* [George Roussos](https://www.bbk.ac.uk/our-staff/profile/8009155/george-roussos), Birkbeck, University of London, g.roussos@bbk.ac.uk.

## License
ESPRESSO is written and developed by the [ESPRESSO project](https://espressoproject.org/) 
This code is released under the [AGPL-3.0 license](https://github.com/espressogroup/ESPRESSO/blob/main/LICENSE)
