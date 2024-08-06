# Read in the file
with open('/Users/ragab/Downloads/ESPRESSO/Automation/ExperimentSetup/wwwj0partexp.ttl', 'r') as file:
  filedata = file.read()

# Replace the target string
filedata = filedata.replace('/Users/yurysavateev/ESPRESSO/ESPRESSOExperiments/medhist/', '/Users/ragab/Downloads/medhistragab/')

# Write the file out again
with open('/Users/ragab/Downloads/ESPRESSO/Automation/ExperimentSetup/wwwj0partexpragab.ttl', 'w') as file:
  file.write(filedata)
